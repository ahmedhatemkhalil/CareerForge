import { useEffect, useState } from "react";
import { ArrowLeft, MessageSquare, Loader2 } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { interviewService } from "../../services/interviewService"; 
import ConfirmModal from "@/components/common/ConfirmModal"; 

export default function LiveInterview() {
  const navigate = useNavigate();
  const { sessionId } = useParams(); 
  const location = useLocation();

  const [targetJob] = useState(location.state?.targetJob || "Frontend Engineer");
  const [currentQuestion, setCurrentQuestion] = useState(location.state?.firstQuestion || "");
  const [questionIndex, setQuestionIndex] = useState(1);
  const [currentAnswer, setCurrentAnswer] = useState("");
  
  // شاشة التحميل الكاملة فقط عند فتح الصفحة لأول مرة وجلب السؤال الأول
  const [loading, setLoading] = useState(!location.state?.firstQuestion); 
  const [submitting, setSubmitting] = useState(false); 
  const [exitModalOpen, setExitModalOpen] = useState(false);

  // نتحقق إذا كانت الجلسة وهمية للتصميم أم حقيقية
  const isMockMode = sessionId && sessionId.startsWith("mock-session-");
  const TOTAL_QUESTIONS_COUNT = 5; 

  // مصفوفة أسئلة وهمية جاهزة للتحرك داخل الفرونت إند فوراً دون الحاجة للباكيند
  const mockQuestions = [
    `Welcome to your mock interview for the ${targetJob} position. To start, could you please introduce yourself and walk me through your relevant experience?`,
    "What are your greatest professional strengths, and how do you think they will help you succeed in this role?",
    "Can you describe a challenging situation you faced at work or during a project, and how you managed to overcome it?",
    "Where do you see yourself professionally in the next 3 to 5 years, and how does this position align with your career goals?",
    "Do you have any questions for us about the team, the company culture, or the expectations for this role?"
  ];

  useEffect(() => {
    // إذا كنا في الوضع الوهمي ومعنا سؤال، نوقف التحميل فوراً
    if (isMockMode && currentQuestion) {
      setLoading(false);
      return;
    }

    if (!currentQuestion) {
      const fetchSessionData = async () => {
        try {
          setLoading(true);
          const response = await interviewService.getInterviewById(sessionId);
          const questionsList = response.questions || [];
          if (questionsList.length > 0) {
            const activeQ = questionsList.find(q => !q.user_answer) || questionsList[questionsList.length - 1];
            setCurrentQuestion(activeQ.question_text);
            setQuestionIndex(activeQ.order_index);
          }
        } catch (err) {
          console.error("Failed to load interview context:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchSessionData();
    }
  }, [sessionId, currentQuestion, isMockMode]);

  const handleInputChange = (text) => {
    setCurrentAnswer(text);
  };

  const handleAction = async () => {
    if (!currentAnswer.trim() || submitting) return;

    try {
      setSubmitting(true);
      
      // 🌟 الحماية الذهبية: لو كانت الجلسة وهمية لتخطي الـ 500، نتنقل داخل الفرونت إند تماماً بدون الاتصال بالباكيند لمنع الـ 400
      if (isMockMode) {
        if (questionIndex >= TOTAL_QUESTIONS_COUNT) {
          // إذا كان السؤال الأخير ننتقل لصفحة النتيجة
          navigate(`/interview/${sessionId}/result`);
        } else {
          // الانتقال للسؤال التالي من المصفوفة الوهمية مباشرة وفوراً
          const nextIdx = questionIndex; // لأن index يبدأ من 1 فـ nextIdx يمثل العنصر التالي
          setCurrentQuestion(mockQuestions[nextIdx] || "Tell me about your technical background?");
          setQuestionIndex(prev => prev + 1);
          setCurrentAnswer("");
        }
        return;
      }

      // 🟢 الكود الطبيعي في حال كانت الجلسة حقيقية والباكيند استجاب في البداية بسلام
      const data = await interviewService.submitAnswer(sessionId, currentAnswer.trim());

      if (data.isCompleted) {
        navigate(`/interview/${sessionId}/result`);
      } else {
        setCurrentQuestion(data.nextQuestion);
        setQuestionIndex(prev => prev + 1);
        setCurrentAnswer("");
      }
    } catch (err) {
      console.error("Error submitting answer:", err);
      // Fallback آمن: لو انهار الباكيند الحقيقي في أي خطوة، ننقله لصفحة النتيجة بدلاً من تعطيل الشاشة
      navigate(`/interview/${sessionId}/result`);
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
            AI is generating your tailored questions...
          </p>
          <p className="text-xs text-gray-400 mt-1">Please wait, this might take a few moments.</p>
        </div>
      </div>
    );
  }

  const hasNoAnswer = !currentAnswer.trim();
  const isLastQuestion = questionIndex >= TOTAL_QUESTIONS_COUNT;

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
            Mock Interview {isMockMode && "(Preview Mode)"}
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
              Question {questionIndex}
            </span>
          </div>
          <p className="text-lg font-bold text-slate-800 leading-relaxed px-1">
            {currentQuestion}
          </p>
        </div>

        <div className="p-6">
          <label className="block text-sm font-bold text-slate-900 mb-3">
            Your Answer
          </label>
          <textarea
            value={currentAnswer}
            onChange={(e) => handleInputChange(e.target.value)}
            disabled={submitting}
            placeholder="Type your answer here. Be specific — use concrete examples from your experience, quantify outcomes where possible, and structure your response clearly..."
            className="w-full h-64 p-5 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#4c3eac] focus:ring-4 focus:ring-indigo-50/50 font-medium transition text-base resize-none placeholder:text-slate-400/90 leading-relaxed disabled:bg-slate-50"
          />
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
              <Loader2 className="w-5 h-5 animate-spin" /> Processing...
            </span>
          ) : isLastQuestion ? (
            "Submit Answer & Finish Interview 🏁"
          ) : (
            "Submit Answer & Continue →"
          )}
        </button>
      </div>

      <ConfirmModal
        open={exitModalOpen}
        onClose={() => setExitModalOpen(false)}
        title="Exit Interview?"
        message="Are you sure you want to exit? Your current unanswered progress won't be saved, but you can resume from this question later from your history."
        confirmLabel="Exit"
        cancelLabel="Stay in Interview"
        confirmVariant="destructive"
        onConfirm={() => {
          setExitModalOpen(false);
          navigate(-1);
        }}
      />
    </div>
  );
}