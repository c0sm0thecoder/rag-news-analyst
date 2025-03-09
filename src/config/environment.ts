export interface EnvironmentVariables {
    // Application
    PORT: string;
    NODE_ENV: string;

    // Pinecone
    PINECONE_API_KEY: string;
    PINECONE_INDEX_NAME?: string;

    // Kafka
    KAFKA_CLIENT_ID: string;
    KAFKA_BROKER: string;
    KAFKA_TOPIC_NAME: string;
    KAFKA_GROUP_ID_PREFIX: string;
    KAFKA_SSL: string;
    KAFKA_SASL: string;
    KAFKA_USERNAME: string;
    KAFKA_PASSWORD: string;

    // LLM
    GEMINI_API_KEY: string;

    // Langfuse
    LANGFUSE_PUBLIC_KEY: string;
    LANGFUSE_SECRET_KEY: string;
    LANGFUSE_HOST?: string;
}

export function getEnvironmentVariables(): EnvironmentVariables {
    return {
        PORT: process.env.APP_PORT || "4000",
        NODE_ENV: process.env.APP_ENV || "development",

        PINECONE_API_KEY: process.env.PINECONE_API_KEY!,
        PINECONE_INDEX_NAME: process.env.PINECONE_INDEX_NAME || "",

        KAFKA_CLIENT_ID: process.env.KAFKA_CLIENT_ID || "",
        KAFKA_BROKER: process.env.KAFKA_BROKER || "",
        KAFKA_TOPIC_NAME: process.env.KAFKA_TOPIC_NAME || "",
        KAFKA_GROUP_ID_PREFIX: process.env.KAFKA_GROUP_ID_PREFIX || "",
        KAFKA_SSL: process.env.KAFKA_SSL || "",
        KAFKA_SASL: process.env.KAFKA_SASL || "",
        KAFKA_USERNAME: process.env.KAFKA_USERNAME || "",
        KAFKA_PASSWORD: process.env.KAFKA_PASSWORD || "",

        GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",

        LANGFUSE_PUBLIC_KEY: process.env.LANGFUSE_PUBLIC_KEY || "",
        LANGFUSE_SECRET_KEY: process.env.LANGFUSE_SECRET_KEY || "",
        LANGFUSE_HOST: process.env.LANGFUSE_HOST,
    };
}
