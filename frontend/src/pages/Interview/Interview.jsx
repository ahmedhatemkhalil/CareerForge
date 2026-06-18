import { useState, useEffect } from "react";
import { Plus, Calendar, Clock, ChevronRight, Play, Loader2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { interviewService } from "../../services/interviewService"; 
import ConfirmModal from "@/components/common/ConfirmModal"; // تأكدي من صحة مسار المودال لديكِ

export default function Interview() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  
  // حالات المودال المضافة
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setLoading(true);
        const data = await interviewService.getAllInterviews();
        setSessions(Array.isArray(data) ? data : data.sessions || []);
      } catch (error) {
        console.error("Error fetching interviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  // فتح المودال وتحديد الجلسة المراد حذفها
  const handleDeleteTrigger = (id, e) => {
    e.stopPropagation(); 
    setSelectedSessionId(id);
    setConfirmOpen(true);
  };

  // تنفيذ الحذف الفعلي من داخل المودال
  const confirmDelete = async () => {
    if (!selectedSessionId) return;
    try {
      setDeleteLoading(true);
      if (interviewService.deleteInterview) {
        await interviewService.deleteInterview(selectedSessionId);
      }
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

  return (
    <div className="p-6 max-w-5xl mx-auto font-sans text-gray-800 antialiased bg-slate-50/30 min-h-screen">
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-[#0f172a] tracking-tight">Mock Interviews</h1>
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
              const rawDate = item.date || item.createdAt || item.updatedAt || new Date();
              const formattedDate = new Date(rawDate).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              });

              let cvName = item.fileName || item.resumeName || item.resume || item.cvName || item.jobDescription || "Elaf_Saad_Resume.pdf";
              if (typeof cvName === 'string' && cvName.includes('/')) {
                cvName = cvName.split('/').pop();
              }

              const radius = 20;
              const circumference = 2 * Math.PI * radius;
              const scoreValue = isCompleted ? (item.score || 0) : 40; 
              const strokeDashoffset = circumference - (scoreValue / 100) * circumference;

              return (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-5 hover:bg-slate-50/40 transition-all group relative cursor-pointer"
                  onClick={() => navigate(`/interview/${item._id}`)} 
                >
                  <div className="flex items-start gap-4">
                    <div className="relative w-11 h-11 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="22" cy="22" r={radius} className="stroke-gray-100" strokeWidth="3" fill="transparent" />
                        <circle
                          cx="22"
                          cy="22"
                          r={radius}
                          stroke={isCompleted ? (item.score >= 80 ? "#10b981" : "#f59e0b") : "#f59e0b"} 
                          strokeWidth="3"
                          fill="transparent"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          style={{ strokeDasharray: !isCompleted ? "4 2" : circumference }} 
                          className="transition-all duration-500 ease-out"
                        />
                      </svg>
                      <span className="absolute font-bold text-xs text-gray-800">
                        {isCompleted ? `${item.score}%` : `${item.score || 0}%`}
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
                            <span className={`text-[11px] px-2 py-0.5 font-medium rounded-md border ${item.score >= 80 ? "border-emerald-100 bg-emerald-50 text-emerald-600" : "border-blue-100 bg-blue-50 text-blue-600"}`}>
                              {item.matchStatus || (item.score >= 80 ? "Strong Yes" : "Yes")}
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
                        {isCompleted && cvName && (
                          <span className="text-gray-400 truncate max-w-[250px] ml-1">
                            {cvName}
                          </span>
                        )}
                      </div>

                      {!isCompleted && cvName && (
                        <div className="text-xs text-gray-400 font-normal mt-1 block">
                          {cvName}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                    {!isCompleted && (
                      <button 
                        onClick={() => navigate(`/interview/${item._id}`)}
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

      {/* مودال تأكيد الحذف */}
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