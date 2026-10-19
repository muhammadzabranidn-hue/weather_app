const $ = id => document.getElementById(id);
const form = $("search-form"), cityInput = $("city-input"), searchBtn = $("search-btn");
const seg = $("unit-seg");
const views = { intro: $("intro"), loading: $("loading-msg"), error: $("error-msg"), result: $("weather-info") };

const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage tidak tersedia */ } }
};

let busy = false, shownTemp = 0, last = null; // last = { d: cuaca, f: prakiraan }
let unit = store.get("weather.unit", "c");
let recent = store.get("weather.recent", []);

Fx.theme("intro");
cityInput.focus({ preventScroll: true });

const deg = c => Math.round(unit === "f" ? c * 9 / 5 + 32 : c);
const clock = (ts, tz) => new Date((ts + tz) * 1000).toISOString().slice(11, 16);

function show(name) {
  for (const [k, el] of Object.entries(views)) el.classList.toggle("hidden", k !== name);
  if (name === "result") { // putar ulang animasi masuk
    views.result.classList.remove("show"); void views.result.offsetWidth; views.result.classList.add("show");
  }
}

function themeOf({ id, icon }) {
  const night = icon.endsWith("n");
  if (id < 300) return "thunder";
  if (id < 600) return "rain";
  if (id < 700) return "snow";
  if (id < 800) return "mist";
  return (id <= 801 ? "clear-" : "clouds-") + (night ? "night" : "day");
}

function countTo(target) {
  const from = shownTemp, t0 = performance.now(), dur = 1100, out = $("temperature");
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { out.textContent = `${target}°`; shownTemp = target; return; }
  (function step(now) {
    const k = Math.min((now - t0) / dur, 1), e = k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
    out.textContent = `${Math.round(from + (target - from) * e)}°`;
    if (k < 1) requestAnimationFrame(step); else shownTemp = target;
  })(t0);
}

// Semua angka suhu dibaca dari °C lalu dikonversi di sini
function paintTemps() {
  document.querySelectorAll("[data-c]").forEach(b => { b.textContent = `${deg(+b.dataset.c)}°`; });
  if (!last) return;
  const m = last.d.main;
  $("feels").textContent = `${deg(m.feels_like)}°`;
  $("range").textContent = `T: ${deg(m.temp_max)}°  R: ${deg(m.temp_min)}°`;
  countTo(deg(m.temp));
}

function paintHourly() {
  const f = last?.f, box = $("hourly");
  box.classList.toggle("hidden", !f?.list?.length);
  if (!f?.list?.length) return;
  $("hourly-list").innerHTML = f.list.slice(0, 9).map((it, i) => {
    const pop = Math.round((it.pop || 0) * 100), w = it.weather[0];
    return `<li><span>${i ? clock(it.dt, f.city.timezone).slice(0, 2) + ".00" : "Sekarang"}</span>
      <img src="https://openweathermap.org/img/wn/${w.icon}@2x.png" alt="${w.description}" width="44" height="44" loading="lazy">
      <small>${pop >= 20 ? pop + "%" : ""}</small><b data-c="${it.main.temp}">-</b></li>`;
  }).join("");
}

function render(d, f) {
  last = { d, f };
  const w = d.weather[0], m = d.main;
  $("city-name").textContent = d.sys?.country ? `${d.name}, ${d.sys.country}` : d.name;
  $("description").textContent = w.description;
  const icon = $("weather-icon");
  icon.src = `https://openweathermap.org/img/wn/${w.icon}@4x.png`; icon.alt = w.description;

  const diff = m.feels_like - m.temp;
  $("feels-note").textContent = diff > .5 ? "Terasa lebih hangat" : diff < -.5 ? "Terasa lebih dingin" : "Sama dengan suhu aktual";
  $("humidity").textContent = `${m.humidity}%`;
  $("humidity-note").textContent = m.humidity > 80 ? "Udara lembap" : m.humidity < 40 ? "Udara kering" : "Nyaman";
  $("wind").textContent = `${d.wind.speed} m/s`;
  $("wind-note").textContent = `${Math.round(d.wind.speed * 3.6)} km/jam`;
  $("pressure").textContent = m.pressure;
  const km = (d.visibility ?? 0) / 1000;
  $("visibility").textContent = `${km % 1 ? km.toFixed(1) : km} km`;
  $("visibility-note").textContent = km >= 8 ? "Pandangan jelas" : km >= 3 ? "Agak berkabut" : "Terbatas";
  $("clouds").textContent = `${d.clouds?.all ?? 0}%`;

  const { sunrise, sunset } = d.sys, tz = d.timezone;
  $("sunrise").textContent = clock(sunrise, tz);
  $("sunset").textContent = clock(sunset, tz);
  const p = Math.min(Math.max((d.dt - sunrise) / (sunset - sunrise), 0), 1);
  const bar = $("sun-bar").parentElement; bar.style.setProperty("--p", "0%");
  requestAnimationFrame(() => requestAnimationFrame(() => bar.style.setProperty("--p", `${p * 100}%`)));

  document.querySelectorAll(".tile").forEach((t, i) => t.style.setProperty("--i", i));
  Fx.theme(themeOf(w));
  Extra.after(d, f);
  paintHourly();
  paintTemps();
}

// Riwayat pencarian (maks. 5, terbaru di depan)
function paintRecent() {
  const box = $("recent"); box.replaceChildren();
  const chip = (text, cls, fn) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = `chip ${cls}`; b.textContent = text; b.onclick = fn; box.append(b);
  };
  recent.forEach(c => chip(c, "", () => { if (busy) return; cityInput.value = c; form.requestSubmit(); }));
  if (recent.length) chip("Hapus", "clear", () => { recent = []; store.set("weather.recent", recent); paintRecent(); });
}

function remember(name) {
  recent = [name, ...recent.filter(c => c.toLowerCase() !== name.toLowerCase())].slice(0, 5);
  store.set("weather.recent", recent); paintRecent();
}

function setUnit(u) {
  unit = u; seg.dataset.u = u; store.set("weather.unit", u);
  seg.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.u === u)));
  paintTemps();
}

function handleSearch(e) { e.preventDefault(); search(cityInput.value.trim()); }

// city: nama kota (string) atau koordinat {lat, lon}
async function search(city) {
  if (!city || busy) return;
  busy = true; searchBtn.disabled = true; cityInput.blur();
  show("loading");
  try {
    // jeda minimal agar skeleton tidak berkedip; prakiraan yang gagal tidak membatalkan hasil utama
    const [data, forecast] = await Promise.all([
      fetchWeatherData(city),
      fetchForecastData(city).catch(() => null),
      new Promise(r => setTimeout(r, 500))
    ]);
    render(data, forecast); remember(data.name); show("result");
  } catch {
    show("error");
  } finally {
    busy = false; searchBtn.disabled = false;
  }
}

form.addEventListener("submit", handleSearch);
seg.addEventListener("click", e => { const b = e.target.closest("button"); if (b && b.dataset.u !== unit) setUnit(b.dataset.u); });
setUnit(unit); paintRecent();

// Kota contoh di tampilan awal
$("intro").addEventListener("click", e => {
  const b = e.target.closest("[data-city]");
  if (b && !busy) { cityInput.value = b.dataset.city; form.requestSubmit(); }
});

// Kilau lembut yang mengikuti kursor pada kartu
document.addEventListener("pointermove", e => {
  const t = e.target.closest(".tile"); if (!t) return;
  const r = t.getBoundingClientRect();
  t.style.setProperty("--mx", `${e.clientX - r.left}px`);
  t.style.setProperty("--my", `${e.clientY - r.top}px`);
});