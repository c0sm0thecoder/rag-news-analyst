import { Consumer } from "kafkajs";
import { getEnvironmentVariables } from "../config/environment";
import { createKafkaConsumer } from "../config/kafka";
import { logger } from "../utils/logger";
import { NewsMessage } from "../models/message";
import { processNewLink } from "./content-extractor";

let consumer: Consumer;

export async function setUpKafkaConsumer(): Promise<void> {
    const env = getEnvironmentVariables();
    const groupId = `${env.KAFKA_GROUP_ID_PREFIX}-${Date.now()}`;

    try {
        consumer = await createKafkaConsumer(groupId);

        await consumer.subscribe({
            topic: env.KAFKA_TOPIC_NAME,
            fromBeginning: true,
        });

        logger.info(
            `Kafka consumer set up successfully for group ID: ${groupId}`
        );

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                try {
                    if (!message.value) {
                        throw new Error("Message value is empty");
                    }

                    const messageStr = message.value.toString();
                    logger.debug(`Received message: ${messageStr}`);

                    const parts = messageStr.split("\t");
                    if (parts.length < 2) {
                        logger.warn(`Invalid message format: ${messageStr}`);
                        return;
                    }

                    const newsMessage: NewsMessage = {
                        source: parts[0].trim(),
                        url: parts[1].trim(),
                    };

                    logger.info(
                        `Processing message from ${newsMessage.source}: ${newsMessage.url}`
                    );
                    processNewLink(newsMessage);
                    logger.info(`Processed message: ${newsMessage.url}`);
                } catch (err) {
                    logger.error(`Failed to process message: ${err}`);
                }
            },
            autoCommit: true,
        });
    } catch (err) {
        throw new Error(`Failed to set up Kafka consumer: ${err}`);
    }

    const errorTypes = ["unhandledRejection", "uncaughtException"];
    const signalTraps = ["SIGTERM", "SIGINT", "SIGUSR2"];

    errorTypes.forEach((type) => {
        process.on(type, async (e) => {
            logger.error(
                `${type}: ${e instanceof Error ? e.message : String(e)}`
            );
            try {
                logger.info("Disconnecting consumer due to error");
                await consumer.disconnect();
                process.exit(0);
            } catch (err) {
                logger.error(
                    `Error while disconnecting: ${
                        err instanceof Error ? err.message : String(err)
                    }`
                );
                process.exit(1);
            }
        });
    });

    signalTraps.forEach((type) => {
        process.once(type, async () => {
            try {
                logger.info(`Received ${type}, shutting down consumer`);
                await consumer.disconnect();
            } finally {
                process.kill(process.pid, type);
            }
        });
    });
}
