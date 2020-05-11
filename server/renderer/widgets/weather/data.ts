import { oneCall } from '../../../external/openweather';
import { OneCallResponse } from '../../../external/openweather/types';
import { WEATHER_LAT, WEATHER_LON, OPENWEATHER_API_KEY } from '../../../config';

const oneCallConfig = {
  lat: WEATHER_LAT,
  lon: WEATHER_LON,
  apiKey: OPENWEATHER_API_KEY || '',
  current: true,
  daily: true,
  units: 'metric',
} as const;

export type TemplateProps = {
  weather: OneCallResponse<typeof oneCallConfig>;
};

export const dataResolver = async () => {
  const weather = await oneCall(oneCallConfig);
  return { weather };
};
