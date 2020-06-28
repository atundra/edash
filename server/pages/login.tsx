import { useRouter } from 'next/router';
import { Box, Header, Heading, Button, Main } from 'grommet';
import { Home, Github } from 'grommet-icons';
import Link from 'next/link';

export default () => {
  const router = useRouter();
  const nextPage = router.query.next ? `?next=${router.query.next}` : '';

  return (
    <Box width={{ max: 'xlarge' }} margin="auto">
      <Box margin={{ top: 'large' }} direction="row">
        <Link href="/">
          <Button icon={<Home />} label="" />
        </Link>
      </Box>
      <Header margin={{ top: 'small' }}>
        <Heading>Login</Heading>
      </Header>
      <Main>
        <Box direction="row" pad="xsmall">
          <Link href={`/api/auth/github${nextPage}`}>
            <Button icon={<Github />} label="Using Github" />
          </Link>
        </Box>
      </Main>
    </Box>
  );
};
