import { getPineconeClient } from "../config/pinecone";
import { getEnvironmentVariables } from "../config/environment";
import { logger } from "../utils/logger";

const env = getEnvironmentVariables();

export async function upsertVectors(
    vectors: {
        id: string;
        values: number[];
        metadata: any;
    }[]
) {
    const client = getPineconeClient();
    const index = client.index(env.PINECONE_INDEX_NAME);

    return await index.namespace("ns1").upsert(vectors);
}

export async function queryVectors(
    vector: number[],
    topK: number = 5
): Promise<any> {
    try {
        const client = getPineconeClient();
        const env = getEnvironmentVariables();

        if (!env.PINECONE_INDEX_NAME) {
            throw new Error(
                "PINECONE_INDEX_NAME environment variable is not set"
            );
        }

        const index = client.index(env.PINECONE_INDEX_NAME);
        logger.info(`Querying Pinecone index: ${env.PINECONE_INDEX_NAME}`);

        const queryResponse = await index.namespace("ns1").query({
            vector,
            topK,
            includeMetadata: true,
        });

        if (!queryResponse || !queryResponse.matches) {
            logger.warn(
                `Unexpected Pinecone response format: ${JSON.stringify(
                    queryResponse
                )}`
            );
            return { matches: [] };
        }

        return queryResponse;
    } catch (error) {
        logger.error(`Error querying vectors: ${error}`);
        return { matches: [] };
    }
}
