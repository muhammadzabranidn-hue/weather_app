// assets/js/app.js

const searchBtn = document.getElementById("search-btn");
const cityInput = document.getElementById("city-input");

const cityName = document.getElementById("city-name");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const weatherIcon = document.getElementById("weather-icon");

const loadingMsg = document.getElementById("loading-msg");
const errorMsg = document.getElementById("error-msg");
const weatherInfo = document.getElementById("weather-info");

async function handleSearch() {
  const city = cityInput.value.trim();
  if (city === "") return;

  // Set State: Tampilkan loading, sembunyikan error & info cuaca lama
  loadingMsg.classList.remove("hidden");
  errorMsg.classList.add("hidden");
  weatherInfo.classList.add("hidden");

  try {
    const data = await fetchWeatherData(city);

    // Update DOM dengan data dari API
    cityName.textContent = data.name;
    temperature.textContent = `${Math.round(data.main.temp)}°C`;
    description.textContent = data.weather[0].description;
    humidity.textContent = `${data.main.humidity}%`;
    wind.textContent = `${data.wind.speed} m/s`;

    // Ambil icon cuaca dari OpenWeatherMap
    const iconCode = data.weather[0].icon;
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    // Tampilkan data cuaca dan sembunyikan loading
    loadingMsg.classList.add("hidden");
    weatherInfo.classList.remove("hidden");
  } catch (error) {
    loadingMsg.classList.add("hidden");
    errorMsg.classList.remove("hidden");
  }
}

// Event Listeners
searchBtn.addEventListener("click", handleSearch);

cityInput.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    handleSearch();
  }
});