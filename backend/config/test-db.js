import mongoose from "mongoose";
import connectDB from "./db.js";

export const connectToTestDatabase = async () => {
    await connectDB();
};

export const clearDatabase = async () => {
    const collections = mongoose.connection.collections;
    await Promise.all(
        Object.values(collections).map((collection) =>
            collection.deleteMany({})
        )
    );
};

export const closeDatabase = async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
};