import { config } from "dotenv";
config();

export const YANDEX_API_KEY = process.env.YANDEX_API_KEY;
export const GEOCODE_BASE_URL = "https://geocode-maps.yandex.ru/1.x";

export const GMAPS_STATIC_API =
  "https://maps.googleapis.com/maps/api/staticmap";
export const GMAPS_API_KEY = process.env.GMAPS_API_KEY;

export const TRACK24_API = "https://api.track24.ru/tracking.json.php";
export const TRACK24_API_KEY = process.env.TRACK24_API_KEY;

export const CLUSTER_POINTS_MAX_DISTANCE_M = 1000 * 100;

export const PORT =
  process.env.PORT !== undefined ? parseInt(process.env.PORT, 10) : 8000;
