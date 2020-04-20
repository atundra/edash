import { geocodeList } from "./geocoder";
import { getMapUrlForClusters } from "./gmaps";
import { trackLastPosList } from "./track";
import { filterOutNulls, groupLatLonByDistance } from "./utils";
import { CLUSTER_POINTS_MAX_DISTANCE_M } from "./config";

const tracks: string[] = [];

const main = async () => {
  trackLastPosList(tracks)
    .then(filterOutNulls)
    .then(geocodeList)
    .then(filterOutNulls)
    .then(groupLatLonByDistance(CLUSTER_POINTS_MAX_DISTANCE_M))
    .then(getMapUrlForClusters)
    .then(console.log);
};

main();
