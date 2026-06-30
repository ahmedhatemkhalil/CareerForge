import mongoose from "mongoose";

export const mockUser = {
  _id: new mongoose.Types.ObjectId().toString(),
};

// Fake settings document
export const mockSettings = {
  _id: new mongoose.Types.ObjectId().toString(),
  user_id: mockUser._id,
  theme: "light",
  updated_at: new Date(),
};
