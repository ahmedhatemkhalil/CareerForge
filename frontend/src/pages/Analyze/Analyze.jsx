/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import {
  FileText,
  Calendar,
  ChevronRight,
  Trash2,
  Plus
} from "lucide-react";
import { getAllAnalyses, deleteAnalysis } from "../../services/analysisService";
import { Link, useNavigate } from "react-router-dom";
import ConfirmModal from "../../components/common/ConfirmModal";
import { getScoreStyles, formatAnalysisDate} from "../../utils/helpers";
import HistoryListSkeleton from "@/components/common/HistoryListSkeleton";
import EmptyAnalysisState from "@/components/Analysis/EmptyAnalysisState";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-hot-toast";


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

  const totalAnalysis = analyses.length;

  const handleDelete = (analysisId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedAnalysisId(analysisId);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedAnalysisId) return;
    setDeleteLoading(true);
    try {
      await deleteAnalysis(selectedAnalysisId);
      const remaining = analyses.filter((item) => item._id !== selectedAnalysisId);
      setAnalyses(remaining);
      const withScores = remaining.filter((item) => item.matchScore > 0);
      setStats({
        total: withScores.length,
        avgScore: withScores.length ? Math.round(withScores.reduce((s, i) => s + i.matchScore, 0) / withScores.length) : 0,
        bestScore: withScores.length ? Math.max(...withScores.map((i) => i.matchScore)) : 0
      });
      setConfirmOpen(false);
      setSelectedAnalysisId(null);
      toast.success("Analysis record deleted successfully!");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Could not delete the analysis. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (error) {
    return (
      <div className="p-6 text-red-500 text-center font-medium">{error}</div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            CV Analysis
          </h1>
          <div className="text-sm text-muted-foreground font-medium">
            {loading ? (
              <Skeleton className="h-4 w-64 mt-1" />
            ) : totalAnalysis > 0 ? (
              `${totalAnalysis} analyses · Avg score ${stats.avgScore}% · Best ${stats.bestScore}%`
            ) : (
              "No analyses completed yet"
            )}
          </div>
        </div>
        <Button
          onClick={() => navigate("/new-analysis")}
          className="bg-brand-primary hover:bg-brand-primary/90 text-white font-medium inline-flex items-center gap-2 rounded-xl p-5 shadow-xs cursor-pointer w-full sm:w-fit"
        >
          <Plus className="size-4" />
          New Analysis
        </Button>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border bg-card">
          <h2 className="text-lg font-bold tracking-tight">Analysis History</h2>
          <span className="text-xs font-semibold text-muted-foreground uppercase bg-muted/50 px-2.5 py-1 rounded-md">
            {totalAnalysis} records
          </span>
        </div>
        <div>
          {loading ? (
            <HistoryListSkeleton />
          ) : totalAnalysis === 0 ? (
            <EmptyAnalysisState />
          ) : (
            <div className="divide-y divide-border">
              {analyses.map((item) => {
                const currentScore = item.matchScore || 0;
                const scoreStyle = getScoreStyles(currentScore);

                return (
                  <Link
                    key={item._id}
                    to={`/analyze/results/${item._id}`}
                    className="flex flex-col sm:flex-row items-center justify-between p-5 gap-4 hover:bg-muted/30 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-start sm:items-center gap-5 w-full sm:w-auto">
                      {/* Circular Progress Indicators */}
                      <div className="relative size-14 shrink-0 flex items-center justify-center font-bold">
                        <CircularProgressbar
                          value={currentScore}
                          text={`${currentScore}%`}
                          styles={buildStyles({
                            textSize: '24px',
                            textColor: 'currentColor',
                            pathColor: scoreStyle.stroke,
                            trailColor: 'var(--muted)', 
                            strokeLinecap: 'round',
                            pathTransitionDuration: 0.5,
                          })}
                        />
                      </div>

                      {/* Info Metadata */}
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-base text-foreground group-hover:text-brand-primary transition-colors">
                            {item.jobTitle}
                          </h3>
                          <Badge className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${scoreStyle.badge}`}>
                            {scoreStyle.label}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-start sm:items-center gap-1">
                            <FileText className="size-3.5" />
                            CV: {item.fileName}
                          </span>
                          <span className="hidden sm:inline text-muted/60">•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3.5" />
                            {item.analysisDate}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end border-t sm:border-none pt-3 sm:pt-0">
                      <button 
                        type="button"
                        onClick={(e) => handleDelete(item._id, e)}
                        className="p-2 text-status-error/70 hover:text-status-error hover:bg-status-error/10 rounded-xl transition-all opacity-100 sm:opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="Delete Analysis"
                      >
                        <Trash2 className="size-4.5" />
                      </button>
                      
                      <div className='p-2 hover:bg-primary/10 rounded-xl group-hover:translate-x-1 transition-transform text-muted-foreground'>
                        <ChevronRight className="size-4.5"/>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
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
        message="Are you sure you want to delete this CV analysis? This action will permanently remove your data evaluation metrics and cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="destructive"
        onConfirm={confirmDelete}
        isLoading={deleteLoading}
      />
    </div>
  );
}
