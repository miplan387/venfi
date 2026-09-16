import { Request, Response } from 'express';
import { weatherService } from '../services/weatherService';

export class WeatherController {
  public async getWeather(req: Request, res: Response): Promise<void> {
    try {
      const city = (req.query.city as string) || 'caracas';
      const weather = await weatherService.getWeather(city);
      res.status(200).json({
        success: true,
        data: weather
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Error al consultar el clima'
      });
    }
  }

  public async getMajorCities(req: Request, res: Response): Promise<void> {
    try {
      const cities = await weatherService.getMajorCitiesWeather();
      res.status(200).json({
        success: true,
        count: cities.length,
        data: cities
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Error al consultar el clima de ciudades principales'
      });
    }
  }
}

export const weatherController = new WeatherController();
