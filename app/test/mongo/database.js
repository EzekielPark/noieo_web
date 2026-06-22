import { MongoClient } from "mongodb";

const url = process.env.MONGODB_URI;

if (!url) {
  throw new Error("Missing MONGODB_URI. Set it in .env.local.");
}

let connectDB;

if (process.env.NODE_ENV === "development") {
  if (!global._mongo) {
    global._mongo = new MongoClient(url).connect();
  }
  connectDB = global._mongo;
} else {
  connectDB = new MongoClient(url).connect();
}

export { connectDB };

