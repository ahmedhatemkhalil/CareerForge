import crypto from "crypto";
import { interviewSessionModel } from "../../models/Interview/InterviewSession.js";
import { interviewQuestionModel } from "../../models/Interview/InterviewQuestion.js";
import { Analysis } from "../../models/Analysis.js";
import {startInterviewAI, continueInterviewAI} from "../../services/interview.service.js";
import { handleError } from "../../middleware/HandleError.js";
import User from "../../models/User.js"; 

// Post /api/interviews/start
export const startInterview = handleError(async (req, res) => {
    const { analysisId } = req.body;

    if (!analysisId) {
        return res.status(400).json({ message: "analysisId is required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const userPlanName = user.plan || "free"; 
    const allowedLimit = user.maxLimits?.interviewsPerMonth || (userPlanName === "pro" ? 99 : 1);
    const currentUsage = user.usage?.interviewsThisMonth || 0;

    if (currentUsage >= allowedLimit) {
        return res.status(403).json({ 
            message: `You have exceeded your monthly interview limit for your current plan (Maximum allowed: ${allowedLimit}). Please upgrade your plan.`
        });
    }

    await User.findByIdAndUpdate(req.user.id, {
        $inc: { "usage.interviewsThisMonth": 1 }
    });

    let aiResponse;
    try {
        const analysis = await Analysis.findOne({_id: analysisId, userId: req.user.id}).populate("jobId");
        if (!analysis?.jobId) {
            await User.findByIdAndUpdate(req.user.id, { $inc: { "usage.interviewsThisMonth": -1 } });
            return res.status(404).json({ message: "Analysis or Associated Job not found" });
        }

        const langflowSessionId = crypto.randomUUID();
        aiResponse = await startInterviewAI({
            langflowSessionId,
            jobTitle: analysis.jobId.title,
            jobDescription: analysis.jobId.descriptionText,
            matchScore: analysis.matchScore,
            strengths: analysis.strengths,
            weaknesses: analysis.weaknesses,
            skillGaps: analysis.skillGaps,
        });

        if (!aiResponse?.nextQuestion || aiResponse.error) {
            throw new Error("AI Generation Failed");
        }

        const session = await interviewSessionModel.create({
            user_id: req.user.id,
            analysis_id: analysis._id,
            jobTitle: analysis.jobId.title,
            status: "in_progress",
            started_at: new Date(),
            langflow_session_id: langflowSessionId,
        });

        const firstQuestion = await interviewQuestionModel.create({
            session_id: session._id,
            question_text: aiResponse.nextQuestion,
            order_index: 1,
        });


        return res.status(201).json({
            message: "Interview started successfully",
            data: {
                sessionId: session._id,
                question: firstQuestion.question_text,
                order: 1,
                isCompleted: false,
            },
        });

    } catch (error) {
        await User.findByIdAndUpdate(req.user.id, {
            $inc: { "usage.interviewsThisMonth": -1 }
        });
        
        console.error("Start Interview Error:", error.message);
        return res.status(500).json({ message: "Failed to start interview due to an external error. Please try again." });
    }
});

// POST /api/interviews/:sessionId/answer
export const submitAnswer = handleError(async (req, res) => {
    const { answer } = req.body;

    if (!answer?.trim()) {
        return res.status(400).json({ message: "Answer is required" });
    }

    const session = req.session;

    if (session.status === "completed") {
        return res.status(400).json({ message: "Interview already completed" });
    }

    const analysis = await Analysis.findById(session.analysis_id).populate("jobId");

    const currentQuestion = await interviewQuestionModel.findOne({
      session_id: session._id,
      answer_status: { $in: ["pending", "failed"] },
    }).sort({ order_index: 1 });

    if (!currentQuestion) {
      return res.status(400).json({ message: "No active question found" });
    }

    currentQuestion.user_answer = answer.trim();
    currentQuestion.answer_status = "processing";
    await currentQuestion.save();

    const allQuestions = await interviewQuestionModel.find({ session_id: session._id }).sort({ order_index: 1 });

    const interviewHistory = allQuestions.filter(q => q.answer_status === "completed" && q.user_answer)
      .map(q => ({
        question: q.question_text,
        answer: q.user_answer,
      }));

    const aiResponse = await continueInterviewAI({
        langflowSessionId: session.langflow_session_id,
        jobTitle: analysis.jobId.title,
        jobDescription: analysis.jobId.descriptionText,
        matchScore: analysis.matchScore,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        skillGaps: analysis.skillGaps,
        interviewHistory,
        candidateAnswer: answer.trim(),
    });

    console.log("AI RESPONSE:", aiResponse);
    if (!aiResponse || aiResponse.error) {
        currentQuestion.answer_status = "failed";
        await currentQuestion.save();
        return res.status(500).json({message: "Please try submitting your answer again.",});
    }

    const questionsCount = currentQuestion.order_index;
    const MIN_QUESTIONS = 5;
    const MAX_QUESTIONS = 8;

    if (aiResponse.isCompleted && questionsCount < MIN_QUESTIONS) {
        aiResponse.isCompleted = false;
    }

    if (questionsCount >= MAX_QUESTIONS) {
        aiResponse.isCompleted = true;
    }

    if (!aiResponse.isCompleted && !aiResponse.nextQuestion) {
        currentQuestion.answer_status = "failed";
        await currentQuestion.save();

        return res.status(500).json({
            message: "AI failed to generate next question",
        });
    }

    // SAVE AI RESULT
    currentQuestion.score = aiResponse.score ?? 0;
    currentQuestion.ai_feedback = aiResponse.feedback || "No feedback provided.";
    currentQuestion.answer_status = "completed";
    await currentQuestion.save();

    // finish
    if (aiResponse.isCompleted) {
        session.status = "completed";
        session.total_questions = questionsCount;
        session.overall_score = aiResponse.overall_score ?? aiResponse.overallScore ?? 0; 
        session.overall_feedback = aiResponse.overall_feedback ?? aiResponse.generalFeedback;
        session.tips_for_improvement = (aiResponse.tips_for_improvement ?? aiResponse.tipsForImprovement) || [];
        session.hiringRecommendation = aiResponse.hiringRecommendation;
        session.completed_at = new Date();

        await session.save();

        return res.status(200).json({
            isCompleted: true,
            score: currentQuestion.score,
            feedback: currentQuestion.ai_feedback,
            overallScore: session.overall_score,
            generalFeedback: session.overall_feedback,
            tipsForImprovement: session.tips_for_improvement,
            hiringRecommendation: session.hiringRecommendation,
        });
    }

    // next Question
    const nextQuestion = await interviewQuestionModel.create({
        session_id: session._id,
        question_text: aiResponse.nextQuestion,
        order_index: currentQuestion.order_index + 1,
        answer_status: "pending",
    });

    return res.status(200).json({
        isCompleted: false,
        score: aiResponse.score,
        feedback: aiResponse.feedback,
        nextQuestion: nextQuestion.question_text,
    });
});

// GET /api/interviews
export const getAllInterviews = handleError(async (req, res) => {
    const interviews = await interviewSessionModel
        .find({user_id: req.user.id, status: "completed"})
        .populate({
            path: "analysis_id",
            select: "cvId",
            populate: {
                path: "cvId",
                select: "fileName",
            },
        })
        .sort({ createdAt: -1 });

    const formattedInterviews = interviews.map((interview) => {
        return {
            id: interview._id,
            jobTitle: interview.jobTitle,
            score: interview.overall_score,
            status: interview.status,
            hiringRecommendation: interview.hiringRecommendation,
            interviewDate: interview.createdAt,
            started_at: interview.started_at,
            completed_at: interview.completed_at,
            cvName:interview.analysis_id?.cvId?.fileName || null,
        };
    });

    return res.status(200).json({
        count: formattedInterviews.length,
        data: formattedInterviews,
    });
});

// // GET /api/interviews/:sessionId
export const getInterviewById = handleError(async (req, res) => {
    const questions = await interviewQuestionModel.find({session_id: req.session._id}).sort({order_index: 1,});

    return res.status(200).json({
        session: req.session,
        questions,
    });
});

// DELETE /api/interviews/:sessionId
export const deleteInterview = handleError(async (req, res) => {
    await interviewQuestionModel.deleteMany({ session_id: req.session._id });
    await req.session.deleteOne();
    return res.status(200).json({message: "Interview deleted successfully",});
});