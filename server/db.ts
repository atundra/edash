import { MongoClient, Db, ObjectId, MongoError } from 'mongodb';
import { TaskEither, taskify } from 'fp-ts/lib/TaskEither';
import { Profile as GithubProfile } from 'passport-github';
import * as io from 'io-ts';

export const createMongoClient: (connectionUri: string) => TaskEither<MongoError, MongoClient> = taskify(
  MongoClient.connect
);

export const getDb = (client: MongoClient) => client.db();

export type User = {
  id?: string;
  _id: ObjectId;
  github?: GithubProfile;
};

export type Device = {
  uid: string;
  name: string;
  _id: ObjectId;
  user: User['_id'];
  config: io.TypeOf<typeof DeviceConfig>;
};

export const DeviceConfig = io.type({
  widgets: io.array(io.object),
});

type DeviceWidgetConfig = {};

export type DeviceConfig = {
  _id: ObjectId;
  deviceId: Device['_id'];
  widgets: DeviceWidgetConfig[];
};

type CollectionSchemaMap = {
  users: User;
  devices: Device;
};

type CollectionName = keyof CollectionSchemaMap;

type CollectionSchema<Key extends CollectionName> = CollectionSchemaMap[Key];

export const getCollection = <C extends CollectionName>(collectionName: C) => (db: Db) =>
  db.collection<CollectionSchema<C>>(collectionName);
