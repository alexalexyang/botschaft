const { client } = require("../DBHandlers/DBClient");
const { PubSub } = require("apollo-server");

const pubsub = new PubSub();

const EVENTS = {
  gotCurrentLocation: "GOT_CURRENT_LOCATION"
};

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
    },
    getCurrentLocation: async (parent, { botID }) => {
      let conn = await client;
      let travelHistoryCollection = conn
        .db("botschaft")
        .collection("travel_history");

      let location = await travelHistoryCollection
        .find({ botID: botID })
        .sort({ _id: -1 })
        .limit(1)
        .next()
        .then(location => {
          return location;
        })
        .catch(err => console.error(err));

      const result = [300, location.lat, location.lng];

      pubsub.publish(EVENTS.gotCurrentLocation, {
        gotCurrentLocation: result
      });

      return result;
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
      conn.close();
      return { botID: botID, pois: pois };
    }
  },

  Subscription: {
    gotCurrentLocation: {
      subscribe: () => pubsub.asyncIterator(EVENTS.gotCurrentLocation)
    }
  }
};
