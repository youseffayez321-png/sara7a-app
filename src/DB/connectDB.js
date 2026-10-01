import mongoose from "mongoose";

const connectDB = async (req, res, next) => {
    try {
        mongoose.connect("mongodb://localhost:27017/sara7a", {
            serverSelectionTimeoutMS: 5000,
        });
        console.log("DB connected successfully");
    } catch (error) {
        console.log("failed to connect DB");
    }
};
export default connectDB;
