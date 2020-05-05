type Latitude = number;

type Longitude = number;

type ApiKey = string;

type UnixTime = number;

type OneCallDataPart = 'current' | 'hourly' | 'daily';

type Units = 'metric' | 'imperial' | undefined;

type TempFahrenheit = number;

type TempCelsius = number;

type TempKelvin = number;

type Temp<U extends Units> = U extends undefined
  ? TempKelvin
  : U extends 'metric'
  ? TempCelsius
  : U extends 'asdf'
  ? TempFahrenheit
  : never;

type Pressure = number; // hPa

type Percentage = number; // %, 0-100

type Degrees = number; // ˚, 0-360

type PosInteger = number; // 0+

type SpeedMeterPerSec = number;

type SpeedMilesPerHour = number;

type Speed<U extends Units> = U extends undefined | 'metric'
  ? SpeedMeterPerSec
  : SpeedMilesPerHour;

type OneCallHourlyData<U extends Units> = {
  dt: UnixTime; // Time of the forecasted data, unix, UTC
  temp: Temp<U>; // Temperature. Unit Default: Kelvin, Metric: Celsius, Imperial: Fahrenheit. How to change units format
  feels_like: Temp<U>; // Temperature. This temperature parameter accounts for the human perception of weather. Unit Default: Kelvin, Metric: Celsius, Imperial: Fahrenheit.
  pressure: Pressure; // Atmospheric pressure on the sea level, hPa
  humidity: Percentage; // Humidity, %
  dew_point: Temp<U>; // Atmospheric temperature (varying according to pressure and humidity) below which water droplets begin to condense and dew can form. Unit Default: Kelvin, Metric: Celsius, Imperial: Fahrenheit.
  clouds: Percentage; // Cloudiness, %
  visibility: PosInteger; // Average visibility, meters
  wind_speed: Speed<U>; // Wind speed. Unit Default: meter/sec, Metric: meter/sec, Imperial: miles/hour.
  wind_gust: Speed<U>; // Wind gust. Unit Default: meter/sec, Metric: meter/sec, Imperial: miles/hour.
  wind_deg: Degrees; // Wind direction, degrees (meteorological)
  rain: Record<string, PosInteger>; // Precipitation volume, mm, {1h: 12.2}
  snow: PosInteger; // Snow volume, mm
  weather: WeatherCondition[];
};

export type OneCallConfig = {
  lat: Latitude;
  lon: Longitude;
  apiKey: ApiKey;
  units?: Units;
} & {
  [Part in OneCallDataPart]?: boolean;
};

// Current weather data API response
type OneCallCurrentResponse<U extends Units> = OneCallHourlyData<U> & {
  sunrise: UnixTime; // Sunrise time, unix, UTC
  sunset: UnixTime; // Sunset time, unix, UTC
  uvi: PosInteger; // UV index
};

// Hourly forecast weather data API response
type OneCallHourlyResponse<U extends Units> = OneCallHourlyData<U>[];

type OneCallDaySpecific<U extends Units> = {
  temp: {
    morn: Temp<U>; // Morning temperature. Unit Default: Kelvin, Metric: Celsius, Imperial: Fahrenheit. How to change units format
    day: Temp<U>; // Day temperature. Unit Default: Kelvin, Metric: Celsius, Imperial: Fahrenheit.
    eve: Temp<U>; // Evening temperature. Unit Default: Kelvin, Metric: Celsius, Imperial: Fahrenheit.
    night: Temp<U>; // Night temperature. Unit Default: Kelvin, Metric: Celsius, Imperial: Fahrenheit.
    min: Temp<U>; // Min daily temperature. Unit Default: Kelvin, Metric: Celsius, Imperial: Fahrenheit.
    max: Temp<U>; // Max daily temperature. Unit Default: Kelvin, Metric: Celsius, Imperial: Fahrenheit.
  };
  feels_like: {
    morn: Temp<U>; // Morning temperature.Temperature. This temperature parameter accounts for the human perception of weather. Unit Default: Kelvin, Metric: Celsius, Imperial: Fahrenheit. How to change units format
    day: Temp<U>; // Day temperature.Temperature. This temperature parameter accounts for the human perception of weather. Unit Default: Kelvin, Metric: Celsius, Imperial: Fahrenheit.
    eve: Temp<U>; // Evening temperature.Temperature. This temperature parameter accounts for the human perception of weather. Unit Default: Kelvin, Metric: Celsius, Imperial: Fahrenheit.
    night: Temp<U>; // Night temperature.Temperature. This temperature parameter accounts for the human perception of weather. Unit Default: Kelvin, Metric: Celsius, Imperial: Fahrenheit.
  };
};

type OneCallDayResponse<U extends Units> = Omit<
  OneCallCurrentResponse<U>,
  keyof OneCallDaySpecific<U>
> &
  OneCallDaySpecific<U>;

type OneCallDailyResponse<U extends Units> = OneCallDayResponse<U>[];

export type OneCallResponse<Config extends OneCallConfig> = {
  lat: string;
  lon: string;
  timezone: string;
  current: Config['current'] extends true
    ? OneCallCurrentResponse<Config['units']>
    : undefined;
  hourly: Config['hourly'] extends true
    ? OneCallHourlyResponse<Config['units']>
    : undefined;
  daily: Config['daily'] extends true
    ? OneCallDailyResponse<Config['units']>
    : undefined;
};

type WeatherCondition =
  // Group 2xx: Thunderstorm
  | {
      id: 200;
      main: 'Thunderstorm';
      description: 'thunderstorm with light rain';
      icon: '11d';
    }
  | {
      id: 201;
      main: 'Thunderstorm';
      description: 'thunderstorm with rain';
      icon: '11d';
    }
  | {
      id: 202;
      main: 'Thunderstorm';
      description: 'thunderstorm with heavy rain';
      icon: '11d';
    }
  | {
      id: 210;
      main: 'Thunderstorm';
      description: 'light thunderstorm';
      icon: '11d';
    }
  | { id: 211; main: 'Thunderstorm'; description: 'thunderstorm'; icon: '11d' }
  | {
      id: 212;
      main: 'Thunderstorm';
      description: 'heavy thunderstorm';
      icon: '11d';
    }
  | {
      id: 221;
      main: 'Thunderstorm';
      description: 'ragged thunderstorm';
      icon: '11d';
    }
  | {
      id: 230;
      main: 'Thunderstorm';
      description: 'thunderstorm with light drizzle';
      icon: '11d';
    }
  | {
      id: 231;
      main: 'Thunderstorm';
      description: 'thunderstorm with drizzle';
      icon: '11d';
    }
  | {
      id: 232;
      main: 'Thunderstorm';
      description: 'thunderstorm with heavy drizzle';
      icon: '11d';
    }
  // Group 3xx: Drizzle
  | {
      id: 300;
      main: 'Drizzle';
      description: 'light intensity drizzle';
      icon: '09d';
    }
  | { id: 301; main: 'Drizzle'; description: 'drizzle'; icon: '09d' }
  | {
      id: 302;
      main: 'Drizzle';
      description: 'heavy intensity drizzle';
      icon: '09d';
    }
  | {
      id: 310;
      main: 'Drizzle';
      description: 'light intensity drizzle rain';
      icon: '09d';
    }
  | { id: 311; main: 'Drizzle'; description: 'drizzle rain'; icon: '09d' }
  | {
      id: 312;
      main: 'Drizzle';
      description: 'heavy intensity drizzle rain';
      icon: '09d';
    }
  | {
      id: 313;
      main: 'Drizzle';
      description: 'shower rain and drizzle';
      icon: '09d';
    }
  | {
      id: 314;
      main: 'Drizzle';
      description: 'heavy shower rain and drizzle';
      icon: '09d';
    }
  | { id: 321; main: 'Drizzle'; description: 'shower drizzle'; icon: '09d' }
  // Group 5xx: Rain
  | { id: 500; main: 'Rain'; description: 'light rain'; icon: '10d' }
  | { id: 501; main: 'Rain'; description: 'moderate rain'; icon: '10d' }
  | { id: 502; main: 'Rain'; description: 'heavy intensity rain'; icon: '10d' }
  | { id: 503; main: 'Rain'; description: 'very heavy rain'; icon: '10d' }
  | { id: 504; main: 'Rain'; description: 'extreme rain'; icon: '10d' }
  | { id: 511; main: 'Rain'; description: 'freezing rain'; icon: '13d' }
  | {
      id: 520;
      main: 'Rain';
      description: 'light intensity shower rain';
      icon: '09d';
    }
  | { id: 521; main: 'Rain'; description: 'shower rain'; icon: '09d' }
  | {
      id: 522;
      main: 'Rain';
      description: 'heavy intensity shower rain';
      icon: '09d';
    }
  | { id: 531; main: 'Rain'; description: 'ragged shower rain'; icon: '09d' }
  // Group 6xx: Snow
  | { id: 600; main: 'Snow'; description: 'light snow'; icon: '13d' }
  | { id: 601; main: 'Snow'; description: 'Snow'; icon: '13d' }
  | { id: 602; main: 'Snow'; description: 'Heavy snow'; icon: '13d' }
  | { id: 611; main: 'Snow'; description: 'Sleet'; icon: '13d' }
  | { id: 612; main: 'Snow'; description: 'Light shower sleet'; icon: '13d' }
  | { id: 613; main: 'Snow'; description: 'Shower sleet'; icon: '13d' }
  | { id: 615; main: 'Snow'; description: 'Light rain and snow'; icon: '13d' }
  | { id: 616; main: 'Snow'; description: 'Rain and snow'; icon: '13d' }
  | { id: 620; main: 'Snow'; description: 'Light shower snow'; icon: '13d' }
  | { id: 621; main: 'Snow'; description: 'Shower snow'; icon: '13d' }
  | { id: 622; main: 'Snow'; description: 'Heavy shower snow'; icon: '13d' }
  // Group 7xx: Atmosphere
  | { id: 701; main: 'Mist'; description: 'mist'; icon: '50d' }
  | { id: 711; main: 'Smoke'; description: 'Smoke'; icon: '50d' }
  | { id: 721; main: 'Haze'; description: 'Haze'; icon: '50d' }
  | { id: 731; main: 'Dust'; description: 'sand/ dust whirls'; icon: '50d' }
  | { id: 741; main: 'Fog'; description: 'fog'; icon: '50d' }
  | { id: 751; main: 'Sand'; description: 'sand'; icon: '50d' }
  | { id: 761; main: 'Dust'; description: 'dust'; icon: '50d' }
  | { id: 762; main: 'Ash'; description: 'volcanic ash'; icon: '50d' }
  | { id: 771; main: 'Squall'; description: 'squalls'; icon: '50d' }
  | { id: 781; main: 'Tornado'; description: 'tornado'; icon: '50d' }
  // Group 800: Clear
  | { id: 800; main: 'Clear'; description: 'clear sky'; icon: '01n' }
  | { id: 800; main: 'Clear'; description: 'clear sky'; icon: '01d' }
  // Group 80x: Clouds
  | {
      id: 801;
      main: 'Clouds';
      description: 'few clouds: 11-25%';
      icon: '02n' | '02d';
    }
  | {
      id: 802;
      main: 'Clouds';
      description: 'scattered clouds: 25-50%';
      icon: '03n' | '03d';
    }
  | {
      id: 803;
      main: 'Clouds';
      description: 'broken clouds: 51-84%';
      icon: '04n' | '04d';
    }
  | {
      id: 804;
      main: 'Clouds';
      description: 'overcast clouds: 85-100%';
      icon: '04n' | '04d';
    };
