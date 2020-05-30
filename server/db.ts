import { MongoClient, Db, ObjectId, MongoError } from 'mongodb';
import { TaskEither, taskify } from 'fp-ts/lib/TaskEither';
import { Profile as GithubProfile } from 'passport-github';

export const createMongoClient: (connectionUri: string) => TaskEither<MongoError, MongoClient> = taskify(
  MongoClient.connect
);

export const getDb = (client: MongoClient) => client.db();

export type User = {
  _id?: ObjectId;
  github?: GithubProfile;
};

type CollectionSchemaMap = {
  users: User;
};

type CollectionName = keyof CollectionSchemaMap;

type CollectionSchema<Key extends CollectionName> = CollectionSchemaMap[Key];

export const getCollection = <C extends CollectionName>(collectionName: C) => (db: Db) =>
  db.collection<CollectionSchema<C>>(collectionName);
