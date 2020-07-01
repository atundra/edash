import { useSWRAndRouterWithAuthRedirect } from '../../ui/hooks/swr';
import Link from 'next/link';
import { ObjectId } from 'mongodb';
import { Device } from '../../db';
import { Header, Button, Heading, Main, Paragraph, Box, List, Anchor } from 'grommet';
import { Add, Home } from 'grommet-icons';

type Props = { devices?: Device[] };

const DevicesList = ({ devices }: Props) => {
  if (!devices) {
    return <Paragraph>Loading</Paragraph>;
  }

  if (devices.length === 0) {
    return <Paragraph>You havn't added devices yet.</Paragraph>;
  }

  return (
    <List
      data={devices}
      primaryKey={(device) => (
        <Link key={device._id} href="/device/[id]" as={`/device/${device._id}`}>
          <Anchor>{device.name}</Anchor>
        </Link>
      )}
      secondaryKey="uid"
    />
  );
};

export default () => {
  const { data } = useSWRAndRouterWithAuthRedirect('/api/device');

  return (
    <Box width={{ max: 'xlarge' }} margin="auto" pad={{ horizontal: 'medium' }}>
      <Box margin={{ top: 'large' }} direction="row">
        <Link href="/">
          <Button icon={<Home />} label="" />
        </Link>
      </Box>
      <Header margin={{ top: 'small' }}>
        <Heading>My Devices</Heading>
      </Header>
      <Main>
        <DevicesList devices={data} />
        <Paragraph>
          <Link href="/device/create">
            <Button primary icon={<Add />} label="Create a new device" />
          </Link>
        </Paragraph>
      </Main>
    </Box>
  );
};
