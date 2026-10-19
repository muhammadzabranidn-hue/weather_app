// Latar langit dinamis + partikel (hujan, salju, bintang)
const Fx = (() => {
  const THEMES = ["intro", "clear-day", "clear-night", "clouds-day", "clouds-night", "rain", "thunder", "snow", "mist"];
  const MODE = { thunder: "thunder", rain: "rain", snow: "snow", "clear-night": "stars" };
  const sky = document.getElementById("sky");
  const cv = document.getElementById("fx");
  const ctx = cv.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let mode = null, parts = [], w = 0, h = 0, raf = 0, flashTimer = 0;

  THEMES.forEach(t => { const d = document.createElement("div"); d.className = "layer"; d.dataset.t = t; sky.appendChild(d); });

  function seed() {
    const n = { rain: 140, thunder: 180, snow: 90, stars: 80 }[mode] || 0;
    parts = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, z: Math.random() * .8 + .2, p: Math.random() * 6.28 }));
  }
  function resize() {
    const d = devicePixelRatio || 1;
    w = innerWidth; h = innerHeight; cv.width = w * d; cv.height = h * d;
    ctx.setTransform(d, 0, 0, d, 0, 0); seed();
  }
  function frame(t) {
    ctx.clearRect(0, 0, w, h);
    for (const p of parts) {
      if (mode === "stars") {
        ctx.globalAlpha = .3 + .7 * Math.abs(Math.sin(t / 1500 + p.p));
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(p.x, p.y * .7, p.z * 1.3, 0, 6.28); ctx.fill();
        continue;
      }
      if (mode === "snow") {
        p.y += p.z * .9; p.x += Math.sin(t / 1200 + p.p) * .3;
        ctx.globalAlpha = .85 * p.z; ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(p.x, p.y, p.z * 2.4, 0, 6.28); ctx.fill();
      } else {
        p.y += p.z * 14; p.x -= p.z * 2;
        ctx.globalAlpha = .35 * p.z; ctx.strokeStyle = "#cfe3ff"; ctx.lineWidth = p.z * 1.2;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + p.z * 3, p.y - p.z * 16); ctx.stroke();
      }
      if (p.y > h) { p.y = -20; p.x = Math.random() * w; }
      if (p.x < -20) p.x = w + 10;
    }
    raf = requestAnimationFrame(frame);
  }
  function lightning() {
    clearTimeout(flashTimer);
    if (mode !== "thunder" || reduce) return;
    flashTimer = setTimeout(() => {
      document.body.classList.add("flash");
      setTimeout(() => document.body.classList.remove("flash"), 400);
      lightning();
    }, 4000 + Math.random() * 5000);
  }

  addEventListener("resize", resize);

  return {
    theme(name) {
      sky.querySelectorAll(".layer").forEach(l => l.classList.toggle("on", l.dataset.t === name));
      mode = MODE[name] || null;
      cancelAnimationFrame(raf); resize(); ctx.clearRect(0, 0, w, h);
      if (mode && !reduce) raf = requestAnimationFrame(frame);
      lightning();
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", name === "clear-day" ? "#1a6fd8" : "#0a1020");
    }
  };
})();
