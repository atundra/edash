import type { GetServerSideProps } from 'next';

type Props = { devices: { id: string }[] };

export default ({ devices }: Props) => (
  <ul>
    {devices.map((device) => (
      <li>
        <a href={`/device/${device.id}`}>{device.id}</a>
      </li>
    ))}
  </ul>
);

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  return {
    props: {
      devices: [
        {
          id: 'sdfasdfasdf',
        },
      ],
    },
  };
};
