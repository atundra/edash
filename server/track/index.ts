import { createUrl, mapPromiseAll, getDataLoader } from "../utils";
import { TRACK24_API, TRACK24_API_KEY } from "../config";
import { TrackResponse } from "./types";

const getApiUrl = (track: string) =>
  createUrl(TRACK24_API, {
    apiKey: TRACK24_API_KEY,
    domain: "trackindashboard.local",
    code: track,
  });

const axiosGet = getDataLoader<TrackResponse>();

const getLastPosFromResponse = (res: TrackResponse) =>
  (res.status === "ok" && res.data.lastPoint.operationPlaceName) || null;

const trackLastPos = (track: string) =>
  Promise.resolve(getApiUrl(track)).then(axiosGet).then(getLastPosFromResponse);

export const trackLastPosList = mapPromiseAll(trackLastPos);
