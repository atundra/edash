import { GeocoderResponse, LatLon } from './types';
import { YANDEX_API_KEY, YANDEX_GEOCODE_BASE_URL } from '../../config';
import { createUrl, createTuple2, getDataLoader, mapPromiseAll } from '../../utils';

const createGeocodeUrl = (address: string) =>
  createUrl(YANDEX_GEOCODE_BASE_URL, {
    apikey: YANDEX_API_KEY,
    geocode: address,
    format: 'json',
  });

const axiosGet = getDataLoader<GeocoderResponse>();

const getPosFromResponse = (res: GeocoderResponse) =>
  res.response.GeoObjectCollection.featureMember.length
    ? res.response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos
    : null;

const processPos = (gmlPoint: string | null) =>
  gmlPoint ? createTuple2(gmlPoint.split(' ').map(parseFloat).reverse()) : null;

/**
 * Returns latlon
 * @param address
 */
export const geocode = (address: string): Promise<LatLon | null> =>
  Promise.resolve(createGeocodeUrl(address)).then(axiosGet).then(getPosFromResponse).then(processPos);

export const geocodeList = mapPromiseAll(geocode);
