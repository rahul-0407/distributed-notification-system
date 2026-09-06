function required(name: string): string {
  const value = Bun.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`)
  }
  return value;
}

function optional(name: string, fallback: string): string {
  return Bun.env[name] ?? fallback;
}

const dbUrl = Bun.env.DATABASE_URL ?? Bun.env.POSTGRES_URL ?? Bun.env.SUPABASE_DB_URL ?? "";

export const env = {
  port: Number(optional("PORT", "5000")),
  baseUrl: optional("BASE_URL", "http://localhost:5000"),
  corsOrigin: optional("CORS_ORIGIN", "http://localhost:3000"),
  jwtSecret: required("JWT_SECRET"),

  redisUrl: optional("REDIS_URL", "redis://localhost:6379"),

  kafkaBrokers: optional("KAFKA_BROKERS", "localhost:9092"),
  kafkaClientId: optional("KAFKA_CLIENT_ID", "notification-system-backend"),
  kafkaTopic: optional("KAFKA_TOPIC", "notification-events"),
  kafkaSsl: optional("KAFKA_SSL", "false") === "true",
  kafkaSaslMechanism: optional("KAFKA_SASL_MECHANISM", "scram-sha-512"),
  kafkaSaslUsername: optional("KAFKA_SASL_USERNAME", ""),
  kafkaSaslPassword: optional("KAFKA_SASL_PASSWORD", ""),
} as const;
