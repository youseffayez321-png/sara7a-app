import express from "express";
import connectDB from "./DB/connectDB.js";
import userRouter from "./modules/user/user.controller.js";
import cors from "cors"
const app = express();
const port = 3000;
const bootstrap = async (req, res, next) => {

    app.use(cors());
    app.use(express.json());
    await connectDB();
    app.use("/users", userRouter);
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
