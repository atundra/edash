import { createUrl } from '../../utils';
import { GMAPS_STATIC_API, GMAPS_API_KEY } from '../../config';
import { LatLon } from '../geocoder/types';

const buildGmapsParams = (
  params: Record<string, string | null>,
  value?: string
) =>
  Object.entries(params)
    .filter((entry) => entry.every((item) => item !== null))
    .map((entry) => entry.join(':'))
    .concat(value ? [value] : [])
    .join('|');

const getDefaultConfig = () => ({
  key: GMAPS_API_KEY,
  style: [
    buildGmapsParams({
      feature: 'administrative',
      element: 'labels',
      visibility: 'off',
    }),
    buildGmapsParams({
      feature: 'administrative.province',
      element: 'geometry.stroke',
      visibility: 'off',
    }),
    buildGmapsParams({
      feature: 'administrative.country',
      element: 'geometry.stroke',
      color: '0x000000',
    }),
    buildGmapsParams({
      feature: 'water',
      element: 'geometry',
      color: '0x000000',
    }),
    buildGmapsParams({
      feature: 'landscape',
      element: 'geometry',
      color: '0xFFFFFF',
    }),
    buildGmapsParams({
      feature: 'water',
      element: 'labels',
      visibility: 'off',
    }),
  ],
});

type Marker = {
  color?: string;
  label?: string;
  pos: LatLon | string;
};

export const getMapUrl = (
  markers: Marker[],
  size: { width: number; height: number }
) =>
  createUrl(GMAPS_STATIC_API, {
    ...getDefaultConfig(),
    size: `${size.width}x${size.height}`,
    markers: markers.map((marker) =>
      buildGmapsParams(
        {
          color: marker.color ?? 'black',
        },
        Array.isArray(marker.pos) ? marker.pos.join(',') : marker.pos
      )
    ),
  });

const getClusterLabel = (count: number) =>
  count > 9 ? 'L' : count > 1 ? String(count) : null;

export const getMapUrlForClusters = (
  clusters: { pos: LatLon; count: number }[],
  size: { width: number; height: number }
) =>
  createUrl(GMAPS_STATIC_API, {
    ...getDefaultConfig(),
    size: `${size.width}x${size.height}`,
    markers: clusters.map(({ pos, count }) =>
      buildGmapsParams(
        {
          color: '0xFF0000',
          label: getClusterLabel(count),
        },
        pos.join(',')
      )
    ),
  });
