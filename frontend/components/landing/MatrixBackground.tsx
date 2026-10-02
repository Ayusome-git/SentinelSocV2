"use client";

import { useEffect, useRef } from 'react';

export function MatrixBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Matrix characters: Binary + Hex + Security Events
    const chars = '010110011010A4F8B2C9 LOGIN_FAILED AUTH_FAILURE EVENT_4821 0x7FA21 ADMIN_ACTION RISK_ENGINE THREAT_DETECTED INC-00042'.split(' ');
    
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    
    const drops: number[] = [];
    for (let x = 0; x < columns; x++) {
      drops[x] = Math.random() * -100; // Start at random negative y to stagger
    }

    const draw = () => {
      // Very translucent black to show trails
      ctx.fillStyle = 'rgba(3, 6, 3, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;
      
      for (let i = 0; i < drops.length; i++) {
        // Randomly pick a string or character
        const text = chars[Math.floor(Math.random() * chars.length)];
        
        // Use very low opacity Matrix green
        ctx.fillStyle = `rgba(0, 255, 65, ${Math.random() * 0.15 + 0.05})`;
        
        ctx.fillText(text, i * fontSize * 2, drops[i] * fontSize);
        
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        
        // Randomize drop speed slightly
        drops[i] += Math.random() > 0.5 ? 1 : 0.5;
      }
    };

    const interval = setInterval(draw, 50);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 z-0 pointer-events-none opacity-50"
    />
  );
}
