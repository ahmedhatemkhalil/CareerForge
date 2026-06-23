import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, MessageSquare, Loader2, Mic, MicOff } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { interviewService } from "../../services/interviewService";
import ConfirmModal from "@/components/common/ConfirmModal";
import { useVoiceAnswer } from "./useVoiceAnswer";


export default function LiveInterview() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const location = useLocation();

  const [targetJob] = useState(location.state?.targetJob || "Frontend Engineer");
  const [currentQuestion, setCurrentQuestion] = useState(location.state?.firstQuestion || "");
  const [questionIndex, setQuestionIndex] = useState(1);
  const [currentAnswer, setCurrentAnswer] = useState("");

  const [loading, setLoading] = useState(!location.state?.firstQuestion);
  const [submitting, setSubmitting] = useState(false);
  const [exitModalOpen, setExitModalOpen] = useState(false);

  const answerBaseRef = useRef("");

  const handleRecordingComplete = useCallback((spokenText) => {
    setCurrentAnswer((prev) => {
      const base = answerBaseRef.current.trim() || prev.trim();
      return base ? `${base} ${spokenText}` : spokenText;
    });
  }, []);

  const {
    isRecording,
    isSupported,
    liveTranscript,
    stopVoiceAnswer,
    startVoiceAnswer,
  } = useVoiceAnswer({ onRecordingComplete: handleRecordingComplete });

  const handleStartRecording = () => {
    answerBaseRef.current = currentAnswer;
    startVoiceAnswer();
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      stopVoiceAnswer();
    } else {
      handleStartRecording();
    }
  };

  const displayedAnswer = isRecording
    ? [answerBaseRef.current.trim(), liveTranscript.trim()].filter(Boolean).join(" ")
    : currentAnswer;

  useEffect(() => {
    if (!currentQuestion) {
      const fetchSessionData = async () => {
        try {
          setLoading(true);
          const response = await interviewService.getInterviewById(sessionId);
          const questionsList = response?.questions || response?.data?.questions || [];
          if (questionsList.length > 0) {
            const activeQ = questionsList.find(q => !q.user_answer) || questionsList[questionsList.length - 1];
            setCurrentQuestion(activeQ.question_text);
            setQuestionIndex(activeQ.order_index || questionsList.length);
          }
        } catch (err) {
          console.error("Failed to load interview question from backend AI:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchSessionData();
    }
  }, [sessionId, currentQuestion]);

  useEffect(() => {
    if (submitting && isRecording) {
      stopVoiceAnswer();
    }
  }, [submitting, isRecording, stopVoiceAnswer]);

  const handleAction = async () => {
    const answerToSend = (isRecording ? displayedAnswer : currentAnswer).trim();
    if (!answerToSend || submitting) return;

    stopVoiceAnswer();

    try {
      setSubmitting(true);

      const response = await interviewService.submitAnswer(sessionId, answerToSend);
      console.log("AI Response Raw:", response);

      const isCompleted = response?.isCompleted ?? response?.data?.isCompleted ?? false;
      const nextQuestionText = response?.nextQuestion ?? response?.data?.nextQuestion;

      if (isCompleted) {
        navigate(`/interview/${sessionId}/result`);
      } else if (nextQuestionText) {
        setCurrentQuestion(nextQuestionText);
        setQuestionIndex(prev => prev + 1);
        setCurrentAnswer("");
        answerBaseRef.current = "";
      } else {
        console.warn("No nextQuestion found in response, navigating to results.");
        navigate(`/interview/${sessionId}/result`);
      }
    } catch (err) {
      console.error("Error submitting answer to AI:", err);
      alert("Failed to communicate with AI Server. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 text-[#5850ec]">
        <Loader2 className="w-10 h-10 animate-spin" />
        <div className="text-center">
          <p className="text-base font-bold text-gray-800">
            AI is connecting to your interview session...
          </p>
          <p className="text-xs text-gray-400 mt-1">Please wait, retrieving tailored questions.</p>
        </div>
      </div>
    );
  }

  const hasNoAnswer = !displayedAnswer.trim();

  return (
    <div className="p-8 max-w-4xl mx-auto font-sans text-gray-800 antialiased selection:bg-indigo-100">
      <div className="mb-6">
        <button
          onClick={() => setExitModalOpen(true)}
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={16} strokeWidth={2.5} /> Exit interview
        </button>
      </div>

      <div className="flex justify-between items-end mb-8">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
            Live AI Interview
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight capitalize">
            {targetJob}
          </h1>
        </div>

        <div className="flex items-center gap-2 px-4 py-2.5 bg-[#4c3eac] text-white font-bold text-sm rounded-2xl shadow-sm tracking-wide">
          <MessageSquare size={16} fill="currentColor" className="opacity-90" />
          Question {questionIndex}
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden mb-6">
        <div className="p-6 bg-[#f4f3ff] border-b border-indigo-50/50">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 flex items-center justify-center font-bold text-xs bg-[#4c3eac] text-white rounded-full">
              {questionIndex}
            </div>
            <span className="text-xs font-bold text-[#4c3eac] uppercase tracking-wider">
              AI Prompt
            </span>
          </div>
          <p className="text-lg font-bold text-slate-800 leading-relaxed px-1">
            {currentQuestion}
          </p>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <label className="block text-sm font-bold text-slate-900">
              Your Answer
            </label>

            {isSupported && (
              <button
                type="button"
                onClick={handleToggleRecording}
                disabled={submitting}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isRecording
                    ? "bg-red-500 text-white shadow-md shadow-red-100 hover:bg-red-600"
                    : "bg-indigo-50 text-[#4c3eac] border border-indigo-100 hover:bg-indigo-100"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isRecording ? (
                  <>
                    <MicOff size={15} />
                    Stop recording
                  </>
                ) : (
                  <>
                    <Mic size={15} />
                    Record answer
                  </>
                )}
              </button>
            )}
          </div>
          <textarea
            value={displayedAnswer}
            onChange={(e) => {
              if (!isRecording) {
                setCurrentAnswer(e.target.value);
              }
            }}
            disabled={submitting || isRecording}
            placeholder={
              isSupported
                ? "Type your answer or tap Record answer to speak..."
                : "Type your answer here..."
            }
            className={`w-full h-64 p-5 rounded-2xl border font-medium transition text-base resize-none placeholder:text-slate-400/90 leading-relaxed disabled:bg-slate-50 ${
              isRecording
                ? "border-red-200 bg-red-50/30 focus:border-red-300 focus:ring-4 focus:ring-red-50"
                : "border-slate-200 focus:outline-none focus:border-[#4c3eac] focus:ring-4 focus:ring-indigo-50/50"
            }`}
          />

          {isRecording && (
            <p className="mt-2 text-xs text-slate-400 px-1">
              Text updates in real time as you speak. Click Stop recording to edit, then submit.
            </p>
          )}
        </div>
      </div>

      <div>
        <button
          type="button"
          onClick={handleAction}
          disabled={hasNoAnswer || submitting}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base transition-all duration-200 tracking-wide ${
            hasNoAnswer || submitting
              ? "bg-[#beb9e4] text-white cursor-not-allowed"
              : "bg-[#4c3eac] hover:bg-[#3e3194] text-white shadow-md shadow-indigo-100"
          }`}
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> AI is evaluating your response...
            </span>
          ) : (
            "Submit Answer & Continue →"
          )}
        </button>
      </div>

      <ConfirmModal
        open={exitModalOpen}
        onClose={() => setExitModalOpen(false)}
        title="Exit Interview?"
        message="Are you sure you want to exit? You can resume later."
        confirmLabel="Exit"
        cancelLabel="Stay"
        confirmVariant="destructive"
        onConfirm={() => {
          stopVoiceAnswer();
          setExitModalOpen(false);
          navigate(-1);
        }}
      />
    </div>
  );
}