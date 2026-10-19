// Fitur tambahan: dashboard awal interaktif + panel detail hasil
const Extra = (() => {
    const WORLD = ["Jakarta", "Tokyo", "London", "New York", "Sydney", "Dubai"];
    const AQI = ["Baik", "Cukup", "Sedang", "Buruk", "Sangat buruk"];
    const AQI_COLOR = ["#30d158", "#a3e635", "#ffd60a", "#ff9f0a", "#ff453a"];
    const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const DIRS = ["Utara", "Timur Laut", "Timur", "Tenggara", "Selatan", "Barat Daya", "Barat", "Barat Laut"];
    const FACTS = [
      "Indonesia dilalui garis khatulistiwa, sehingga suhunya relatif stabil sepanjang tahun dan hanya dibedakan musim hujan dan kemarau.",
      "Petir dapat memanaskan udara di sekitarnya hingga lebih dari 25.000 °C, jauh lebih panas dari permukaan Matahari.",
      "Bau tanah setelah hujan disebut petrikor, berasal dari senyawa geosmin yang dilepas tanah saat terkena air.",
      "Kelembapan tinggi membuat keringat sulit menguap, itulah sebabnya 32 °C bisa terasa jauh lebih panas dari angkanya.",
      "Tekanan udara biasanya turun menjelang badai, karena itu barometer dipakai untuk memprakirakan cuaca.",
      "Awan tampak putih karena butir air di dalamnya menyebarkan semua warna cahaya Matahari secara merata."
    ];
    const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    const icon = (i, s = "") => `https://openweathermap.org/img/wn/${i}${s}.png`;
    let favs = store.get("weather.fav", []);
  
    // --- Sapaan + jam live ---
    function tick() {
      const n = new Date(), h = n.getHours();
      const hi = h < 11 ? "Selamat pagi" : h < 15 ? "Selamat siang" : h < 18 ? "Selamat sore" : "Selamat malam";
      $("clock").textContent = `${hi} · ${n.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })} · ${n.toLocaleTimeString("id-ID", { hour12: false }).replaceAll(".", ":")}`;
    }
    tick(); setInterval(tick, 1000);
  
    // --- Cuaca kota dunia (klik kartu = buka detail lewat handler [data-city] di app.js) ---
    $("world-grid").innerHTML = WORLD.map(c => `<button type="button" class="wcard" data-city="${c}"><span>${c}</span><b>…</b></button>`).join("");
    WORLD.forEach((c, i) => fetchWeatherData(c).then(d => {
      const card = $("world-grid").children[i], w = d.weather[0];
      card.innerHTML = `<span>${c}</span><b data-c="${d.main.temp}">${deg(d.main.temp)}°</b><small>${esc(w.description)}</small><img src="${icon(w.icon, "@2x")}" alt="" width="48" height="48">`;
    }).catch(() => $("world-grid").children[i]?.remove()));
  
    // --- Fakta acak ---
    let fi = Math.floor(Math.random() * FACTS.length);
    const fact = () => { $("fact-text").textContent = FACTS[fi]; fi = (fi + 1) % FACTS.length; };
    fact(); $("fact-next").onclick = fact;
  
    // --- Lokasi saya ---
    const loc = $("locate");
    loc.onclick = () => {
      const reset = (t, ms = 0) => setTimeout(() => (loc.textContent = "📍 Lokasi saya"), ms);
      if (!navigator.geolocation) { loc.textContent = "Lokasi tidak didukung"; return reset("", 2500); }
      loc.textContent = "Mencari lokasi…";
      navigator.geolocation.getCurrentPosition(
        p => { reset(); search({ lat: p.coords.latitude, lon: p.coords.longitude }); },
        () => { loc.textContent = "Izin lokasi ditolak"; reset("", 2500); },
        { timeout: 8000 });
    };
  
    // --- Autocomplete kota ---
    const sg = $("suggest"); let timer;
    cityInput.addEventListener("input", () => {
      clearTimeout(timer);
      const q = cityInput.value.trim();
      if (q.length < 2) return sg.classList.add("hidden");
      timer = setTimeout(async () => {
        try {
          const r = await fetchSuggestions(q);
          sg.innerHTML = r.map(x => `<li role="option" data-lat="${x.lat}" data-lon="${x.lon}" data-name="${esc(x.name)}">${esc(x.name)}<small>${esc([x.state, x.country].filter(Boolean).join(", "))}</small></li>`).join("");
          sg.classList.toggle("hidden", !r.length);
        } catch { sg.classList.add("hidden"); }
      }, 300);
    });
    sg.addEventListener("pointerdown", e => {
      const li = e.target.closest("li"); if (!li) return;
      e.preventDefault(); sg.classList.add("hidden"); cityInput.value = li.dataset.name;
      search({ lat: +li.dataset.lat, lon: +li.dataset.lon });
    });
    cityInput.addEventListener("blur", () => setTimeout(() => sg.classList.add("hidden"), 150));
    form.addEventListener("submit", () => sg.classList.add("hidden"));
    cityInput.addEventListener("keydown", e => { if (e.key === "Escape") sg.classList.add("hidden"); });
  
    // --- Favorit ---
    const paintFavs = () => {
      $("favs").innerHTML = favs.length ? `<span>Favorit</span>` + favs.map(c => `<button type="button" class="chip" data-city="${esc(c)}">★ ${esc(c)}</button>`).join("") : "";
    };
    const mark = () => {
      const on = favs.includes(last?.d.name);
      $("fav").textContent = on ? "★ Favorit" : "☆ Favorit"; $("fav").setAttribute("aria-pressed", String(on));
    };
    $("fav").onclick = () => {
      const n = last?.d.name; if (!n) return;
      favs = favs.includes(n) ? favs.filter(x => x !== n) : [n, ...favs].slice(0, 6);
      store.set("weather.fav", favs); paintFavs(); mark();
    };
    paintFavs();
  
    // --- Grafik suhu 24 jam (SVG) ---
    function chart(f) {
      const L = f?.list?.slice(0, 9) || [], box = $("chart-box");
      box.classList.toggle("hidden", L.length < 2); if (L.length < 2) return;
      const T = L.map(i => i.main.temp), lo = Math.min(...T), sp = (Math.max(...T) - lo) || 1;
      const P = T.map((v, i) => [20 + i * 35, 78 - (v - lo) / sp * 44]);
      const line = P.map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join(" ");
      $("chart").innerHTML = `<defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
        <path d="${line} L${P.at(-1)[0]} 94 L20 94Z" fill="url(#cg)"/>
        <path d="${line}" class="draw" pathLength="1" fill="none" stroke="#fff" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
        ${P.map((p, i) => `<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="#fff"/><text x="${p[0]}" y="${p[1] - 10}" text-anchor="middle" data-c="${T[i]}">-</text><text class="x" x="${p[0]}" y="109" text-anchor="middle">${i ? clock(L[i].dt, f.city.timezone).slice(0, 2) + ".00" : "Kini"}</text>`).join("")}`;
    }
  
    // --- Prakiraan 5 hari ---
    function daily(f) {
      const L = f?.list || [], box = $("daily-box");
      box.classList.toggle("hidden", !L.length); if (!L.length) return;
      const g = {};
      L.forEach(i => { (g[new Date((i.dt + f.city.timezone) * 1000).toISOString().slice(0, 10)] ||= []).push(i); });
      const days = Object.entries(g).slice(0, 5).map(([k, a]) => ({
        k, lo: Math.min(...a.map(i => i.main.temp_min)), hi: Math.max(...a.map(i => i.main.temp_max)),
        pop: Math.max(...a.map(i => i.pop || 0)), w: a[a.length >> 1].weather[0]
      }));
      const lo = Math.min(...days.map(d => d.lo)), sp = (Math.max(...days.map(d => d.hi)) - lo) || 1;
      $("daily").innerHTML = days.map((d, i) => `<li><span>${i ? DAYS[new Date(d.k).getUTCDay()] : "Hari ini"}</span>
        <img src="${icon(d.w.icon.replace("n", "d"))}" alt="${esc(d.w.description)}" width="36" height="36"><small>${d.pop >= .2 ? Math.round(d.pop * 100) + "%" : ""}</small>
        <b data-c="${d.lo}">-</b><div class="rng"><i style="left:${(d.lo - lo) / sp * 100}%;width:${Math.max((d.hi - d.lo) / sp * 100, 10)}%"></i></div><b data-c="${d.hi}">-</b></li>`).join("");
    }
  
    // --- Skor & saran aktivitas ---
    function advice(d, f, aq) {
      const id = d.weather[0].id, t = d.main.temp, ws = d.wind.speed;
      const pop = Math.max(0, ...(f?.list || []).slice(0, 8).map(i => i.pop || 0));
      let s = 100; const tips = [];
      if (id < 600) { s -= 40; tips.push(["☔", "Sedang hujan, bawa payung atau jas hujan"]); }
      else if (pop > .5) { s -= 20; tips.push(["🌦️", `Peluang hujan ${Math.round(pop * 100)}% dalam 24 jam, siapkan payung`]); }
      if (id >= 600 && id < 700) { s -= 35; tips.push(["🧥", "Bersalju, pakai pakaian tebal dan alas kaki anti-selip"]); }
      if (t >= 32) { s -= 25; tips.push(["🥤", "Panas terik, perbanyak minum dan hindari matahari pukul 11.00–15.00"]); }
      else if (t <= 15) { s -= 20; tips.push(["🧣", "Suhu dingin, kenakan jaket"]); }
      if (ws > 8) { s -= 15; tips.push(["💨", "Angin kencang, waspada di area terbuka"]); }
      if (d.main.humidity > 85) s -= 8;
      if (aq >= 4) { s -= 30; tips.push(["😷", "Udara buruk, pakai masker saat di luar"]); }
      else if (aq === 3) { s -= 12; tips.push(["🏃", "Kualitas udara sedang, kurangi olahraga berat di luar"]); }
      if (!tips.length) tips.push(["😎", "Kondisi nyaman untuk beraktivitas di luar ruangan"]);
      s = Math.max(5, s);
      const lab = s >= 75 ? "Sangat baik" : s >= 50 ? "Cukup baik" : "Kurang ideal";
      $("advice").innerHTML = `<div class="score" style="--p:${s};--c:${s >= 75 ? "#30d158" : s >= 50 ? "#ffd60a" : "#ff9f0a"}"><b>${s}</b></div>
        <div><h3>Aktivitas luar ruang: <em>${lab}</em></h3><ul>${tips.map(([e, x]) => `<li>${e} ${x}</li>`).join("")}</ul></div>`;
    }
  
    // Dipanggil dari render() di app.js
    function after(d, f) {
      mark();
      const deg8 = d.wind.deg ?? 0;
      $("wind-arrow").style.transform = `rotate(${deg8 + 180}deg)`;
      $("wind-note").textContent += ` · dari ${DIRS[Math.round(deg8 / 45) % 8]}`;
      chart(f); daily(f);
      $("aqi").textContent = "…"; $("aqi-note").textContent = "Memuat data";
      $("aqi-bar").style.width = "0%";
      advice(d, f, 0);
      fetchAirQuality(d.coord).then(a => {
        if (last?.d !== d) return; // pencarian lain sudah menggantikan
        const n = a.list[0].main.aqi;
        $("aqi").textContent = AQI[n - 1];
        $("aqi-note").textContent = `Indeks ${n}/5 · PM2.5 ${a.list[0].components.pm2_5.toFixed(1)} µg/m³`;
        $("aqi-bar").style.cssText = `width:${n * 20}%;background:${AQI_COLOR[n - 1]}`;
        advice(d, f, n);
      }).catch(() => { if (last?.d === d) { $("aqi").textContent = "-"; $("aqi-note").textContent = "Data tidak tersedia"; } });
    }
  
    return { after };
  })();
  