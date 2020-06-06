import { useRouter } from 'next/router';
import { useSWRAndRouterWithAuthRedirect } from '../../hooks/swr';

type Device = { id: string; _id: string; name: string } | null;

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
      <h1>Device {data.name}</h1>
      <p>Device id: {data.id}</p>
    </>
  );
};
