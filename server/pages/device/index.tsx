import { useSWRAndRouterWithAuthRedirect } from '../_hooks/swr';
import Link from 'next/link';
import { ObjectId } from 'mongodb';
import { Device } from '../../db';

type Props = { devices?: Device[] };

const DevicesList = ({ devices }: Props) => {
  if (!devices) {
    return <p>Loading</p>;
  }

  if (devices.length === 0) {
    return <p>You havn't added devices yet.</p>;
  }

  return (
    <ul>
      {devices.map((device) => (
        <li key={device._id + device.name}>
          <Link href="/device/[id]" as={`/device/${device._id}`}>
            <a>{device.name}</a>
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default () => {
  const { data } = useSWRAndRouterWithAuthRedirect('/api/device');

  return (
    <>
      <h1>My Devices</h1>
      <DevicesList devices={data} />
      <p>
        <Link href="/device/create">
          <a>Create a new device</a>
        </Link>
      </p>
    </>
  );
};
