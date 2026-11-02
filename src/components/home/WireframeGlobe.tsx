"use client";

import * as React from "react";

type Point = { x: number; y: number; z: number };

/**
 * A lightweight canvas wireframe globe: a dotted sphere made of latitude
 * parallels and longitude meridians drawn only on the front (visible)
 * hemisphere. Auto-rotates, nudges toward the pointer, pauses off-screen,
 * and falls back to a single static frame when the user prefers reduced
 * motion. Colored to EcoBrew's palette (sprout dots on leaf/moss lines).
 */
export default function WireframeGlobe({ className = "" }: { className?: string }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const rawCanvas = canvasRef.current;
    if (!rawCanvas) return;
    const canvas = rawCanvas;
    const rawCtx = canvas.getContext("2d");
    if (!rawCtx) return;
    const ctx = rawCtx;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const SPR = "#8fc77f"; // sprout
    const MOSS = "#5d745f"; // moss
    const DEEP = "#24422f"; // leaf-deep

    // Build the dotted wireframe once.
    const points: { p: Point; ring: "lat" | "lon" }[] = [];

    // Latitude parallels.
    for (let i = -6; i <= 6; i++) {
      const lat = (i * 15 * Math.PI) / 180;
      for (let j = 0; j < 60; j++) {
        const lon = (j / 60) * 2 * Math.PI;
        points.push({
          p: {
            x: Math.cos(lat) * Math.cos(lon),
            y: Math.sin(lat),
            z: Math.cos(lat) * Math.sin(lon),
          },
          ring: "lat",
        });
      }
    }
    // Longitude meridians.
    for (let i = 0; i < 12; i++) {
      const lon = (i / 12) * 2 * Math.PI;
      for (let j = 0; j <= 30; j++) {
        const lat = (j / 30) * Math.PI - Math.PI / 2;
        points.push({
          p: {
            x: Math.cos(lat) * Math.cos(lon),
            y: Math.sin(lat),
            z: Math.cos(lat) * Math.sin(lon),
          },
          ring: "lon",
        });
      }
    }

    let raf = 0;
    let visible = true;
    let rotY = 0.3;
    let tilt = 0.35;
    let targetTiltX = 0.35;
    let targetTiltZ = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width * dpr));
      height = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== width) canvas.width = width;
      if (canvas.height !== height) canvas.height = height;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      if (visible && !reduceMotion) start();
      else stop();
    });
    visibilityObserver.observe(canvas);

    function handlePointer(e: PointerEvent) {
      const rect = canvas.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / Math.max(rect.width, 1) - 0.5;
      const ny = (e.clientY - rect.top) / Math.max(rect.height, 1) - 0.5;
      targetTiltZ = nx * 0.6;
      targetTiltX = 0.35 - ny * 0.5;
    }

    canvas.addEventListener("pointermove", handlePointer);

    function rotateX(p: Point, a: number): Point {
      const c = Math.cos(a);
      const s = Math.sin(a);
      return {
        x: p.x,
        y: p.y * c - p.z * s,
        z: p.y * s + p.z * c,
      };
    }

    function rotateY(p: Point, a: number): Point {
      const c = Math.cos(a);
      const s = Math.sin(a);
      return {
        x: p.x * c + p.z * s,
        y: p.y,
        z: -p.x * s + p.z * c,
      };
    }

    function rotateZ(p: Point, a: number): Point {
      const c = Math.cos(a);
      const s = Math.sin(a);
      return {
        x: p.x * c - p.y * s,
        y: p.x * s + p.y * c,
        z: p.z,
      };
    }

    let last = performance.now();

    function draw(now: number) {
      const dt = Math.min(now - last, 50) / 1000;
      last = now;

      // ease the tilt toward pointer target
      tilt += (targetTiltX - tilt) * Math.min(1, dt * 4);
      const tiltZ = targetTiltZ;
      if (!reduceMotion) rotY += dt * 0.25;

      const cx = width / dpr / 2;
      const cy = height / dpr / 2;
      const R = Math.min(width, height) / dpr / 2 - 12;
      const fov = 3.2;

      ctx.clearRect(0, 0, width / dpr, height / dpr);

      for (const { p, ring } of points) {
        let q = rotateY(p, rotY);
        q = rotateX(q, tilt);
        q = rotateZ(q, tiltZ);

        if (q.z > 0.08) continue; // hide back hemisphere

        const scale = fov / (fov + q.z);
        const sx = cx + q.x * R * scale;
        const sy = cy - q.y * R * scale;
        if (sx < -10 || sx > width / dpr + 10 || sy < -10 || sy > height / dpr + 10)
          continue;

        const depth = Math.abs(q.z); // 0 front … ~1 edge
        const r = (ring === "lat" ? 1.5 : 1.15) * scale;

        if (ring === "lat") {
          const a = 1 - depth * 0.55;
          ctx.fillStyle = SPR;
          ctx.globalAlpha = a;
        } else {
          const a = 0.5 - depth * 0.3;
          ctx.fillStyle = MOSS;
          ctx.globalAlpha = Math.max(0.08, a);
        }
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // subtle rim glow near center
      const grad = ctx.createRadialGradient(cx, cy, R * 0.25, cx, cy, R * 1.1);
      grad.addColorStop(0, "rgba(143,199,127,0.05)");
      grad.addColorStop(1, "rgba(36,66,47,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.1, 0, Math.PI * 2);
      ctx.fill();

      if (visible && !reduceMotion) raf = window.requestAnimationFrame(draw);
    }

    function start() {
      if (raf || !visible) return;
      last = performance.now();
      raf = window.requestAnimationFrame(draw);
    }
    function stop() {
      if (!raf) return;
      window.cancelAnimationFrame(raf);
      raf = 0;
    }

    if (reduceMotion) {
      draw(performance.now());
    } else {
      start();
    }

    return () => {
      stop();
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      canvas.removeEventListener("pointermove", handlePointer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      role="img"
      aria-label="Wireframe globe of the EcoBrew process"
    />
  );
}
