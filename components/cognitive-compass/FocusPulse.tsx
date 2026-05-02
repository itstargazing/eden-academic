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
    <div className="min-w-0 space-y-6 rounded-lg border border-[var(--border)] bg-[var(--bg-panel)]/90 p-6">
      <h3 className="flex items-center gap-2 text-xl font-semibold text-[var(--text)]">
        <Brain size={20} />
        Today&apos;s Focus Pulse
      </h3>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm text-[var(--text-dim)]">How focused do you feel today?</label>
          <div className="flex min-w-0 items-center gap-4">
            <input
              type="range"
              min="0"
              max="100"
              value={focus}
              onChange={(e) => setFocus(parseInt(e.target.value, 10))}
              className="h-2 min-w-0 flex-1 cursor-pointer appearance-none rounded-lg bg-[var(--bg)]"
            />
            <span className="min-w-[3ch] shrink-0 text-[var(--text)]">{focus}%</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-[var(--text-dim)]">
            <Battery size={16} />
            Energy level right now?
          </label>
          <div className="grid min-w-0 grid-cols-3 gap-2">
            {(['Low', 'Medium', 'High'] as const).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setEnergy(level)}
                className={`min-w-0 rounded-md p-2 text-sm transition-colors ${
                  energy === level
                    ? 'border border-[var(--text)] bg-[var(--bg-hover)] text-[var(--text)]'
                    : 'border border-[var(--border)] bg-[var(--bg)] text-[var(--text-dim)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)]'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-[var(--text-dim)]">
            <AlertCircle size={16} />
            Biggest distraction?
          </label>
          <div className="grid min-w-0 grid-cols-2 gap-2">
            {distractions.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDistraction(d)}
                className={`min-w-0 rounded-md p-2 text-sm transition-colors ${
                  distraction === d
                    ? 'border border-[var(--text)] bg-[var(--bg-hover)] text-[var(--text)]'
                    : 'border border-[var(--border)] bg-[var(--bg)] text-[var(--text-dim)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)]'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <button type="button" onClick={handleSubmit} className="btn btn-primary w-full py-2 px-4">
          Update Focus Status
        </button>
      </div>
    </div>
  );
}
