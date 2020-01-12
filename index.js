require("dotenv").config();
const http = require("http");
const { client } = require("./DBHandlers/DBClient");
const { ApolloServer } = require("apollo-server-express");
const schema = require("./schema");
const resolvers = require("./resolvers");
const express = require("express");
const { getAllBots, createBots } = require("./DBHandlers/botHandlers");
const { movementCycle } = require("./movement");
const PORT = process.env.PORT;

const app = express();

async function initApp() {
  const conn = await client;
  // await createBots(conn)
  let bots = await getAllBots(conn)
    .then(bots => {
      return bots;
    })
    .catch(err => console.error(err));
  bots.map(bot => movementCycle(conn, bot.botID));
}

// initApp();

const server = new ApolloServer({
  typeDefs: schema,
  resolvers
});

server.applyMiddleware({ app, path: "/graphql" });
const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

app.get("/", async (req, res) => {
  res.send("Cycle started");
});

httpServer.listen(PORT, () => {
  console.log(`Apollo server at ${PORT}, /graphql.`);
});

process.on("SIGINT", async () => {
  console.log("Cleaning up.");
  console.log("Dropping collections.");
  const conn = await client;
  const db = conn.db("botschaft");
  // db.dropCollection('bots', res => console.log(res))
  // db.dropCollection('travel_history', res => console.log(res))
  // db.dropCollection('possible_locations', res => console.log(res))
  console.log("Closing client.");
  conn.close();
  console.log("Done.");
  process.exit(22);
});
