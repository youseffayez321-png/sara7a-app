import { createClient } from "redis";
import { REDIS__URL } from "../../config/config.service.js";

export const redis_client = createClient({
    url: REDIS__URL,
});
export const connectRedis = async (req, res, next) => {
    try {
        await redis_client.connect()
        console.log("redis connected successfully");
    } catch (error) {
        console.log("failed to connect redis");
    }
};
