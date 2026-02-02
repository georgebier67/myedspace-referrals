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
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex">
        {Array.from({ length: totalBlocks }).map((_, i) => (
          <div
            key={i}
            className={`progress-block ${i < activeBlocks ? 'active' : ''}`}
            style={{
              opacity: i < activeBlocks ? 1 : 0.2,
            }}
          />
        ))}
      </div>
      <p className="font-mono text-sm text-gray-600">{message}</p>
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
      <svg
        className="w-16 h-16 text-green-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="square"
          strokeLinejoin="miter"
          strokeWidth={3}
          d="M5 13l4 4L19 7"
        />
      </svg>
    </div>
  );
}
