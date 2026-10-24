import { createClient } from "redis";

export const redis_client = createClient({
    url: "rediss://default:gQAAAAAAAotgAAIgcDJhOGIzYjM3MTJlN2Y0ZjI2YjM2ZjYwNThkZDM1ZTY0Mg@trusted-cod-166752.upstash.io:6379",
});
export const connectRedis = async (req, res, next) => {
    try {
        await redis_client.connect()
        console.log("redis connected successfully");
    } catch (error) {
        console.log("failed to connect redis");
    }
};
