import useSWR from 'swr';
import type { fetcherFn as FetcherFn } from 'swr/dist/types';

type Device = { id: string };

type Props = { devices: Device[] };

const fetcher: FetcherFn<Device> = (url) => fetch(url).then((r) => r.json());

export default ({ devices }: Props) => {
  const { data, error } = useSWR('/api/user', fetcher);

  if (error) return <div>failed to load</div>;
  if (!data) return <div>loading...</div>;
  return <div>hello {data.id}!</div>;
};
