"use client";

import { useState } from 'react';
import { Brain, Battery, AlertCircle } from 'lucide-react';

interface FocusPulseProps {
  onUpdate: (data: {
    focus: number;
    energy: 'Low' | 'Medium' | 'High';
    distraction: string;
  }) => void;
}

export default function FocusPulse({ onUpdate }: FocusPulseProps) {
  const [focus, setFocus] = useState(50);
  const [energy, setEnergy] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [distraction, setDistraction] = useState('None');

  const distractions = ['Phone', 'Noise', 'Thoughts', 'None'];

  const handleSubmit = () => {
    onUpdate({ focus, energy, distraction });
  };

  return (
    <div className="space-y-6 p-6 bg-background/50 rounded-lg border border-white/10">
      <h3 className="text-xl font-semibold text-white flex items-center gap-2">
        <Brain size={20} />
        Today's Focus Pulse
      </h3>

      <div className="space-y-6">
        {/* Focus Slider */}
        <div className="space-y-2">
          <label className="text-sm text-white/70">How focused do you feel today?</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="100"
              value={focus}
              onChange={(e) => setFocus(parseInt(e.target.value))}
              className="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-white min-w-[3ch]">{focus}%</span>
          </div>
        </div>

        {/* Energy Level */}
        <div className="space-y-2">
          <label className="text-sm text-white/70 flex items-center gap-2">
            <Battery size={16} />
            Energy level right now?
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['Low', 'Medium', 'High'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setEnergy(level)}
                className={`p-2 rounded-md text-sm transition-colors ${
                  energy === level
                    ? 'bg-white/20 text-white'
                    : 'bg-background hover:bg-white/10 text-white/70'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Distraction Type */}
        <div className="space-y-2">
          <label className="text-sm text-white/70 flex items-center gap-2">
            <AlertCircle size={16} />
            Biggest distraction?
          </label>
          <div className="grid grid-cols-2 gap-2">
            {distractions.map((d) => (
              <button
                key={d}
                onClick={() => setDistraction(d)}
                className={`p-2 rounded-md text-sm transition-colors ${
                  distraction === d
                    ? 'bg-white/20 text-white'
                    : 'bg-background hover:bg-white/10 text-white/70'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full py-2 px-4 bg-white/10 hover:bg-white/20 text-white rounded-md transition-colors"
        >
          Update Focus Status
        </button>
      </div>
    </div>
  );
} 