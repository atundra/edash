import Link from 'next/link';
import styles from './index.module.css';
import { Box, Header, Heading, Button, Main, Stack, Paragraph } from 'grommet';
import { Dashboard } from 'grommet-icons';
import { MovingDots } from '../ui/components/MovingDots';

const Index = () => {
  return (
    <Box direction="column">
      <Box fill={true} width={{ max: 'xlarge' }} margin="auto" pad={{ horizontal: 'medium' }}>
        <Header>
          <Heading>edash</Heading>
          <Link href="/device">
            <Button primary label="My Devices" icon={<Dashboard />} />
          </Link>
        </Header>
      </Box>
      <Stack fill={true} interactiveChild="first">
        <Box direction="column">
          <Box width={{ max: 'xlarge' }} margin="auto" pad={{ vertical: 'medium', horizontal: 'medium' }} fill>
            <Box width={{ max: 'large' }} fill>
              <Heading size="large">DIY dashboard using eink display and ESP32</Heading>
            </Box>
          </Box>
        </Box>
        <MovingDots />
      </Stack>
      <Box fill={true} width={{ max: 'xlarge' }} margin="auto" pad={{ horizontal: 'medium' }}>
        <Heading>More awesome content coming soon</Heading>
        <Paragraph>Stay tuned epta</Paragraph>
      </Box>
    </Box>
  );
};

export default Index;
