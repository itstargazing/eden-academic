"use client";

import { Music, Clock, Users, Target } from 'lucide-react';

interface SuggestionPanelProps {
  profile: {
    type: string;
    focusStyle: string;
    answers: Record<string, string>;
  };
  pulseData: {
    focus: number;
    energy: 'Low' | 'Medium' | 'High';
    distraction: string;
  };
}

export default function SuggestionPanel({ profile, pulseData }: SuggestionPanelProps) {
  const getSoundscape = () => {
    if (pulseData.energy === 'Low') return 'Rain + Fireplace';
    if (pulseData.distraction === 'Noise') return 'White Noise';
    return 'Forest Ambience';
  };

  const getStudyBlock = () => {
    const duration = profile.answers.duration;
    if (duration?.includes('15-25')) return '20-min sprint, 5-min break';
    if (duration?.includes('25-45')) return '30-min focus, 7-min break';
    return '45-min deep work, 10-min break';
  };

  const getChallenge = () => {
    if (pulseData.distraction === 'Phone') return 'Phone-free 25 minutes';
    if (pulseData.energy === 'Low') return '10-min power focus';
    return '30-min deep work sprint';
  };

  return (
    <div className="min-w-0 space-y-6 rounded-lg border border-[var(--border)] bg-[var(--bg-panel)] p-6">
      <h3 className="text-xl font-semibold text-[var(--text)]">Smart Suggestions</h3>
      
      <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
        <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-4">
          <div className="mb-2 flex items-center gap-2">
            <Music size={18} className="text-[var(--text-dim)]" />
            <h4 className="text-[var(--text)]">Ideal Soundscape</h4>
          </div>
          <p className="break-words text-[var(--text-dim)]">{getSoundscape()}</p>
        </div>

        <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-4">
          <div className="mb-2 flex items-center gap-2">
            <Clock size={18} className="text-[var(--text-dim)]" />
            <h4 className="text-[var(--text)]">Suggested Study Block</h4>
          </div>
          <p className="break-words text-[var(--text-dim)]">{getStudyBlock()}</p>
        </div>

        <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-4">
          <div className="mb-2 flex items-center gap-2">
            <Users size={18} className="text-[var(--text-dim)]" />
            <h4 className="text-[var(--text)]">Partner Match</h4>
          </div>
          <p className="break-words text-[var(--text-dim)]">
            {profile.focusStyle === 'Deep' 
              ? 'Deep Focus Partners Online'
              : profile.focusStyle === 'Sprint'
              ? 'Sprint Study Buddies'
              : 'Balanced Study Groups'}
          </p>
        </div>

        <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-4">
          <div className="mb-2 flex items-center gap-2">
            <Target size={18} className="text-[var(--text-dim)]" />
            <h4 className="text-[var(--text)]">Mini Challenge</h4>
          </div>
          <p className="break-words text-[var(--text-dim)]">{getChallenge()}</p>
        </div>
      </div>
    </div>
  );
}
