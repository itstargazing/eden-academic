"use client";

import { useState, useEffect, createContext, useContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BrainCircuit, Pencil, Network, Clock, Search, 
  BookOpen, Brain, Menu, X, PanelLeft, PanelRight, LogIn, Volume2, Compass 
} from 'lucide-react';
import ProfileMenu from '@/components/layout/profile-menu';
import Image from 'next/image';
import { useAuthStore } from '@/store/auth-store';
import { AuthModal } from '@/components/auth/auth-modal';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Create context for sidebar state
const SidebarContext = createContext<{
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}>({
  isCollapsed: false,
  setIsCollapsed: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

const navItems = [
  {
    name: "BrainMerge",
    href: "/brain-merge",
    icon: BrainCircuit
  },
  {
    name: "ThesisSculptor",
    href: "/thesis-sculptor",
    icon: Pencil
  },
  {
    name: "MindMap Translator",
    href: "/mindmap-translator",
    icon: Network
  },
  {
    name: "StudyTime Synch",
    href: "/studytime-synch",
    icon: Clock
  },
  {
    name: "GhostCitations",
    href: "/ghost-citations",
    icon: Search
  },
  {
    name: "Syllabus Whisperer",
    href: "/syllabus-whisperer",
    icon: BookOpen
  },
  {
    name: "Cognitive Compass",
    href: "/cognitive-compass",
    icon: Compass
  },
  {
    name: "Stress Alchemist",
    href: "/stress-alchemist",
    icon: Brain
  },
  {
    name: "Focus Soundscapes",
    href: "/focus-soundscapes",
    icon: Volume2
  }
];

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuthStore();
  const { data: session } = useSession();
  const router = useRouter();
  
  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);
  
  // Close mobile sidebar when escape key is pressed
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Add CSS custom property for sidebar width
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sidebar-width', 
      isCollapsed ? '70px' : '250px'
    );
  }, [isCollapsed]);
  
  return (
    <>
      {/* Mobile sidebar toggle */}
      <button 
        className="fixed top-4 left-4 p-2 rounded-md bg-primary z-40 lg:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? (
          <X size={24} className="text-white" />
        ) : (
          <Menu size={24} className="text-white" />
        )}
      </button>
      
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-30 flex flex-col bg-primary border-r border-primary-light transition-all ${
          isMobileOpen 
            ? "translate-x-0" 
            : "translate-x-[-100%] lg:translate-x-0"
        } ${
          isCollapsed 
            ? "w-[70px]" 
            : "w-[250px]"
        }`}
      >
        <div className="flex items-center h-16 px-4 border-b border-primary-light">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-white hover:text-white/90 transition-colors"
          >
            <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
              <Image
                src="/images/logo.png"
                alt="EDEN Logo"
                width={48}
                height={48}
                className="object-contain"
                priority
              />
            </div>
            {!isCollapsed && (
              <span className="font-bold text-lg font-logo">EDEN</span>
            )}
          </Link>
          
          <button 
            className="ml-auto p-1.5 rounded-md text-text-secondary hover:bg-primary-light hover:text-white hidden lg:block"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <PanelRight size={18} />
            ) : (
              <PanelLeft size={18} />
            )}
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
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive 
                      ? "bg-primary-light text-white" 
                      : "text-text-secondary hover:bg-primary-light hover:text-white"
                  }`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="truncate">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
        
        {/* Auth section */}
        <div className="border-t border-primary-light p-4">
          {session ? (
            <ProfileMenu />
          ) : (
            <button 
              onClick={() => setShowAuthModal(true)}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium text-text-secondary hover:bg-primary-light hover:text-white transition-colors ${
                isCollapsed ? "justify-center" : ""
              }`}
              title={isCollapsed ? "Sign In" : undefined}
            >
              <LogIn size={20} className="flex-shrink-0" />
              {!isCollapsed && <span>Sign In</span>}
            </button>
          )}
        </div>
      </aside>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
} 