export interface ConnectedApp {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  authUrl?: string;
  scopes: string[];
}

// OAuth Configuration - In production, these should be environment variables
const OAUTH_CONFIG = {
  'google-calendar': {
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'your-google-client-id',
    redirectUri: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback/google` : 'http://localhost:3000/api/auth/callback/google',
    scopes: ['https://www.googleapis.com/auth/calendar.readonly', 'https://www.googleapis.com/auth/calendar.events']
  },
  'notion': {
    clientId: process.env.NEXT_PUBLIC_NOTION_CLIENT_ID || 'your-notion-client-id',
    redirectUri: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback/notion` : 'http://localhost:3000/api/auth/callback/notion',
    scopes: ['read_content', 'read_user']
  },
  'spotify': {
    clientId: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || 'your-spotify-client-id',
    redirectUri: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback/spotify` : 'http://localhost:3000/api/auth/callback/spotify',
    scopes: ['user-read-playback-state', 'user-modify-playback-state', 'user-read-currently-playing']
  },
  'discord': {
    clientId: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || 'your-discord-client-id',
    redirectUri: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback/discord` : 'http://localhost:3000/api/auth/callback/discord',
    scopes: ['identify', 'guilds']
  }
};

export class OAuthService {
  private static connectedApps: ConnectedApp[] = [
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      icon: '📅',
      connected: false,
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      scopes: OAUTH_CONFIG['google-calendar'].scopes
    },
    {
      id: 'notion',
      name: 'Notion',
      icon: '📝',
      connected: false,
      authUrl: 'https://api.notion.com/v1/oauth/authorize',
      scopes: OAUTH_CONFIG['notion'].scopes
    },
    {
      id: 'spotify',
      name: 'Spotify',
      icon: '🎵',
      connected: false,
      authUrl: 'https://accounts.spotify.com/authorize',
      scopes: OAUTH_CONFIG['spotify'].scopes
    },
    {
      id: 'discord',
      name: 'Discord',
      icon: '💬',
      connected: false,
      authUrl: 'https://discord.com/api/oauth2/authorize',
      scopes: OAUTH_CONFIG['discord'].scopes
    }
  ];

  static getConnectedApps(): ConnectedApp[] {
    // In a real implementation, this would fetch from a database
    // For now, we'll use localStorage to persist state
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('eden-connected-apps');
      if (stored) {
        return JSON.parse(stored);
      }
    }
    return this.connectedApps;
  }

  static async connectApp(appId: string): Promise<{ success: boolean; error?: string; redirectUrl?: string }> {
    try {
      const app = this.connectedApps.find(a => a.id === appId);
      if (!app) {
        return { success: false, error: 'App not found' };
      }

      const config = OAUTH_CONFIG[appId as keyof typeof OAUTH_CONFIG];
      if (!config) {
        return { success: false, error: 'OAuth configuration not found' };
      }

      // Generate state parameter for security
      const state = btoa(JSON.stringify({ appId, timestamp: Date.now() }));
      
      // Store state in localStorage for validation later
      if (typeof window !== 'undefined') {
        localStorage.setItem(`oauth-state-${appId}`, state);
      }

      // Build OAuth URL based on the provider
      let authUrl = '';
      
      switch (appId) {
        case 'google-calendar':
          authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${config.clientId}&` +
            `redirect_uri=${encodeURIComponent(config.redirectUri)}&` +
            `scope=${encodeURIComponent(config.scopes.join(' '))}&` +
            `response_type=code&` +
            `access_type=offline&` +
            `state=${state}`;
          break;
          
        case 'notion':
          authUrl = `https://api.notion.com/v1/oauth/authorize?` +
            `client_id=${config.clientId}&` +
            `redirect_uri=${encodeURIComponent(config.redirectUri)}&` +
            `response_type=code&` +
            `state=${state}`;
          break;
          
        case 'spotify':
          authUrl = `https://accounts.spotify.com/authorize?` +
            `client_id=${config.clientId}&` +
            `redirect_uri=${encodeURIComponent(config.redirectUri)}&` +
            `scope=${encodeURIComponent(config.scopes.join(' '))}&` +
            `response_type=code&` +
            `state=${state}`;
          break;
          
        case 'discord':
          authUrl = `https://discord.com/api/oauth2/authorize?` +
            `client_id=${config.clientId}&` +
            `redirect_uri=${encodeURIComponent(config.redirectUri)}&` +
            `scope=${encodeURIComponent(config.scopes.join(' '))}&` +
            `response_type=code&` +
            `state=${state}`;
          break;
          
        default:
          return { success: false, error: 'Unsupported OAuth provider' };
      }

      // Redirect to OAuth provider
      if (typeof window !== 'undefined') {
        window.location.href = authUrl;
      }
      
      return { success: true, redirectUrl: authUrl };
    } catch (error) {
      console.error('OAuth connection error:', error);
      return { success: false, error: 'Failed to initiate OAuth connection' };
    }
  }

  static async disconnectApp(appId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Revoke the OAuth token
      console.log(`Disconnecting from ${appId}...`);
      
      // Remove stored tokens
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`oauth-token-${appId}`);
        localStorage.removeItem(`oauth-refresh-token-${appId}`);
        localStorage.removeItem(`oauth-state-${appId}`);
      }
      
      const apps = this.getConnectedApps();
      const updatedApps = apps.map(a => 
        a.id === appId ? { ...a, connected: false } : a
      );
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('eden-connected-apps', JSON.stringify(updatedApps));
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to disconnect app' };
    }
  }

  static async handleOAuthCallback(appId: string, code: string, state: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate state parameter
      const storedState = typeof window !== 'undefined' ? localStorage.getItem(`oauth-state-${appId}`) : null;
      if (storedState !== state) {
        return { success: false, error: 'Invalid state parameter' };
      }

      const config = OAUTH_CONFIG[appId as keyof typeof OAUTH_CONFIG];
      if (!config) {
        return { success: false, error: 'OAuth configuration not found' };
      }

      // Exchange code for access token
      // Note: This should be done on the backend for security, but for demo purposes:
      console.log(`Processing OAuth callback for ${appId} with code: ${code}`);
      
      // Store the connection (in a real app, you'd exchange the code for tokens)
      const apps = this.getConnectedApps();
      const updatedApps = apps.map(a => 
        a.id === appId ? { ...a, connected: true } : a
      );
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('eden-connected-apps', JSON.stringify(updatedApps));
        localStorage.setItem(`oauth-token-${appId}`, `demo-token-${Date.now()}`);
        localStorage.removeItem(`oauth-state-${appId}`);
      }
      
      return { success: true };
    } catch (error) {
      console.error('OAuth callback error:', error);
      return { success: false, error: 'Failed to process OAuth callback' };
    }
  }

  static getAppData(appId: string): any {
    // In a real implementation, this would fetch data from the connected app
    // For now, return mock data
    switch (appId) {
      case 'google-calendar':
        return {
          upcomingEvents: [
            { title: 'Study Session', time: '2:00 PM', date: 'Today' },
            { title: 'Research Meeting', time: '4:00 PM', date: 'Tomorrow' }
          ]
        };
      case 'spotify':
        return {
          currentlyPlaying: {
            track: 'Focus Music Playlist',
            artist: 'Study Beats'
          }
        };
      default:
        return null;
    }
  }
} 