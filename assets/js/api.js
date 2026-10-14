const weather_api_key = "b33f48533cbf0d447d6ffb023e63686d"

async function fetchWeatherData(city) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weather_api_key}&units=metric`);
    if (!response.ok) {
        throw new Error('Weather data not found');
    }
    const data = await response.json();
    return data;
}