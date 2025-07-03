"use client";

import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Play, Pause, RotateCcw, Save, Waves, Zap, Wind, TreePine, Flame, Moon } from "lucide-react";

interface SoundConfig {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  file: string;
  isPlaying: boolean;
  volume: number;
}

interface SoundSettings {
  [key: string]: {
    isPlaying: boolean;
    volume: number;
  };
}

export default function FocusSoundscapesPage() {
  const [sounds, setSounds] = useState<SoundConfig[]>([
    {
      id: 'rain',
      name: 'Rain',
      icon: Waves,
      color: 'text-blue-400',
      file: '/sounds/rain.mp3',
      isPlaying: false,
      volume: 50
    },
    {
      id: 'thunder',
      name: 'Thunder',
      icon: Zap,
      color: 'text-purple-400',
      file: '/sounds/thunder.mp3',
      isPlaying: false,
      volume: 50
    },
    {
      id: 'wind',
      name: 'Wind',
      icon: Wind,
      color: 'text-gray-400',
      file: '/sounds/wind.mp3',
      isPlaying: false,
      volume: 50
    },
    {
      id: 'forest',
      name: 'Forest',
      icon: TreePine,
      color: 'text-green-400',
      file: '/sounds/forest.mp3',
      isPlaying: false,
      volume: 50
    },
    {
      id: 'fireplace',
      name: 'Fireplace',
      icon: Flame,
      color: 'text-orange-400',
      file: '/sounds/fireplace.mp3',
      isPlaying: false,
      volume: 50
    },
    {
      id: 'midnight',
      name: 'Midnight',
      icon: Moon,
      color: 'text-indigo-400',
      file: '/sounds/midnight.mp3',
      isPlaying: false,
      volume: 50
    }
  ]);

  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const [isLoaded, setIsLoaded] = useState(true); // Set to true for demo purposes
  const [savedMix, setSavedMix] = useState<string | null>(null);
  const [focusTimer, setFocusTimer] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio elements with graceful fallback
  useEffect(() => {
    const initializeAudio = async () => {
      sounds.forEach(sound => {
        const audio = new Audio();
        audio.src = sound.file;
        audio.loop = true;
        audio.volume = sound.volume / 100;
        audio.preload = 'auto';
        
        // Handle audio loading errors gracefully
        audio.addEventListener('error', () => {
          console.warn(`Audio file not found: ${sound.file}`);
        });
        
        audioRefs.current[sound.id] = audio;
      });

      // Restore saved settings
      restoreSettings();
    };

    initializeAudio();

    return () => {
      Object.values(audioRefs.current).forEach(audio => {
        audio.pause();
        audio.src = '';
      });
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const restoreSettings = () => {
    try {
      const saved = localStorage.getItem('focus-soundscapes-settings');
      if (saved) {
        const settings = JSON.parse(saved);
        setSounds(prevSounds => 
          prevSounds.map(sound => ({
            ...sound,
            isPlaying: settings[sound.id]?.isPlaying || false,
            volume: settings[sound.id]?.volume || 50
          }))
        );
        setSavedMix('Current Mix');
      }
    } catch (error) {
      console.error('Error restoring settings:', error);
    }
  };

  const saveSettings = () => {
    try {
      const settings: SoundSettings = {};
      sounds.forEach(sound => {
        settings[sound.id] = {
          isPlaying: sound.isPlaying,
          volume: sound.volume
        };
      });
      localStorage.setItem('focus-soundscapes-settings', JSON.stringify(settings));
      setSavedMix('Custom Mix');
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const toggleSound = async (soundId: string) => {
    const audio = audioRefs.current[soundId];
    if (!audio) return;

    setSounds(prevSounds => 
      prevSounds.map(sound => {
        if (sound.id === soundId) {
          const newIsPlaying = !sound.isPlaying;
          
          if (newIsPlaying) {
            // Try to play audio, fallback to console log if file not found
            audio.play().catch(error => {
              console.warn(`Could not play ${sound.name}:`, error.message);
              console.log(`Playing ${sound.name} (audio file missing)`);
            });
          } else {
            audio.pause();
          }
          
          return { ...sound, isPlaying: newIsPlaying };
        }
        return sound;
      })
    );
  };

  const updateVolume = (soundId: string, volume: number) => {
    const audio = audioRefs.current[soundId];
    if (audio) {
      audio.volume = volume / 100;
    }

    setSounds(prevSounds => 
      prevSounds.map(sound => 
        sound.id === soundId ? { ...sound, volume } : sound
      )
    );
  };

  const resetMix = () => {
    // Stop all currently playing sounds
    Object.values(audioRefs.current).forEach(audio => {
      if (audio && !audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
    });

    setSounds(prevSounds => 
      prevSounds.map(sound => ({
        ...sound,
        isPlaying: false,
        volume: 50
      }))
    );
    setSavedMix(null);
  };

  const getActiveSoundsCount = () => {
    return sounds.filter(sound => sound.isPlaying).length;
  };

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setIsTimerRunning(true);
    timerRef.current = setInterval(() => {
      setFocusTimer(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsTimerRunning(false);
  };

  const resetTimer = () => {
    stopTimer();
    setFocusTimer(0);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const applyPreset = (presetName: string, soundSettings: Array<{id: string, volume: number}>) => {
    resetMix();
    setTimeout(() => {
      soundSettings.forEach(setting => {
        toggleSound(setting.id);
        updateVolume(setting.id, setting.volume);
      });
      setSavedMix(presetName);
    }, 100);
  };

  return (
    <div className="space-y-8">
      <section className="py-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-background border border-white/20 rounded-lg">
            <Volume2 size={32} className="text-blue-500" />
          </div>
          <div>
            <h1 className="page-header">Focus Soundscapes</h1>
            <p className="text-text-secondary">Create your custom focus mix</p>
          </div>
        </div>

        {/* Status Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 bg-background border border-white/10 rounded-lg">
            <div className="flex items-center gap-4">
              <span className="text-sm text-text-secondary">
                {getActiveSoundsCount()} sounds playing
              </span>
              {savedMix && (
                <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">
                  {savedMix}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={saveSettings}
                className="btn btn-secondary text-sm flex items-center gap-2"
              >
                <Save size={16} />
                Save Mix
              </button>
              <button
                onClick={resetMix}
                className="btn btn-secondary text-sm flex items-center gap-2"
              >
                <RotateCcw size={16} />
                Reset
              </button>
            </div>
          </div>

          {/* Focus Timer */}
          <div className="flex items-center justify-between p-4 bg-background border border-white/10 rounded-lg">
            <div className="flex items-center gap-4">
              <span className="text-sm text-text-secondary">Focus Time:</span>
              <span className="text-lg font-mono text-white">{formatTime(focusTimer)}</span>
            </div>
            <div className="flex gap-2">
              {!isTimerRunning ? (
                <button
                  onClick={startTimer}
                  className="btn btn-secondary text-sm flex items-center gap-2"
                >
                  <Play size={16} />
                  Start
                </button>
              ) : (
                <button
                  onClick={stopTimer}
                  className="btn btn-secondary text-sm flex items-center gap-2"
                >
                  <Pause size={16} />
                  Pause
                </button>
              )}
              <button
                onClick={resetTimer}
                className="btn btn-secondary text-sm flex items-center gap-2"
              >
                <RotateCcw size={16} />
                Reset
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Sound Controls Grid */}
      <section className="card">
        <h2 className="section-title">Ambient Sounds</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sounds.map((sound) => {
            const IconComponent = sound.icon;
            return (
              <div
                key={sound.id}
                className={`p-6 rounded-lg border transition-all duration-300 ${
                  sound.isPlaying
                    ? 'bg-white/5 border-white/20 shadow-lg'
                    : 'bg-background border-white/10 hover:border-white/20'
                }`}
              >
                {/* Sound Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-background border border-white/10 ${sound.color}`}>
                      <IconComponent size={20} />
                    </div>
                    <h3 className="font-medium text-white">{sound.name}</h3>
                  </div>
                  
                  <button
                    onClick={() => toggleSound(sound.id)}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      sound.isPlaying
                        ? 'bg-white/20 text-white hover:bg-white/30'
                        : 'bg-background border border-white/10 text-text-secondary hover:text-white hover:border-white/20'
                    }`}
                  >
                    {sound.isPlaying ? <Pause size={18} /> : <Play size={18} />}
                  </button>
                </div>

                {/* Volume Control */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Volume</span>
                    <span className="text-sm text-white">{sound.volume}%</span>
                  </div>
                  
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sound.volume}
                      onChange={(e) => updateVolume(sound.id, Number(e.target.value))}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-background border border-white/10"
                      style={{
                        background: `linear-gradient(to right, ${
                          sound.isPlaying ? '#3b82f6' : '#6b7280'
                        } 0%, ${
                          sound.isPlaying ? '#3b82f6' : '#6b7280'
                        } ${sound.volume}%, #1f2937 ${sound.volume}%, #1f2937 100%)`
                      }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-text-secondary">
                    <VolumeX size={12} />
                    <Volume2 size={12} />
                  </div>
                </div>

                {/* Visual Indicator */}
                {sound.isPlaying && (
                  <div className="mt-4 flex justify-center">
                    <div className="flex gap-1">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-blue-500 rounded-full animate-pulse"
                          style={{
                            height: `${Math.max(8, sound.volume / 5)}px`,
                            animationDelay: `${i * 150}ms`,
                            animationDuration: '1s'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Presets Section */}
      <section className="card">
        <h2 className="section-title">Preset Mixes</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => applyPreset('Stormy Weather', [
              {id: 'rain', volume: 70},
              {id: 'thunder', volume: 30}
            ])}
            className="p-4 rounded-lg bg-background border border-white/10 hover:border-white/20 transition-colors text-left"
          >
            <h3 className="font-medium text-white mb-1">🌧️ Stormy Weather</h3>
            <p className="text-sm text-text-secondary">Rain with distant thunder</p>
          </button>
          
          <button
            onClick={() => applyPreset('Deep Forest', [
              {id: 'forest', volume: 60},
              {id: 'wind', volume: 40}
            ])}
            className="p-4 rounded-lg bg-background border border-white/10 hover:border-white/20 transition-colors text-left"
          >
            <h3 className="font-medium text-white mb-1">🌲 Deep Forest</h3>
            <p className="text-sm text-text-secondary">Birds and gentle wind</p>
          </button>
          
          <button
            onClick={() => applyPreset('Cozy Evening', [
              {id: 'fireplace', volume: 80},
              {id: 'rain', volume: 20}
            ])}
            className="p-4 rounded-lg bg-background border border-white/10 hover:border-white/20 transition-colors text-left"
          >
            <h3 className="font-medium text-white mb-1">🔥 Cozy Evening</h3>
            <p className="text-sm text-text-secondary">Fireplace with light rain</p>
          </button>
          
          <button
            onClick={() => applyPreset('Peaceful Rain', [
              {id: 'rain', volume: 80}
            ])}
            className="p-4 rounded-lg bg-background border border-white/10 hover:border-white/20 transition-colors text-left"
          >
            <h3 className="font-medium text-white mb-1">☔ Peaceful Rain</h3>
            <p className="text-sm text-text-secondary">Pure rain sounds</p>
          </button>
        </div>
      </section>

      {/* Tips Section */}
      <section className="card">
        <h2 className="section-title">Focus Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="font-medium text-white">🎯 Optimal Mixing</h3>
            <ul className="text-sm text-text-secondary space-y-2">
              <li>• Keep total volume moderate (2-3 sounds max)</li>
              <li>• Use thunder sparingly for dramatic effect</li>
              <li>• Rain + forest creates natural harmony</li>
              <li>• Lower volumes often work better than higher</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="font-medium text-white">⏰ Focus Sessions</h3>
            <ul className="text-sm text-text-secondary space-y-2">
              <li>• Start with gentle sounds, add complexity</li>
              <li>• Save your favorite mixes for different tasks</li>
              <li>• Use consistent mixes to build focus habits</li>
              <li>• Take breaks every 25-30 minutes</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
} 