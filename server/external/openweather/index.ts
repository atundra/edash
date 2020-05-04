import { createUrl, getDataLoader } from '../../utils';
import { OneCallConfig, OneCallResponse } from './types';
import { OPENWEATHER_API_KEY } from '../../config';
import https from 'https';
import dns from 'dns';

// One server is broken so we need to exclude it from dns resolve process
const openWeatherApiAgent = new https.Agent({
  lookup: (hostname, options, callback) =>
    dns.lookup(
      hostname,
      {
        ...options,
        all: true,
      },
      (err, addresses) => {
        const result = addresses.filter(
          ({ address }) => address !== '188.166.16.132'
        )[0];
        callback(err, result?.address, result?.family);
      }
    ),
});

const getOneCallUrl = ({
  lat,
  lon,
  apiKey: appId,
  current,
  hourly,
  daily,
}: OneCallConfig) =>
  createUrl(
    'https://api.openweathermap.org/data/2.5/onecall',
    {
      lat,
      lon,
      appId,
      exclude: Object.entries({
        current,
        hourly,
        daily,
      })
        .filter(([, value]) => !!value === false)
        .map(([name]) => name)
        .join(','),
    },
    true
  );

// https://openweathermap.org/api/one-call-api
const oneCall = async <Config extends OneCallConfig>(config: Config) =>
  getDataLoader<OneCallResponse<Config>>()(getOneCallUrl(config), {
    httpsAgent: openWeatherApiAgent,
  });
