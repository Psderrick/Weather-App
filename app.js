const apiKey = window.OPENWEATHER_API_KEY; 

const searchBtn = document.getElementById('searchBtn');
const cityInput = document.getElementById('cityInput');
const cityName = document.getElementById('cityName');
const temperature = document.getElementById('temperature');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const weatherInfo = document.querySelector('.weather-info');
const errorMessage = document.getElementById('errorMessage');
const loading = document.getElementById('loading');
const icon = document.getElementById('icon');
const locationBanner = document.getElementById('locationBanner');

function showWeather(data, fromCache = false) {
  cityName.textContent = data.name;
  temperature.textContent = `${Math.round(data.main.temp)}°C`;
  humidity.textContent = `💧 ${data.main.humidity}%`;
  windSpeed.textContent = `💨 ${data.wind.speed} m/s`;
  icon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  icon.alt = data.weather[0].description;

  updateBackground(data.weather[0].main);

  weatherInfo.classList.remove('hidden');
  locationBanner.classList.toggle('hidden', !fromCache);
}

function updateBackground(weather) {
  const main = weather.toLowerCase();
  document.body.className = '';

  if (main.includes('rain')) {
    document.body.classList.add('rainy');
  } else if (main.includes('cloud')) {
    document.body.classList.add('cloudy');
  } else if (main.includes('clear') || main.includes('sun')) {
    document.body.classList.add('sunny');
  } else {
    document.body.classList.add('clear');
  }
}

function fetchWeather(url, useCache = false) {
  weatherInfo.classList.add('hidden');
  locationBanner.classList.add('hidden');
  errorMessage.textContent = '';
  loading.style.display = 'block';

  fetch(url)
    .then(res => res.json())
    .then(data => {
      loading.style.display = 'none';

      if (data.cod !== 200) {
        errorMessage.textContent = '⚠️ City not found!';
        return;
      }

      // Store latest data in localStorage
      localStorage.setItem('weatherData', JSON.stringify(data));
      localStorage.setItem('weatherTimestamp', Date.now());

      showWeather(data, useCache);
    })
    .catch(() => {
      loading.style.display = 'none';
      if (useCache) {
        const cachedData = localStorage.getItem('weatherData');
        if (cachedData) {
          showWeather(JSON.parse(cachedData), true);
          errorMessage.textContent = '📦 Showing cached weather data (offline)';
        } else {
          errorMessage.textContent = '🚫 Failed to fetch weather.';
        }
      }
    });
}

// Manual search
searchBtn.addEventListener('click', () => {
  const city = cityInput.value.trim();
  if (!city) return;

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  fetchWeather(url);
});

// Auto fetch on geolocation
window.addEventListener('load', () => {
  const cachedData = localStorage.getItem('weatherData');
  const lastFetch = localStorage.getItem('weatherTimestamp');
  const now = Date.now();

  // Show cached data if within 10 minutes
  if (cachedData && lastFetch && now - lastFetch < 10 * 60 * 1000) {
    showWeather(JSON.parse(cachedData), true);
    return;
  }

  loading.style.display = 'block';
  loading.textContent = '📍 Detecting your location...';

  if (!navigator.geolocation) {
    errorMessage.textContent = "Geolocation not supported.";
    loading.style.display = 'none';
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
      fetchWeather(url);
    },
    (error) => {
      loading.style.display = 'none';
      errorMessage.textContent = '🔍 Location denied. Use search to find weather.';
      if (cachedData) {
        showWeather(JSON.parse(cachedData), true);
      }
    }
  );
});



   // Register Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js')
    .then(() => console.log("✅ Service Worker registered"))
    .catch((err) => console.error("❌ Service Worker registration failed:", err));
}



