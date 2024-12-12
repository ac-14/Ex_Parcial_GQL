import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { resolvers } from "./resolvers.ts";
import { schema } from "./schema.ts";
import { MongoClient } from 'mongodb'

// Connection URL
 const MONGO_URL = Deno.env.get("MONGO_URL");
if(!MONGO_URL){
  throw new Error("MONGO_URL not stablished")
}
const client = new MongoClient(MONGO_URL);

// Database Name
const dbName = 'ExamenParcial';
await client.connect();
console.log('Connected successfully to server');
const db = client.db(dbName);
const personsCollection = db.collection('persons');


const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
});

const { url } = await startStandaloneServer(server, {context: async() => ({personsCollection})});
console.log(`🚀 Server ready at ${url}`);