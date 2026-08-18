function optional(name: string, fallback: string): string {
  return Bun.env[name] ?? fallback;
}

export const env = {
  kafkaBrokers: optional("KAFKA_BROKERS", "localhost:9092"),
  kafkaClientId: optional("KAFKA_CLIENT_ID", "notification-consumer-worker"),
  kafkaGroupId: optional("KAFKA_GROUP_ID", "notification-consumer-group"),
  kafkaTopic: optional("KAFKA_TOPIC", "notification-events"),
  kafkaDlqTopic: optional("KAFKA_DLQ_TOPIC", "notification-events-dlq"),
  kafkaSsl: optional("KAFKA_SSL", "false") === "true",
  kafkaSaslMechanism: optional("KAFKA_SASL_MECHANISM", "scram-sha-512"),
  kafkaSaslUsername: optional("KAFKA_SASL_USERNAME", ""),
  kafkaSaslPassword: optional("KAFKA_SASL_PASSWORD", ""),
  redisUrl: optional("REDIS_URL", "redis://localhost:6379"),
} as const;
