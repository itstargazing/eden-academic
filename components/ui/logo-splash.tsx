'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { useState, useEffect } from 'react';

interface LogoSplashProps {
  onDiscover: () => void;
}

export default function LogoSplash({ onDiscover }: LogoSplashProps) {
  const [currentLine, setCurrentLine] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [matrixChars, setMatrixChars] = useState<string[]>([]);
  const prefersReducedMotion = useReducedMotion();

  const terminalLines = [
    '> system_boot.exe',
    '> loading_eden_protocol...',
    '> initializing_academic_network...',
    '> connecting_to_research_nodes...',
    '> academic_evolution_ready',
    '> press_any_key_to_continue'
  ];

  // Matrix rain effect
  useEffect(() => {
    if (prefersReducedMotion) return;
    
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const interval = setInterval(() => {
      setMatrixChars(prev => {
        const newChars = [...prev];
        for (let i = 0; i < 5; i++) {
          newChars[Math.floor(Math.random() * 20)] = chars[Math.floor(Math.random() * chars.length)];
        }
        return newChars.slice(0, 20);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  // Terminal typing effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLine(prev => (prev + 1) % terminalLines.length);
    }, 800);

    return () => clearInterval(interval);
  }, []);

  // Cursor blink effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black text-white overflow-hidden font-mono">
      {/* Matrix rain background */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute text-white/10 text-xs"
              style={{
                left: `${(i * 2) % 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`
              }}
            >
              <div className="matrix-text">
                {matrixChars[i % matrixChars.length] || '0'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Scanline effect */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="scanline absolute w-full h-px bg-white/20"></div>
        </div>
      )}

      {/* Top bar with small logo */}
      <div className="absolute top-4 left-4 flex items-center space-x-3 z-10">
        <Image
          src="/images/logo.png"
          alt="EDEN Logo"
          width={32}
          height={32}
          className="rounded-sm"
        />
        <span className="text-sm font-mono">EDEN_ACADEMIC_PLATFORM_v2.1.0</span>
      </div>

      {/* Terminal window */}
      <div className="absolute top-16 left-4 right-4 bottom-4 border border-white/30 bg-black/80 backdrop-blur-sm">
        {/* Terminal header */}
        <div className="flex items-center justify-between p-2 border-b border-white/30">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-white/60"></div>
            <div className="w-3 h-3 rounded-full bg-white/40"></div>
            <div className="w-3 h-3 rounded-full bg-white/20"></div>
          </div>
          <span className="text-xs">eden@academic:~$</span>
        </div>

        {/* Terminal content */}
        <div className="p-4 h-full flex flex-col justify-center items-center">
          {/* Terminal output */}
          <div className="w-full max-w-2xl mb-8">
            {terminalLines.slice(0, currentLine + 1).map((line, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="mb-2 text-sm"
              >
                <span className="text-white/60">eden@academic:~$ </span>
                <span className="text-white">{line}</span>
              </motion.div>
            ))}
            <div className="flex items-center text-sm">
              <span className="text-white/60">eden@academic:~$ </span>
              <span className="text-white">_</span>
              {showCursor && <span className="terminal-cursor">█</span>}
            </div>
          </div>

          {/* Main EDEN title */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="font-unbounded text-8xl md:text-9xl font-bold text-white mb-4 tracking-wider">
              EDEN
            </h1>
            <div className="text-xl font-mono text-white/80 mb-2">
              [Education's Digital Evolution Network]
            </div>
            <div className="text-sm font-mono text-white/60">
              Academic Research Platform • AI-Powered Tools • Global Network
            </div>
          </motion.div>

          {/* Interactive elements */}
          <div className="text-center space-y-4">
            {/* Discover button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              onClick={onDiscover}
              className="bg-transparent border-2 border-white text-white px-8 py-3 text-lg font-mono uppercase tracking-wider hover:bg-white hover:text-black transition-all duration-300 font-bold"
              onMouseEnter={() => {
                if (!prefersReducedMotion) {
                  document.querySelector('.discover-btn')?.classList.add('glitch-effect');
                }
              }}
              onMouseLeave={() => {
                document.querySelector('.discover-btn')?.classList.remove('glitch-effect');
              }}
            >
              DISCOVER_TOOLS
            </motion.button>

            {/* Status indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              className="flex justify-center space-x-8 text-sm font-mono"
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span>SYSTEM_ONLINE</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span>AI_READY</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span>NETWORK_ACTIVE</span>
              </div>
            </motion.div>

            {/* Interactive prompt */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5 }}
              className="text-xs font-mono text-white/60 mt-8"
            >
              <div className="typing-effect">
                Press DISCOVER_TOOLS to initialize academic protocol...
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-white/30"></div>
      <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-white/30"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-white/30"></div>
      <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-white/30"></div>

      {/* Glitch overlay */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-white/5 mix-blend-overlay opacity-0 animate-pulse"></div>
        </div>
      )}
    </div>
  );
} 