import { generateEmbeddings } from "../config/llm";
import { queryVectors } from "../db/pineconeClient";
import { logger } from "../utils/logger";

export interface QueryResponse {
    id: string;
    metadata: any;
    distance: number;
}

export async function retrieveRelevantChunks(
    query: string,
    topK: number = 5
): Promise<QueryResponse[]> {
    try {
        logger.info(`Retrieving relevant chunks for query: ${query}`);

        const embeddedQuery = await generateEmbeddings(query);
        const response = await queryVectors(embeddedQuery, topK);

        const results: QueryResponse[] = response.matches.map((match) => ({
            id: match.id,
            metadata: match.metadata,
            distance: 1 - match.score,
        }));

        logger.info(`Retrieved relevant chunks for query: ${query}`);

        return results;
    } catch (error) {
        logger.error(`Error retrieving relevant chunks: ${error}`);
        throw new Error(`Error retrieving relevant chunks: ${error}`);
    }
}
