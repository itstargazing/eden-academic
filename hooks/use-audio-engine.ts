'use client';

import { useEffect, useRef, useState } from 'react';

const SOUND_URLS = {
  Rain: 'https://assets.mixkit.co/active_storage/sfx/2515/2515.mp3',
  Thunder: 'https://assets.mixkit.co/active_storage/sfx/1821/1821.mp3',
  Wind: 'https://assets.mixkit.co/active_storage/sfx/65/65.mp3',
  Forest: 'https://assets.mixkit.co/active_storage/sfx/2517/2517.mp3',
  Fireplace: 'https://assets.mixkit.co/active_storage/sfx/1234/1234.mp3',
  Midnight: 'https://assets.mixkit.co/active_storage/sfx/2516/2516.mp3',
} as const;

const SOUND_NAMES = Object.keys(SOUND_URLS) as Array<keyof typeof SOUND_URLS>;

type PlayingState = Record<keyof typeof SOUND_URLS, boolean>;
type VolumeState = Record<keyof typeof SOUND_URLS, number>;

function buildInitialVolumes() {
  return SOUND_NAMES.reduce((accumulator, name) => {
    accumulator[name] = 50;
    return accumulator;
  }, {} as VolumeState);
}

function buildInitialPlaying() {
  return SOUND_NAMES.reduce((accumulator, name) => {
    accumulator[name] = false;
    return accumulator;
  }, {} as PlayingState);
}

export function useAudioEngine() {
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const [volumes, setVolumes] = useState<VolumeState>(buildInitialVolumes);
  const [playing, setPlaying] = useState<PlayingState>(buildInitialPlaying);

  useEffect(() => {
    SOUND_NAMES.forEach((name) => {
      const audio = new Audio(SOUND_URLS[name]);
      audio.loop = true;
      audio.volume = 0.5;
      audioRefs.current[name] = audio;
    });

    return () => {
      Object.values(audioRefs.current).forEach((audio) => {
        audio.pause();
        audio.src = '';
      });
    };
  }, []);

  const setVolume = (name: keyof typeof SOUND_URLS, value: number) => {
    setVolumes((previous) => ({
      ...previous,
      [name]: value,
    }));

    const audio = audioRefs.current[name];

    if (audio) {
      audio.volume = value / 100;
    }
  };

  const toggleSound = async (name: keyof typeof SOUND_URLS) => {
    const audio = audioRefs.current[name];

    if (!audio) {
      return;
    }

    if (playing[name]) {
      audio.pause();
      setPlaying((previous) => ({
        ...previous,
        [name]: false,
      }));
      return;
    }

    audio.volume = volumes[name] / 100;

    try {
      await audio.play();
      setPlaying((previous) => ({
        ...previous,
        [name]: true,
      }));
    } catch {
      setPlaying((previous) => ({
        ...previous,
        [name]: false,
      }));
    }
  };

  const applyPreset = async (preset: Partial<VolumeState>) => {
    const nextVolumes = { ...volumes, ...preset };
    setVolumes(nextVolumes);

    await Promise.all(
      SOUND_NAMES.map(async (name) => {
        const audio = audioRefs.current[name];
        const nextVolume = nextVolumes[name];

        if (!audio) {
          return;
        }

        audio.volume = nextVolume / 100;

        if (nextVolume > 0) {
          try {
            await audio.play();
            setPlaying((previous) => ({
              ...previous,
              [name]: true,
            }));
          } catch {
            setPlaying((previous) => ({
              ...previous,
              [name]: false,
            }));
          }
        } else {
          audio.pause();
          setPlaying((previous) => ({
            ...previous,
            [name]: false,
          }));
        }
      }),
    );
  };

  const resetAll = () => {
    Object.values(audioRefs.current).forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });

    setVolumes(buildInitialVolumes());
    setPlaying(buildInitialPlaying());
  };

  return {
    volumes,
    playing,
    setVolume,
    toggleSound,
    applyPreset,
    resetAll,
    soundNames: SOUND_NAMES,
  };
}
