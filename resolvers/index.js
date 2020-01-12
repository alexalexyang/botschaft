const { client } = require("../DBHandlers/DBClient");

module.exports = {
  Query: {
    bot: async (parent, { botID }) => {
      let conn = await client;
      const collection = conn.db("botschaft").collection("bots");
      let bot = await collection.findOne({ botID: botID });
      conn.close();
      return bot;
    },
    bots: async () => {
      let conn = await client;
      const db = conn.db("botschaft");
      const collection = db.collection("bots");
      const bots = await collection.find().toArray();
      conn.close();
      return bots;
    }
  },

  Mutation: {
    addPossibleLocations: async (parent, { botID, pois }) => {
      let conn = await client;
      const collection = conn.db("botschaft").collection("possible_locations");
      collection.updateOne(
        { botID: botID },
        { $set: { pois: pois } },
        { upsert: true }
      );
      // pubsub.publish(new_pois, "new pois are in");
      conn.close();
      return { botID: botID, pois: pois };
    }
  }
};
