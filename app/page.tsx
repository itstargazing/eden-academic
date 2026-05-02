"use client";

import { useState, useEffect } from 'react';
import { useUserStore } from '../store/user-store';
import LogoSplash from '../components/ui/logo-splash';
import Introduction from '../components/ui/introduction';
import SystemMapFeatures from '../components/ui/system-map-features';

export default function HomePage() {
  const [showLogoSplash, setShowLogoSplash] = useState(true);
  const [showIntroduction, setShowIntroduction] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const { 
    isLoggedIn, 
    username, 
    studySessions
  } = useUserStore();

  // Blinking cursor effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible(v => !v);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Don't render anything until hydrated to avoid mismatch
  if (!isHydrated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#ebebeb', minHeight: '100vh', color: '#0a0a0a' }}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0a0a0a]"></div>
      </div>
    );
  }

  // First show the logo splash page
  if (showLogoSplash) {
    return <LogoSplash onDiscover={() => {
      setShowLogoSplash(false);
      setShowIntroduction(true);
    }} />;
  }
  
  // Then show the introduction with features
  if (showIntroduction) {
    return <Introduction onComplete={() => setShowIntroduction(false)} />;
  }

  return (
    <div
      className="font-mono space-y-8 sm:space-y-12 max-w-full"
      style={{ background: '#ebebeb', minHeight: '100vh', color: '#0a0a0a' }}
    >
      {/* Terminal Header */}
      <section className="space-y-2">
        <div className="flex items-center gap-2 text-accent">
          <span>📁</span>
          <span className="text-text-secondary">eden@{username || 'user'}:~$</span>
          <span className={cursorVisible ? 'opacity-100' : 'opacity-0'}>▊</span>
        </div>
        
        {isLoggedIn && (
          <div className="pl-4 sm:pl-6 text-text-secondary">
            <p className="text-sm sm:text-base">Welcome back, {username}. Your tools are synced.</p>
          </div>
        )}
      </section>

      <SystemMapFeatures />

      {/* Active Sessions */}
      {studySessions.length > 0 && (
        <section className="pl-4 sm:pl-6 space-y-2">
          <div className="flex items-center gap-2 text-accent">
            <span>⏳</span>
            <span>Active Sessions</span>
          </div>
          {studySessions.slice(0, 3).map((session, i) => (
            <div key={i} className="pl-4 sm:pl-6 text-xs sm:text-sm text-text-secondary">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <span>Focus:</span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <div
                      key={j}
                      className={`h-1 w-3 rounded-full sm:w-4 ${
                        j < 3 ? 'bg-[var(--text-dim)]' : 'bg-[var(--border)]'
                      }`}
                    />
                  ))}
                </div>
                <span>{session.duration}m left</span>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
