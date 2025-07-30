"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, BookMarked, 
  Calendar, CheckCircle
} from 'lucide-react';
import { useUserStore } from '../store/user-store';
import LogoSplash from '../components/ui/logo-splash';
import Introduction from '../components/ui/introduction';

const tools = [
  {
    name: "BrainMerge",
    description: "Match with research collaborators",
    command: "brainmerge",
    href: "/brain-merge"
  },
  {
    name: "ThesisSculptor",
    description: "Build papers using AI frameworks",
    command: "thesissculptor",
    href: "/thesis-sculptor"
  },
  {
    name: "MindMap Translator",
    description: "Visualize lecture notes",
    command: "mindmap",
    href: "/mindmap-translator"
  },
  {
    name: "StudyTime Synch",
    description: "Virtual study room with focus tracking",
    command: "studytime",
    href: "/studytime-synch"
  },
  {
    name: "GhostCitations",
    description: "Recover lost references",
    command: "ghostcite",
    href: "/ghost-citations"
  },
  {
    name: "Syllabus Whisperer",
    description: "Personalize your learning path",
    command: "syllabus",
    href: "/syllabus-whisperer"
  },
  {
    name: "Cognitive Compass",
    description: "Optimize your focus environment",
    command: "compass",
    href: "/cognitive-compass"
  },
  {
    name: "Stress Alchemist",
    description: "Strengthen academic resilience",
    command: "alchemist",
    href: "/stress-alchemist"
  },
  {
    name: "Focus Soundscapes",
    description: "Ambient sounds for study",
    command: "soundscape",
    href: "/focus-soundscapes"
  }
];

export default function HomePage() {
  const [showLogoSplash, setShowLogoSplash] = useState(true);
  const [showIntroduction, setShowIntroduction] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
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

  // Reset states when component mounts
  useEffect(() => {
    // Remove this effect as it's redundant with the initial state
  }, []);

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
    <div className="font-mono space-y-8 sm:space-y-12 max-w-3xl">
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

      {/* Tools List */}
      <section className="space-y-4 sm:space-y-6 relative">
        {/* Vertical Line */}
        <div className="absolute left-1 sm:left-2 top-0 bottom-0 w-px bg-white/10" />

        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="block pl-4 sm:pl-6 group relative hover:bg-white/5 py-2 -ml-1 sm:-ml-2 pr-3 sm:pr-4 rounded-r-lg border-l-2 border-transparent hover:border-accent transition-colors"
          >
                          <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-accent">→</span>
                  <span className="font-semibold text-sm sm:text-base">{tool.name}</span>
                </div>
                <p className="text-text-secondary text-xs sm:text-sm pl-4 sm:pl-6">
                  {tool.description}
                </p>
                <div className="pl-4 sm:pl-6 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                  <code className="text-accent">$ run {tool.command}</code>
                  <span className="text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                    Press Enter
                  </span>
                </div>
              </div>
          </Link>
        ))}
      </section>

      {/* Active Sessions */}
      {studySessions.length > 0 && (
        <section className="pl-4 sm:pl-6 space-y-2">
          <div className="flex items-center gap-2 text-accent">
            <span>⏳</span>
            <span>Active Sessions</span>
          </div>
          {studySessions.slice(0, 3).map((session, i) => (
            <div key={i} className="pl-4 sm:pl-6 text-xs sm:text-sm text-text-secondary">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span>Focus:</span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div 
                        key={i}
                        className={`h-1 w-3 sm:w-4 rounded-full ${
                          i < 3 ? 'bg-accent' : 'bg-white/20'
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
