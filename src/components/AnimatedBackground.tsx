import React, { useEffect, useRef } from 'react';

interface DustParticle {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  drift: number;
}

interface InkDrip {
  x: number;
  y: number;
  progress: number;
  length: number;
  opacity: number;
  corner: 'tl' | 'tr' | 'bl' | 'br';
}

const AnimatedBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dustParticles = useRef<DustParticle[]>([]);
  const inkDrips = useRef<InkDrip[]>([]);
  const candleFlicker = useRef(1);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize dust particles
    for (let i = 0; i < 30; i++) {
      dustParticles.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.3 + 0.1,
        opacity: Math.random() * 0.3 + 0.1,
        drift: Math.random() * 2 - 1
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Candlelight flicker effect - subtle vignette
      candleFlicker.current += (Math.random() - 0.5) * 0.1;
      candleFlicker.current = Math.max(0.85, Math.min(1.15, candleFlicker.current));
      
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width * 0.8
      );
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(0.7, `rgba(45, 36, 30, ${0.05 * candleFlicker.current})`);
      gradient.addColorStop(1, `rgba(30, 24, 18, ${0.15 * candleFlicker.current})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw and update dust particles
      dustParticles.current.forEach(particle => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 160, 130, ${particle.opacity * candleFlicker.current})`;
        ctx.fill();

        // Update position
        particle.y -= particle.speed;
        particle.x += particle.drift * 0.1;
        
        // Reset if off screen
        if (particle.y < -10) {
          particle.y = canvas.height + 10;
          particle.x = Math.random() * canvas.width;
        }
        if (particle.x < -10) particle.x = canvas.width + 10;
        if (particle.x > canvas.width + 10) particle.x = -10;
      });

      // Occasionally spawn ink drips
      if (Math.random() < 0.002 && inkDrips.current.length < 3) {
        const corners: ('tl' | 'tr' | 'bl' | 'br')[] = ['tl', 'tr', 'bl', 'br'];
        const corner = corners[Math.floor(Math.random() * corners.length)];
        let x = 0, y = 0;
        
        switch (corner) {
          case 'tl': x = Math.random() * 100; y = 0; break;
          case 'tr': x = canvas.width - Math.random() * 100; y = 0; break;
          case 'bl': x = Math.random() * 100; y = canvas.height - 50; break;
          case 'br': x = canvas.width - Math.random() * 100; y = canvas.height - 50; break;
        }
        
        inkDrips.current.push({
          x, y, progress: 0,
          length: Math.random() * 30 + 20,
          opacity: Math.random() * 0.3 + 0.2,
          corner
        });
      }

      // Draw ink drips
      inkDrips.current = inkDrips.current.filter(drip => {
        const yOffset = drip.corner.startsWith('t') ? drip.progress : -drip.progress;
        
        ctx.beginPath();
        ctx.moveTo(drip.x, drip.y);
        ctx.quadraticCurveTo(
          drip.x + Math.sin(drip.progress * 0.1) * 5,
          drip.y + yOffset * 0.5,
          drip.x + Math.sin(drip.progress * 0.2) * 3,
          drip.y + yOffset
        );
        ctx.strokeStyle = `rgba(45, 36, 30, ${drip.opacity * (1 - drip.progress / drip.length)})`;
        ctx.lineWidth = 2 + Math.sin(drip.progress * 0.3);
        ctx.lineCap = 'round';
        ctx.stroke();

        drip.progress += 0.3;
        return drip.progress < drip.length;
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(requestRef.current);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: 'multiply' }}
    />
  );
};

export default AnimatedBackground;
