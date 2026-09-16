"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.weatherController = exports.WeatherController = void 0;
const weatherService_1 = require("../services/weatherService");
class WeatherController {
    async getWeather(req, res) {
        try {
            const city = req.query.city || 'caracas';
            const weather = await weatherService_1.weatherService.getWeather(city);
            res.status(200).json({
                success: true,
                data: weather
            });
        }
        catch (err) {
            res.status(500).json({
                success: false,
                message: err.message || 'Error al consultar el clima'
            });
        }
    }
    async getMajorCities(req, res) {
        try {
            const cities = await weatherService_1.weatherService.getMajorCitiesWeather();
            res.status(200).json({
                success: true,
                count: cities.length,
                data: cities
            });
        }
        catch (err) {
            res.status(500).json({
                success: false,
                message: err.message || 'Error al consultar el clima de ciudades principales'
            });
        }
    }
}
exports.WeatherController = WeatherController;
exports.weatherController = new WeatherController();
//# sourceMappingURL=weatherController.js.map