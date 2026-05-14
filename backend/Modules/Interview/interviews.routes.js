import express from "express";
import {createInterview, submitAnswer, completeInterview, getAllInterviews, getInterviewById, deleteInterview} from "./interview.controller.js";
import { verifyToken } from "../../middleware/auth.js";
import checkInterview from "../../middleware/checkInterview.js";

const interviewRouter = express.Router();
interviewRouter.use(verifyToken);
interviewRouter.post("/", createInterview);
interviewRouter.post("/:id/answer", checkInterview, submitAnswer);
interviewRouter.post("/:id/complete", checkInterview, completeInterview);
interviewRouter.get("/", getAllInterviews);
interviewRouter.get("/:id", checkInterview, getInterviewById);
interviewRouter.delete("/:id", checkInterview, deleteInterview);

export default interviewRouter;