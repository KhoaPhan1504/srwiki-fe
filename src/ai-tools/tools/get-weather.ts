import axios from 'axios';
import { z } from 'zod';
import { httpClient } from '~root/lib/http-client';
import { Endpoints } from '~root/constants';
import type { ToolDefinition } from '../types';

const inputSchema = z.discriminatedUnion('mode', [
  z.object({ mode: z.literal('current'), city: z.string().min(1) }),
  z.object({ mode: z.literal('forecast'), city: z.string().min(1) }),
]);

type GetWeatherInput = z.infer<typeof inputSchema>;

interface CurrentWeatherOutput {
  mode: 'current';
  city: string;
  country: string;
  temperatureC: number;
  feelsLikeC: number;
  description: string;
  humidityPercent: number;
  windSpeedMs: number;
}

interface ForecastOutput {
  mode: 'forecast';
  city: string;
  country: string;
  days: { date: string; minTemperatureC: number; maxTemperatureC: number; description: string }[];
}

type GetWeatherOutput = CurrentWeatherOutput | ForecastOutput;

export const getWeatherTool: ToolDefinition<GetWeatherInput, GetWeatherOutput> = {
  name: 'get_weather',
  description:
    'Get the current weather or a 5-day forecast for a city. Set mode to "current" or "forecast", and city to the city name (e.g. "Ho Chi Minh City"). Ask the user which city if they have not said one. When presenting the result, include a relevant weather emoji for each condition (e.g. ☀️ clear, ⛅ partly cloudy, ☁️ cloudy, 🌧️ rain, ⛈️ storm, ❄️ snow, 🌫️ fog) and use 🌡️ for temperature, 💧 for humidity, and 💨 for wind.',
  inputSchema,
  metadata: { category: 'lookup', readOnly: true, requiresNetwork: true },
  execute: async (input) => {
    try {
      const res = await httpClient.post<GetWeatherOutput>(Endpoints.WEATHER, input);
      return { success: true, data: res.data };
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        const detail = err.response.data?.detail;
        return {
          success: false,
          error: {
            category: 'execution',
            message: typeof detail === 'string' ? detail : 'Could not fetch weather data.',
          },
        };
      }
      return {
        success: false,
        error: { category: 'execution', message: 'Could not reach the weather service.' },
      };
    }
  },
};
