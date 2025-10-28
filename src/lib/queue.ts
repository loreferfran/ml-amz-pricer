import { Queue } from "bullmq";
import IORedis from "ioredis";
const connection = new IORedis(process.env.REDIS_URL as string, { maxRetriesPerRequest: null });
export const priceQueue = new Queue("price-jobs", { connection });
