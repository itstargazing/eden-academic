'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '../../store/user-store';
import { OAuthService, ConnectedApp } from '../../lib/oauth-service';
import { useTheme } from '../../lib/theme-context';
import { 
  LogOut, 
  User,
  Mail,
  MapPin,
  Globe,
  Clock,
  Settings,
  Shield,
  Bell,
  Edit2,
  ChevronRight,
  Moon,
  Sun,
  Key,
  Activity,
  Link as LinkIcon,
  Quote,
  RefreshCw
} from 'lucide-react';

export default function AccountPage() {
  const router = useRouter();
  const { 
    isLoggedIn, 
    username, 
    email, 
    logout, 
    studySessions, 
    totalStudyHours,
    savedCitations 
  } = useUserStore();
  const { theme, toggleTheme } = useTheme();
  const [showEditModal, setShowEditModal] = useState(false);
  const [connectedApps, setConnectedApps] = useState<ConnectedApp[]>([]);
  const [connectingApp, setConnectingApp] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(0);

  // Motivational quotes for students and researchers
  const motivationalQuotes = [
    {
      text: "The expert in anything was once a beginner.",
      author: "Helen Hayes"
    },
    {
      text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      author: "Winston Churchill"
    },
    {
      text: "The only way to do great work is to love what you do.",
      author: "Steve Jobs"
    },
    {
      text: "Education is the most powerful weapon which you can use to change the world.",
      author: "Nelson Mandela"
    },
    {
      text: "The beautiful thing about learning is that no one can take it away from you.",
      author: "B.B. King"
    },
    {
      text: "Research is what I'm doing when I don't know what I'm doing.",
      author: "Wernher von Braun"
    },
    {
      text: "The important thing is not to stop questioning.",
      author: "Albert Einstein"
    },
    {
      text: "Knowledge is power. Information is liberating.",
      author: "Kofi Annan"
    },
    {
      text: "The future belongs to those who learn more skills and combine them in creative ways.",
      author: "Robert Greene"
    },
    {
      text: "Don't let what you cannot do interfere with what you can do.",
      author: "John Wooden"
    }
  ];

  useEffect(() => {
    setIsHydrated(true);
    console.log('Account page - Auth status:', isLoggedIn);
    if (!isLoggedIn) {
      console.log('User not authenticated, redirecting to home');
      router.push('/');
    } else {
      // Load connected apps
      setConnectedApps(OAuthService.getConnectedApps());
    }
  }, [isLoggedIn, router]);

  // Auto-change quotes every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % motivationalQuotes.length);
    }, 30000);

    return () => clearInterval(interval);
  }, [motivationalQuotes.length]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleConnectApp = async (appId: string, connected: boolean) => {
    setConnectingApp(appId);
    try {
      if (connected) {
        // Disconnect app
        const result = await OAuthService.disconnectApp(appId);
        if (result.success) {
          setConnectedApps(OAuthService.getConnectedApps());
          alert('App disconnected successfully!');
        } else {
          alert('Failed to disconnect app: ' + result.error);
        }
      } else {
        // Connect app - this will redirect to OAuth provider
        const result = await OAuthService.connectApp(appId);
        if (result.success) {
          // User will be redirected to OAuth provider
          console.log('Redirecting to OAuth provider...');
        } else {
          alert('Failed to connect app: ' + result.error);
          setConnectingApp(null);
        }
      }
    } catch (error) {
      console.error('OAuth error:', error);
      alert('An error occurred. Please try again.');
      setConnectingApp(null);
    }
  };

  const nextQuote = () => {
    setCurrentQuote((prev) => (prev + 1) % motivationalQuotes.length);
  };

  if (!isLoggedIn || !isHydrated) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--border)]"></div>
      </div>
    );
  }

  // Calculate dynamic stats
  const achievements = studySessions.length >= 10 ? 3 : studySessions.length >= 5 ? 2 : studySessions.length >= 1 ? 1 : 0;
  
  const stats = [
    { 
      label: 'Study Sessions', 
      value: studySessions.length.toString(),
      clickable: true,
      action: () => {
        // TODO: Navigate to detailed sessions view
        console.log('Show study sessions details');
      }
    },
    { 
      label: 'Focus Time', 
      value: `${Math.round(totalStudyHours)}h`,
      clickable: true,
      action: () => {
        // TODO: Navigate to focus time breakdown
        console.log('Show focus time breakdown');
      }
    },
    { 
      label: 'Achievements', 
      value: achievements.toString(),
      clickable: true,
      action: () => {
        // TODO: Navigate to achievements page
        console.log('Show achievements');
      }
    },
  ];



  return (
    <div className="feature-page -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8 min-h-screen">
      {/* Page Header */}
      <section className="mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-6">
          <div className="p-3 bg-[var(--bg-panel)] border border-[var(--border)] rounded-lg">
            <User size={32} className="text-[var(--text)]" />
          </div>
          <div>
            <h1 className="page-header">Account Settings</h1>
            <p className="text-text-secondary">Manage your profile and preferences</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 pb-6 lg:pb-8 min-h-[calc(100vh-8rem)] sm:min-h-[calc(100vh-10rem)] lg:min-h-[calc(100vh-12rem)]">
        {/* Profile Summary Card */}
        <div className="lg:col-span-1 space-y-4 sm:space-y-6 flex flex-col">
          <div className="card space-y-4 sm:space-y-6">
            {/* Profile Card */}
            <div className="bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl p-6 space-y-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative group">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center overflow-hidden grayscale hover:grayscale-0 transition-all duration-300">
                    <span className="text-[var(--text)] text-3xl sm:text-5xl font-medium">
                      {username?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <button 
                    onClick={() => setShowEditModal(true)}
                    className="absolute bottom-0 right-0 bg-[var(--bg-hover)] text-[var(--text)] border border-[var(--border)] p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
                <div>
                  <h2 className="text-xl font-medium text-[var(--text)]">{username}</h2>
                  <p className="text-[var(--text-dim)]">@{username?.toLowerCase().replace(/\s+/g, '')}</p>
                </div>
                <button 
                  onClick={() => setShowEditModal(true)}
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-lg text-[var(--text)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  Edit Profile
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 border-t border-[var(--border)]">
                {stats.map((stat, i) => (
                                      <button 
                      key={i} 
                      className="text-center p-1 sm:p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
                      onClick={stat.clickable ? stat.action : undefined}
                      disabled={!stat.clickable}
                    >
                      <div className="text-base sm:text-lg font-medium text-[var(--text)]">{stat.value}</div>
                      <div className="text-xs text-[var(--text-dim)]">{stat.label}</div>
                    </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card flex-grow flex flex-col">
            <h3 className="section-title">Quick Actions</h3>
            <div className="space-y-2 flex-grow">
              {[
                { icon: User, label: 'Edit Profile', action: () => setShowEditModal(true) },
                { icon: Settings, label: 'Preferences', action: () => console.log('Settings') },
                { icon: Shield, label: 'Privacy', action: () => console.log('Privacy') },
                { icon: Bell, label: 'Notifications', action: () => console.log('Notifications') },
              ].map((item, i) => (
                <button 
                  key={i} 
                  className="w-full flex items-center gap-3 px-4 py-3 text-[var(--text)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
                  onClick={item.action}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                  <ChevronRight size={16} className="ml-auto" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6 flex flex-col">
          {/* Personal Info and Recent Activity in a grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 flex-grow">
            {/* Personal Info */}
            <section className="card h-full">
              <h3 className="section-title">Personal Information</h3>
                              <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-sm text-[var(--text-dim)]">Email</label>
                    <div className="flex items-center gap-2 text-[var(--text)]">
                      <Mail size={16} />
                      <span>{email}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-[var(--text-dim)]">Password</label>
                    <button className="flex items-center gap-2 text-[var(--text)] hover:text-accent transition-colors">
                      <Key size={16} />
                      <span>Change password</span>
                    </button>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-[var(--text-dim)]">Language</label>
                    <div className="flex items-center gap-2 text-[var(--text)]">
                      <Globe size={16} />
                      <span>English (US)</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-[var(--text-dim)]">Theme</label>
                    <button 
                      onClick={toggleTheme}
                      className="flex items-center gap-2 text-[var(--text)] hover:text-accent transition-colors"
                    >
                      {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                      <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Recent Activity */}
            <section className="card h-full">
              <h3 className="section-title">Recent Activity</h3>
              <div className="space-y-4">
                {studySessions.slice(0, 3).length > 0 ? (
                  studySessions.slice(0, 3).map((session, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-[var(--bg-hover)] rounded-lg border border-[var(--border)]">
                      <div className="p-2 bg-[var(--bg-panel)] rounded-lg border border-[var(--border)]">
                        <Activity size={20} className="text-[var(--text)]" />
                      </div>
                      <div>
                        <h4 className="text-[var(--text)]">Study Session: {session.topic}</h4>
                        <p className="text-sm text-[var(--text-dim)]">
                          {Math.round(session.duration / 60)} minutes • {new Date(session.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Activity size={48} className="mx-auto mb-4 text-[var(--text-ghost)]" />
                    <p className="text-[var(--text-dim)]">No study sessions yet</p>
                    <p className="text-sm text-[var(--text-ghost)]">Start using the study tools to see your activity here</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Connected Apps */}
          <section className="card">
            <h3 className="section-title">Connected Applications</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {connectedApps.map((app, i) => (
                                  <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-[var(--bg-hover)] rounded-lg border border-[var(--border)] gap-3 sm:gap-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center text-lg">
                      {app.icon}
                    </div>
                    <div>
                      <span className="text-[var(--text)] font-medium">{app.name}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`w-2 h-2 rounded-full ${app.connected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                        <span className="text-xs text-[var(--text-dim)]">
                          {app.connected ? 'Connected' : 'Not Connected'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button 
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                      app.connected 
                        ? 'border-red-400/50 text-red-400 hover:bg-red-400/10' 
                        : 'border-green-400/50 text-green-400 hover:bg-green-400/10'
                    }`}
                    onClick={() => handleConnectApp(app.id, app.connected)}
                    disabled={connectingApp === app.id}
                  >
                    {connectingApp === app.id 
                      ? 'Loading...' 
                      : app.connected ? 'Disconnect' : 'Connect'
                    }
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Motivational Quote Box */}
          <div className="card relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Quote size={20} className="text-[var(--text)]" />
                <h3 className="section-title mb-0">Daily Inspiration</h3>
              </div>
              <button
                onClick={nextQuote}
                className="p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
                title="Next quote"
              >
                <RefreshCw size={16} className="text-[var(--text-dim)] hover:text-[var(--text)]" />
              </button>
            </div>
            
            <div className="text-center py-6">
              <blockquote className="text-lg text-[var(--text)] font-medium mb-4 leading-relaxed">
                "{motivationalQuotes[currentQuote].text}"
              </blockquote>
              <cite className="text-[var(--text-dim)] text-sm">
                — {motivationalQuotes[currentQuote].author}
              </cite>
            </div>
            
            {/* Progress indicator */}
            <div className="flex justify-center gap-1 mt-4">
              {motivationalQuotes.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-1 rounded-full transition-colors ${
                    index === currentQuote ? 'bg-[var(--text)]' : 'bg-[var(--border)]'
                  }`}
                />
              ))}
                         </div>
           </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full btn btn-secondary flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            <span>Log out</span>
          </button>
         </div>
       </div>
     </div>
   );
} 