import mongoose from "mongoose";
import { DB_URL } from "../../config/config.service.js";

const connectDB = async (req, res, next) => {
    try {
        mongoose.connect(DB_URL, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log("DB connected successfully");
    } catch (error) {
        console.log("failed to connect DB");
    }
};
export default connectDB;
