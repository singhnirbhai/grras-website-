import mongoose from "mongoose";

const rawUri = process.env.mongodb_connection_string || process.env.MONGODB_CONNECTION_STRING || process.env.MONGODB_URI || process.env.mongodb_uri;
if (!rawUri) {
  throw new Error("Please define the MONGODB_URI or MONGODB_CONNECTION_STRING environment variable");
}
const MONGODB_URI: string = rawUri;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached && cached.conn) {
    return cached.conn;
  }

  if (cached && !cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      autoIndex: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log("Connected to MongoDB successfully");
      return mongooseInstance;
    });
  }

  try {
    if (cached) {
      cached.conn = await cached.promise;
    }
  } catch (e) {
    if (cached) {
      cached.promise = null;
    }
    throw e;
  }

  return cached?.conn;
}
