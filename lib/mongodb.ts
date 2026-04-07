import { MongoClient, Db } from "mongodb";

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri);
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  }

  client = new MongoClient(uri);
  return client.connect();
}

export async function getDb(): Promise<Db> {
  if (!clientPromise) {
    clientPromise = getClientPromise();
  }
  const c = await clientPromise;
  return c.db();
}

export default function getClientPromiseExport() {
  if (!clientPromise) {
    clientPromise = getClientPromise();
  }
  return clientPromise;
}
