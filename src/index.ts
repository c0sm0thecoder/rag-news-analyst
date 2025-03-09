import dotenv from 'dotenv';
import { startGraphQLServer } from "./api/graphql/index";
import { initPineconeClient } from "./config/pinecone";
import { getEnvironmentVariables } from "./config/environment";
import { setUpKafkaConsumer } from "./ingest/kafka-consumer";
import { getGeminiModel, initGemini } from "./config/llm";
import { logger } from "./utils/logger";
import { createKafkaClient, createKafkaTopics } from './config/kafka';

dotenv.config();

async function main() {
    try {
        logger.info("Starting RAG News Analysis Application...");
        const kafkaClient = createKafkaClient();
        await createKafkaTopics(kafkaClient);

        const env = getEnvironmentVariables();

        logger.info("Initializing Pinecone client...");
        initPineconeClient();

        logger.info("Initializing Gemini LLM...");
        initGemini();

        try {
            const model = getGeminiModel();
            logger.info("LLM model initialized successfully");
        } catch (error) {
            logger.error(`Failed to connect to LLM model: ${error}`);
            throw new Error("LLM initialization failed");
        }

        logger.info("Setting up Kafka consumer...");
        await setUpKafkaConsumer();

        logger.info("Starting GraphQL server...");
        const { app, server } = await startGraphQLServer();

        const PORT = parseInt(env.PORT || "8080");
        logger.info(
            `Server running at http://localhost:${PORT}${server.graphqlPath}`
        );
        logger.info("RAG News Analysis Application started successfully");
    } catch (error) {
        logger.error(`Failed to start application: ${error}`);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
    logger.info("Received SIGINT signal, shutting down gracefully");
    process.exit(0);
});

process.on("SIGTERM", () => {
    logger.info("Received SIGTERM signal, shutting down gracefully");
    process.exit(0);
});

process.on("unhandledRejection", (reason, promise) => {
    logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});

process.on("uncaughtException", (error) => {
    logger.error(`Uncaught Exception: ${error}`);
    process.exit(1);
});

main();
