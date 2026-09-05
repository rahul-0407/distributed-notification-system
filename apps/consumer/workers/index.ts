import { startEmailWorker } from "./emailWorkers";
import { startSmsWorker } from "./smsWorker";
import { startPushWorker } from "./pushWorker";
import { startWebhookWorker } from "./webhookWorker";


export async function startAllQueueWorkers(): Promise<void> {
    console.log(`[Queue Workers] Initializing channel queue workers...`);
    await Promise.all([
        startEmailWorker(),
        startSmsWorker(),
        startPushWorker(),
        startWebhookWorker()
    ])
    console.log(`[Queue Workers] All 4 channel queue workers active and listening for RabbitMQ jobs.`);
}