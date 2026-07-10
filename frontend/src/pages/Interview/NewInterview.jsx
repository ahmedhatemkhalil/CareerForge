import { useState, useEffect } from "react";
import { Sparkles, Loader2, Calendar, FileText, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { interviewService } from "../../services/interviewService";
import { getAllAnalyses } from "../../services/analysisService"; 
import ConfirmModal from "@/components/common/ConfirmModal";
import { usePlanLimitModal } from "@/hooks/usePlanLimitModal";
import { toast } from "react-hot-toast";

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
  const { handleError, modal: upgradeModal } = usePlanLimitModal();

  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingAnalyses, setFetchingAnalyses] = useState(true);
  const [analysesList, setAnalysesList] = useState([]);
  
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

  const handleStartTrigger = () => {
    if (!selectedAnalysis) {
      alert("Please select a CV analysis configuration first.");
      return;
    }
    setStartConfirmOpen(true);
  };

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

    if (!handleError(err, "interview")) {
      toast.error(
        err.response?.data?.message ||
          "Failed to start interview. Please try again."
      );
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 sm:space-y-6">
      
      <div className="mb-6 ml-2">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Start Mock Interview
        </h1>
        <p className="text-sm text-muted-foreground">
          Select one of your analyzed CVs to start a tailored AI interview
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
        
        <div className="space-y-3">
          <label className="block text font-bold text-foreground ml-1 mb-4">
            Select CV Analysis Profile
          </label>

          {fetchingAnalyses ? (
            <div className="flex items-center gap-2 text-muted-foreground text-xs py-8 justify-center border border-dashed border-border rounded-md">
              <Loader2 className="animate-spin w-5 h-5 text-brand-primary" />
              Loading your analysis history...
            </div>
          ) : analysesList.length === 0 ? (
            <div className="text-sm text-muted-foreground p-8 border border-dashed border-border rounded-md text-center">
              No CV analyses found. Please analyze a CV first.
              <button 
                onClick={() => navigate("/new-analysis")}
                className="block mx-auto mt-3 text-brand-primary font-semibold hover:underline"
              >
                + Create New Analysis
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {analysesList.map((analysis) => {
                const isSelected = selectedAnalysis?._id === analysis._id;
                const jobTitle = analysis.jobId?.title || "Targeted Job Role";
                const fileName = analysis.cvId?.fileName || "Uploaded_Resume.pdf";
                const matchScore = analysis.matchScore ?? 0;

                return (
                  <div
                    key={analysis._id}
                    onClick={() => setSelectedAnalysis(analysis)}
                    className={`p-4 border rounded-xl cursor-pointer flex items-center justify-between transition-all duration-200 gap-3 ${
                      isSelected
                        ? "border-brand-primary bg-secondary"
                        : "border-border bg-card hover:border-brand-primary/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-lg transition-colors flex items-center justify-center ${isSelected ? 'bg-brand-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                        <BarChart3 size={18} />
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground text-[15px]">
                          {jobTitle}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-normal mt-0.5 flex-wrap">
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
                          <span className="text-status-success font-semibold bg-status-success/10 px-1.5 py-0.5 rounded">
                            Match: {matchScore}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <input 
                      type="radio" 
                      name="analysis-selection" 
                      checked={isSelected} 
                      onChange={() => setSelectedAnalysis(analysis)} 
                      className="h-5 w-5 accent-brand-primary cursor-pointer flex-shrink-0"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-secondary/50 border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="text-brand-primary mt-0.5 flex-shrink-0">
            <Sparkles size={16} />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The AI will instantly extract the context of your selected CV analysis profile to trigger specific interview questions. Each of your responses during the interview will be scored from 1 to 10.
          </p>
        </div>

        <button
          onClick={handleStartTrigger} 
          disabled={loading || fetchingAnalyses || !selectedAnalysis}
          className="w-full cursor-pointer bg-brand-primary text-primary-foreground py-4 rounded-xl font-bold hover:bg-brand-primary-hover disabled:opacity-50 transition-all shadow-lg flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="animate-spin w-4 h-4 text-white" />}
          Start AI Mock Interview 
        </button>
      </div>

      <ConfirmModal
        open={startConfirmOpen}
        onClose={() => setStartConfirmOpen(false)}
        title="Ready to Start?"
        message={`You are about to start a live interview for "${selectedAnalysis?.jobId?.title || 'Targeted Job Role'}". Make sure you have enough time to finish your answers.`}
        confirmLabel="Start Interview"
        cancelLabel="Cancel"
        confirmVariant="default"
        onConfirm={confirmStartInterview}
      />

      {upgradeModal}
    </div>
  );
}