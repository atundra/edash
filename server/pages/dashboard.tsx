import Link from 'next/link';

export default () => {
  return (
    <>
      <h1>Dashboard</h1>
      <p>
        <Link href="/device">
          <a>Your devices</a>
        </Link>
      </p>
    </>
  );
};
