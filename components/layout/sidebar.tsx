'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BookOpen,
  Brain,
  BrainCircuit,
  Briefcase,
  Clock,
  Compass,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Network,
  PanelLeft,
  PanelRight,
  Pencil,
  Search,
  Volume2,
  X,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useSupabaseUser } from '@/hooks/use-supabase-user';

const SidebarContext = createContext<{
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}>({
  isCollapsed: false,
  setIsCollapsed: () => {},
});

const navItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Career Studio',
    href: '/career-studio',
    icon: Briefcase,
  },
  {
    name: 'BrainMerge',
    href: '/brain-merge',
    icon: BrainCircuit,
  },
  {
    name: 'ThesisSculptor',
    href: '/thesis-sculptor',
    icon: Pencil,
  },
  {
    name: 'MindMap Translator',
    href: '/mindmap-translator',
    icon: Network,
  },
  {
    name: 'StudyTime Synch',
    href: '/studytime-synch',
    icon: Clock,
  },
  {
    name: 'GhostCitations',
    href: '/ghost-citations',
    icon: Search,
  },
  {
    name: 'Syllabus Whisperer',
    href: '/syllabus-whisperer',
    icon: BookOpen,
  },
  {
    name: 'Cognitive Compass',
    href: '/cognitive-compass',
    icon: Compass,
  },
  {
    name: 'Stress Alchemist',
    href: '/stress-alchemist',
    icon: Brain,
  },
  {
    name: 'Focus Soundscapes',
    href: '/focus-soundscapes',
    icon: Volume2,
  },
];

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => useContext(SidebarContext);

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const { user } = useSupabaseUser();
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', isCollapsed ? '70px' : '250px');
  }, [isCollapsed]);

  const handleSignOut = async () => {
    if (!supabase) {
      router.push('/sign-in');
      return;
    }

    setSigningOut(true);
    await supabase.auth.signOut();
    router.push('/sign-in');
    router.refresh();
    setSigningOut(false);
  };

  return (
    <>
      <button
        className="fixed left-3 top-3 z-40 rounded-sm border border-[var(--border)] bg-[var(--bg)] p-2 shadow-lg lg:hidden"
        onClick={() => setIsMobileOpen((previous) => !previous)}
      >
        {isMobileOpen ? <X size={18} className="text-[var(--text)]" /> : <Menu size={18} className="text-[var(--text)]" />}
      </button>

      {isMobileOpen ? (
        <div
          className="fixed inset-0 z-20 bg-[rgba(176,176,176,0.35)] backdrop-blur-[1px] lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed bottom-0 left-0 top-0 z-30 flex flex-col border-r border-[var(--border)] bg-[var(--bg)] transition-all ${
          isMobileOpen ? 'translate-x-0' : 'translate-x-[-100%] lg:translate-x-0'
        } ${isCollapsed ? 'w-[70px]' : 'w-[250px]'}`}
      >
        <div className="flex h-16 items-center border-b border-[var(--border)] px-4">
          <Link href="/" className="flex items-center gap-2 text-[var(--text)] transition-colors">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center">
              <Image
                src="/images/logo.png"
                alt="EDEN Logo"
                width={48}
                height={48}
                className="object-contain"
                priority
              />
            </div>
            {!isCollapsed ? <span className="font-logo text-lg font-bold">EDEN</span> : null}
          </Link>

          <button
            className="ml-auto hidden rounded-sm p-1.5 text-[var(--text-dim)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)] lg:block"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <PanelRight size={18} /> : <PanelLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-transparent font-bold underline text-[var(--text)]'
                      : 'text-[var(--text)] hover:bg-transparent hover:underline'
                  }`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {!isCollapsed ? <span className="truncate">{item.name}</span> : null}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-[var(--border)] p-4">
          {user ? (
            <div className="space-y-3">
              {!isCollapsed ? (
                <div>
                  <p className="truncate text-sm font-medium text-[var(--text)]">
                    {user.user_metadata?.full_name || user.email}
                  </p>
                  <p className="truncate text-xs text-[var(--text-dim)]">{user.email}</p>
                </div>
              ) : null}
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className={`flex w-full items-center gap-3 rounded-sm border border-[var(--border)] bg-[var(--bg-panel)] px-3 py-2 text-sm font-medium text-[var(--text)] transition-colors hover:bg-[var(--bg-hover)] ${
                  isCollapsed ? 'justify-center' : ''
                }`}
                title={isCollapsed ? 'Sign Out' : undefined}
              >
                <LogOut size={20} className="flex-shrink-0" />
                {!isCollapsed ? <span>{signingOut ? 'Signing out...' : 'Sign Out'}</span> : null}
              </button>
            </div>
          ) : (
            <Link
              href="/sign-in"
              className={`flex w-full items-center gap-3 rounded-sm border border-[var(--border)] bg-[var(--bg-panel)] px-5 py-2 text-sm font-medium text-[var(--text)] transition-colors hover:bg-[var(--bg-hover)] ${
                isCollapsed ? 'justify-center' : ''
              }`}
              title={isCollapsed ? 'Sign In' : undefined}
            >
              <LogIn size={20} className="flex-shrink-0" />
              {!isCollapsed ? <span>Sign In</span> : null}
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
