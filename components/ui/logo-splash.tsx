'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { useState, useEffect } from 'react';

interface LogoSplashProps {
  onDiscover: () => void;
}

type MatrixDrop = { id: number; leftPct: number; topPct: number; delaySec: number };

export default function LogoSplash({ onDiscover }: LogoSplashProps) {
  const [currentLine, setCurrentLine] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  /** Fixed length avoids `i % 0` (NaN) before the rain interval fills cells */
  const [matrixChars, setMatrixChars] = useState<string[]>(() => Array(20).fill('0'));
  /** Random layout only after mount so server and client HTML match (hydration-safe) */
  const [matrixDrops, setMatrixDrops] = useState<MatrixDrop[]>([]);
  const prefersReducedMotion = useReducedMotion();

  const terminalLines = [
    '> system_boot.exe',
    '> loading_eden_protocol...',
    '> initializing_academic_network...',
    '> connecting_to_research_nodes...',
    '> academic_evolution_ready',
    '> press_any_key_to_continue'
  ];

  useEffect(() => {
    if (prefersReducedMotion) return;
    setMatrixDrops(
      Array.from({ length: 50 }, (_, i) => ({
        id: i,
        leftPct: (i * 2) % 100,
        topPct: Math.random() * 100,
        delaySec: Math.random() * 2,
      }))
    );
  }, [prefersReducedMotion]);

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
    <div
      className="fixed inset-0 z-50 overflow-hidden font-mono"
      style={{ background: '#ebebeb', color: '#0a0a0a' }}
    >
      {/* Matrix rain background */}
      {!prefersReducedMotion && matrixDrops.length > 0 ? (
        <div className="absolute inset-0 pointer-events-none">
          {matrixDrops.map((drop) => (
            <div
              key={drop.id}
              className="absolute text-xs"
              style={{
                left: `${drop.leftPct}%`,
                top: `${drop.topPct}%`,
                animationDelay: `${drop.delaySec}s`,
                color: 'rgba(68,68,68,0.12)',
                willChange: 'transform',
                backfaceVisibility: 'hidden',
              }}
            >
              <div className="matrix-text">
                {matrixChars[drop.id % matrixChars.length] || '0'}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Scanline effect */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="scanline absolute w-full h-px" style={{ background: 'rgba(68,68,68,0.18)' }}></div>
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
        <span className="text-sm font-mono" style={{ color: '#0a0a0a' }}>EDEN_ACADEMIC_PLATFORM_v2.1.0</span>
      </div>

      {/* Terminal window */}
      <div
        className="absolute top-16 left-4 right-4 bottom-4 backdrop-blur-sm"
        style={{ border: '1px solid #0a0a0a', background: '#ebebeb' }}
      >
        {/* Terminal header */}
        <div className="flex items-center justify-between p-2" style={{ borderBottom: '1px solid #0a0a0a' }}>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(68,68,68,0.7)' }}></div>
            <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(68,68,68,0.45)' }}></div>
            <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(68,68,68,0.25)' }}></div>
          </div>
          <span className="text-xs" style={{ color: '#0a0a0a' }}>eden@academic:~$</span>
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
              style={{ willChange: 'transform', backfaceVisibility: 'hidden' }}
              >
                <span style={{ color: 'rgba(68,68,68,0.55)' }}>eden@academic:~$ </span>
                <span style={{ color: '#0a0a0a' }}>{line}</span>
              </motion.div>
            ))}
            <div className="flex items-center text-sm">
              <span style={{ color: 'rgba(68,68,68,0.55)' }}>eden@academic:~$ </span>
              <span style={{ color: '#0a0a0a' }}>_</span>
              {showCursor && <span className="terminal-cursor">█</span>}
            </div>
          </div>

          {/* Main EDEN title */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="text-center mb-12"
            style={{ willChange: 'transform', backfaceVisibility: 'hidden' }}
          >
            <h1 className="font-unbounded text-[6.5rem] md:text-[9rem] lg:text-[11rem] font-bold mb-4 tracking-wider" style={{ color: '#0a0a0a' }}>
              EDEN
            </h1>
            <div className="text-xl font-mono mb-2" style={{ color: '#0a0a0a' }}>
              [Education's Digital Evolution Network]
            </div>
            <div className="text-sm font-mono" style={{ color: '#444444' }}>
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
              className="font-unbounded text-lg uppercase font-bold"
              style={{
                background: '#0a0a0a',
                color: '#ebebeb',
                padding: '0.75rem 2rem',
                border: 'none',
                cursor: 'pointer',
                letterSpacing: '0.05em',
                willChange: 'transform',
                backfaceVisibility: 'hidden',
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
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#0a0a0a' }}></div>
                <span>SYSTEM_ONLINE</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#0a0a0a' }}></div>
                <span>AI_READY</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#0a0a0a' }}></div>
                <span>NETWORK_ACTIVE</span>
              </div>
            </motion.div>

            {/* Interactive prompt */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5 }}
              className="text-xs font-mono mt-8"
              style={{ color: '#444444' }}
            >
              <div className="typing-effect">
                Press DISCOVER_TOOLS to initialize academic protocol...
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-16 h-16" style={{ borderLeft: '2px solid rgba(68,68,68,0.3)', borderTop: '2px solid rgba(68,68,68,0.3)' }}></div>
      <div className="absolute top-0 right-0 w-16 h-16" style={{ borderRight: '2px solid rgba(68,68,68,0.3)', borderTop: '2px solid rgba(68,68,68,0.3)' }}></div>
      <div className="absolute bottom-0 left-0 w-16 h-16" style={{ borderLeft: '2px solid rgba(68,68,68,0.3)', borderBottom: '2px solid rgba(68,68,68,0.3)' }}></div>
      <div className="absolute bottom-0 right-0 w-16 h-16" style={{ borderRight: '2px solid rgba(68,68,68,0.3)', borderBottom: '2px solid rgba(68,68,68,0.3)' }}></div>
    </div>
  );
} 