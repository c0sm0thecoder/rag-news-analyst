import { processNewLink } from '../../../ingest/content-extractor';
import { NewsMessage } from '../../../models/message';
import { generateResponse } from '../../../rag/generator';
import { logger } from '../../../utils/logger';

export const resolvers = {
  Query: {
    askQuestion: async (_: any, { query }: { query: string }) => {
      try {
        logger.info(`Processing question: ${query}`);
        const result = await generateResponse(query);
        return result;
      } catch (error) {
        logger.error(`Error processing question: ${error}`);
        throw new Error(`Failed to process question: ${error}`);
      }
    },
  },
  
  Mutation: {
    processUrl: async (_: any, { url, source }: { url: string, source: string }) => {
      try {
        const newsMessage: NewsMessage = {
          url,
          source
        };
        
        await processNewLink(newsMessage);
        return true;
      } catch (error) {
        logger.error(`Error processing URL: ${error}`);
        throw new Error(`Failed to process URL: ${error}`);
      }
    }
  }
};