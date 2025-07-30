'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '../../store/user-store';
import { OAuthService, ConnectedApp } from '../../lib/oauth-service';
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
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [connectedApps, setConnectedApps] = useState<ConnectedApp[]>([]);
  const [connectingApp, setConnectingApp] = useState<string | null>(null);
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
      const result = connected 
        ? await OAuthService.disconnectApp(appId)
        : await OAuthService.connectApp(appId);
        
      if (result.success) {
        setConnectedApps(OAuthService.getConnectedApps());
      } else {
        console.error('Failed to connect/disconnect app:', result.error);
      }
    } catch (error) {
      console.error('OAuth error:', error);
    } finally {
      setConnectingApp(null);
    }
  };

  const nextQuote = () => {
    setCurrentQuote((prev) => (prev + 1) % motivationalQuotes.length);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
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
          <div className="p-3 bg-background border border-white/20 rounded-lg">
            <User size={32} className="text-white" />
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
            <div className="bg-black border border-white/20 rounded-2xl p-6 space-y-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative group">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white flex items-center justify-center overflow-hidden grayscale hover:grayscale-0 transition-all duration-300">
                    <span className="text-black text-3xl sm:text-5xl font-medium">
                      {username?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <button 
                    onClick={() => setShowEditModal(true)}
                    className="absolute bottom-0 right-0 bg-white text-black p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
                <div>
                  <h2 className="text-xl font-medium text-white">{username}</h2>
                  <p className="text-white/60">@{username?.toLowerCase().replace(/\s+/g, '')}</p>
                </div>
                <button 
                  onClick={() => setShowEditModal(true)}
                  className="w-full px-4 py-2 border border-white/20 rounded-lg text-white hover:bg-white hover:text-black transition-colors"
                >
                  Edit Profile
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 border-t border-white/10">
                {stats.map((stat, i) => (
                                      <button 
                      key={i} 
                      className="text-center p-1 sm:p-2 rounded-lg hover:bg-white/5 transition-colors"
                      onClick={stat.clickable ? stat.action : undefined}
                      disabled={!stat.clickable}
                    >
                      <div className="text-base sm:text-lg font-medium text-white">{stat.value}</div>
                      <div className="text-xs text-white/60">{stat.label}</div>
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
                  className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/5 rounded-lg transition-colors"
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
                    <label className="text-sm text-white/60">Email</label>
                    <div className="flex items-center gap-2 text-white">
                      <Mail size={16} />
                      <span>{email}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-white/60">Password</label>
                    <button className="flex items-center gap-2 text-white hover:text-accent transition-colors">
                      <Key size={16} />
                      <span>Change password</span>
                    </button>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-white/60">Language</label>
                    <div className="flex items-center gap-2 text-white">
                      <Globe size={16} />
                      <span>English (US)</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-white/60">Theme</label>
                    <button 
                      onClick={() => setIsDarkMode(!isDarkMode)}
                      className="flex items-center gap-2 text-white hover:text-accent transition-colors"
                    >
                      {isDarkMode ? <Moon size={16} /> : <Sun size={16} />}
                      <span>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
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
                    <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                      <div className="p-2 bg-white/10 rounded-lg">
                        <Activity size={20} className="text-white" />
                      </div>
                      <div>
                        <h4 className="text-white">Study Session: {session.topic}</h4>
                        <p className="text-sm text-white/60">
                          {Math.round(session.duration / 60)} minutes • {new Date(session.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Activity size={48} className="mx-auto mb-4 text-white/30" />
                    <p className="text-white/60">No study sessions yet</p>
                    <p className="text-sm text-white/40">Start using the study tools to see your activity here</p>
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
                                  <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-white/5 rounded-lg border border-white/10 gap-3 sm:gap-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center text-lg">
                      {app.icon}
                    </div>
                    <div>
                      <span className="text-white font-medium">{app.name}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`w-2 h-2 rounded-full ${app.connected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                        <span className="text-xs text-white/60">
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
                <Quote size={20} className="text-white" />
                <h3 className="section-title mb-0">Daily Inspiration</h3>
              </div>
              <button
                onClick={nextQuote}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                title="Next quote"
              >
                <RefreshCw size={16} className="text-white/60 hover:text-white" />
              </button>
            </div>
            
            <div className="text-center py-6">
              <blockquote className="text-lg text-white font-medium mb-4 leading-relaxed">
                "{motivationalQuotes[currentQuote].text}"
              </blockquote>
              <cite className="text-white/60 text-sm">
                — {motivationalQuotes[currentQuote].author}
              </cite>
            </div>
            
            {/* Progress indicator */}
            <div className="flex justify-center gap-1 mt-4">
              {motivationalQuotes.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-1 rounded-full transition-colors ${
                    index === currentQuote ? 'bg-white' : 'bg-white/20'
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