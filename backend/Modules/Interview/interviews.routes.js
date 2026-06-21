import express from "express";
import { verifyToken } from "../../middleware/auth.js";
import { checkInterview } from "../../middleware/checkInterview.js";
import {startInterview, submitAnswer, getAllInterviews, getInterviewById, deleteInterview,} from "./interview.controller.js";

const interviewRouter = express.Router();

interviewRouter.use(verifyToken);

interviewRouter.post("/start", startInterview);
interviewRouter.post("/:sessionId/answer", checkInterview, submitAnswer);
interviewRouter.get("/", getAllInterviews);
interviewRouter.get("/:sessionId", getInterviewById);
interviewRouter.delete("/:sessionId", checkInterview, deleteInterview);

export default interviewRouter;