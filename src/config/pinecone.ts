import { Pinecone } from "@pinecone-database/pinecone";
import { getEnvironmentVariables } from "./environment";

let pineconeClient: Pinecone;

export function initPineconeClient(): Pinecone {
    const env = getEnvironmentVariables();
    pineconeClient = new Pinecone({
        apiKey: env.PINECONE_API_KEY
    });
    return pineconeClient;
}

export function getPineconeClient(): Pinecone {
    if (!pineconeClient) {
        initPineconeClient();
    }
    return pineconeClient;
}

export async function upsertVectors(
    indexName: string,
    vectors: {
        id: string;
        values: number[];
        metadata: any;
    }[]
) {
    const client = getPineconeClient();
    const index = client.index(indexName);

    return await index.namespace('ns1').upsert(vectors);
}

export async function queryVectors(
    indexName: string,
    vector: number[],
    topK: number = 5
) {
    const client = getPineconeClient();
    const index = client.index(indexName);

    return await index.query({
        topK,
        vector,
        includeMetadata: true,
    });
}
