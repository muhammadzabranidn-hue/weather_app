const weather_api_key = "b33f48533cbf0d447d6ffb023e63686d";
const API_BASE = "https://api.openweathermap.org";
// Menerima nama kota (string) atau koordinat {lat, lon}
const qs = c => typeof c === "string" ? `q=${encodeURIComponent(c)}` : `lat=${c.lat}&lon=${c.lon}`;
async function getJSON(path) {
    const r = await fetch(`${API_BASE}${path}&appid=${weather_api_key}`);
    if (!r.ok) throw new Error(r.status);
    return r.json();
}
const fetchWeatherData = c => getJSON(`/data/2.5/weather?${qs(c)}&units=metric&lang=id`);
// Prakiraan 5 hari, interval 3 jam (40 data)
const fetchForecastData = c => getJSON(`/data/2.5/forecast?${qs(c)}&units=metric&lang=id&cnt=40`);
const fetchAirQuality = ({ lat, lon }) => getJSON(`/data/2.5/air_pollution?lat=${lat}&lon=${lon}`);
const fetchSuggestions = q => getJSON(`/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=5`);
