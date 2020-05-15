import { geocodeList } from './external/geocoder';
import { getMapUrlForClusters } from './gmaps';
import { trackLastPosList } from './external/track24';
import { filterOutNulls, groupLatLonByDistance } from './utils';
import { CLUSTER_POINTS_MAX_DISTANCE_M } from './config';

export const generate = (
  tracks: string[],
  size: { width: number; height: number }
) =>
  trackLastPosList(tracks)
    .then(filterOutNulls)
    .then(geocodeList)
    .then(filterOutNulls)
    .then(groupLatLonByDistance(CLUSTER_POINTS_MAX_DISTANCE_M))
    .then((clusters) => getMapUrlForClusters(clusters, size));
