import Image from 'next/image';
import { motion } from 'framer-motion';

interface LogoSplashProps {
  onDiscover: () => void;
}

export default function LogoSplash({ onDiscover }: LogoSplashProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-8">
      {/* Logo and Text Container */}
      <motion.div 
        className="text-center space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Logo */}
        <div className="relative w-32 h-32 mx-auto mb-6">
          <Image
            src="/images/logo.png"
            alt="EDEN Logo"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent">
          EDEN
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-text-secondary max-w-md mx-auto">
          Your AI-powered academic companion for enhanced research and learning
        </p>
      </motion.div>

      {/* Discover Button */}
      <motion.button
        onClick={onDiscover}
        className="btn btn-primary px-8 py-3 text-lg rounded-full hover:scale-105 transition-transform"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        Discover Tools
      </motion.button>
    </div>
  );
} 