# 🌦️ Minimalist Weather Dashboard

A modern, responsive, and secure Weather Dashboard built with **Vanilla HTML, CSS, and JavaScript**, featuring dynamic sky backgrounds, hourly forecasts, and glassmorphism UI design inspired by Apple Weather.

![Weather App Preview](https://img.shields.io/badge/status-active-success.svg) ![HTML5](https://img.shields.io/badge/HTML5-%23E34F26.svg?style=flat&logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-%231572B6.svg?style=flat&logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-%23F7DF1E.svg?style=flat&logo=javascript&logoColor=black)

---

## Deployment

Deployed in Vercel

## ✨ Features

* **Dynamic Sky Backgrounds**: Automatically switches themes and gradient layers (Clear Day, Night, Rain, Thunder, Snow, etc.) based on real-time weather conditions.
* **Glassmorphism UI**: Clean, modern aesthetic utilizing CSS backdrop filters, custom easing animations, and smooth transitions.
* **Hourly & Daily Insights**: Interactive scrollable hourly forecasts and detailed weather metrics (wind speed, humidity, pressure, and sunrise/sunset progress).
* **Recent Search History**: Saves searched cities locally using `localStorage` for quick access.
* **Unit Conversion**: Toggle seamlessly between Metric (°C) and Imperial (°F).
* **Secure API Configuration**: Implements security best practices to protect API keys on public repositories.

---

## 🛠️ Tech Stack

* **Markup & Style**: HTML5, Modern CSS3 (Grid, Flexbox, CSS Variables)
* **Scripting**: Vanilla JavaScript (ES6+, Async/Await, Fetch API)
* **API**: [OpenWeatherMap API](https://openweathermap.org/) (Current Weather & Forecast endpoints)

---

## 📁 Project Structure

```text
weather-app/
├── assets/
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── api.js             
│       ├── app.js  
│       ├── configExample.js       
│       └── effect.js
├── .gitignore                 
├── index.html                 
└── README.md                 

---

## 🚀 Fitur Tambahan (v2)

* **Dashboard awal interaktif**: sapaan + jam live, cuaca 6 kota dunia secara real-time, tombol *Lokasi saya* (geolocation), fakta cuaca acak.
* **Autocomplete kota** (OpenWeatherMap Geocoding) dan **kota favorit** (★) tersimpan di `localStorage`.
* **Grafik suhu 24 jam**, **prakiraan 5 hari** dengan rentang suhu, **kualitas udara (AQI)**, arah angin, dan **skor + saran aktivitas luar ruang**.
