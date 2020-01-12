const { gql } = require("apollo-server-express");

const Schema = gql`
  scalar Date

  type Query {
    bot(botID: ID!): Bot
    bots: [Bot]!
    possibleLocations: PossibleLocations!
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
`;

module.exports = Schema;
