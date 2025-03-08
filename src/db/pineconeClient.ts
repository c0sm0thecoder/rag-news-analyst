import { getPineconeClient } from "../config/pinecone";
import { getEnvironmentVariables } from "../config/environment";

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
    const client = getPineconeClient();
    const index = client.index(env.PINECONE_INDEX_NAME);

    return await index.query({
        topK,
        vector,
        includeMetadata: true,
    });
}