import { redis_client } from "../connectRedis.js";

export const setValue = async ({ key, value, ttl }) => {
    try {
        if (typeof value == "string") {
            value = value;
        } else {
            value = JSON.stringify(value);
        }

        if (ttl) {
            return await redis_client.set(key, value, { EX: ttl });
        } else {
            return await redis_client.set(key, value);
        }
    } catch (error) {
        console.log("\nredis set failed");
    }
};

export const update = async ({ key, value, ttl }) => {
    try {
        if (!(await redis_client.exists(key))) return 0;
        if (typeof value == "string") {
            value = value;
        } else {
            value = JSON.stringify(value);
        }
        if (ttl) {
            return await redis_client.set(key, value, { EX: ttl });
        } else {
            return await redis_client.set(key, value);
        }
    } catch (error) {
        console.log("\nredis set failed");
    }
};

export const getValue = async ( key ) => {
    try {
        try {
            return JSON.parse(await redis_client.get(key));
        } catch (error) {
            return await redis_client.get(key);
        }
    } catch (error) {
        console.log("\nredis get failed");
    }
};

export const ttl = async (key) => {
    try {
        return await redis_client.ttl(key);
    } catch (error) {
        console.log("\nredis ttl failed");
    }
};

export const expire = async ({ key, ttl }) => {
    try {
        return await redis_client.expire(key, ttl);
    } catch (error) {
        console.log("\nredis expire failed");
    }
};

export const exists = async (key) => {
    try {
        return await redis_client.exists(key);
    } catch (error) {
        console.log("\nredis exists failed");
    }
};

export const deleteKey = async (key) => {
    try {
        if (!key?.length) return 0;
        return await redis_client.del(key);
    } catch (error) {
        console.log("\nredis deleted failed");
    }
};
export const keys = async (key) => {
    try {
        return await redis_client.keys(`${key}*`);
    } catch (error) {
        console.log("\nredis keys failed");
    }
};
export const incr = async (key) => {
    try {
        return await redis_client.incr(key);
    } catch (error) {
        console.log("\nredis incr failed");
    }
};