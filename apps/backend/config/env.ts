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
  port: Number(optional("PORT", "4000")),
  baseUrl: optional("BASE_URL", "https://localhost:4000"),

  redisUrl: required("REDIS_URL"),

  kafkaBrokers: optional("KAFKA_BROKERS", "localhost:9092"),
  kafkaClientId: optional("KAFKA_CLIENT_ID", "url-shortener-backend"),
  kafkaTopic: optional("KAFKA_TOPIC", "clicks"),
} as const;
