import mongoose from "mongoose";
import { interviewSessionModel } from "../models/Interview/InterviewSession.js";
export const checkInterview = async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        if (!sessionId) {
            return res.status(400).json({ message: "Session ID is required" });
        }

        if (!mongoose.Types.ObjectId.isValid(sessionId)) {
            return res.status(400).json({ message: "Invalid Session ID format" });
        }

        const session = await interviewSessionModel.findOne({ _id: sessionId, user_id: req.user.id });
        if (!session) {
            return res.status(404).json({ message: "Interview session not found" });
        }

        req.session = session;
        next();
    } catch (error) {
        console.error("Check interview error:", error);
        return res.status(500).json({ message: error.message });
    }
};