import { generateEmbeddings } from "../config/llm";
import { queryVectors } from "../db/pineconeClient";
import { logger } from "../utils/logger";

export interface QueryResponse {
    id: string;
    metadata: any;
    distance: number;
    text?: string;
}

export async function retrieveRelevantChunks(
    query: string,
    topK: number = 5
): Promise<QueryResponse[]> {
    try {
        logger.info(`Retrieving relevant chunks for query: ${query}`);

        const embeddedQuery = await generateEmbeddings(query);
        const response = await queryVectors(embeddedQuery, topK);

        if (!response || !response.matches || !Array.isArray(response.matches)) {
            logger.warn(`Invalid response structure from vector database: ${JSON.stringify(response)}`);
            return [];
        }

        const results: QueryResponse[] = response.matches.map((match) => ({
            id: match.id,
            metadata: match.metadata || {},
            text: match.metadata?.text || match.metadata?.chunkContent || '',
            distance: match.score ? (1 - match.score) : 1.0,
        }));

        logger.info(`Retrieved ${results.length} relevant chunks for query: ${query}`);

        for (const result of results) {
            logger.info(`Chunk source: ${result.metadata.source}, title: ${result.metadata.title}`);
            logger.debug(`Chunk content (first 100 chars): ${(result.text || '').substring(0, 100)}...`);
        }
        
        return results;
    } catch (error) {
        logger.error(`Error retrieving relevant chunks: ${error}`);
        return [];
    }
}
