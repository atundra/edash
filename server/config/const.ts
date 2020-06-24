import { config } from 'dotenv';
import { parseEnv } from './env';
config();

export const PORT = process.env.PORT !== undefined ? parseInt(process.env.PORT, 10) : 8000;

// Increment to discard current widget data cache
export const CACHE_GENERATION = 1;

export const CLUSTER_POINTS_MAX_DISTANCE_M = 1000 * 100;

export const ENABLE_GOOGLE_API = Boolean(process.env.ENABLE_GOOGLE_API);

export const EXPRESS_SESSION_SECRET = 'fatproductspiner';

export const ENV = parseEnv(process.env.ENV);

export const GITHUB_CALLBACK_URL = `http://localhost:${PORT}/api/auth/github/callback`;
export const GITHUB_CLIENT_ID = String(process.env.GITHUB_CLIENT_ID);
export const GITHUB_CLIENT_SECRET = String(process.env.GITHUB_CLIENT_SECRET);

export const GMAPS_STATIC_API = 'https://maps.googleapis.com/maps/api/staticmap';
export const GMAPS_API_KEY = process.env.GMAPS_API_KEY;

export const GOOGLE_API_OAUTH_AUTH_URI = 'https://accounts.google.com/o/oauth2/auth';
export const GOOGLE_API_OAUTH_CERTS_URI = 'https://www.googleapis.com/oauth2/v1/certs';
export const GOOGLE_API_OAUTH_CLIENT_ID = '795615539023-ufesmnnvsc3i36c27qvamedn96doqrp9.apps.googleusercontent.com';
export const GOOGLE_API_OAUTH_CLIENT_SECRET = process.env.GOOGLE_API_OAUTH_CLIENT_SECRET;
export const GOOGLE_API_OAUTH_PROJECT_ID = 'quickstart-1564650386949';
export const GOOGLE_API_OAUTH_REDIRECT_URI = 'http://localhost:8000/api/auth/google/callback';
export const GOOGLE_API_OAUTH_TOKEN_PATH = 'token.json';
export const GOOGLE_API_OAUTH_TOKEN_URI = 'https://oauth2.googleapis.com/token';

export const IMAGE_MAX_AGE = 1000 * 60 * 60 * 6;

export const LAYOUT_COLUMNS_COUNT = 16;
export const LAYOUT_ROWS_COUNT = 12;

export const MONGO_CONNECTION_URI =
  process.env.MONGO_CONNECTION_URI !== undefined ? process.env.MONGO_CONNECTION_URI : 'mongodb://localhost:27017/edash';

export const ONE_USER_MODE = Boolean(process.env.ONE_USER_MODE);
export const ONE_USER_USERID = process.env.ONE_USER_USERID !== undefined ? Number(process.env.ONE_USER_USERID) : 0;

export const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

export const PUPPETEER_ARGS = process.env.PUPPETEER_ARGS !== undefined ? process.env.PUPPETEER_ARGS.split(',') : [];

export const TRACK24_API = 'https://api.track24.ru/tracking.json.php';
export const TRACK24_API_KEY = process.env.TRACK24_API_KEY;

export const TRACKS = process.env.TRACKS !== undefined ? process.env.TRACKS.split(',') : [];

// Default latlon is Moscow
export const WEATHER_LAT = process.env.WEATHER_LAT !== undefined ? Number(process.env.WEATHER_LAT) : 55.7558;
export const WEATHER_LON = process.env.WEATHER_LAT !== undefined ? Number(process.env.WEATHER_LAT) : 37.6173;

export const YANDEX_API_KEY = process.env.YANDEX_API_KEY;
export const YANDEX_GEOCODE_BASE_URL = 'https://geocode-maps.yandex.ru/1.x';
