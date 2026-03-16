import { useEffect, useRef } from "react";

const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animationId: number;
    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let width = window.innerWidth;
    let height = window.innerHeight;
    let scrollY = window.scrollY;
    let pageHeight = document.documentElement.scrollHeight;

    const setSize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
      pageHeight = document.documentElement.scrollHeight;
    };
    setSize();

    const handleResize = () => setSize();
    const handleScroll = () => { scrollY = window.scrollY; };
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Particles – fewer, viewport-relative
    const PARTICLE_COUNT = 60;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * width,
      yRel: Math.random(), // 0-1 relative to page
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.2,
      r: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.4 + 0.15,
      pulse: Math.random() * Math.PI * 2,
    }));

    // Streams – fewer, simpler
    const STREAM_COUNT = 18;
    const streams = Array.from({ length: STREAM_COUNT }, (_, i) => ({
      yRelBase: i / STREAM_COUNT + Math.random() * (1 / STREAM_COUNT),
      speed: 0.3 + Math.random() * 0.5,
      direction: Math.random() > 0.5 ? 1 : -1,
      amplitude: 30 + Math.random() * 60,
      frequency: 0.002 + Math.random() * 0.003,
      thickness: 1.5 + Math.random() * 3,
      hue: 200 + Math.random() * 25,
      brightness: 55 + Math.random() * 20,
      alpha: 0.12 + Math.random() * 0.15,
      offset: Math.random() * Math.PI * 2,
      length: 0.4 + Math.random() * 0.4,
    }));

    // Orbs – fewer
    const ORB_COUNT = 6;
    const orbs = Array.from({ length: ORB_COUNT }, () => ({
      x: Math.random() * width,
      yRel: Math.random(),
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.0002,
      r: 50 + Math.random() * 80,
      hue: 200 + Math.random() * 30,
      alpha: 0.04 + Math.random() * 0.05,
      pulseSpeed: 0.5 + Math.random() * 0.8,
    }));

    const MARGIN = 200; // px above/below viewport to render

    const draw = (time: number) => {
      const t = time * 0.001;
      const vpTop = scrollY - MARGIN;
      const vpBottom = scrollY + height + MARGIN;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Background gradient (viewport only)
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, "hsl(222, 47%, 3%)");
      grad.addColorStop(0.5, "hsl(220, 50%, 5%)");
      grad.addColorStop(1, "hsl(225, 45%, 3%)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Orbs (no shadowBlur)
      for (const orb of orbs) {
        orb.x += orb.vx;
        orb.yRel += orb.vy;
        if (orb.x < -orb.r) orb.x = width + orb.r;
        if (orb.x > width + orb.r) orb.x = -orb.r;
        if (orb.yRel < 0) orb.yRel = 1;
        if (orb.yRel > 1) orb.yRel = 0;

        const worldY = orb.yRel * pageHeight;
        if (worldY < vpTop - orb.r || worldY > vpBottom + orb.r) continue;

        const screenY = worldY - scrollY;
        const pulse = 1 + 0.3 * Math.sin(t * orb.pulseSpeed);
        const r = orb.r * pulse;
        const g = ctx.createRadialGradient(orb.x, screenY, 0, orb.x, screenY, r);
        g.addColorStop(0, `hsla(${orb.hue}, 90%, 60%, ${orb.alpha * 1.2})`);
        g.addColorStop(0.6, `hsla(${orb.hue}, 85%, 50%, ${orb.alpha * 0.4})`);
        g.addColorStop(1, `hsla(${orb.hue}, 80%, 40%, 0)`);
        ctx.fillStyle = g;
        ctx.fillRect(orb.x - r, screenY - r, r * 2, r * 2);
      }

      // Streams (no shadowBlur – use lineWidth layering instead)
      ctx.lineCap = "round";
      for (const s of streams) {
        const worldYBase = s.yRelBase * pageHeight;
        if (worldYBase < vpTop - s.amplitude * 2 || worldYBase > vpBottom + s.amplitude * 2) continue;

        const screenYBase = worldYBase - scrollY;
        const startX = s.direction === 1 ? -width * 0.1 : width * 1.1;
        const endX = s.direction === 1 ? width * (s.length + 0.1) : width * (1 - s.length - 0.1);
        const phase = t * s.speed * s.direction + s.offset;
        const xStart = Math.min(startX, endX);
        const xEnd = Math.max(startX, endX);
        const step = 6;

        // Build path once
        ctx.beginPath();
        for (let x = xStart; x <= xEnd; x += step) {
          const y = screenYBase +
            Math.sin(x * s.frequency + phase) * s.amplitude +
            Math.sin(x * s.frequency * 2.3 + phase * 1.5) * s.amplitude * 0.3;
          if (x === xStart) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        // Outer glow (thick, low alpha)
        ctx.strokeStyle = `hsla(${s.hue}, 95%, ${s.brightness}%, ${s.alpha * 0.3})`;
        ctx.lineWidth = s.thickness + 8;
        ctx.stroke();

        // Core
        ctx.strokeStyle = `hsla(${s.hue}, 100%, ${s.brightness + 10}%, ${s.alpha})`;
        ctx.lineWidth = s.thickness;
        ctx.stroke();

        // Hot center
        ctx.strokeStyle = `hsla(${s.hue}, 100%, 85%, ${s.alpha * 0.4})`;
        ctx.lineWidth = Math.max(0.8, s.thickness * 0.35);
        ctx.stroke();
      }

      // Particles (no connections – O(n) only)
      for (const p of particles) {
        p.x += p.vx;
        p.yRel += p.vy / pageHeight;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.yRel < 0) p.yRel = 1;
        if (p.yRel > 1) p.yRel = 0;

        const worldY = p.yRel * pageHeight;
        if (worldY < vpTop || worldY > vpBottom) continue;

        const screenY = worldY - scrollY;
        const flicker = 0.5 + 0.5 * Math.sin(t * 2 + p.pulse);
        const alpha = p.opacity * (0.6 + 0.4 * flicker);

        ctx.beginPath();
        ctx.arc(p.x, screenY, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(210, 80%, 80%, ${alpha})`;
        ctx.fill();
      }

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

export default ParticleBackground;
