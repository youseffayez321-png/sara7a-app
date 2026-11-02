import express from "express";
import connectDB from "./DB/connectDB.js";
import userRouter from "./modules/user/user.controller.js";
import cors from "cors";
import { connectRedis } from "./DB/connectRedis.js";
import messageRouter from "./modules/message/message.controller.js";
import { PORT } from "../config/config.service.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
const app = express();
const port = PORT;
const limiter = rateLimit({
    windowMs:60*1000,
    limit:30,
    message:{
        success:false,
        message:"game over"
    },
    standardHeaders:true,
    legacyHeaders:false,
    skipSuccessfulRequests:true
})
const allowOrigin=[
    "http://localhost:4000",
    "http://localhost:5000"
]
const bootstrap = async (req, res, next) => {
    app.set("case sensitve routing", true);
    app.set("strict routing", true);
    app.use(cors({
        origin:function (origin,callback){
            if([...allowOrigin,undefined].includes(origin)){
                callback(null,true)
            }else{
                callback(new Error("not allowed origin"))
            }
        }
    }));
    app.use(limiter);
    app.use(helmet());
    app.use(express.json());
    await connectDB();
    await connectRedis();
    app.use("/users", userRouter);
    app.use("/messages", messageRouter);
    app.use("{/*demo}", (req, res, next) => {
        throw new Error(
            `Url ${req.originalUrl}with method ${req.method}not found`,
            { cause: 404 },
        );
    });
    app.use((err, req, res, next) => {
        console.error(err);
        res.status(err.cause || 500).json({
            message: err.message,
            stack: err.stack,
        });
    });
    app.listen(port, () => {
        console.log("welcome to sara7a 😎");
    });
};
export default bootstrap;
