import { Consumer, Kafka, KafkaConfig } from "kafkajs";
import { getEnvironmentVariables } from "./environment";

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
