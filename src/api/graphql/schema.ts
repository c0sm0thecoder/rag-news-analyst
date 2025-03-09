import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type Source {
    title: String
    url: String
    date: String
    source: String
  }

  type QueryResult {
    answer: String
    sources: [Source]
  }

  type Article {
    title: String
    content: String
    url: String
    date: String
    source: String
  }

  type Query {
    askQuestion(query: String!): QueryResult
  }

  type Mutation {
    processUrl(url: String!, source: String!): Boolean
  }
`;