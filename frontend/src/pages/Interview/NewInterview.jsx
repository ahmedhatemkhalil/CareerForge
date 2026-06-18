import { useState, useEffect } from "react";
import { Sparkles, ArrowLeft, Loader2, Calendar, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { interviewService } from "../../services/interviewService";
import { getAllAnalyses } from "../../services/analysisService"; 
import ConfirmModal from "@/components/common/ConfirmModal"; // تأكدي من صحة المسار

const formatAnalysisDate = (isoDate) => {
  if (!isoDate) return "Unknown date";
  const dateOnly = String(isoDate).split("T")[0];
  return new Date(`${dateOnly}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function NewInterview() {
  const navigate = useNavigate();

  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingAnalyses, setFetchingAnalyses] = useState(true);
  const [analysesList, setAnalysesList] = useState([]);
  
  // حالة مودال تأكيد البدء
  const [startConfirmOpen, setStartConfirmOpen] = useState(false);

  useEffect(() => {
    const fetchUserAnalyses = async () => {
      try {
        setFetchingAnalyses(true);
        const response = await getAllAnalyses();

        let fetchedAnalyses = [];
        if (Array.isArray(response)) {
          fetchedAnalyses = response;
        } else if (response?.success && Array.isArray(response.data)) {
          fetchedAnalyses = response.data;
        } else if (response?.data && typeof response.data === "object") {
          fetchedAnalyses =
            response.data.analyses ||
            response.data.data ||
            Object.values(response.data).find(Array.isArray) ||
            [];
        }

        setAnalysesList(fetchedAnalyses);
        
        if (fetchedAnalyses.length > 0) {
          setSelectedAnalysis(fetchedAnalyses[0]);
        }
      } catch (err) {
        console.error("Failed to fetch CV analyses:", err);
      } finally {
        setFetchingAnalyses(false);
      }
    };

    fetchUserAnalyses();
  }, []);

  // دالة تفعيل المودال أولاً بدلاً من تشغيل الـ API مباشرة
  const handleStartTrigger = () => {
    if (!selectedAnalysis) {
      alert("Please select a CV analysis configuration first.");
      return;
    }
    setStartConfirmOpen(true);
  };

  // الدالة الفعلية لبدء الـ interview بعد الموافقة في المودال
 // الدالة المعدلة بالكامل لتخطي خطأ الباكيند 500 والدخول لصفحة الـ Live فوراً
 const confirmStartInterview = async () => {
  setStartConfirmOpen(false);

  try {
    setLoading(true);

    const analysisId = selectedAnalysis?._id;
    const targetJob = selectedAnalysis?.jobId?.title || "Software Engineer";

    const response = await interviewService.startInterview(analysisId);

    const { sessionId, question } = response;

    if (!sessionId) {
      throw new Error("No sessionId returned from backend");
    }

    navigate(`/live-interview/${sessionId}`, {
      state: {
        firstQuestion: question,
        targetJob
      }
    });

  } catch (err) {
    console.error("Start interview failed:", err);

    // ❌ NO fallback
    alert("Failed to start interview. Please check backend.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-[820px] mx-auto font-sans text-gray-800 antialiased min-h-screen p-6">
      
      <div className="mb-6 ml-2 flex items-center gap-3">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-[33px] font-bold text-[#0f172a] tracking-tight mb-1">
            Start Mock Interview
          </h1>
          <p className="text-[18px] text-gray-500 font-normal">
            Select one of your analyzed CVs to start a tailored AI interview
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-[20px] p-6 shadow-sm">
        
        <div className="mb-6">
          <label className="block text-[20px] font-bold text-[#0f172a] mb-0.5">
            Select CV Analysis Profile
          </label>
          <span className="block text-[15px] text-gray-400 mb-4">
            The interview questions will be highly customized based on the selected role and CV match.
          </span>

          {fetchingAnalyses ? (
            <div className="flex items-center gap-2 text-gray-400 text-xs py-8 justify-center border border-dashed border-gray-200 rounded-xl">
              <Loader2 className="animate-spin w-5 h-5 text-indigo-600" />
              Loading your analysis history...
            </div>
          ) : analysesList.length === 0 ? (
            <div className="text-sm text-gray-400 p-8 border border-dashed border-gray-200 rounded-xl text-center">
              No CV analyses found. Please analyze a CV first.
              <button 
                onClick={() => navigate("/new-analysis")}
                className="block mx-auto mt-3 text-indigo-600 font-semibold hover:underline"
              >
                + Create New Analysis
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {analysesList.map((analysis) => {
                const isSelected = selectedAnalysis?._id === analysis._id;
                const jobTitle = analysis.jobId?.title || "Targeted Job Role";
                const fileName = analysis.cvId?.fileName || "Uploaded_Resume.pdf";
                const matchScore = analysis.matchScore ?? 0;

                return (
                  <div
                    key={analysis._id}
                    onClick={() => setSelectedAnalysis(analysis)}
                    className={`flex items-center justify-between p-4 border rounded-[14px] cursor-pointer transition-all ${
                      isSelected
                        ? "border-[#4f46e5] bg-[#f9f3ff] ring-1 ring-[#4f46e5]"
                        : "border-gray-200 hover:bg-slate-50/60"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl mt-0.5 ${isSelected ? 'bg-indigo-100 text-[#4f46e5]' : 'bg-slate-100 text-gray-400'}`}>
                        <Sparkles className="w-4 h-4" />
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-[15px] font-bold text-[#1e293b] tracking-tight">
                          {jobTitle}
                        </span>
                        <div className="flex items-center gap-3 text-[12px] text-gray-400 font-normal mt-1 flex-wrap">
                          <span className="flex items-center gap-1">
                            <FileText size={13} />
                            {fileName}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar size={13} />
                            {formatAnalysisDate(analysis.createdAt)}
                          </span>
                          <span>•</span>
                          <span className="text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                            Match: {matchScore}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center pr-1">
                      <div className={`w-[20px] h-[20px] rounded-full border flex items-center justify-center ${isSelected ? 'border-[#4f46e5]' : 'border-gray-300'}`}>
                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#4f46e5]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-[#f5f3ff] border border-indigo-50/50 rounded-xl p-3.5 mb-5 flex items-start gap-2.5">
          <div className="text-[#4f46e5] mt-0.5 flex-shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <p className="text-[11.5px] text-[#4f46e5] font-medium leading-relaxed">
            The AI will instantly extract the context of your selected CV analysis profile to trigger specific interview questions. Each of your responses during the interview will be scored from 1 to 10.
          </p>
        </div>

        <button
          onClick={handleStartTrigger} // التغيير هنا
          disabled={loading || fetchingAnalyses || !selectedAnalysis}
          className="w-full flex items-center justify-center gap-1.5 text-white py-3.5 rounded-xl font-bold text-[14px] shadow-sm transition-all disabled:opacity-50 bg-brand-primary"
          style={{ background: 'linear-gradient(135deg, #4e27e9 0%, #6339e2 100%)' }}
        >
          {loading ? (
            <Loader2 className="animate-spin w-4 h-4 text-white" />
          ) : (
            <span className="text-md">✨</span>
          )}
          Start AI Mock Interview 🌟
        </button>
      </div>

      {/* مودال تأكيد بدء المقابلة */}
      <ConfirmModal
        open={startConfirmOpen}
        onClose={() => setStartConfirmOpen(false)}
        title="Ready to Start?"
        message={`You are about to start a live interview for "${selectedAnalysis?.jobId?.title || 'Targeted Job Role'}". Make sure you have enough time to finish your answers.`}
        confirmLabel="Let's Go! 🚀"
        cancelLabel="Cancel"
        confirmVariant="default"
        onConfirm={confirmStartInterview}
      />
    </div>
  );
}