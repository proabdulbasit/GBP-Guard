import { MongoClient } from 'mongodb';
import { config } from '../config.js';

let client;
let database;
let indexesReady = false;

const ensureIndexes = async () => {
  if (indexesReady || !database) return;
  const posts = database.collection('posts');
  await posts.createIndex({ slug: 1 }, { unique: true });
  await posts.createIndex({ status: 1, publishedAt: -1 });
  await posts.createIndex({ updatedAt: -1 });
  indexesReady = true;
};

export const getDb = async () => {
  if (database) return database;

  if (!client) {
    client = new MongoClient(config.getMongoUri(), {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10_000,
    });
  }

  await client.connect();
  database = client.db(config.getMongoDbName());
  await ensureIndexes();
  return database;
};

export const getPostsCollection = async () => {
  const db = await getDb();
  return db.collection('posts');
};

export const closeMongo = async () => {
  if (client) {
    await client.close();
    client = undefined;
    database = undefined;
    indexesReady = false;
  }
};
