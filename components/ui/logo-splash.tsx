import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { useMemo } from 'react';

interface LogoSplashProps {
  onDiscover: () => void;
}

export default function LogoSplash({ onDiscover }: LogoSplashProps) {
  const taglineWords = ["[Education's", "Digital", "Evolution", "Network]"];
  const prefersReducedMotion = useReducedMotion();
  
  // Memoize particle positions to prevent recalculation on each render
  const particles = useMemo(() => {
    return [...Array(12)].map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: 3 + Math.random() * 1.5,
      delay: Math.random() * 1.5
    }));
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center overflow-hidden">
      {/* Optimized animated background - reduced number of particles */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0 overflow-hidden will-change-transform">
          {particles.map((particle, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-accent/40 rounded-full"
              style={{
                left: particle.left,
                top: particle.top,
                willChange: 'transform, opacity'
              }}
              initial={{ y: 0, opacity: 0.4, scale: 1 }}
              animate={{
                y: [-20, 0, -20],
                opacity: [0.4, 0.7, 0.4],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
                ease: "linear",
              }}
            />
          ))}
        </div>
      )}

      {/* Optimized fog overlay */}
      {!prefersReducedMotion && (
        <motion.div
          className="absolute inset-0 bg-gradient-radial from-accent/5 via-transparent to-transparent"
          initial={{ opacity: 0.3 }}
          animate={{
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ willChange: 'opacity' }}
        />
      )}

      <div className="text-center relative z-10 flex flex-col items-center justify-center min-h-screen">
        {/* Logo + EDEN - fade in together */}
        <motion.div
          className="mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <div className="mx-auto w-96 h-96 mb-1 flex items-center justify-center relative overflow-visible">
            <Image
              src="/images/logo.png"
              alt="EDEN Logo"
              width={576}
              height={576}
              className="w-[150%] h-[150%] object-contain absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              priority
            />
          </div>
          <h1 className="text-4xl font-bold text-text-primary font-logo mb-3">
            EDEN
          </h1>
        </motion.div>

        {/* Tagline - word by word animation */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.5 }}
        >
          <p className="text-lg text-text-secondary">
            {taglineWords.map((word, index) => (
              <motion.span
                key={index}
                className="inline-block mr-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 2 + index * 0.3,
                  duration: 0.6,
                  ease: "easeOut",
                }}
              >
                {word}
              </motion.span>
            ))}
          </p>
        </motion.div>

        {/* Discover Button - ripple effect */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            delay: 3.5, 
            duration: 0.8,
            type: "spring",
            stiffness: 100,
            damping: 10
          }}
        >
          <div className="relative">
            {/* Ripple effect behind button */}
            <motion.div
              className="absolute inset-0 bg-highlight/30 rounded-lg"
              initial={{ scale: 1, opacity: 0 }}
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0, 0.3, 0],
              }}
              transition={{
                delay: 3.5,
                duration: 1.5,
                ease: "easeOut",
              }}
            />
            <motion.div
              className="absolute inset-0 bg-highlight/20 rounded-lg"
              initial={{ scale: 1, opacity: 0 }}
              animate={{ 
                scale: [1, 1.4, 1],
                opacity: [0, 0.2, 0],
              }}
              transition={{
                delay: 3.7,
                duration: 1.5,
                ease: "easeOut",
              }}
            />
            
            <button
              onClick={onDiscover}
              className="relative group inline-flex items-center gap-2 px-8 py-3 text-lg bg-highlight text-black font-medium rounded-lg hover:bg-highlight/90 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-logo"
            >
              DISCOVER
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 