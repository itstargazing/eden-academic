'use client';

import { useEffect, useRef } from 'react';

type RainDrop = {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
};

type Props = {
  label?: string;
};

const DROP_COUNT = 26;

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function createDrop(width: number, height: number, startAbove = false): RainDrop {
  return {
    x: randomBetween(0, Math.max(width, 1)),
    y: startAbove ? randomBetween(-height, 0) : randomBetween(0, Math.max(height, 1)),
    length: randomBetween(15, 40),
    speed: randomBetween(0.7, 2.8),
    opacity: randomBetween(0.08, 0.25),
  };
}

export default function RainSidebar({ label }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let drops: RainDrop[] = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      drops = Array.from({ length: DROP_COUNT }, () => createDrop(width, height));
    };

    resize();

    const draw = () => {
      context.clearRect(0, 0, width, height);
      context.lineWidth = 1;
      context.lineCap = 'round';

      drops.forEach((drop, index) => {
        context.beginPath();
        context.moveTo(drop.x, drop.y);
        context.lineTo(drop.x, drop.y + drop.length);
        context.strokeStyle = `rgba(68, 68, 68, ${drop.opacity})`;
        context.stroke();

        drop.y += drop.speed;

        if (drop.y - drop.length > height) {
          drops[index] = createDrop(width, height, true);
        }
      });

      animationFrame = requestAnimationFrame(draw);
    };

    draw();

    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[var(--bg-panel)]">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{
          background: 'transparent',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)',
        }}
      />

      {label ? (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <p
            className="font-mono text-xs font-semibold uppercase tracking-[0.32em] text-[var(--text-dim)]"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            {label}
          </p>
        </div>
      ) : null}
    </div>
  );
}
