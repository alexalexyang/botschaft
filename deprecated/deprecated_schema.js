const { client } = require("../DBHandlers/DBClient");
const graphql = require("graphql");
const { GraphQLDateTime } = require("graphql-iso-date");
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLFloat,
  GraphQLList
} = graphql;
const { PubSub } = require("graphql-subscriptions");

const pubsub = new PubSub();
const new_pois = "new_pois";

const BotType = new GraphQLObjectType({
  name: "Bot",
  fields: () => ({
    botID: { type: GraphQLID },
    name: { type: GraphQLString },
    owner: { type: GraphQLString },
    date: { type: GraphQLDateTime }
  })
});

const PossibleLocationsType = new GraphQLObjectType({
  name: "PossibleLocations",
  fields: () => ({
    botID: { type: GraphQLString },
    pois: { type: GraphQLString }
  })
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    bot: {
      type: BotType,
      args: { id: { type: GraphQLID } },
      async resolve(parent, args) {
        let conn = await client;
        const collection = conn.db("botschaft").collection("bots");
        let bot = await collection.findOne({ botID: args.id });
        conn.close();
        return bot;
      }
    },
    bots: {
      type: new GraphQLList(BotType),
      async resolve(parent, args) {
        let conn = await client;
        const db = conn.db("botschaft");
        const collection = db.collection("bots");
        const bots = await collection.find().toArray();
        conn.close();
        return bots;
      }
    }
  }
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addPossibleLocations: {
      type: PossibleLocationsType,
      args: {
        botID: { type: GraphQLString },
        pois: { type: GraphQLString }
      },
      async resolve(parent, args) {
        let conn = await client;
        const collection = conn
          .db("botschaft")
          .collection("possible_locations");
        collection.updateOne(
          { botID: args.botID },
          { $set: { pois: args.pois } },
          { upsert: true }
        );
        pubsub.publish(new_pois, "new pois are in");
        return { botID: args.botID, pois: args.pois };
      }
    }
  }
});

// const Subscription = new GraphQLObjectType({
//     name: "Subscription",
//     fields: () => ({
//         pois: { type: PossibleLocationsType },
//         subscribe: pubsub.asyncIterator(new_pois),
//     }),
//     resolve(body, args, context, info) {
//         console.log(body)
//         return body
//     }
// })

const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
});

module.exports = { schema };
