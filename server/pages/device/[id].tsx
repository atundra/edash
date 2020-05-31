import useSWR from 'swr';
import type { fetcherFn as FetcherFn } from 'swr/dist/types';
import { useRouter } from 'next/router';

type Device = { id: string };

class AuthError extends Error {}

const fetcher: FetcherFn<Device> = (url) =>
  fetch(url).then((r) => {
    if (r.ok) {
      return r.json();
    }

    if (r.status === 403) {
      throw new AuthError();
    }
  });

export default () => {
  const { data, error } = useSWR('/api/device', fetcher);
  const router = useRouter();

  if (error instanceof AuthError) {
    router.push(`/login?next=${router.asPath}`);
    return null;
  }

  if (error) return <div>failed to load</div>;
  if (!data) return <div>loading...</div>;
  return <div>hello {data.id}!</div>;
};
