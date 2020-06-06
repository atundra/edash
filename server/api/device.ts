import { Router as ExpressRouter } from 'express';
import { Router, Context } from './types';
import {
  createRouter,
  restrictUnauthorisedRouter,
  handleGetMRouter,
  handlePostMRouter,
  validationErrorsToHandlerError,
  HandlerError,
  chainRouter,
} from './utils';
import { pipe } from 'fp-ts/lib/pipeable';
import * as R from 'fp-ts/lib/Reader';
import * as H from 'hyper-ts/lib/index';
import * as HE from 'hyper-ts/lib/express';
import * as F from 'fp-ts/lib/function';
import * as T from 'fp-ts/lib/Task';
import * as TE from 'fp-ts/lib/TaskEither';
import * as io from 'io-ts';
import { Db, MongoError, ObjectId } from 'mongodb';
import { TaskEither } from 'fp-ts/lib/TaskEither';
import { getCollection, Device as DbDevice } from '../db';

export const Device = io.type({
  id: io.string,
  name: io.string,
});

export type Device = io.TypeOf<typeof Device>;

const json = pipe(
  H.status(H.Status.OK),
  H.ichain(() => H.json([], F.constVoid))
);

const createDevice = (userId: ObjectId, device: Device, db: Db): TaskEither<MongoError, void> =>
  pipe(
    TE.tryCatch(
      () => pipe(db, getCollection('devices'), (collection) => collection.insertOne({ ...device, user: userId })),
      (err) => err as MongoError
    ),
    TE.map(F.constVoid)
  );

const getDevices = (userId: ObjectId, db: Db): TaskEither<MongoError, DbDevice[]> => {
  return TE.tryCatch(
    () =>
      pipe(db, getCollection('devices'), (collection) =>
        collection.find({ user: userId }, { projection: { user: 0 } }).toArray()
      ),
    (err) => err as MongoError
  );
};

const getDevice = (id: string, userId: ObjectId, db: Db): TaskEither<MongoError, DbDevice | null> => {
  return TE.tryCatch(
    () =>
      pipe(db, getCollection('devices'), (collection) =>
        collection.findOne({ user: userId, id }, { projection: { user: 0 } })
      ),
    (err) => err as MongoError
  );
};

const unsafeGetUserId = (user: Express.User) => F.unsafeCoerce<Express.User, { _id: ObjectId }>(user)._id;

const create = (user: Express.User): R.Reader<Context, H.Middleware<H.StatusOpen, H.ResponseEnded, Error, void>> => ({
  db,
}) =>
  pipe(
    H.decodeBody(Device.decode),
    H.mapLeft(validationErrorsToHandlerError),
    H.ichain((device) =>
      pipe(
        device,
        (device) => createDevice(unsafeGetUserId(user), device, db),
        H.fromTaskEither,
        H.mapLeft((err) => new HandlerError(500, err.message)),
        H.ichain(() => H.status(H.Status.OK)),
        H.ichain(() => H.closeHeaders()),
        H.ichain(() => H.end())
      )
    ),
    H.orElse((err) =>
      pipe(
        H.status(err.code),
        H.ichain(H.closeHeaders),
        H.ichain(() => H.send(err.message))
      )
    )
  );

const getAll = (r: ExpressRouter): Router => ({ db }) =>
  r.get('/', (req, res, next) => {
    const task = pipe(
      getDevices(unsafeGetUserId(req.user!), db),
      TE.fold(
        (err) => T.of(res.status(500).end()),
        (devices) => T.of(res.json(devices).end())
      )
    );

    return task();
  });

const getOne = (r: ExpressRouter): Router => ({ db }) =>
  r.get('/:id', (req, res, next) => {
    const task = pipe(
      getDevice(req.params.id, unsafeGetUserId(req.user!), db),
      TE.fold(
        (err) => T.of(res.status(500).end()),
        (device) => T.of(res.json(device).end())
      )
    );

    return task();
  });

export const router: Router = pipe(
  createRouter(),
  restrictUnauthorisedRouter(),
  chainRouter(getAll),
  chainRouter(getOne),
  chainRouter((r) => (context) =>
    r.post('/', (req, res, next) => HE.toRequestHandler(create(req.user!)(context))(req, res, next))
  )
);
