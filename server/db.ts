import { MongoClient, Db, ObjectId, MongoError } from 'mongodb';
import { TaskEither, taskify } from 'fp-ts/lib/TaskEither';

export const createMongoClient: (connectionUri: string) => TaskEither<MongoError, MongoClient> = taskify(
  MongoClient.connect
);

const getDb = (client: MongoClient) => client.db();

type User = {
  _id: ObjectId;
  githubId: string;
};

type CollectionSchemaMap = {
  users: User;
};

type CollectionName = keyof CollectionSchemaMap;

type CollectionSchema<Key extends CollectionName> = CollectionSchemaMap[Key];

const getCollection = <C extends CollectionName>(collectionName: C) => (db: Db) =>
  db.collection<CollectionSchema<C>>(collectionName);
