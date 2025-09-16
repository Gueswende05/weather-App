// Remplacez par votre clé API OpenWeatherMap
const API_KEY = 'FWU2TSNMR6DLEKPQL5Z24QQ3P'; // Seulement la clé Visual Crossing

// Fonction pour récupérer les données météo selon la ville (Visual Crossing)
async function fetchWeatherByCity(city) {
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(city)}?unitGroup=metric&key=${API_KEY}&contentType=json`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log('Données brutes:', data);
        return data;
    } catch (error) {
        console.error('Erreur lors de la récupération des données météo:', error);
    }
}

// Fonction pour traiter les données JSON et ne garder que l'essentiel (Visual Crossing)
function processWeatherData(data) {
    if (!data || !data.currentConditions || !data.days) return null;
    // Prévisions sur 7 jours
    const forecast = data.days.slice(0, 7).map(day => ({
        date: day.datetime,
        temperature: Math.round(day.temp),
        ressenti: Math.round(day.feelslike),
        description: day.conditions,
        icone: day.icon,
        humidite: day.humidity,
        vent: day.windspeed
    }));
    return {
        ville: data.resolvedAddress,
        temperature: Math.round(data.currentConditions.temp),
        ressenti: Math.round(data.currentConditions.feelslike),
        description: data.currentConditions.conditions,
        humidite: data.currentConditions.humidity,
        vent: data.currentConditions.windspeed,
        icone: data.currentConditions.icon,
        forecast // Ajout des prévisions
    };
}

// Fonction pour définir un arrière-plan dynamique selon l'icône météo
function setDynamicBackground(icon) {
    const backgrounds = {
        "clear-day": "linear-gradient(135deg, #4f8ef7 0%, #67d1fb 100%)",
        "clear-night": "linear-gradient(135deg, #232526 0%, #414345 100%)",
        "partly-cloudy-day": "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)",
        "cloudy": "linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)",
        "rain": "linear-gradient(135deg, #667db6 0%, #0082c8 100%)",
        "snow": "linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)",
        "fog": "linear-gradient(135deg, #757f9a 0%, #d7dde8 100%)",
        "wind": "linear-gradient(135deg, #74ebd5 0%, #ACB6E5 100%)",
        "thunderstorm": "linear-gradient(135deg, #232526 0%, #414345 100%)"
    };
    document.body.style.background = backgrounds[icon] || backgrounds["clear-day"];
}

// Gestionnaire de soumission du formulaire
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('weather-form');
    const input = document.getElementById('city-input');
    const result = document.getElementById('weather-result');
    const loader = document.getElementById('loader');
    const submitBtn = document.getElementById('submit-btn');

    // Active/désactive le bouton selon le champ
    input.addEventListener('input', () => {
        submitBtn.disabled = input.value.trim().length === 0;
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const city = input.value.trim();
        if (!city) return;

        loader.style.display = 'block';
        result.innerHTML = '';

        const rawData = await fetchWeatherByCity(city);
        const weather = processWeatherData(rawData);

        loader.style.display = 'none';

        if (weather) {
            const icons = {
                "clear-day": "☀️",
                "clear-night": "🌙",
                "partly-cloudy-day": "⛅",
                "partly-cloudy-night": "🌤️",
                "cloudy": "☁️",
                "rain": "🌧️",
                "snow": "❄️",
                "fog": "🌫️",
                "wind": "💨",
                "thunderstorm": "⛈️"
            };
            const emoji = icons[weather.icone] || "🌡️";
            // Prévisions sur 7 jours
            const forecastHTML = weather.forecast.map(day => {
                const dayEmoji = icons[day.icone] || "🌡️";
                // Format date (YYYY-MM-DD → Jour)
                const dateObj = new Date(day.date);
                const options = { weekday: 'short', day: 'numeric', month: 'short' };
                const dateStr = dateObj.toLocaleDateString('fr-FR', options);
                return `
                    <div class="forecast-day">
                        <span class="forecast-date">${dateStr}</span>
                        <span class="forecast-emoji">${dayEmoji}</span>
                        <span class="forecast-temp">${day.temperature}°C</span>
                        <span class="forecast-desc">${day.description}</span>
                    </div>
                `;
            }).join('');
            result.innerHTML = `
                <div class="weather-card ${weather.icone}">
                    <div class="weather-main">
                        <span class="weather-emoji">${emoji}</span>
                        <span class="weather-temp">${weather.temperature}°C</span>
                    </div>
                    <div class="weather-city">${weather.ville}</div>
                    <div class="weather-desc">${weather.description}</div>
                    <div class="weather-details">
                        <span>Ressenti&nbsp;: ${weather.ressenti}°C</span>
                        <span>💧 ${weather.humidite}%</span>
                        <span>💨 ${weather.vent} km/h</span>
                    </div>
                    <div class="weather-forecast">
                        <h3>Prévisions 7 jours</h3>
                        <div class="forecast-list">${forecastHTML}</div>
                    </div>
                </div>
            `;
            setDynamicBackground(weather.icone);
        } else {
            result.innerHTML = `<p>Ville non trouvée ou erreur API.</p>`;
        }
    });
});