"use client";

import { useState, useEffect } from 'react';
import { Clock, Users, BarChart, Play, Pause, Repeat } from 'lucide-react';
import GalaxyAnimation from '@/components/GalaxyAnimation';
import { useUserStore } from '@/store/user-store';
import { v4 as uuidv4 } from 'uuid';

interface StudyPartner {
  id: string;
  name: string;
  topic: string;
  focusScore: number;
  status: 'studying' | 'break';
  lastActive: string;
  timeStudied: string;
  isConnected: boolean;
}

export default function StudyTimeSynchPage() {
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [focusLevel, setFocusLevel] = useState(70);
  const [topic, setTopic] = useState('');
  const [availablePartners, setAvailablePartners] = useState<StudyPartner[]>([
    { 
      id: '1', 
      name: 'Alex', 
      topic: 'Machine Learning', 
      focusScore: 85,
      status: 'studying',
      lastActive: '2 min ago',
      timeStudied: '1:45:00',
      isConnected: false
    },
    { 
      id: '2', 
      name: 'Jordan', 
      topic: 'Cognitive Science', 
      focusScore: 78,
      status: 'break',
      lastActive: '5 min ago',
      timeStudied: '0:45:00',
      isConnected: false
    },
    { 
      id: '3', 
      name: 'Taylor', 
      topic: 'Molecular Biology', 
      focusScore: 92,
      status: 'studying',
      lastActive: 'now',
      timeStudied: '2:15:00',
      isConnected: false
    }
  ]);
  const { addStudySession } = useUserStore();

  const [selectedPartner, setSelectedPartner] = useState<StudyPartner | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning) {
      interval = setInterval(() => {
        setTimer(prevTime => prevTime + 1);
        
        // Randomly fluctuate focus level to simulate real tracking
        if (timer % 30 === 0) { // Every 30 seconds
          setFocusLevel(prev => {
            const change = Math.floor(Math.random() * 11) - 5; // -5 to +5
            const newValue = Math.max(0, Math.min(100, prev + change));
            return newValue;
          });
        }
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, timer]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimer(0);
    setFocusLevel(70);
  };

  const endSession = () => {
    if (timer > 0) {
      addStudySession({
        id: uuidv4(),
        topic: topic || 'Untitled Session',
        duration: timer,
        focusLevel,
        date: new Date()
      });
      
      resetTimer();
      setTopic('');
    }
  };

  const connectWithPartner = (partnerId: string) => {
    setAvailablePartners(partners =>
      partners.map(partner => 
        partner.id === partnerId
          ? { ...partner, isConnected: true }
          : partner
      )
    );
    setShowConnectModal(false);
  };

  const initiateConnection = (partner: StudyPartner) => {
    setSelectedPartner(partner);
    setShowConnectModal(true);
  };

  return (
    <div className="split-layout min-h-screen w-full max-w-full">
      <div className="split-left flex flex-col items-center justify-center overflow-hidden bg-[var(--bg-panel)] p-6 sm:p-10">
        <GalaxyAnimation label="StudyTime Synch" />
      </div>
      <div className="split-right flex min-h-0 w-full max-w-full min-w-0 flex-col gap-6 bg-[var(--bg)] p-6 sm:p-8 xl:overflow-y-auto">
    <div className="space-y-8 feature-page min-w-0 max-w-full">
      <section className="py-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-background border border-[var(--border)] rounded-lg">
            <Clock size={32} className="text-[var(--text)]" />
          </div>
          <div>
            <h1 className="page-header">StudyTime Synch</h1>
            <p className="text-text-secondary">Track your focus and find compatible study companions</p>
          </div>
        </div>
      </section>
      
      <div className="grid min-w-0 max-w-full grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Timer Card */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title mb-0">Focus Timer</h2>
            <Clock className="text-[var(--text)]" size={20} />
          </div>
          
          <div className="space-y-6">
            <input
              type="text"
              placeholder="What are you studying today?"
              className="input"
              value={topic}
              onChange={e => setTopic(e.target.value)}
            />
            
            <div className="flex justify-center">
              <div className="text-3xl font-mono font-bold text-[var(--text)] tabular-nums sm:text-5xl">
                {formatTime(timer)}
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-4">
              <button 
                onClick={toggleTimer}
                className="btn btn-secondary p-3 rounded-full"
              >
                {isRunning ? <Pause size={24} /> : <Play size={24} />}
              </button>
              
              <button 
                onClick={resetTimer}
                className="btn btn-secondary p-3 rounded-full"
              >
                <Repeat size={24} />
              </button>
              
              <button 
                onClick={endSession}
                className="btn btn-secondary"
              >
                End Session
              </button>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-secondary">Current Focus Level</span>
              <span className="text-sm font-medium text-[var(--text)]">{focusLevel}%</span>
            </div>
            <div className="h-2 w-full bg-background rounded-full overflow-hidden">
              <div 
                className="h-full bg-[var(--text-dim)] rounded-full"
                style={{ width: `${focusLevel}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* Focus Stats Card */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title mb-0">Focus Stats</h2>
            <BarChart className="text-[var(--text)]" size={20} />
          </div>
          
          {isRunning ? (
            <div className="space-y-4">
              <div className="p-3 rounded-md bg-background border border-[var(--border)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-text-secondary">Session Duration</span>
                  <span className="text-sm font-medium text-[var(--text)]">{formatTime(timer)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Average Focus</span>
                  <span className="text-sm font-medium text-[var(--text)]">{focusLevel}%</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-text-secondary text-sm">Start a session to see your stats</p>
          )}
        </div>
      </div>

      {/* Available Partners */}
      <section className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="section-title mb-0">Available Study Partners</h2>
            <Users className="text-[var(--text)]" size={20} />
          </div>
        </div>
        
        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {availablePartners.map(partner => (
            <div 
              key={partner.id}
              className="p-4 rounded-lg bg-background border border-[var(--border)]"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-[var(--text)]">{partner.name}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  partner.status === 'studying' 
                    ? 'bg-[var(--bg-hover)] text-[var(--text)] border border-[var(--border)]'
                    : 'bg-[var(--bg-hover)] text-[var(--text-dim)]'
                }`}>
                  {partner.status}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <p className="text-sm text-text-secondary">{partner.topic}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-background-light rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[var(--text-dim)] rounded-full"
                      style={{ width: `${partner.focusScore}%` }}
                    />
                  </div>
                  <span className="text-xs text-text-secondary">{partner.focusScore}%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>{partner.lastActive}</span>
                <button
                  onClick={() => initiateConnection(partner)}
                  className="btn btn-secondary text-xs py-1"
                  disabled={partner.isConnected}
                >
                  {partner.isConnected ? 'Connected' : 'Connect'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Connection Modal */}
      {showConnectModal && selectedPartner && (
        <div className="fixed inset-0 bg-[rgba(176,176,176,0.35)] backdrop-blur-[1px] flex items-center justify-center z-50">
          <div className="bg-[var(--bg-panel)] border border-[var(--border)] p-6 rounded-lg max-w-full w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Connect with {selectedPartner.name}</h3>
            <p className="text-text-secondary mb-6">
              Would you like to connect with {selectedPartner.name} who is currently studying {selectedPartner.topic}?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => connectWithPartner(selectedPartner.id)}
                className="flex-1 py-2 px-4 border border-[var(--border)] bg-[var(--bg-panel)] text-[var(--text)] rounded-md hover:bg-[var(--bg-hover)]"
              >
                Connect
              </button>
              <button
                onClick={() => setShowConnectModal(false)}
                className="flex-1 py-2 px-4 border border-[var(--border)] bg-[var(--bg-hover)] text-[var(--text)] rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
      </div>
    </div>
  );
} 