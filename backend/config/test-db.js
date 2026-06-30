import mongoose from "mongoose";
import connectDB from "./db.js";

export const connectToTestDatabase = async () => {
    await connectDB();
};

export const clearDatabase = async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
};

export const closeDatabase = async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
};