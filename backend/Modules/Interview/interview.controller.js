import {interviewModel} from "../../models/Interview.js";
import { handleError } from "../../middleware/HandleError.js";
import {generateFirstQuestion, evaluateAnswerAndGetNext, generateSummaryReport} from "../../services/ai.static.js";

export const createInterview = handleError(async (req,res)=>{
    const { jobDescription } = req.body;
    if(!jobDescription || jobDescription.trim() === ""){
        return res.status(400).json({message:"Job description is required"});
    }
    
    const firstQuestion = await generateFirstQuestion(jobDescription);
    const interview = await interviewModel.create({
        user: req.user.id,
        jobDescription: jobDescription.trim(),
        qaList: [
            {
                question: firstQuestion,
            },
        ],
    });

    res.status(201).json({
        data: {
            interviewId: interview._id,
            status: interview.status,
            currentQuestion: {
                questionNumber: 1,
                totalQuestions: 8,
                question: firstQuestion,
            },
        },
    });
});

export const submitAnswer = handleError(async (req, res)=>{
    const interview = req.interview;
    const { userAnswer } = req.body;

    if (interview.status === "completed") {
        return res.status(400).json({ message: "Interview already completed" });
    }

    if (!userAnswer || userAnswer.trim() === "") {
        return res.status(400).json({message: "userAnswer is required"});
    }

    const currentQA = interview.qaList[interview.currentQuestionIndex];
    if (!currentQA) {
        return res.status(400).json({ message: "No active question found." });
    }

    const currentQuestionNumber = interview.currentQuestionIndex + 1;

    const aiResponse = await evaluateAnswerAndGetNext({jobDescription:interview.jobDescription, questionNumber:currentQuestionNumber});

    currentQA.userAnswer = userAnswer.trim();
    currentQA.feedback = aiResponse.feedback;
    currentQA.score = aiResponse.score;
    
    if (aiResponse.nextQuestion) {
        interview.qaList.push({question:aiResponse.nextQuestion});
        interview.currentQuestionIndex += 1;
    }

    await interview.save();
    
    const isFinished = !aiResponse.nextQuestion;

    res.status(200).json({
        data: {
            answeredQuestion: {
                questionNumber:currentQuestionNumber,
                question:currentQA.question,
                userAnswer:currentQA.userAnswer,
                feedback:currentQA.feedback,
                score:currentQA.score,
            },

            nextQuestion:
                aiResponse.nextQuestion
                    ? {
                        questionNumber:currentQuestionNumber + 1,
                        totalQuestions:interview.totalQuestions,
                        question:aiResponse.nextQuestion,
                    }
                    : null,

            isFinished,
        },
    });
});

export const completeInterview = handleError(async (req, res)=>{
    const interview = req.interview;
    
    if (interview.status === "completed") {
        return res.status(400).json({message:"Interview already completed",});
    }

    const answeredQuestions = interview.qaList.filter((q) => q.userAnswer);

    if (answeredQuestions.length !== interview.totalQuestions) {
        return res.status(400).json({message: "Please answer all questions first"});
    }
    
    const summary = await generateSummaryReport({qaList: interview.qaList});
    interview.summary = summary;
    interview.status = "completed";
    await interview.save();

    res.status(200).json({
        message:"Interview completed successfully",
        data: {
            interviewId: interview._id,
            status: interview.status,
            summary: interview.summary,
            completedAt: interview.updatedAt,
        },
    });
});

export const getAllInterviews = handleError(async (req, res) => {
    const interviews = await interviewModel.find({user: req.user.id, status: "completed",})
    .select("jobDescription totalQuestions summary.overallScore createdAt updatedAt")
    .sort({ createdAt: -1 });

    res.status(200).json({count: interviews.length, data: interviews,});
});

export const getInterviewById =handleError(async (req, res)=>{
    const interview = await interviewModel.findOne({_id: req.params.id, user: req.user.id, status: "completed"});
    if(!interview){
        return res.status(404).json({message: "Interview not found"})
    }
    res.status(200).json({data:interview});
});

export const deleteInterview =handleError(async (req, res)=>{
    const interview = req.interview;
    await interview.deleteOne();
    res.status(200).json({message: "Interview deleted successfully"});
});