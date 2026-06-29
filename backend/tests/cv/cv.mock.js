import mongoose from "mongoose";

export const mockUser = {
  _id: new mongoose.Types.ObjectId().toString(),
  role: "user"
};

export const mockCvData = {
  _id: new mongoose.Types.ObjectId().toString(),
  userId: mockUser._id,
  fileUrl: "https://res.cloudinary.com/mock/resume.pdf",
  fileName: "resume.pdf",
  fileSizeKb: 150,
  status: "processing"
};

export const mockCloudinaryResponse = {
  secure_url: "https://res.cloudinary.com/mock/resume.pdf"
};