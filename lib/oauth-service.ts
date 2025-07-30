export interface ConnectedApp {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  authUrl?: string;
  scopes: string[];
}

export class OAuthService {
  private static connectedApps: ConnectedApp[] = [
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      icon: '📅',
      connected: false,
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      scopes: ['https://www.googleapis.com/auth/calendar.readonly']
    },
    {
      id: 'notion',
      name: 'Notion',
      icon: '📝',
      connected: false,
      authUrl: 'https://api.notion.com/v1/oauth/authorize',
      scopes: ['read_content']
    },
    {
      id: 'spotify',
      name: 'Spotify',
      icon: '🎵',
      connected: false,
      authUrl: 'https://accounts.spotify.com/authorize',
      scopes: ['user-read-playback-state', 'user-modify-playback-state']
    },
    {
      id: 'discord',
      name: 'Discord',
      icon: '💬',
      connected: false,
      authUrl: 'https://discord.com/api/oauth2/authorize',
      scopes: ['identify', 'guilds']
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

  static async connectApp(appId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const app = this.connectedApps.find(a => a.id === appId);
      if (!app) {
        return { success: false, error: 'App not found' };
      }

      // In a real implementation, this would:
      // 1. Redirect to the OAuth provider
      // 2. Handle the callback
      // 3. Store the access token securely
      
      // For demo purposes, we'll simulate a successful connection
      console.log(`Connecting to ${app.name}...`);
      
      // Simulate OAuth flow delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the connection status
      const apps = this.getConnectedApps();
      const updatedApps = apps.map(a => 
        a.id === appId ? { ...a, connected: true } : a
      );
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('eden-connected-apps', JSON.stringify(updatedApps));
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to connect app' };
    }
  }

  static async disconnectApp(appId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // In a real implementation, this would revoke the OAuth token
      console.log(`Disconnecting from ${appId}...`);
      
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