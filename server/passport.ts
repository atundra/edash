import {
  Strategy as GithubStrategy,
  StrategyOptions as GithubStrategyOptions,
  Profile as GithubProfile,
} from 'passport-github';
import type { VerifyCallback as Oauth2VerifyCallback } from 'passport-oauth2';
import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_CALLBACK_URL } from './config';
import passport, { Profile } from 'passport';
import TE, { TaskEither } from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/pipeable';
// import T from 'fp-ts/lib/Task';
// import { left, right } from 'fp-ts/lib/Either';

export const passportInstance = passport;

const retFirst = <A>(work: (a: A) => unknown) => (a: A): A => {
  work(a);
  return a;
};

export const getPassportMiddleware = () =>
  pipe(
    passport,
    (p) => p.use(getGithubStrategy()),
    retFirst((p) => p.serializeUser((user, done) => {})),
    retFirst((p) => p.deserializeUser((id, done) => {}))
  );

const getGithubStrategyConfig = (): GithubStrategyOptions => ({
  clientID: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
  callbackURL: GITHUB_CALLBACK_URL,
});

const verifyCallback = (
  accessToken: string,
  refreshToken: string,
  profile: GithubProfile,
  done: Oauth2VerifyCallback
): void => {
  // const x = findOrCreateUser(profile);
  // User.findOrCreate({ githubId: profile.id }, function (err, user) {
  //   return cb(err, user);
  // });
};

export const getGithubStrategy = () => new GithubStrategy(getGithubStrategyConfig(), verifyCallback);

class CreateUserError extends Error {
  constructor(public readonly reason: string) {
    super(reason);
  }
}

const isGithubProfile = (profile: Profile): profile is GithubProfile => profile.provider === 'github';

const findOrCreateUser = (profile: Profile): TaskEither<CreateUserError, void> => {
  const suspiciousUser = false;
  if (suspiciousUser) {
    return TE.left(new CreateUserError('Suspicious'));
  }

  if (isGithubProfile(profile)) {
    const user = {
      github: profile,
    };

    // TE.tryCatchK();
    return TE.right(undefined);
  }

  return TE.right(undefined);
};
