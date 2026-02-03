'use client';

import { useEffect, useState } from 'react';

interface PixelLoaderProps {
  message?: string;
}

export function PixelLoader({ message = 'Loading...' }: PixelLoaderProps) {
  const [activeBlocks, setActiveBlocks] = useState(0);
  const totalBlocks = 10;

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBlocks((prev) => (prev >= totalBlocks ? 0 : prev + 1));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex border-3 border-[#101626] p-1">
        {Array.from({ length: totalBlocks }).map((_, i) => (
          <div
            key={i}
            className="w-4 h-6 mr-1 last:mr-0"
            style={{
              backgroundColor: i < activeBlocks ? '#b1db00' : '#e5e7eb',
            }}
          />
        ))}
      </div>
      <p className="font-mono text-sm text-[#101626] font-bold uppercase">{message}</p>
    </div>
  );
}

export function PixelSpinner({ size = 32 }: { size?: number }) {
  return (
    <div
      className="pixel-spinner"
      style={{ width: size, height: size }}
    />
  );
}

export function SuccessAnimation() {
  return (
    <div className="pixel-cascade flex items-center justify-center">
      <div className="w-16 h-16 bg-[#b1db00] border-3 border-[#101626] flex items-center justify-center">
        <svg
          className="w-10 h-10 text-[#101626]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="square"
            strokeLinejoin="miter"
            strokeWidth={4}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
    </div>
  );
}
