import { Kafka, type Producer, logLevel } from "kafkajs"
import { env } from "../config/env";
import type { Event } from "../types"


let producer: Producer | null = null;
let connectPromise: Promise<Producer | null> | null = null;

function getSslConfig() {
    if (!env.kafkaSsl) return undefined;
    return {
        rejectUnauthorized: false,
    };
}

const kafka = new Kafka({
    clientId: env.kafkaClientId,
    brokers: env.kafkaBrokers.split(",").map((b) => b.trim()),
    ssl: getSslConfig(),
    sasl: env.kafkaSaslUsername
        ? {
            mechanism: (env.kafkaSaslMechanism as any) || "scram-sha-512",
            username: env.kafkaSaslUsername,
            password: env.kafkaSaslPassword,
        }
        : undefined,
    logLevel: logLevel.WARN,
    retry: {
        initialRetryTime: 300,
        retries: 3,
    },
})

async function getProducer(): Promise<Producer | null> {
    if (producer) return producer;
    if (connectPromise) return connectPromise;

    connectPromise = (async () => {
        try {
            const p = kafka.producer();
            await p.connect();
            producer = p;
            console.log("[kafka] Kafka producer connected successfully.");
            return producer;
        } catch (err: any) {
            console.error("[kafka] Failed to connect Kafka producer:", err.message);
            return null;
        } finally {
            connectPromise = null;
        }
    })();

    return connectPromise;
}

export async function publishEvent(event: Event): Promise<boolean> {
    try {
        const p = await getProducer();
        if (!p) {
            console.warn("[kafka] Kafka producer unavailable, dropping event for tenant/user:", event.tenantId || event.userId);
            return false;
        }

        const messageKey = event.tenantId
            ? `${event.tenantId}:${event.userId || event.eventId}`
            : (event.eventId || event.userId || (event.id ? String(event.id) : undefined));

        await p.send({
            topic: env.kafkaTopic,
            messages: [
                {
                    key: messageKey,
                    value: JSON.stringify(event),
                },
            ],
        });
        return true;
    } catch (err: any) {
        console.error("[kafka] Error producing notification event to Kafka:", err.message);
        return false;
    }
}


export async function disconnectKafkaProducer(): Promise<void> {
  if (producer) {
    await producer.disconnect().catch(() => {});
    producer = null;
  }
}