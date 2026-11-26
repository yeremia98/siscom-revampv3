/* =========================================================
   Garis kontur bergerak di footer (kanvas, tanpa library).
   Dipakai oleh index.html dan demo.html.
   ========================================================= */
(() => {
  const canvas = document.getElementById("footLines");
  if (!canvas) return;
  const host = canvas.parentElement;
  const ctx = canvas.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  let w = 0;
  let h = 0;
  const resize = () => {
    w = host.clientWidth;
    h = host.clientHeight;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  new ResizeObserver(resize).observe(host);

  const LINES = 26;

  const draw = (time) => {
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < LINES; i++) {
      const base = ((i + 0.4) / LINES) * h;
      const ampA = 10 + 6 * Math.sin(i * 0.41 + 1.2);
      const ampB = 16 + 9 * Math.cos(i * 0.27);
      const alpha = 0.06 + 0.08 * Math.pow(Math.sin(i * 0.5 + 0.8), 2);
      ctx.beginPath();
      for (let x = -10; x <= w + 10; x += 6) {
        const u = x / w;
        /* tiga gelombang dengan fase berjalan -> aliran garis terlihat bergerak */
        const y =
          base +
          Math.sin(u * 4.2 - time * 0.62 + i * 0.36) * ampA +
          Math.sin(u * 1.9 + time * 0.38 - i * 0.19) * ampB +
          Math.sin(u * 9.5 - time * 0.85 + i * 0.1) * 3;
        if (x === -10) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  };

  if (reduce) {
    draw(0);
    return;
  }

  let visible = true;
  new IntersectionObserver((entries) => (visible = entries[0].isIntersecting), {
    rootMargin: "120px",
  }).observe(canvas);

  const t0 = performance.now();
  const loop = (now) => {
    requestAnimationFrame(loop);
    if (!visible || document.hidden) return;
    draw((now - t0) / 1000);
  };
  requestAnimationFrame(loop);
})();
