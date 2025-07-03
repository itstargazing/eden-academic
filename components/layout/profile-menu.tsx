import { useState } from 'react';
import { User, LogOut, Settings, UserPlus } from 'lucide-react';
import { useUserStore } from '../../store/user-store';
import { useRouter } from 'next/navigation';
import AuthDialog from '../ui/auth-dialog';

export default function ProfileMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const { username, isLoggedIn, logout } = useUserStore();
  const router = useRouter();
  
  const toggleMenu = () => {
    if (isLoggedIn) {
      setIsMenuOpen(!isMenuOpen);
    } else {
      // If not logged in, open auth dialog directly
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

  const goToAccount = () => {
    router.push('/account');
    setIsMenuOpen(false);
  };
  
  return (
    <div className="relative">
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
        <span className="text-sm">{isLoggedIn ? username : 'Login / Sign Up'}</span>
      </button>
      
      {isMenuOpen && isLoggedIn && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-primary rounded-md shadow-lg overflow-hidden z-10 border border-white/10">
          <div className="p-2">
            <button 
              className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-primary-light text-white text-left"
              onClick={goToAccount}
            >
              <User size={16} className="text-text-secondary" />
              <span>Account</span>
            </button>
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