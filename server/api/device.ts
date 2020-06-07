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
import * as E from 'fp-ts/lib/Either';
import * as T from 'fp-ts/lib/Task';
import * as TE from 'fp-ts/lib/TaskEither';
import * as io from 'io-ts';
import { Db, MongoError, ObjectId } from 'mongodb';
import { TaskEither } from 'fp-ts/lib/TaskEither';
import { getCollection, Device as DbDevice, DeviceConfig } from '../db';
import { validateWidgetConfig } from '../validation';

export const Device = io.type({
  uid: io.string,
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
      () =>
        pipe(db, getCollection('devices'), (collection) =>
          collection.insertOne({ ...device, user: userId, config: { widgets: [] } })
        ),
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

const getDevice = (id: ObjectId, userId: ObjectId, db: Db): TaskEither<HandlerError, DbDevice> => {
  return TE.tryCatch(
    () =>
      pipe(db, getCollection('devices'), (collection) =>
        collection
          .findOne({ user: userId, _id: id }, { projection: { user: 0 } })
          .then((value) => {
            if (!value) {
              throw new HandlerError(404, `Device with id ${id} not found`);
            }

            return value;
          })
          .catch((err) => {
            throw new HandlerError(500, 'Server error during getting device');
          })
      ),
    (err) => err as HandlerError
  );
};

const updateConfig = (
  deviceId: ObjectId,
  userId: ObjectId,
  config: DbDevice['config'],
  db: Db
): TaskEither<HandlerError, void> => {
  return TE.tryCatch(
    () =>
      pipe(db, getCollection('devices'), (collection) =>
        collection.updateOne({ user: userId, _id: deviceId }, { $set: { config } }).then(F.constVoid)
      ),
    (err) => new HandlerError(500, 'Update config server error')
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

const parseObjectId = (id: string): E.Either<HandlerError, ObjectId> =>
  E.tryCatch(
    () => ObjectId.createFromHexString(id),
    (err) => new HandlerError(400, 'Error parsing object id')
  );

const getOne = (r: ExpressRouter): Router => ({ db }) =>
  r.get('/:id', (req, res, next) => {
    const task = pipe(
      parseObjectId(req.params.id),
      TE.fromEither,
      TE.chain((deviceId) => getDevice(deviceId, unsafeGetUserId(req.user!), db)),
      TE.fold(
        (err) => T.of(res.status(err.code).json(err.message).end()),
        (device) => T.of(res.json(device).end())
      )
    );

    return task();
  });

export type DashboardConfig = {
  widgets: [];
};

const addUpdateConfigHandler = (r: ExpressRouter): Router => ({ db }) =>
  r.put('/:id/configuration', (req, res, next) =>
    pipe(
      parseObjectId(req.params.id),
      TE.fromEither,
      TE.chain((deviceId) =>
        pipe(
          req.body,
          DeviceConfig.decode,

          // @TODO: VALIDATE THIS PROPERLY
          // validateWidgetConfig,

          E.mapLeft(validationErrorsToHandlerError),
          TE.fromEither,
          TE.chain((wConfig) => updateConfig(deviceId, unsafeGetUserId(req.user!), wConfig, db))
        )
      ),
      TE.fold(
        (err) => T.of(res.status(err.code).json(err.message).end()),
        () => T.of(res.status(200).end())
      )
    )()
  );

export const router: Router = pipe(
  createRouter(),
  restrictUnauthorisedRouter(),
  chainRouter(getAll),
  chainRouter(getOne),
  chainRouter(addUpdateConfigHandler),
  chainRouter((r) => (context) =>
    r.post('/', (req, res, next) => HE.toRequestHandler(create(req.user!)(context))(req, res, next))
  )
);
