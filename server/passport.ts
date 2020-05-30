import {
  Strategy as GithubStrategy,
  StrategyOptions as GithubStrategyOptions,
  Profile as GithubProfile,
} from 'passport-github';
import type { VerifyCallback as Oauth2VerifyCallback } from 'passport-oauth2';
import type { Config } from './config';
import passport, { Profile, PassportStatic } from 'passport';
import TE, { TaskEither } from 'fp-ts/lib/TaskEither';
import * as R from 'fp-ts/lib/Reader';
import { pipe } from 'fp-ts/lib/pipeable';
import { MongoClient, Db } from 'mongodb';
// import T from 'fp-ts/lib/Task';
// import { left, right } from 'fp-ts/lib/Either';
import { mapFirst } from './utils';

export const passportInstance = passport;

export const getPassportMiddleware = (db: Db): R.Reader<Config, PassportStatic> =>
  pipe(
    R.ask<Config>(),
    R.map(() => passport),
    R.chain(useGithubStrategy(db)),
    R.map(mapFirst((p) => p.serializeUser((user, done) => {}))),
    R.map(mapFirst((p) => p.deserializeUser((id, done) => {})))
  );

const useGithubStrategy = (db: Db) => (p: PassportStatic): R.Reader<Config, PassportStatic> => ({
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GITHUB_CALLBACK_URL,
}) =>
  p.use(
    new GithubStrategy(
      {
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        callbackURL: GITHUB_CALLBACK_URL,
      },
      (accessToken, refreshToken, profile, done) => {
        findOrCreateUser(db, profile);
      }
    )
  );

class CreateUserError extends Error {
  constructor(public readonly reason: string) {
    super(reason);
  }
}

const isGithubProfile = (profile: Profile): profile is GithubProfile => profile.provider === 'github';

const findOrCreateUser = (db: Db, profile: Profile): TaskEither<CreateUserError, void> => {
  const suspiciousUser = false;
  if (suspiciousUser) {
    return TE.left(new CreateUserError('Suspicious'));
  }

  if (isGithubProfile(profile)) {
    const user = {
      github: profile,
    };

    // User.findOrCreate({ githubId: profile.id }, function (err, user) {
    //   return cb(err, user);
    // });

    // TE.tryCatchK();
    return TE.right(undefined);
  }

  return TE.right(undefined);
};
