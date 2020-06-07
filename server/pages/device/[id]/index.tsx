import { useRouter } from 'next/router';
import { useSWRAndRouterWithAuthRedirect } from '../../_hooks/swr';
import Link from 'next/link';
import { Device as DbDevice } from '../../../db';

type Device = DbDevice | null;

export default () => {
  const {
    query: { id },
  } = useRouter();

  const { data, error } = useSWRAndRouterWithAuthRedirect<Device>(`/api/device/${id}`, id ? undefined : null);

  if (error) return <div>failed to load</div>;
  if (data === undefined) return <div>loading...</div>;
  if (data === null) return <div>Device with id {id} not found</div>;

  return (
    <>
      <h1>{data.name}</h1>
      <p>Device uid: {data.uid}</p>
      <Link href="/device/[id]/configure" as={`/device/${data._id}/configure`}>
        <a>Configure device</a>
      </Link>
    </>
  );
};
