import useSWR from 'swr';
import type { fetcherFn, responseInterface, keyInterface, ConfigInterface } from 'swr/dist/types';
import { useRouter, NextRouter } from 'next/router';

export type UseSWRAndRouterWithAuthRedirectReturn<Data = any, Error = any> = responseInterface<Data, Error> & {
  router: NextRouter;
};

class AuthError extends Error {}

export const getHandleAuthFetcher = (input: RequestInfo, init?: RequestInit) =>
  fetch(input, init).then((res) => {
    if (res.status === 403) {
      throw new AuthError();
    }

    if (!res.ok) {
      throw new Error(res.statusText);
    }

    return res.json();
  });

export const useSWRAndRouterWithAuthRedirect = <Data = any, Error = any>(
  key: keyInterface,
  fn: fetcherFn<Data> | null = getHandleAuthFetcher,
  config?: ConfigInterface<Data, Error>
): UseSWRAndRouterWithAuthRedirectReturn<Data, Error> => {
  const { data, error, revalidate, mutate, isValidating } = useSWR<Data, Error>(key, fn ?? undefined, config);
  const router = useRouter();

  if (error instanceof AuthError) {
    router.push(`/login?next=${router.asPath}`);
  }

  return { data, error, revalidate, mutate, isValidating, router };
};
