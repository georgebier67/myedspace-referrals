'use client';

import { useEffect, useState, useRef } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  velocityX: number;
  velocityY: number;
  rotation: number;
  rotationSpeed: number;
  shape: 'square' | 'rectangle' | 'line';
}

const BRAND_COLORS = [
  '#3533ff', // Main blue
  '#b1db00', // CTA green
  '#a3e1f0', // Light blue
  '#101626', // Dark
];

function createParticle(id: number): Particle {
  const shapes: ('square' | 'rectangle' | 'line')[] = ['square', 'rectangle', 'line'];
  return {
    id,
    x: Math.random() * 100,
    y: -10 - Math.random() * 20,
    size: 8 + Math.random() * 16,
    color: BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)],
    velocityX: (Math.random() - 0.5) * 1.5,
    velocityY: 0.8 + Math.random() * 1.5,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 15,
    shape: shapes[Math.floor(Math.random() * shapes.length)],
  };
}

function createInitialParticles(): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < 60; i++) {
    particles.push(createParticle(i));
  }
  return particles;
}

export function Confetti({ duration = 4000 }: { duration?: number }) {
  const [particles, setParticles] = useState<Particle[]>(createInitialParticles);
  const [isActive, setIsActive] = useState(true);
  const isActiveRef = useRef(true);

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    // Animation loop
    let animationId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 16; // Normalize to ~60fps
      lastTime = currentTime;

      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.velocityX * deltaTime,
            y: p.y + p.velocityY * deltaTime,
            rotation: p.rotation + p.rotationSpeed * deltaTime,
            velocityY: p.velocityY + 0.03 * deltaTime, // Gravity (slower)
          }))
          .filter((p) => p.y < 120)
      );

      if (isActiveRef.current) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);

    // Stop after duration
    const timeout = setTimeout(() => {
      setIsActive(false);
    }, duration);

    return () => {
      cancelAnimationFrame(animationId);
      clearTimeout(timeout);
    };
  }, [duration]);

  if (!isActive && particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            transform: `rotate(${particle.rotation}deg)`,
          }}
        >
          {particle.shape === 'square' && (
            <div
              style={{
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
                border: '2px solid #101626',
              }}
            />
          )}
          {particle.shape === 'rectangle' && (
            <div
              style={{
                width: particle.size * 1.5,
                height: particle.size * 0.5,
                backgroundColor: particle.color,
                border: '2px solid #101626',
              }}
            />
          )}
          {particle.shape === 'line' && (
            <div
              style={{
                width: particle.size * 2,
                height: 4,
                backgroundColor: particle.color,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
