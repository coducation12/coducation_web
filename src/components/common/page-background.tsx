'use client';

import { useEffect, useRef } from 'react';

interface PageBackgroundProps {
  type?: 'animated' | 'static';
}

export function PageBackground({ type = 'animated' }: PageBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/?;:"}{[]|\\!@#$%^&*()_+-=';

  useEffect(() => {
    if (!containerRef.current || type === 'static') return;

    const createChar = () => {
      if (!containerRef.current) return;
      const char = document.createElement('div');
      char.classList.add('char');
      char.innerText = chars[Math.floor(Math.random() * chars.length)];
      
      const duration = Math.random() * 5 + 5; // 5 to 10 seconds
      const left = Math.random() * 100; // 0 to 100%
      const delay = Math.random() * 5; // 0 to 5 seconds delay

      char.style.left = `${left}vw`;
      char.style.animationDuration = `${duration}s`;
      char.style.animationDelay = `${delay}s`;
      
      containerRef.current.appendChild(char);

      // Remove the char after it has fallen to prevent DOM clutter
      setTimeout(() => {
        char.remove();
      }, (duration + delay) * 1000);
    };

    // Create an initial burst of characters
    for(let i = 0; i < 50; i++) {
      createChar();
    }

    // Continuously create characters
    const intervalId = setInterval(createChar, 200);

    return () => {
      clearInterval(intervalId);
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [type]);

  return (
    <div 
      ref={containerRef} 
      className={`falling-code ${type === 'static' ? 'static-background' : ''}`} 
      aria-hidden="true" 
    />
  );
}
