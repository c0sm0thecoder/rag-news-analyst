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
