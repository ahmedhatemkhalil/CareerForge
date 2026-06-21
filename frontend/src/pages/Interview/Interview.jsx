import { useState, useEffect } from "react";
import { Plus, Calendar, ChevronRight, Play, Loader2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { interviewService } from "../../services/interviewService"; 
import ConfirmModal from "@/components/common/ConfirmModal"; 

export default function Interview() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({ avgScore: 0, bestScore: 0 });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setLoading(true);
        const resData = await interviewService.getAllInterviews();
        const interviewList = Array.isArray(resData) ? resData : resData.data || [];
        setSessions(interviewList);

        const completedSessions = interviewList.filter(s => s.status === "Completed");
        if (completedSessions.length > 0) {
          const scores = completedSessions.map(s => s.score || 0);
          const total = scores.reduce((sum, score) => sum + score, 0);
          setStats({
            avgScore: Math.round(total / scores.length),
            bestScore: Math.max(...scores)
          });
        }
      } catch (error) {
        console.error("Error fetching interviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  const handleDeleteTrigger = (id, e) => {
    e.stopPropagation(); 
    setSelectedSessionId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedSessionId) return;
    try {
      setDeleteLoading(true);
      await interviewService.deleteInterview(selectedSessionId);
      setSessions(sessions.filter((session) => session._id !== selectedSessionId));
      setConfirmOpen(false);
      setSelectedSessionId(null);
    } catch (error) {
      console.error("Error deleting interview:", error);
      alert("Failed to delete the interview session.");
    } finally {
      setDeleteLoading(false);
    }
  };

 const handleRowClick = (item) => {
  if (item.status === "Completed") {
    navigate(`/interview/${item._id}/result`); // 👈 اتأكدي إنها مكتوبة كده بالظبط
  } else {
    navigate(`/live-interview/${item._id}`);
  }
};

  return (
    <div className="p-6 max-w-5xl mx-auto font-sans text-gray-800 antialiased bg-slate-50/30 min-h-screen">
      
   
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-[#0f172a] tracking-tight">Mock Interviews</h1>
          {sessions.length > 0 && (
            <p className="text-xs text-gray-400 font-medium mt-1">
              {sessions.length} sessions - Avg score {stats.avgScore}% - Best {stats.bestScore}%
            </p>
          )}
        </div>
        <button
          onClick={() => navigate("/new-interview")}
          className="flex items-center gap-2 bg-[#4f46e5] hover:bg-[#4338ca] text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all duration-200"
        >
          <Plus size={16} strokeWidth={2.5} />
          Start New Interview
        </button>
      </div>

  
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-[#0f172a]">Session History</h2>
          <span className="text-xs font-semibold text-gray-400">{sessions.length} records</span>
        </div>

        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="flex h-48 items-center justify-center text-indigo-600">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              No interview sessions found.
            </div>
          ) : (
            sessions.map((item) => {
              const isCompleted = item.status === "Completed";
              const rawDate = item.interviewDate || new Date();
              const formattedDate = new Date(rawDate).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              });

              const radius = 20;
              const circumference = 2 * Math.PI * radius;
              const currentScore = item.score || 0;
              const totalQuestions = item.totalQuestions || 5;
              const answeredQuestions = item.answeredQuestions || 0;
              
              const percentage = isCompleted ? currentScore : (answeredQuestions / totalQuestions) * 100;
              const strokeDashoffset = circumference - (percentage / 100) * circumference;

              return (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-5 hover:bg-slate-50/40 transition-all group relative cursor-pointer"
                  onClick={() => handleRowClick(item)} 
                >
                  <div className="flex items-start gap-4">
                    <div className="relative w-11 h-11 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="22" cy="22" r={radius} className="stroke-gray-100" strokeWidth="3" fill="transparent" />
                        <circle
                          cx="22"
                          cy="22"
                          r={radius}
                          stroke={isCompleted ? (currentScore >= 80 ? "#10b981" : "#f59e0b") : "#f59e0b"} 
                          strokeWidth="3"
                          fill="transparent"
                          strokeDasharray={isCompleted ? circumference : "4, 2"}
                          strokeDashoffset={isCompleted ? strokeDashoffset : 0}
                          strokeLinecap="round"
                          className="transition-all duration-500 ease-out"
                        />
                      </svg>
                      <span className="absolute font-bold text-xs text-gray-800">
                        {isCompleted ? `${currentScore}%` : `${answeredQuestions}/${totalQuestions}`}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-[#1e293b] text-[15px] tracking-tight group-hover:text-[#4f46e5] transition duration-150">
                          {item.jobTitle || "Job Title"}
                        </h3>
                        
                        {isCompleted ? (
                          <>
                            <span className="text-[11px] px-2 py-0.5 font-medium rounded-md border border-emerald-100 bg-emerald-50 text-emerald-600 flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-emerald-500"></span> Completed
                            </span>
                            <span className={`text-[11px] px-2 py-0.5 font-medium rounded-md border ${currentScore >= 80 ? "border-emerald-100 bg-emerald-50 text-emerald-600" : "border-blue-100 bg-blue-50 text-blue-600"}`}>
                              {item.hiringRecommendation || (currentScore >= 80 ? "Strong Yes" : "Yes")}
                            </span>
                          </>
                        ) : (
                          <span className="text-[11px] px-2 py-0.5 font-medium rounded-md border border-amber-100 bg-amber-50 text-amber-600 flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse"></span> In Progress
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs font-normal text-gray-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar size={13} className="text-gray-300" />
                          {formattedDate}
                        </span>

                        {item.cvName && (
                          <span className="text-gray-400 truncate max-w-[250px] border-l border-gray-200 pl-3">
                            {item.cvName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                    {!isCompleted && (
                      <button 
                        onClick={() => navigate(`/live-interview/${item._id}`)}
                        className="flex items-center gap-1.5 px-3 py-1 bg-[#4f46e5] text-white hover:bg-[#4338ca] font-semibold text-xs rounded-lg shadow-sm transition-all"
                      >
                        <Play size={10} fill="currentColor" /> Resume
                      </button>
                    )}
                    
                    <button
                      onClick={(e) => handleDeleteTrigger(item._id, e)}
                      className="text-gray-300 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                      title="Delete Interview"
                    >
                      <Trash2 size={15} />
                    </button>

                    <ChevronRight className="text-gray-300 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all duration-150" size={16} />
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
          setSelectedSessionId(null);
        }}
        title="Delete Interview Session"
        message="Are you sure you want to delete this interview session? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="destructive"
        onConfirm={confirmDelete}
        isLoading={deleteLoading}
      />
    </div>
  );
}