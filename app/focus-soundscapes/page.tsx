'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Flame,
  Loader2,
  Moon,
  Pause,
  Play,
  RotateCcw,
  Save,
  TreePine,
  Volume2,
  Waves,
  Wind,
  Zap,
} from 'lucide-react';
import SaveResultsBanner from '@/components/auth/save-results-banner';
import GalaxyAnimation from '@/components/GalaxyAnimation';
import { useAudioEngine } from '@/hooks/use-audio-engine';

const PRESETS = {
  'Stormy Weather': { Rain: 80, Thunder: 40, Wind: 0, Forest: 0, Fireplace: 0, Midnight: 0 },
  'Deep Forest': { Rain: 0, Thunder: 0, Wind: 30, Forest: 90, Fireplace: 0, Midnight: 0 },
  'Cozy Evening': { Rain: 40, Thunder: 0, Wind: 0, Forest: 0, Fireplace: 80, Midnight: 0 },
  'Peaceful Rain': { Rain: 100, Thunder: 0, Wind: 0, Forest: 0, Fireplace: 0, Midnight: 0 },
};

const SOUND_ICONS = {
  Rain: Waves,
  Thunder: Zap,
  Wind,
  Forest: TreePine,
  Fireplace: Flame,
  Midnight: Moon,
};

function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
}

export default function FocusSoundscapesPage() {
  const { volumes, playing, setVolume, toggleSound, applyPreset, resetAll, soundNames } = useAudioEngine();

  const [seconds, setSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [targetSeconds, setTargetSeconds] = useState(25 * 60);
  const [durationChoice, setDurationChoice] = useState<'25' | '45' | '60' | 'custom'>('25');
  const [customMinutes, setCustomMinutes] = useState('25');
  const [activePreset, setActivePreset] = useState('');
  const [saveToast, setSaveToast] = useState('');

  useEffect(() => {
    const savedMix = localStorage.getItem('eden-saved-mix');

    if (!savedMix) {
      return;
    }

    const parsed = JSON.parse(savedMix) as {
      volumes?: Record<string, number>;
    };

    Object.entries(parsed.volumes || {}).forEach(([name, value]) => {
      if (typeof value === 'number' && soundNames.includes(name as keyof typeof volumes)) {
        setVolume(name as keyof typeof volumes, value);
      }
    });
  }, [setVolume, soundNames, volumes]);

  useEffect(() => {
    if (!timerRunning) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setSeconds((previous) => {
        if (previous <= 1) {
          window.clearInterval(interval);
          setTimerRunning(false);

          if (Notification.permission === 'granted') {
            new Notification('EDEN Focus Session Complete! Take a break.');
          }

          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [timerRunning]);

  const soundsPlaying = Object.values(playing).filter(Boolean).length;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = targetSeconds > 0 ? seconds / targetSeconds : 0;
  const strokeDashoffset = circumference * (1 - progress);

  const handleDurationSelect = (choice: '25' | '45' | '60' | 'custom') => {
    setDurationChoice(choice);

    if (choice === '25') {
      setTargetSeconds(25 * 60);
      setSeconds(25 * 60);
      return;
    }

    if (choice === '45') {
      setTargetSeconds(45 * 60);
      setSeconds(45 * 60);
      return;
    }

    if (choice === '60') {
      setTargetSeconds(60 * 60);
      setSeconds(60 * 60);
    }
  };

  const handleCustomApply = () => {
    const minutes = Number(customMinutes);

    if (!minutes || minutes < 1) {
      return;
    }

    setTargetSeconds(minutes * 60);
    setSeconds(minutes * 60);
  };

  const handleStart = async () => {
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    setSeconds(targetSeconds);
    setTimerRunning(true);
  };

  const handleSaveMix = () => {
    localStorage.setItem(
      'eden-saved-mix',
      JSON.stringify({
        volumes,
        playing,
      }),
    );

    setSaveToast('Mix saved!');
    window.setTimeout(() => setSaveToast(''), 2000);
  };

  const presetEntries = useMemo(() => Object.entries(PRESETS), []);

  return (
    <div className="split-layout min-h-screen w-full max-w-full">
      <div className="split-left flex flex-col items-center justify-center overflow-hidden bg-[var(--bg-panel)] p-6 sm:p-10">
        <GalaxyAnimation label="Focus Soundscapes" />
      </div>
      <div className="split-right flex min-h-0 w-full max-w-full min-w-0 flex-col gap-6 bg-[var(--bg)] p-6 sm:p-8 xl:overflow-y-auto">
    <div className="feature-page min-w-0 max-w-full space-y-8">
      <section className="py-6">
        <div className="flex items-center gap-4">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-panel)] p-3">
            <Volume2 size={32} className="text-[var(--text)]" />
          </div>
          <div>
            <h1 className="page-header">Focus Soundscapes</h1>
            <p className="text-text-secondary">Build a study sound mix and run timed focus sessions</p>
          </div>
        </div>
      </section>

      <section className="grid min-w-0 gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="card min-w-0 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="section-title">Ambient Mix</h2>
            <span className="text-sm text-text-secondary">{soundsPlaying} sounds playing</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {soundNames.map((soundName) => {
              const Icon = SOUND_ICONS[soundName];

              return (
                <div key={soundName} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-panel)] p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon size={20} className="text-[var(--text)]" />
                      <h3 className="font-semibold text-[var(--text)]">{soundName}</h3>
                    </div>
                    <button
                      onClick={() => void toggleSound(soundName)}
                      className="rounded-full border border-[var(--border)] p-2 text-[var(--text)] transition hover:bg-[var(--bg-hover)]"
                    >
                      {playing[soundName] ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                  </div>

                  <div className="mt-5 space-y-2">
                    <div className="flex items-center justify-between text-sm text-text-secondary">
                      <span>Volume</span>
                      <span>{volumes[soundName]}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={volumes[soundName]}
                      onChange={(event) => setVolume(soundName, Number(event.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-[var(--text)]">Preset mixes</h3>
            <div className="grid gap-3 md:grid-cols-2">
              {presetEntries.map(([name, preset]) => (
                <button
                  key={name}
                  onClick={() => {
                    void applyPreset(preset);
                    setActivePreset(name);
                  }}
                  className={`rounded-2xl border p-4 text-left transition ${
                    activePreset === name
                      ? 'border-[var(--text)] bg-[var(--bg-hover)]'
                      : 'border-[var(--border)] bg-[var(--bg-panel)] hover:bg-[var(--bg-hover)]'
                  }`}
                >
                  <p className="font-semibold text-[var(--text)]">{name}</p>
                  <p className="mt-2 text-sm text-text-secondary">
                    Click to load this mix and start the sounds with non-zero volume.
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={handleSaveMix} className="btn btn-primary inline-flex items-center gap-2">
              <Save size={16} />
              Save Mix
            </button>
            <button
              onClick={() => {
                resetAll();
                setActivePreset('');
              }}
              className="btn btn-secondary inline-flex items-center gap-2"
            >
              <RotateCcw size={16} />
              Reset
            </button>
          </div>

          {saveToast ? (
            <div className="rounded-xl border border-[var(--success)] bg-[#eef8ef] px-4 py-3 text-sm text-[var(--success)]">
              {saveToast}
            </div>
          ) : null}
        </div>

        <div className="card min-w-0 space-y-6">

          <div className="flex flex-wrap gap-2">
            {[
              ['25', '25 min'],
              ['45', '45 min'],
              ['60', '60 min'],
              ['custom', 'Custom'],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => handleDurationSelect(value as '25' | '45' | '60' | 'custom')}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  durationChoice === value
                    ? 'border-[var(--text)] bg-[var(--bg-hover)] text-[var(--text)]'
                    : 'border-[var(--border)] text-[var(--text-dim)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {durationChoice === 'custom' ? (
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="number"
                min={1}
                value={customMinutes}
                onChange={(event) => setCustomMinutes(event.target.value)}
                className="input"
                placeholder="Minutes"
              />
              <button onClick={handleCustomApply} className="btn btn-secondary">
                Apply
              </button>
            </div>
          ) : null}

          <div className="flex justify-center">
            <div className="relative h-36 w-36 sm:h-44 sm:w-44">
              <svg className="h-36 w-36 -rotate-90 sm:h-44 sm:w-44" viewBox="0 0 176 176">
                <circle
                  cx="88"
                  cy="88"
                  r={radius}
                  stroke="var(--border)"
                  strokeWidth="10"
                  fill="none"
                />
                <circle
                  cx="88"
                  cy="88"
                  r={radius}
                  stroke="var(--text-dim)"
                  strokeWidth="10"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-2xl font-semibold text-[var(--text)] sm:text-3xl">
                {formatTime(seconds)}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button onClick={handleStart} className="btn btn-primary inline-flex items-center gap-2">
              <Play size={16} />
              Start
            </button>
            <button
              onClick={() => setTimerRunning((previous) => !previous)}
              disabled={seconds === 0}
              className="btn btn-secondary inline-flex items-center gap-2"
            >
              {timerRunning ? <Pause size={16} /> : <Loader2 size={16} className="opacity-0" />}
              {timerRunning ? 'Pause' : 'Resume'}
            </button>
            <button
              onClick={() => {
                setSeconds(targetSeconds);
                setTimerRunning(false);
              }}
              className="btn btn-secondary inline-flex items-center gap-2"
            >
              <RotateCcw size={16} />
              Reset
            </button>
          </div>
        </div>
      </section>

      <SaveResultsBanner />
    </div>
      </div>
    </div>
  );
}
