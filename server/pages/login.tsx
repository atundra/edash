import { useRouter } from 'next/router';

export default () => {
  const router = useRouter();
  const nextPage = router.query.next ? `?next=${router.query.next}` : '';

  return (
    <div>
      <h1>Login</h1>
      <ul>
        <li>
          <a href={`/api/auth/github${nextPage}`}>using Github</a>
        </li>
      </ul>
    </div>
  );
};
