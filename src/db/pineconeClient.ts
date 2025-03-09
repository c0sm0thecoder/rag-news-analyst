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

    return await index.namespace('ns1').upsert(vectors);
}

export async function queryVectors(
    vector: number[],
    topK: number = 5
) {
    if (checkUrlExists) {
        logger.info(`URL exists`);
        return;
    }
    const client = getPineconeClient();
    const index = client.index(env.PINECONE_INDEX_NAME);

    return await index.query({
        topK,
        vector,
        includeMetadata: true,
    });
}

export async function checkUrlExists(url: string): Promise<boolean> {
    const client = getPineconeClient();
    const index = client.index(getEnvironmentVariables().PINECONE_INDEX_NAME);

    const articleId = Buffer.from(url).toString('base64');
    
    const idToCheck = `${articleId}_chunk_0`;
    
    try {
        const response = await index.fetch([idToCheck]);
        if (response.records && idToCheck in response.records) {
            return true;
        }
    } catch (error) {
        logger.error(`Error checking if URL exists: ${error}`);
        return false;
    }
}
