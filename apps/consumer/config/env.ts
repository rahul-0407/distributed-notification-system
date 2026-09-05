import dotenv from "dotenv";
dotenv.config();

export const env = {
  kafkaBrokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
  kafkaTopic: process.env.KAFKA_TOPIC || "notification-events",
  kafkaDlqTopic: process.env.KAFKA_DLQ_TOPIC || "notification-events-dlq",
  kafkaGroupId: process.env.KAFKA_GROUP_ID_FANOUT || "notification-fanout-group",
  kafkaSsl: (process.env.KAFKA_SSL || "false") === "true",
  kafkaSaslMechanism: process.env.KAFKA_SASL_MECHANISM || "scram-sha-512",
  kafkaSaslUsername: process.env.KAFKA_SASL_USERNAME || "",
  kafkaSaslPassword: process.env.KAFKA_SASL_PASSWORD || "",

  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",



  rabbitmqUrl: (process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672"),
  rabbitmqExchange: process.env.RABBITMQ_EXCHANGE || "notification.exchange",
  rabbitmqDlx: process.env.RABBITMQ_DLX || "notification.dlx",
  rabbitmqDlqQueue: process.env.RABBITMQ_DLQ_QUEUE || "notification.dlq.queue",

  queues: {
    email: process.env.RABBITMQ_EMAIL_QUEUE || "notification.email.queue",
    sms: process.env.RABBITMQ_SMS_QUEUE || "notification.sms.queue",
    push: process.env.RABBITMQ_PUSH_QUEUE || "notification.push.queue",
    webhook: process.env.RABBITMQ_WEBHOOK_QUEUE || "notification.webhook.queue",
  },
  
  routingKeys: {
    email: "notification.email",
    sms: "notification.sms",
    push: "notification.push",
    webhook: "notification.webhook",
  }

}
