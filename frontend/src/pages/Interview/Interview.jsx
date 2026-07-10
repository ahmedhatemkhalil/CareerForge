import { useState, useEffect } from "react";
import { Plus, Calendar, ChevronRight, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { interviewService } from "../../services/interviewService"; 
import ConfirmModal from "@/components/common/ConfirmModal"; 
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-hot-toast";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import HistoryListSkeleton from '@/components/common/HistoryListSkeleton';
import { getScoreStyles } from "../../utils/helpers";
import EmptyInterviewsState from "../../components/Interview/EmptyInterviewsState"; 

export default function Interview() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ avgScore: 0, bestScore: 0 });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setIsLoading(true);
        const res = await interviewService.getAllInterviews();
        const interviewList = res?.data?.data || res?.data || [];
        setSessions(interviewList);

        if (interviewList.length > 0) {
          const scores = interviewList.map(s => s.score || 0);
          const total = scores.reduce((sum, score) => sum + score, 0);
          setStats({
            avgScore: Math.round(total / scores.length),
            bestScore: Math.max(...scores)
          });
        }
      } catch (error) {
        console.error("Error fetching interviews:", error);
        const errorMessage = error.response?.data?.message || "Failed to load your interview history.";
        toast.error(errorMessage, { id: 'fetch-interviews-error' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  const totalSessions = sessions.length;

  const handleDeleteClick = (id, e) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    setSelectedSessionId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedSessionId) return;
    setDeleteLoading(true);
    try {
      await interviewService.deleteInterview(selectedSessionId);
      setSessions(prev => prev.filter((session) => session.id !== selectedSessionId));
      setConfirmOpen(false);
      setSelectedSessionId(null);
      toast.success("Interview session deleted successfully!");
    } catch (error) {
      console.error("Error deleting interview:", error);
      const errorMessage = error.response?.data?.message || "Could not delete the interview. Please try again.";
      toast.error(errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 sm:space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Mock Interviews</h1>
          <div className="text-sm text-muted-foreground font-medium">
            {isLoading ? (
              <Skeleton className="h-4 w-64 mt-1" />
            ) : totalSessions > 0 ? (
              `${totalSessions} sessions · Avg score ${stats.avgScore}% · Best ${stats.bestScore}%`
            ) : (
              "No interview sessions completed yet"
            )}
          </div>
        </div>
        <Button onClick={() => navigate("/new-interview")} className="bg-brand-primary hover:bg-brand-primary/90 text-white font-medium inline-flex items-center gap-2 rounded-xl p-5 shadow-xs cursor-pointer w-full sm:w-fit">
          <Plus className="size-4" />
          Start New Interview
        </Button>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border bg-card">
          <h2 className="text-lg font-bold tracking-tight">Session History</h2>
          <span className="text-xs font-semibold text-muted-foreground uppercase bg-muted/50 px-2.5 py-1 rounded-md">
            {totalSessions} records
          </span>
        </div>

        <div>
          {isLoading ? (
            <HistoryListSkeleton />
          ) : totalSessions === 0 ? (
            <EmptyInterviewsState />
          ) : (
            <div className="divide-y divide-border">
              {sessions.map((item) => {
                const currentScore = item.score || 0;
                const scoreStyle = getScoreStyles(currentScore);

                return (
                  <Link
                    key={item.id}
                    to={`/interview/${item.id}/result`}
                    className="flex flex-col sm:flex-row items-center justify-between p-5 gap-4 hover:bg-muted/30 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-start sm:items-center gap-5 w-full sm:w-auto">
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

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-base text-foreground group-hover:text-brand-primary transition-colors">
                            {item.jobTitle || "Job Title"}
                          </h3>

                          {item.hiringRecommendation && (
                            <Badge className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${scoreStyle.badge}`}>
                              {item.hiringRecommendation}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                          {item.cvName && <span className="">CV: {item.cvName}</span>}
                          {item.cvName && <span className="hidden sm:inline text-muted/60">•</span>}
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3.5" />
                            {formatDate(item.interviewDate)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Section */}
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end border-t sm:border-none pt-3 sm:pt-0">
                      <button 
                        type="button"
                        onClick={(e) => handleDeleteClick(item.id, e)}
                        className="p-2 text-status-error/70 hover:text-status-error hover:bg-status-error/10 rounded-xl transition-all opacity-100 sm:opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="Delete Interview"
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

      {/* Confirmation Dialog */}
      <ConfirmModal
        open={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setSelectedSessionId(null);
        }}
        title="Delete Interview Session"
        message="Are you sure you want to delete this interview session? This action will permanently remove your evaluation and cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="destructive" 
        onConfirm={handleConfirmDelete}
        isLoading={deleteLoading}
      />
    </div>
  );
}