import { config } from 'dotenv';
config();

export const YANDEX_API_KEY = process.env.YANDEX_API_KEY;
export const GEOCODE_BASE_URL = 'https://geocode-maps.yandex.ru/1.x';

export const GMAPS_STATIC_API =
  'https://maps.googleapis.com/maps/api/staticmap';
export const GMAPS_API_KEY = process.env.GMAPS_API_KEY;

export const TRACK24_API = 'https://api.track24.ru/tracking.json.php';
export const TRACK24_API_KEY = process.env.TRACK24_API_KEY;

export const CLUSTER_POINTS_MAX_DISTANCE_M = 1000 * 100;

export const PORT =
  process.env.PORT !== undefined ? parseInt(process.env.PORT, 10) : 8000;

export const IMAGE_MAX_AGE = 1000 * 60 * 60 * 6;

export const TRACKS =
  process.env.TRACKS !== undefined ? process.env.TRACKS.split(',') : [];

export const GOOGLE_API_OAUTH_PROJECT_ID = 'quickstart-1564650386949';
export const GOOGLE_API_OAUTH_AUTH_URI =
  'https://accounts.google.com/o/oauth2/auth';
export const GOOGLE_API_OAUTH_TOKEN_URI = 'https://oauth2.googleapis.com/token';
export const GOOGLE_API_OAUTH_CERTS_URI =
  'https://www.googleapis.com/oauth2/v1/certs';
export const GOOGLE_API_OAUTH_REDIRECT_URI =
  'http://localhost:8000/api/auth/google/callback';
export const GOOGLE_API_OAUTH_CLIENT_ID =
  '795615539023-ufesmnnvsc3i36c27qvamedn96doqrp9.apps.googleusercontent.com';
export const GOOGLE_API_OAUTH_CLIENT_SECRET =
  process.env.GOOGLE_API_OAUTH_CLIENT_SECRET;
export const GOOGLE_API_OAUTH_TOKEN_PATH = 'token.json';

export const ENABLE_GOOGLE_API = Boolean(process.env.ENABLE_GOOGLE_API);

export const PUPPETEER_ARGS =
  process.env.PUPPETEER_ARGS !== undefined
    ? process.env.PUPPETEER_ARGS.split(',')
    : [];

export const COLUMNS = 16;
export const ROWS = 12;
