import { MongoClient, Db } from "mongodb";
import { env } from "./env.js";

let client: MongoClient;
let db: Db;

export async function connectDB(): Promise<Db> {
  if (db) return db;

  client = new MongoClient(env.MONGODB_URI);
  await client.connect();
  db = client.db(env.DB_NAME);

  console.log(`✅ MongoDB connected → DB: ${env.DB_NAME}`);
  return db;
}

export function getDB(): Db {
  if (!db) {
    throw new Error("Database not initialized. Call connectDB() first.");
  }
  return db;
}

export async function closeDB(): Promise<void> {
  if (client) await client.close();
}