import { Strategy as GithubStrategy, Profile as GithubProfile } from 'passport-github';
import type { Config } from './config';
import passport, { Profile, PassportStatic } from 'passport';
import * as TE from 'fp-ts/lib/TaskEither';
import * as R from 'fp-ts/lib/Reader';
import * as T from 'fp-ts/lib/Task';
import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';
import { Db, MongoError, ObjectId } from 'mongodb';
import { Strategy as CustomStrategy } from 'passport-custom';
import { mapFirst } from './utils';
import { getCollection, User } from './db';

export const passportInstance = passport;

const getUserForOneUserMode = (userId: number) => ({
  _id: ObjectId.createFromTime(userId),
});

export const getPassportMiddleware = (db: Db): R.Reader<Config, PassportStatic> =>
  pipe(
    R.ask<Config>(),
    R.map(() => passport),
    R.chain((passport) => (context) =>
      (context.ONE_USER_MODE ? useDummyStrategy : useGithubStrategy(db))(passport)(context)
    ),
    R.map(
      mapFirst((p) => p.serializeUser<User, string>((user: User, done) => done(null, user._id?.toString())))
    ),
    R.chainFirst((p) => ({ ONE_USER_MODE, ONE_USER_USERID }) =>
      ONE_USER_MODE
        ? p.deserializeUser<User, string>((id, done) => done(null, getUserForOneUserMode(ONE_USER_USERID)))
        : p.deserializeUser<User, string>((id, done) =>
            pipe(
              db,
              findUser(id),
              TE.fold(
                (err) => T.of(done(err)),
                (user) => T.of(done(null, user))
              )
            )()
          )
    )
  );

const useDummyStrategy = (p: PassportStatic): R.Reader<Config, PassportStatic> => ({ ONE_USER_USERID }) =>
  p.use('dummy-strategy', new CustomStrategy((req, done) => done(null, getUserForOneUserMode(ONE_USER_USERID))));

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

const findUser = (id: string) => (db: Db) =>
  pipe(db, getCollection('users'), (users) =>
    TE.tryCatch(
      () =>
        users.findOne({ _id: new ObjectId(id) }).then((user) => {
          if (!user) {
            throw Error('No such user');
          }

          return user;
        }),
      (err) => err as MongoError
    )
  );

const findOrCreateUser = (db: Db, profile: Profile): TE.TaskEither<CreateUserError | MongoError, User> => {
  const suspiciousUser = false;
  if (suspiciousUser) {
    return TE.left(new CreateUserError('Suspicious'));
  }

  if (isGithubProfile(profile)) {
    const user = {
      github: profile,
    };

    return pipe(db, getCollection('users'), (users) =>
      TE.tryCatch(
        () =>
          users.findOneAndUpdate({ 'github.id': profile.id }, { $set: user }, { upsert: true }).then((updated) => {
            if (!updated.ok) {
              throw Error('sdfsdf');
            }

            return updated.value as User;
          }),
        (err) => err as MongoError
      )
    );
  }

  return TE.left(new CreateUserError('uuuu suka'));
};
