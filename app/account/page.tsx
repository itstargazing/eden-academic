'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
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
  Link as LinkIcon
} from 'lucide-react';

export default function AccountPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!session) return null;

  const stats = [
    { label: 'Study Sessions', value: '24' },
    { label: 'Focus Time', value: '127h' },
    { label: 'Achievements', value: '7' },
  ];

  const recentActivity = [
    { type: 'Study Session', time: '2 hours ago', duration: '45 minutes' },
    { type: 'Focus Track', time: 'Yesterday', duration: '2 hours' },
    { type: 'Achievement', time: '3 days ago', name: 'Focus Master' },
  ];

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Left Sidebar */}
          <div className="w-80 flex-shrink-0 space-y-8">
            {/* Profile Card */}
            <div className="bg-zinc-900 rounded-2xl p-6 space-y-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center overflow-hidden grayscale hover:grayscale-0 transition-all duration-300">
                    {session.user?.image ? (
                      <img 
                        src={session.user.image} 
                        alt={session.user.name || 'Profile'} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-black text-5xl font-medium">
                        {session.user?.name?.[0]?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() => setShowEditModal(true)}
                    className="absolute bottom-0 right-0 bg-white text-black p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
                <div>
                  <h2 className="text-xl font-medium text-white">{session.user?.name}</h2>
                  <p className="text-zinc-400">@{session.user?.name?.toLowerCase().replace(/\s+/g, '')}</p>
                </div>
                <button 
                  onClick={() => setShowEditModal(true)}
                  className="w-full px-4 py-2 border border-white/20 rounded-lg text-white hover:bg-white hover:text-black transition-colors"
                >
                  Edit Profile
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                {stats.map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="text-lg font-medium text-white">{stat.value}</div>
                    <div className="text-xs text-zinc-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="bg-zinc-900 rounded-2xl p-4">
              <ul className="space-y-2">
                {[
                  { icon: User, label: 'Profile' },
                  { icon: Settings, label: 'Settings' },
                  { icon: Shield, label: 'Privacy' },
                  { icon: Bell, label: 'Notifications' },
                  { icon: LinkIcon, label: 'Connected Apps' }
                ].map((item, i) => (
                  <li key={i}>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/5 rounded-lg transition-colors">
                      <item.icon size={18} />
                      <span>{item.label}</span>
                      <ChevronRight size={16} className="ml-auto" />
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-8">
            {/* Personal Info */}
            <section className="bg-zinc-900 rounded-2xl p-8">
              <h3 className="text-xl font-medium text-white mb-6">Personal Information</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm text-zinc-400">Email</label>
                    <div className="flex items-center gap-2 text-white">
                      <Mail size={16} />
                      <span>{session.user?.email}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-zinc-400">Password</label>
                    <button className="flex items-center gap-2 text-white hover:text-accent transition-colors">
                      <Key size={16} />
                      <span>Change password</span>
                    </button>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-zinc-400">Language</label>
                    <div className="flex items-center gap-2 text-white">
                      <Globe size={16} />
                      <span>English (US)</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-zinc-400">Theme</label>
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
            <section className="bg-zinc-900 rounded-2xl p-8">
              <h3 className="text-xl font-medium text-white mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                    <div className="p-2 bg-white/10 rounded-lg">
                      <Activity size={20} className="text-white" />
                    </div>
                    <div>
                      <h4 className="text-white">{activity.type}</h4>
                      <p className="text-sm text-zinc-400">
                        {activity.duration ? `${activity.duration} • ` : ''}{activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Connected Apps */}
            <section className="bg-zinc-900 rounded-2xl p-8">
              <h3 className="text-xl font-medium text-white mb-6">Connected Applications</h3>
              <div className="grid grid-cols-2 gap-4">
                {['Google Calendar', 'Notion', 'Spotify', 'Discord'].map((app, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/10 rounded-lg"></div>
                      <span className="text-white">{app}</span>
                    </div>
                    <button className="text-zinc-400 hover:text-white transition-colors">
                      <Settings size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              <LogOut size={18} />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 