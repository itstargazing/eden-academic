"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Lock, UserPlus, User, X, Mail, KeyRound } from 'lucide-react';
import { useUserStore } from '../../store/user-store';
import { z } from 'zod';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

// Form validation schemas
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function AuthDialog({ isOpen, onClose }: AuthDialogProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const login = useUserStore(state => state.login);

  // Wait for component to mount to avoid hydration errors with portals
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const validateForm = () => {
    try {
      if (isLogin) {
        loginSchema.parse({ email, password });
      } else {
        registerSchema.parse({ username, email, password });
      }
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            newErrors[err.path[0]] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // In a real app, this would be an API call to your authentication service
      // For now, we'll simulate a successful auth flow
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Log the user in with the user store
      login(username || email.split('@')[0], email);
      onClose();
      
      // Reset form
      setUsername('');
      setEmail('');
      setPassword('');
      setErrors({});
    } catch (error) {
      console.error('Authentication error:', error);
      setErrors({ form: 'Authentication failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !isMounted) return null;

  // Create portal content - the modal itself
  const modalContent = (
    // Modal overlay - fixed position covering the full screen with a dark backdrop
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] backdrop-blur-sm"
      style={{
        position: 'fixed !important' as any,
        top: '0 !important',
        left: '0 !important',
        right: '0 !important',
        bottom: '0 !important',
        width: '100vw !important',
        height: '100vh !important',
        display: 'flex !important',
        alignItems: 'center !important',
        justifyContent: 'center !important',
        zIndex: 9999
      }}
      onClick={(e) => {
        // Close modal when clicking the backdrop
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Modal dialog */}
      <div 
        className="bg-primary rounded-lg w-full max-w-md p-4 sm:p-6 border border-white/20 shadow-xl m-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 rounded-full bg-white flex items-center justify-center">
              {isLogin ? <Lock size={18} className="text-black" /> : <UserPlus size={18} className="text-black" />}
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-white font-logo">
              {isLogin ? 'LOGIN' : 'CREATE ACCOUNT'}
            </h2>
          </div>
          <button 
            className="p-1 rounded-full hover:bg-primary-light text-text-secondary"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {errors.form && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-md mb-4">
            {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm text-text-secondary">Username</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary">
                  <User size={16} />
                </span>
                <input
                  id="username"
                  type="text"
                  className="w-full pl-10 p-3 border border-white/10 rounded-md bg-background text-white focus:border-white/30"
                  placeholder="Your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              {errors.username && (
                <p className="text-red-400 text-xs mt-1">{errors.username}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm text-text-secondary">Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary">
                <Mail size={16} />
              </span>
              <input
                id="email"
                type="email"
                className="w-full pl-10 p-3 border border-white/10 rounded-md bg-background text-white focus:border-white/30"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm text-text-secondary">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary">
                <KeyRound size={16} />
              </span>
              <input
                id="password"
                type="password"
                className="w-full pl-10 p-3 border border-white/10 rounded-md bg-background text-white focus:border-white/30"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full p-3 rounded-md bg-white hover:bg-white/90 transition-colors text-black font-medium flex items-center justify-center"
          >
            {isSubmitting ? (
              <span className="animate-spin mr-2 h-4 w-4 border-2 border-black border-t-transparent rounded-full" />
            ) : null}
            {isLogin ? 'Login' : 'Create Account'}
          </button>

          <div className="text-center text-sm text-text-secondary">
            {isLogin ? "Don't have an account?" : "Already have an account?"} 
            <button 
              type="button"
              className="ml-1 text-white hover:underline"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
              }}
            >
              {isLogin ? 'Sign up' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Use createPortal to render the modal at the document body level
  // Ensure we have a valid portal target
  if (typeof window === 'undefined') return null;
  
  return createPortal(modalContent, document.body);
} 