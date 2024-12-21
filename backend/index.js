import express from "express"
import http from "http"
import cors from "cors";
import dotenv from "dotenv"

import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4"
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer"

import mergedResolvers from "./resolvers/index.js";
import mergedTypeDefs from "./typeDefs/index.js";
import { resolveCaa } from "dns/promises";
import { connectDB } from "./db/connectDB.js";

dotenv.config()
const app = express()
const httpServer = http.createServer(app)
const server = new ApolloServer({
  typeDefs: mergedTypeDefs,
  resolvers: mergedResolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })]
});

//Ensure we wait for out server to start
await server.start()
//set up for express middleware to handle CORS , body parsing, and our expressMiddleware function.
app.use(
  "/",
  cors(),
  express.json(),
  //ExpressMIddleware accepts the same arguments
  //an appollo Server instance and optional configuration options
  expressMiddleware(server, {
    context: async ({ req }) => ({ req })
  })
)
await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve))
await connectDB()
console.log(`Server is ready at http://localhost:4000/`);
