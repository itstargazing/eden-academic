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
    <div className="space-y-6 p-6 bg-background rounded-lg border border-white/10">
      <h3 className="text-xl font-semibold text-white">Smart Suggestions</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Soundscape */}
        <div className="p-4 bg-background rounded-lg border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Music size={18} className="text-white/70" />
            <h4 className="text-white">Ideal Soundscape</h4>
          </div>
          <p className="text-white/70">{getSoundscape()}</p>
        </div>

        {/* Study Block */}
        <div className="p-4 bg-background rounded-lg border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={18} className="text-white/70" />
            <h4 className="text-white">Suggested Study Block</h4>
          </div>
          <p className="text-white/70">{getStudyBlock()}</p>
        </div>

        {/* Partner Type */}
        <div className="p-4 bg-background rounded-lg border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Users size={18} className="text-white/70" />
            <h4 className="text-white">Partner Match</h4>
          </div>
          <p className="text-white/70">
            {profile.focusStyle === 'Deep' 
              ? 'Deep Focus Partners Online'
              : profile.focusStyle === 'Sprint'
              ? 'Sprint Study Buddies'
              : 'Balanced Study Groups'}
          </p>
        </div>

        {/* Challenge */}
        <div className="p-4 bg-background rounded-lg border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Target size={18} className="text-white/70" />
            <h4 className="text-white">Mini Challenge</h4>
          </div>
          <p className="text-white/70">{getChallenge()}</p>
        </div>
      </div>
    </div>
  );
} 