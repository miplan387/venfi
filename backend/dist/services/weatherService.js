"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.weatherService = exports.WeatherService = void 0;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../config/env");
const CITY_COORDINATES = {
    caracas: { lat: 10.4880, lon: -66.8792, defaultTemp: 28, condition: 'Parcialmente Nublado' },
    maracaibo: { lat: 10.6427, lon: -71.6125, defaultTemp: 33, condition: 'Soleado y Cálido' },
    valencia: { lat: 10.1620, lon: -68.0077, defaultTemp: 29, condition: 'Despejado' },
    barquisimeto: { lat: 10.0678, lon: -69.3474, defaultTemp: 28, condition: 'Viento Suave' }
};
class WeatherService {
    cache = new Map();
    CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutos TTL
    /**
     * Consulta el clima de una ciudad específica
     */
    async getWeather(cityParam = 'caracas') {
        const cityKey = cityParam.toLowerCase().trim();
        const now = Date.now();
        // 1. Verificar Cache
        const cached = this.cache.get(cityKey);
        if (cached && (now - cached.timestamp < this.CACHE_TTL_MS)) {
            return cached.data;
        }
        const cityMeta = CITY_COORDINATES[cityKey] || CITY_COORDINATES.caracas;
        const formattedCityName = cityParam.charAt(0).toUpperCase() + cityParam.slice(1).toLowerCase();
        // 2. Nivel 1: OpenWeatherMap (si existe API Key válida)
        const apiKey = env_1.config.externalApis.openWeatherApiKey;
        if (apiKey && apiKey !== 'mock_or_user_openweather_api_key' && apiKey.length > 10) {
            try {
                const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(formattedCityName)},VE&units=metric&lang=es&appid=${apiKey}`;
                const response = await axios_1.default.get(url, { timeout: 3000 });
                if (response.data && response.data.main) {
                    const d = response.data;
                    const result = {
                        city: formattedCityName,
                        country: 'Venezuela',
                        temp: Math.round(d.main.temp),
                        feelsLike: Math.round(d.main.feels_like),
                        tempMin: Math.round(d.main.temp_min),
                        tempMax: Math.round(d.main.temp_max),
                        condition: d.weather[0]?.main || 'Despejado',
                        description: d.weather[0]?.description || 'Cielo despejado',
                        icon: d.weather[0]?.icon || '01d',
                        humidity: d.main.humidity,
                        windSpeed: Math.round(d.wind.speed * 3.6), // m/s a km/h
                        updatedAt: new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Caracas' }),
                        dataSource: 'openweathermap'
                    };
                    this.cache.set(cityKey, { data: result, timestamp: now });
                    return result;
                }
            }
            catch (err) {
                console.warn(`[weatherService] OpenWeatherMap falló para ${cityParam}:`, err.message);
            }
        }
        // 3. Nivel 2: Open-Meteo API (gratuita, sin API key, datos meteorológicos globales)
        try {
            const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${cityMeta.lat}&longitude=${cityMeta.lon}&current_weather=true&hourly=relativehumidity_2m`;
            const response = await axios_1.default.get(openMeteoUrl, { timeout: 3000 });
            if (response.data && response.data.current_weather) {
                const cw = response.data.current_weather;
                const weatherCode = cw.weathercode;
                let condition = 'Despejado';
                let description = 'Cielo soleado';
                if (weatherCode >= 1 && weatherCode <= 3) {
                    condition = 'Parcialmente Nublado';
                    description = 'Nubes dispersas';
                }
                else if (weatherCode >= 45 && weatherCode <= 48) {
                    condition = 'Neblina';
                    description = 'Niebla matutina';
                }
                else if (weatherCode >= 51 && weatherCode <= 67) {
                    condition = 'Lluvia Ligera';
                    description = 'Precipitaciones aisladas';
                }
                else if (weatherCode >= 80) {
                    condition = 'Chubascos';
                    description = 'Tormentas eléctricas';
                }
                const result = {
                    city: formattedCityName,
                    country: 'Venezuela',
                    temp: Math.round(cw.temperature),
                    feelsLike: Math.round(cw.temperature + 1.5),
                    tempMin: Math.round(cw.temperature - 3),
                    tempMax: Math.round(cw.temperature + 2),
                    condition,
                    description,
                    icon: cw.is_day ? '02d' : '02n',
                    humidity: 68,
                    windSpeed: Math.round(cw.windspeed),
                    updatedAt: new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Caracas' }),
                    dataSource: 'openmeteo'
                };
                this.cache.set(cityKey, { data: result, timestamp: now });
                return result;
            }
        }
        catch (err) {
            console.warn(`[weatherService] Open-Meteo falló para ${cityParam}:`, err.message);
        }
        // 4. Nivel 3: Respaldo estático estacional
        const fallbackResult = {
            city: formattedCityName,
            country: 'Venezuela',
            temp: cityMeta.defaultTemp,
            feelsLike: cityMeta.defaultTemp + 2,
            tempMin: cityMeta.defaultTemp - 4,
            tempMax: cityMeta.defaultTemp + 2,
            condition: cityMeta.condition,
            description: cityMeta.condition,
            icon: '01d',
            humidity: 65,
            windSpeed: 12,
            updatedAt: new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Caracas' }),
            dataSource: 'fallback'
        };
        this.cache.set(cityKey, { data: fallbackResult, timestamp: now });
        return fallbackResult;
    }
    /**
     * Retorna el clima de las principales ciudades venezolanas (Caracas, Maracaibo, Valencia)
     */
    async getMajorCitiesWeather() {
        const cities = ['caracas', 'maracaibo', 'valencia'];
        const results = await Promise.all(cities.map(c => this.getWeather(c)));
        return results;
    }
}
exports.WeatherService = WeatherService;
exports.weatherService = new WeatherService();
//# sourceMappingURL=weatherService.js.map