import { afterEach, describe, expect, it, vi } from 'vitest';
import { httpClient } from '~root/lib/http-client';
import { toolRegistry } from '~root/ai-tools';

vi.mock('~root/lib/http-client', () => ({
  httpClient: { post: vi.fn() },
}));

afterEach(() => {
  vi.restoreAllMocks();
  vi.mocked(httpClient.post).mockReset();
});

describe('get_weather tool', () => {
  it('returns current weather data on success', async () => {
    vi.mocked(httpClient.post).mockResolvedValueOnce({
      data: {
        mode: 'current',
        city: 'Ho Chi Minh City',
        country: 'VN',
        temperatureC: 30.5,
        feelsLikeC: 34.0,
        description: 'scattered clouds',
        humidityPercent: 70,
        windSpeedMs: 3.2,
      },
    });

    const result = await toolRegistry.execute('get_weather', {
      mode: 'current',
      city: 'Ho Chi Minh City',
    });

    expect(httpClient.post).toHaveBeenCalledWith('/weather', {
      mode: 'current',
      city: 'Ho Chi Minh City',
    });
    expect(result).toEqual({
      success: true,
      data: {
        mode: 'current',
        city: 'Ho Chi Minh City',
        country: 'VN',
        temperatureC: 30.5,
        feelsLikeC: 34.0,
        description: 'scattered clouds',
        humidityPercent: 70,
        windSpeedMs: 3.2,
      },
    });
  });

  it('returns forecast data on success', async () => {
    vi.mocked(httpClient.post).mockResolvedValueOnce({
      data: {
        mode: 'forecast',
        city: 'Ho Chi Minh City',
        country: 'VN',
        days: [
          {
            date: '2026-08-28',
            minTemperatureC: 24.0,
            maxTemperatureC: 33.0,
            description: 'clear sky',
          },
        ],
      },
    });

    const result = await toolRegistry.execute('get_weather', {
      mode: 'forecast',
      city: 'Ho Chi Minh City',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        mode: 'forecast',
        city: 'Ho Chi Minh City',
        country: 'VN',
        days: [
          {
            date: '2026-08-28',
            minTemperatureC: 24.0,
            maxTemperatureC: 33.0,
            description: 'clear sky',
          },
        ],
      });
    }
  });

  it('rejects an empty city before calling the API', async () => {
    const result = await toolRegistry.execute('get_weather', { mode: 'current', city: '' });

    expect(httpClient.post).not.toHaveBeenCalled();
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.category).toBe('validation');
    }
  });

  it('maps an HTTP error response detail into the tool error message', async () => {
    vi.mocked(httpClient.post).mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 404, data: { detail: 'City not found: asdkjaskjd' } },
    });

    const result = await toolRegistry.execute('get_weather', {
      mode: 'current',
      city: 'asdkjaskjd',
    });

    expect(result).toEqual({
      success: false,
      error: { category: 'execution', message: 'City not found: asdkjaskjd' },
    });
  });

  it('falls back to a generic message when the network request itself fails', async () => {
    vi.mocked(httpClient.post).mockRejectedValueOnce({ isAxiosError: true, response: undefined });

    const result = await toolRegistry.execute('get_weather', {
      mode: 'current',
      city: 'Ho Chi Minh City',
    });

    expect(result).toEqual({
      success: false,
      error: { category: 'execution', message: 'Could not reach the weather service.' },
    });
  });
});
