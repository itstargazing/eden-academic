import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { AuthButtons } from './auth-buttons';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] md:w-full max-w-[420px] bg-black border border-white/10 p-6 md:p-8 rounded-xl shadow-2xl z-50 mx-auto"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white font-unbounded">Welcome to EDEN</h2>
                <p className="text-text-secondary mt-1">Sign in to continue</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Close"
              >
                <X size={20} className="text-text-secondary" />
              </button>
            </div>

            <div className="mb-8">
              <p className="text-text-secondary">
                Sign in to save your progress, sync across devices, and access all features of EDEN's academic toolkit.
              </p>
            </div>

            <AuthButtons />

            <p className="text-xs text-text-secondary text-center mt-6">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 