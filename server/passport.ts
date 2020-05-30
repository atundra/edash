import { Strategy as GithubStrategy, Profile as GithubProfile } from 'passport-github';
// import type { VerifyCallback as Oauth2VerifyCallback } from 'passport-oauth2';
import type { Config } from './config';
import passport, { Profile, PassportStatic } from 'passport';
import * as TE from 'fp-ts/lib/TaskEither';
import * as R from 'fp-ts/lib/Reader';
import * as T from 'fp-ts/lib/Task';
import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';
import { MongoClient, Db, FilterQuery, MongoError } from 'mongodb';
import { mapFirst } from './utils';
import { getCollection, User } from './db';

export const passportInstance = passport;

export const getPassportMiddleware = (db: Db): R.Reader<Config, PassportStatic> =>
  pipe(
    R.ask<Config>(),
    R.map(() => passport),
    R.chain(useGithubStrategy(db)),
    R.map(
      mapFirst((p) =>
        p.serializeUser((user, done) => {
          console.log('serializeUser');
          console.log(user);
        })
      )
    ),
    R.map(
      mapFirst((p) =>
        p.deserializeUser((id, done) => {
          console.log('deserializeUser');
          console.log(id);
        })
      )
    )
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
        const task = pipe(
          findOrCreateUser(db, profile),
          TE.fold(
            (err) => T.of(done(err)),
            (user) => T.of(done(null, user))
          )
        );

        return task();
      }
    )
  );

class CreateUserError extends Error {
  constructor(public readonly reason: string) {
    super(reason);
  }
}

const isGithubProfile = (profile: Profile): profile is GithubProfile => profile.provider === 'github';

const findOrCreateUser = (db: Db, profile: Profile): TE.TaskEither<CreateUserError | MongoError, User> => {
  const suspiciousUser = false;
  if (suspiciousUser) {
    return TE.left(new CreateUserError('Suspicious'));
  }

  if (isGithubProfile(profile)) {
    const user = {
      github: profile,
    };

    return pipe(
      db,
      getCollection('users'),
      (users) =>
        TE.tryCatch(
          () => users.findOneAndUpdate({ 'github.id': profile.id }, { $set: user }, { upsert: true }),
          (err) => err as MongoError
        ),
      TE.map(() => user)
    );
  }

  return TE.left(new CreateUserError('uuuu suka'));
};
