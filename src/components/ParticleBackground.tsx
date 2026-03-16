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

    // Observe body size changes to keep canvas full-page
    const ro = new ResizeObserver(() => {
      height = canvas.height = document.documentElement.scrollHeight;
    });
    ro.observe(document.body);

    // Particles
    const PARTICLE_COUNT = 80;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.5 + 0.2,
      pulse: Math.random() * Math.PI * 2,
    }));

    // Wave config – 4 large layered waves
    const waves = [
      { amplitude: 120, wavelength: 0.0015, speed: 0.4, yOffset: 0.25, hue: 210, sat: 85, light: 50, alpha: 0.12 },
      { amplitude: 150, wavelength: 0.0012, speed: -0.3, yOffset: 0.45, hue: 217, sat: 91, light: 55, alpha: 0.10 },
      { amplitude: 100, wavelength: 0.002, speed: 0.5, yOffset: 0.65, hue: 199, sat: 89, light: 48, alpha: 0.14 },
      { amplitude: 130, wavelength: 0.0018, speed: -0.35, yOffset: 0.82, hue: 225, sat: 80, light: 45, alpha: 0.09 },
    ];

    const CONNECTION_DIST = 120;

    const draw = (time: number) => {
      const t = time * 0.001;
      const scrollY = window.scrollY;
      const viewH = window.innerHeight;

      // Dark blue gradient background
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, "hsl(222, 47%, 3%)");
      grad.addColorStop(0.3, "hsl(220, 50%, 5%)");
      grad.addColorStop(0.6, "hsl(218, 55%, 4%)");
      grad.addColorStop(1, "hsl(225, 45%, 3%)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Draw big flowing waves
      for (const wave of waves) {
        const baseY = wave.yOffset * height;
        ctx.beginPath();
        ctx.moveTo(0, height);

        for (let x = 0; x <= width; x += 3) {
          const y =
            baseY +
            Math.sin(x * wave.wavelength + t * wave.speed) * wave.amplitude +
            Math.sin(x * wave.wavelength * 0.5 + t * wave.speed * 1.3 + 1.5) * wave.amplitude * 0.5 +
            Math.cos(x * wave.wavelength * 0.3 + t * wave.speed * 0.7 + 3) * wave.amplitude * 0.3;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.closePath();

        // Gradient fill for each wave
        const wGrad = ctx.createLinearGradient(0, baseY - wave.amplitude * 2, 0, baseY + wave.amplitude * 2);
        wGrad.addColorStop(0, `hsla(${wave.hue}, ${wave.sat}%, ${wave.light}%, 0)`);
        wGrad.addColorStop(0.3, `hsla(${wave.hue}, ${wave.sat}%, ${wave.light}%, ${wave.alpha})`);
        wGrad.addColorStop(0.6, `hsla(${wave.hue}, ${wave.sat}%, ${wave.light + 10}%, ${wave.alpha * 1.3})`);
        wGrad.addColorStop(1, `hsla(${wave.hue}, ${wave.sat}%, ${wave.light}%, ${wave.alpha * 0.5})`);
        ctx.fillStyle = wGrad;
        ctx.fill();

        // Bright edge line on the wave crest
        ctx.beginPath();
        for (let x = 0; x <= width; x += 3) {
          const y =
            baseY +
            Math.sin(x * wave.wavelength + t * wave.speed) * wave.amplitude +
            Math.sin(x * wave.wavelength * 0.5 + t * wave.speed * 1.3 + 1.5) * wave.amplitude * 0.5 +
            Math.cos(x * wave.wavelength * 0.3 + t * wave.speed * 0.7 + 3) * wave.amplitude * 0.3;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `hsla(${wave.hue}, ${wave.sat}%, ${wave.light + 20}%, ${wave.alpha * 1.5})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Only draw particles/connections near the viewport for performance
      const viewTop = scrollY - 100;
      const viewBottom = scrollY + viewH + 100;

      // Update & draw particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        if (p.y < viewTop || p.y > viewBottom) continue;

        const flicker = 0.5 + 0.5 * Math.sin(t * 2 + p.pulse);
        const alpha = p.opacity * (0.6 + 0.4 * flicker);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(210, 80%, 75%, ${alpha})`;
        ctx.fill();
      }

      // Draw connections (only visible particles)
      const visibleParticles = particles.filter(
        (p) => p.y >= viewTop && p.y <= viewBottom
      );
      ctx.lineWidth = 0.5;
      for (let i = 0; i < visibleParticles.length; i++) {
        for (let j = i + 1; j < visibleParticles.length; j++) {
          const dx = visibleParticles[i].x - visibleParticles[j].x;
          const dy = visibleParticles[i].y - visibleParticles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.12;
            ctx.strokeStyle = `hsla(217, 91%, 60%, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(visibleParticles[i].x, visibleParticles[i].y);
            ctx.lineTo(visibleParticles[j].x, visibleParticles[j].y);
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
      className="absolute inset-0 w-full"
      style={{ zIndex: 0, height: "100%" }}
    />
  );
};

export default ParticleBackground;
