import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import { typeDefs } from './schema';
import { resolvers } from './resolvers/resolver';
import { getEnvironmentVariables } from '../../config/environment';
import { logger } from '../../utils/logger';

export async function startGraphQLServer() {
  const app = express();
  const env = getEnvironmentVariables();
  
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      return { req };
    },
    formatError: (error) => {
      logger.error(`GraphQL error: ${error}`);
      return error;
    }
  });
  
  await server.start();
  
  server.applyMiddleware({ app });
  
  const PORT = parseInt(env.PORT || '4000');
  app.listen(PORT, () => {
    logger.info(`GraphQL server running at http://localhost:${PORT}${server.graphqlPath}`);
  });
  
  return { app, server };
}