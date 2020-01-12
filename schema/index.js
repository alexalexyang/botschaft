const { gql } = require("apollo-server-express");

const Schema = gql`
  scalar Date

  type Query {
    bot(botID: ID!): Bot
    bots: [Bot]!
    possibleLocations: PossibleLocations!
    getCurrentLocation(botID: ID!): [Float!]
  }

  type Mutation {
    addPossibleLocations(botID: ID!, pois: String!): PossibleLocations
  }

  type Bot {
    botID: ID!
    name: String!
    owner: String!
    date: Date!
  }

  type PossibleLocations {
    botID: ID!
    pois: String!
  }

  type Subscription {
    gotCurrentLocation: [Float!]
  }
`;

module.exports = Schema;
