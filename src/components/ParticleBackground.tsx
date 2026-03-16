import { useEffect, useRef } from "react";

const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = document.documentElement.scrollHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = document.documentElement.scrollHeight;
    };
    window.addEventListener("resize", handleResize);

    const ro = new ResizeObserver(() => {
      height = canvas.height = document.documentElement.scrollHeight;
    });
    ro.observe(document.body);

    // Particles
    const PARTICLE_COUNT = 90;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * 5000,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.5 + 0.2,
      pulse: Math.random() * Math.PI * 2,
    }));

    // Wind streams – bold glowing streaks that sweep across
    const STREAM_COUNT = 18;
    const streams = Array.from({ length: STREAM_COUNT }, (_, i) => ({
      yBase: (i / STREAM_COUNT) * 5000 + Math.random() * 300,
      speed: 0.3 + Math.random() * 0.6,
      direction: Math.random() > 0.5 ? 1 : -1,
      amplitude: 40 + Math.random() * 80,
      frequency: 0.002 + Math.random() * 0.003,
      thickness: 2 + Math.random() * 4,
      hue: 200 + Math.random() * 25,
      brightness: 55 + Math.random() * 20,
      glowSize: 20 + Math.random() * 40,
      glowAlpha: 0.15 + Math.random() * 0.2,
      offset: Math.random() * Math.PI * 2,
      length: 0.4 + Math.random() * 0.5, // fraction of width
    }));

    // Bright floating orbs
    const ORB_COUNT = 6;
    const orbs = Array.from({ length: ORB_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * 4000,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.4,
      r: 60 + Math.random() * 120,
      hue: 200 + Math.random() * 30,
      alpha: 0.04 + Math.random() * 0.06,
      pulseSpeed: 0.5 + Math.random() * 1,
    }));

    const CONNECTION_DIST = 110;

    const draw = (time: number) => {
      const t = time * 0.001;

      // Dark blue gradient
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, "hsl(222, 47%, 3%)");
      grad.addColorStop(0.3, "hsl(220, 50%, 5%)");
      grad.addColorStop(0.7, "hsl(218, 55%, 4%)");
      grad.addColorStop(1, "hsl(225, 45%, 3%)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Glowing orbs
      for (const orb of orbs) {
        orb.x += orb.vx;
        orb.y += orb.vy;
        if (orb.x < -orb.r) orb.x = width + orb.r;
        if (orb.x > width + orb.r) orb.x = -orb.r;
        if (orb.y < -orb.r) orb.y += 500;
        if (orb.y > height + orb.r) orb.y -= 500;

        const pulse = 1 + 0.3 * Math.sin(t * orb.pulseSpeed);
        const r = orb.r * pulse;
        const g = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, r);
        g.addColorStop(0, `hsla(${orb.hue}, 90%, 60%, ${orb.alpha * 1.5})`);
        g.addColorStop(0.5, `hsla(${orb.hue}, 85%, 50%, ${orb.alpha * 0.7})`);
        g.addColorStop(1, `hsla(${orb.hue}, 80%, 40%, 0)`);
        ctx.fillStyle = g;
        ctx.fillRect(orb.x - r, orb.y - r, r * 2, r * 2);
      }

      // Wind streams – bold glowing sweeping lines
      ctx.lineCap = "round";
      for (const s of streams) {
        const startX = s.direction === 1 ? -width * 0.1 : width * 1.1;
        const endX = s.direction === 1 ? width * (s.length + 0.1) : width * (1 - s.length - 0.1);
        const phase = t * s.speed * s.direction + s.offset;

        // Glow layer
        ctx.beginPath();
        const step = 4;
        const xStart = Math.min(startX, endX);
        const xEnd = Math.max(startX, endX);
        for (let x = xStart; x <= xEnd; x += step) {
          const progress = (x - xStart) / (xEnd - xStart);
          const fadeEdge = Math.sin(progress * Math.PI); // fade at both ends
          const y =
            s.yBase +
            Math.sin(x * s.frequency + phase) * s.amplitude +
            Math.sin(x * s.frequency * 2.3 + phase * 1.5) * s.amplitude * 0.3 +
            Math.cos(x * s.frequency * 0.7 + phase * 0.8) * s.amplitude * 0.2;

          if (x === xStart) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        // Outer glow
        ctx.shadowColor = `hsla(${s.hue}, 100%, ${s.brightness}%, 0.8)`;
        ctx.shadowBlur = s.glowSize;
        ctx.strokeStyle = `hsla(${s.hue}, 95%, ${s.brightness}%, ${s.glowAlpha * 0.6})`;
        ctx.lineWidth = s.thickness + 6;
        ctx.stroke();

        // Core bright line
        ctx.shadowBlur = s.glowSize * 0.5;
        ctx.strokeStyle = `hsla(${s.hue}, 100%, ${s.brightness + 15}%, ${s.glowAlpha})`;
        ctx.lineWidth = s.thickness;
        ctx.stroke();

        // Hot center
        ctx.shadowBlur = 0;
        ctx.strokeStyle = `hsla(${s.hue}, 100%, 85%, ${s.glowAlpha * 0.5})`;
        ctx.lineWidth = Math.max(1, s.thickness * 0.4);
        ctx.stroke();
      }

      ctx.shadowBlur = 0;
      ctx.shadowColor = "transparent";

      // Particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y += height;
        if (p.y > height) p.y -= height;

        const flicker = 0.5 + 0.5 * Math.sin(t * 2 + p.pulse);
        const alpha = p.opacity * (0.6 + 0.4 * flicker);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(210, 80%, 80%, ${alpha})`;
        ctx.fill();
      }

      // Connections
      ctx.lineWidth = 0.4;
      ctx.shadowBlur = 0;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.1;
            ctx.strokeStyle = `hsla(217, 91%, 60%, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full pointer-events-none"
      style={{ zIndex: 0, height: "100%" }}
    />
  );
};

export default ParticleBackground;
