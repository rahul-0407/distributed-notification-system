import amqp, { type ChannelModel, type ConfirmChannel, type Channel } from "amqplib";
import { env } from "../config/env";
import type { ChannelJobPayload, NotificationChannel } from "../types";

let connection: ChannelModel | null = null;
let publisherChannel: ConfirmChannel | null = null;

export async function getRabbitMQConnection(): Promise<ChannelModel> {
    if (!connection) {
        console.log(`[RabbitMQ] Connecting to broker at ${env.rabbitmqUrl.replace(/:[^:@]+@/, ":***@")}...`);
        connection = await amqp.connect(env.rabbitmqUrl);

        connection.on("error", (err: any) => {
            console.error("[RabbitMQ] Connection error:", err.message);
            connection = null;
            publisherChannel = null;
        });

        connection.on("close", () => {
            console.warn("[RabbitMQ] Connection closed.");
            connection = null;
            publisherChannel = null;
        });
    }
    return connection;
}


export async function initRabbitMQTopology(): Promise<void> {
    const conn = await getRabbitMQConnection();
    const channel = await conn.createChannel();

    try {
        await channel.assertExchange(env.rabbitmqDlx, "direct", { durable: true });
        await channel.assertQueue(env.rabbitmqDlqQueue, { durable: true });
        await channel.bindQueue(env.rabbitmqDlqQueue, env.rabbitmqDlx, "dlq");

        await channel.assertExchange(env.rabbitmqExchange, "direct", { durable: true });

        const queueOptions = {
            durable: true,
            arguments: {
                "x-dead-letter-exchange": env.rabbitmqDlx,
                "x-dead-letter-routing-key": "dlq",
            },
        };

        await channel.assertQueue(env.queues.email, queueOptions);
        await channel.bindQueue(env.queues.email, env.rabbitmqExchange, env.routingKeys.email);

        await channel.assertQueue(env.queues.sms, queueOptions);
        await channel.bindQueue(env.queues.sms, env.rabbitmqExchange, env.routingKeys.sms);

        await channel.assertQueue(env.queues.push, queueOptions);
        await channel.bindQueue(env.queues.push, env.rabbitmqExchange, env.routingKeys.push);

        await channel.assertQueue(env.queues.webhook, queueOptions);
        await channel.bindQueue(env.queues.webhook, env.rabbitmqExchange, env.routingKeys.webhook);

        console.log("[RabbitMQ] Topology successfully initialized (Exchanges, Queues, Bindings & DLX ready).");
    } finally {
        await channel.close();
    }
}

export async function getPublisherChannel(): Promise<ConfirmChannel> {
    if (!publisherChannel) {
        const conn = await getRabbitMQConnection();
        publisherChannel = await conn.createConfirmChannel()
    }
    return publisherChannel;
}

export async function publishChannelJob(channelType: NotificationChannel, payload: ChannelJobPayload): Promise<boolean> {

    const channel = await getPublisherChannel();
    const routingKey = env.routingKeys[channelType.toLowerCase() as keyof typeof env.routingKeys];

    if (!routingKey) {
        throw new Error(`[RabbitMQ Publisher] No routing key found for channel: ${channelType}`);
    }

    const content = Buffer.from(JSON.stringify(payload));

    return new Promise((resolve, reject) => {
        channel.publish(
            env.rabbitmqExchange,
            routingKey,
            content,
            {
                persistent: true,
                contentType: "application/json",
                timestamp: Date.now(),
            },
            (err: any) => {
                if (err) {
                    console.error(`[RabbitMQ Publisher] NACK for job ${payload.event.eventId} on channel ${channelType}:`, err.message);
                    return reject(err);
                }
                console.log(`[RabbitMQ Publisher] ACK: Job for Event ${payload.event.eventId} published to exchange with routing key "${routingKey}"`);
                resolve(true)
            }
        );
    });
}

export async function createWorkerChannel(prefetchCount: number = 10): Promise<Channel> {
    const conn = await getRabbitMQConnection();
    const channel = await conn.createChannel();
    await channel.prefetch(prefetchCount);
    return channel;
}

export async function closeRabbitMQ(): Promise<void> {
    if (publisherChannel) {
        await publisherChannel.close().catch(() => { });
        publisherChannel = null;
    }
    if (connection) {
        await connection.close().catch(() => { });
        connection = null;
    }
    console.log("[RabbitMQ] Client gracefully disconnected.");
}




