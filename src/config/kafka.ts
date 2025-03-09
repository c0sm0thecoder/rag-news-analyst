import { Consumer, Kafka, KafkaConfig } from "kafkajs";
import { getEnvironmentVariables } from "./environment";
import { logger } from "../utils/logger";

export function createKafkaClient(): Kafka {
    const env = getEnvironmentVariables();

    const kafkaConfig: KafkaConfig = {
        clientId: env.KAFKA_CLIENT_ID,
        brokers: env.KAFKA_BROKER.split(","),
        ssl: env.KAFKA_SSL === 'true',
        sasl: env.KAFKA_SASL === 'true' ? {
            mechanism: "plain",
            username: env.KAFKA_USERNAME,
            password: env.KAFKA_PASSWORD,
        } : undefined,
    };

    return new Kafka(kafkaConfig);
}

export async function createKafkaConsumer(groupId: string): Promise<Consumer> {
    const kafka = createKafkaClient();
    const consumer = kafka.consumer({ groupId });
    await consumer.connect();
    return consumer;
}

export async function createKafkaTopics(kafka: Kafka): Promise<void> {
    const env = getEnvironmentVariables();
    const admin = kafka.admin();
    
    try {
      await admin.connect();
      logger.info("Connected to Kafka admin client");
      
      const existingTopics = await admin.listTopics();
      logger.info(`Existing topics: ${existingTopics}`);
      
      if (!existingTopics.includes(env.KAFKA_TOPIC_NAME)) {
        await admin.createTopics({
          topics: [{
            topic: env.KAFKA_TOPIC_NAME,
            numPartitions: 1,
            replicationFactor: 1
          }]
        });
        logger.info(`Created topic: ${env.KAFKA_TOPIC_NAME}`);
      }
    } catch (error) {
      logger.error(`Failed to create Kafka topics: ${error}`);
    } finally {
      await admin.disconnect();
    }
  }
