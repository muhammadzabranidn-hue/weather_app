const weather_api_key = "Masukkan API Key Anda di sini"; // Ganti dengan API Key Anda

async function fetchWeatherData(city) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weather_api_key}&units=metric&lang=id`);
    if (!response.ok) {
        throw new Error('Weather data not found');
    }
    const data = await response.json();
    return data;
}