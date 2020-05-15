import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
import { LatLon } from './external/geocoder/types';

type Value = string | number | boolean | undefined | null;

const URL_REGEXP = /^(.+?)(\?.+?)?(#.+)?$/;

function encodeQueryValue(value?: Value): string {
  return value !== null && value !== undefined ? encodeURIComponent(String(value)) : '';
}

function passQueryValue(value?: Value): string {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value);
}

export function serializeQueryData(
  params: { [key: string]: Value | Value[] } = {},
  encodeFunction = encodeQueryValue
): string {
  return Object.keys(params)
    .map((key: string) =>
      Array.isArray(params[key])
        ? (params[key] as Value[]).map((value) => `${key}=${encodeFunction(value)}`).join('&')
        : `${key}=${encodeFunction(params[key] as Value)}`
    )
    .join('&');
}

type QueryData = {
  [key: string]: string | string[];
};

export function deserializeQueryData(query = ''): QueryData {
  return query
    .split('&')
    .map((kv: string) => kv.split('='))
    .reduce((next, [key, value]) => {
      let currentValue = next[key];

      if (typeof currentValue === 'string') {
        next[key] = [currentValue];
        currentValue = next[key];
      }

      if (Array.isArray(currentValue)) {
        currentValue.push(decodeURIComponent(value));
      }

      if (currentValue === undefined) {
        next[key] = decodeURIComponent(value);
      }
      return next;
    }, {} as QueryData);
}

export function getQueryData(url: string): QueryData {
  const match = url.match(URL_REGEXP);

  if (match) {
    const query = match[2];

    if (query) {
      return deserializeQueryData(query.substr(1));
    }
  }

  return {};
}

export function createUrl(baseUrl: string, params = {}, disableEncoding = false): string {
  const match = baseUrl.match(URL_REGEXP);

  const encoder = disableEncoding ? passQueryValue : undefined;

  if (match) {
    const [url, base, query, hash] = match;
    const queryData =
      url && query
        ? {
            ...deserializeQueryData(query.substr(1)),
            ...params,
          }
        : params;

    return `${base}?${serializeQueryData(queryData, encoder)}${hash || ''}`;
  }

  return `?${serializeQueryData(params, encoder)}`;
}

export const createTuple2 = <T>(list: Array<T>): [T, T] => [list[0], list[1]];

export const mapPromiseAll = <T, R>(mapper: (arg: T) => Promise<R>) => (items: T[]) => Promise.all(items.map(mapper));

type GetType<T = any> = (url: string, config?: AxiosRequestConfig) => Promise<T>;

const getAxiosResponseData = (res: AxiosResponse) => res.data;

export const getDataLoader = <RT>(): GetType<RT> => (url, config) => axios.get(url, config).then(getAxiosResponseData);

const isNotNull = <T>(item: T | null): item is T => item !== null;

export const filterOutNulls = <T>(items: Array<T | null>): T[] => items.filter(isNotNull);

const sum = (a: number, b: number) => a + b;

const sumList = (list: number[]) => list.reduce(sum, 0);

/**
 * Get Point with min sum of distances to other points
 */
const getMeanPoint = <Point>(points: Point[], getDistance: (p1: Point, p2: Point) => number): Point => {
  return points
    .map((point) => ({
      point,
      distances: points.map((otherPoint) => getDistance(point, otherPoint)),
    }))
    .map(({ point, distances }) => ({
      point,
      sum: sumList(distances),
    }))
    .reduce((minPoint, point) => (minPoint.sum < point.sum ? minPoint : point)).point;
};

const toRadian = (degrees: number): number => (degrees * Math.PI) / 180;

const EARTH_RADIUS_M = 6371000;

export const haversineDistance = (p1: LatLon, p2: LatLon): number => {
  const [lat1, lon1] = p1.map(toRadian);
  const [lat2, lon2] = p2.map(toRadian);

  const dlon = lon2 - lon1;
  const dlat = lat2 - lat1;
  const a = Math.pow(Math.sin(dlat / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon / 2), 2);

  const c = 2 * Math.asin(Math.sqrt(a));

  return c * EARTH_RADIUS_M;
};

// Group lat-lon points using proximity in meters
export const groupLatLonByDistance = (distance: number) => (points: LatLon[]): { pos: LatLon; count: number }[] => {
  const groups: LatLon[][] = [];
  points.forEach((point) => {
    let placed = false;

    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      if (group.every((groupPoint) => haversineDistance(point, groupPoint) < distance)) {
        group.push(point);
        placed = true;
        break;
      }
    }

    if (placed === false) {
      groups.push([point]);
    }
  });
  return groups.map((group) => ({
    pos: getMeanPoint(group, haversineDistance),
    count: group.length,
  }));
};

export type OneChar = string & { length: 1 };

export const toOneChar = (val: any): OneChar => String(val)[0] as OneChar;

export const inspect = <T>(value: T) => {
  console.log(value);
  return value;
};
