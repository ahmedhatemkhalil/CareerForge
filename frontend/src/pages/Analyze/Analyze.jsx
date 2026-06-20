/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import {
  FileText,
  Calendar,
  Plus,
  ChevronRight,
  Trash2,
  Loader2,
} from "lucide-react";
import { getAllAnalyses, deleteAnalysis } from "../../../../analysisService";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../../components/common/ConfirmModal";
import { getScoreStyles } from "../../utils/helpers";

const formatAnalysisDate = (isoDate) => {
  if (!isoDate) return "Unknown date";
  const dateOnly = String(isoDate).split("T")[0];
  return new Date(`${dateOnly}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function Analyze() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState([]);
  const [stats, setStats] = useState({ total: 0, avgScore: 0, bestScore: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalysesData = async () => {
    try {
      setLoading(true);
      setError(null);

      const analysesRes = await getAllAnalyses();

      let fetchedAnalyses = [];
      if (Array.isArray(analysesRes)) {
        fetchedAnalyses = analysesRes;
      } else if (analysesRes?.success && Array.isArray(analysesRes.data)) {
        fetchedAnalyses = analysesRes.data;
      } else if (analysesRes?.data && typeof analysesRes.data === "object") {
        fetchedAnalyses =
          analysesRes.data.analyses ||
          analysesRes.data.data ||
          Object.values(analysesRes.data).find(Array.isArray) ||
          [];
      }

      const formatted = fetchedAnalyses.map((analysis) => ({
        _id: analysis._id,
        jobTitle: analysis.jobId?.title || "Targeted Job Role",
        matchScore: parseInt(analysis.matchScore ?? 0, 10),
        fileName: analysis.cvId?.fileName || "Uploaded_Resume.pdf",
        version: analysis.version || 1,
        hasAnalysis: true,
        analysisDate: formatAnalysisDate(analysis.createdAt),
      }));

      setAnalyses(formatted);

      const analysesWithScores = formatted.filter(
        (item) => item.matchScore > 0,
      );
      const total = analysesWithScores.length;
      const avgScore =
        total > 0
          ? Math.round(
              analysesWithScores.reduce(
                (acc, item) => acc + item.matchScore,
                0,
              ) / total,
            )
          : 0;
      const bestScore =
        total > 0
          ? Math.max(...analysesWithScores.map((item) => item.matchScore))
          : 0;

      setStats({ total, avgScore, bestScore });
    } catch (err) {
      console.error("Error loading CV data:", err);
      setError("Failed to sync CV analyses history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysesData();
  }, []);

  const handleDelete = (analysisId, e) => {
    e.stopPropagation();
    setSelectedAnalysisId(analysisId);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedAnalysisId) return;

    try {
      setDeleteLoading(true);
      await deleteAnalysis(selectedAnalysisId);
      await fetchAnalysesData();
      setConfirmOpen(false);
      setSelectedAnalysisId(null);
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleOpenAnalysis = (analysisId) => {
    navigate(`/analyze/results/${analysisId}`);
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-indigo-600">
        <Loader2 className="w-9 h-9 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500 text-center font-medium">{error}</div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto font-sans text-gray-800 antialiased">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            CV Analysis
          </h1>
          <p className="text-sm text-gray-500 mt-1.5 font-medium">
            {stats.total} analyses · Avg score {stats.avgScore}% · Best{" "}
            {stats.bestScore}%
          </p>
        </div>
        <button
          onClick={() => navigate("/new-analysis")}
          className="flex items-center gap-2 bg-sidebar-ring hover:bg-sidebar-ring text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all duration-200"
        >
          <Plus size={18} strokeWidth={2.5} />
          New Analysis
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-50">
          <h2 className="text-xl font-bold text-gray-900">Analysis History</h2>
          <span className="text-sm font-semibold text-gray-400">
            {analyses.length} records
          </span>
        </div>

        <div className="divide-y divide-gray-50">
          {analyses.length === 0 ? (
            <p className="text-center text-gray-400 py-12 font-medium">
              No analyses yet.
            </p>
          ) : (
            analyses.map((item) => {
              const score = item.matchScore || 0;
              const styles = getScoreStyles(score);

              const radius = 22;
              const circumference = 2 * Math.PI * radius;
              const strokeDashoffset =
                circumference - (score / 100) * circumference;

              return (
                <div
                  key={item._id}
                  onDoubleClick={() => handleOpenAnalysis(item._id)}
                  className="flex items-center justify-between p-5 hover:bg-slate-50/50 transition-all group relative cursor-pointer"
                >
                  <div className="flex items-center gap-5">
                    <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="24"
                          cy="24"
                          r={radius}
                          className="stroke-gray-100"
                          strokeWidth="4"
                          fill="transparent"
                        />
                        <circle
                          cx="24"
                          cy="24"
                          r={radius}
                          stroke={styles.stroke}
                          strokeWidth="4"
                          fill="transparent"
                          strokeDasharray={circumference}
                          strokeDashoffset={
                            score > 0 ? strokeDashoffset : circumference
                          }
                          strokeLinecap="round"
                          className="transition-all duration-500 ease-out"
                        />
                      </svg>
                      <span
                        className={`absolute font-bold text-xs ${styles.text}`}
                      >
                        {score > 0 ? `${score}` : "-"}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="font-bold text-gray-800 text-base tracking-tight group-hover:text-indigo-600 transition duration-150">
                          {item.jobTitle}
                        </h3>
                        <span
                          className={`text-[11px] px-2.5 py-0.5 font-bold rounded-full border ${styles.badge}`}
                        >
                          {styles.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-medium text-gray-400 mt-2">
                        <span className="flex items-center gap-1">
                          <FileText size={14} className="text-gray-400" />
                          {item.fileName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={14} className="text-gray-400" />
                          {item.analysisDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => handleDelete(item._id, e)}
                      onDoubleClick={(e) => e.stopPropagation()}
                      className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-150"
                      title="Delete analysis"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenAnalysis(item._id)}
                      className="p-1 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all duration-150"
                      title="View analysis details"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setSelectedAnalysisId(null);
        }}
        title="Delete Analysis"
        message="Are you sure you want to delete this analysis? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="destructive"
        onConfirm={confirmDelete}
        isLoading={deleteLoading}
      />
    </div>
  );
}
