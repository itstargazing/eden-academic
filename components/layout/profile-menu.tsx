import { useState, useRef, useEffect } from 'react';
import { User, LogOut, Settings, UserPlus } from 'lucide-react';
import { useUserStore } from '../../store/user-store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthDialog from '../ui/auth-dialog';

export default function ProfileMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const { username, isLoggedIn, logout } = useUserStore();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);
  
  const toggleMenu = () => {
    console.log('Profile menu clicked. isLoggedIn:', isLoggedIn);
    if (isLoggedIn) {
      // Direct navigation to account page - no dropdown
      console.log('Navigating directly to account page');
      router.push('/account');
    } else {
      // If not logged in, open auth dialog directly
      console.log('User not logged in, opening auth dialog');
      setIsAuthDialogOpen(true);
    }
  };
  
  const openAuthDialog = () => {
    setIsAuthDialogOpen(true);
    setIsMenuOpen(false);
  };
  
  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    router.push('/');
  };

  const goToAccount = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log('Account button clicked - Navigating to account page');
    setIsMenuOpen(false);
    // Use setTimeout to ensure menu closes before navigation
    setTimeout(() => {
      router.push('/account');
    }, 10);
  };
  
  return (
    <div className="relative" ref={menuRef}>
      <button 
        className="flex items-center gap-2 p-2 rounded-md hover:bg-primary-light text-white"
        onClick={toggleMenu}
      >
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
          {isLoggedIn ? (
            <span className="text-black font-medium">{username ? username[0].toUpperCase() : 'U'}</span>
          ) : (
            <UserPlus size={16} className="text-black" />
          )}
        </div>
        <span className="text-sm">{isLoggedIn ? `${username} (Click for Account)` : 'Login / Sign Up'}</span>
      </button>
      
      {/* Temporarily disabled dropdown - direct navigation instead */}
      {false && isMenuOpen && isLoggedIn && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-black rounded-md shadow-xl overflow-hidden z-[100] border border-white/20" style={{ boxShadow: '0 20px 25px -5px rgba(255, 255, 255, 0.1)' }}>
          <div className="p-2">
            <Link 
              href="/account"
              className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-white/10 text-white text-left"
              onClick={() => setIsMenuOpen(false)}
            >
              <User size={16} className="text-text-secondary" />
              <span>Account</span>
            </Link>
            <button 
              className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-primary-light text-white text-left"
              onClick={handleLogout}
            >
              <LogOut size={16} className="text-text-secondary" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}
      
      <AuthDialog 
        isOpen={isAuthDialogOpen} 
        onClose={() => setIsAuthDialogOpen(false)} 
      />
    </div>
  );
} 