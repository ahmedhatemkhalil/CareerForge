import { useEffect, useState } from "react";
import { FileText, Calendar, Plus, ChevronRight, Trash2, Loader2} from "lucide-react";
import { getAllCVs, getAllAnalyses, deleteCV, getAllJobs } from "../../services/cvService";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../../components/common/ConfirmModal";
export default function Analyze() {
  const [confirmOpen, setConfirmOpen] = useState(false);
const [selectedCvId, setSelectedCvId] = useState(null);
const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState([]);
  const [cvList, setCvList] = useState([]); 
  const [jobList, setJobList] = useState([]); 
  const [stats, setStats] = useState({ total: 0, avgScore: 0, bestScore: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalysesData = async () => {
    try {
      setLoading(true);

      const [analysesRes, cvsRes] = await Promise.all([
        getAllAnalyses(),
        getAllCVs()
      ]);
console.log("analysesRes =", analysesRes);
      // 1. استخراج الـ CVs المرفوعة
      let fetchedCvs = [];
      if (cvsRes) {
        if (Array.isArray(cvsRes)) fetchedCvs = cvsRes;
        else if (cvsRes.success && Array.isArray(cvsRes.data)) fetchedCvs = cvsRes.data;
        else if (cvsRes.data && typeof cvsRes.data === 'object') {
          fetchedCvs = cvsRes.data.cvs || cvsRes.data.resumes || cvsRes.data.data || Object.values(cvsRes.data).find(Array.isArray) || [];
        }
        setCvList(fetchedCvs);
      }

      // 2. استخراج التحليلات الجاهزة
      let fetchedAnalyses = [];
      if (analysesRes) {
        if (Array.isArray(analysesRes)) fetchedAnalyses = analysesRes;
        else if (analysesRes.success && Array.isArray(analysesRes.data)) fetchedAnalyses = analysesRes.data;
        else if (analysesRes.data && typeof analysesRes.data === 'object') {
          fetchedAnalyses = analysesRes.data.analyses || analysesRes.data.data || Object.values(analysesRes.data).find(Array.isArray) || [];
        }
      }
console.log("CVs:", fetchedCvs);
console.log("Analyses:", fetchedAnalyses);
      // 3. الربط المرن بين الـ CV والتحليل الخاص به
      const formatted = fetchedCvs.map((cv) => {
        // فحص ومقارنة المعرفات بأكثر من طريقة لضمان مطابقة الـ Backend
       // استبدل الـ matching block ده كله
// استبدل الـ matchingAnalysis بالكود ده
const matchingAnalysis = fetchedAnalyses.find((a) => {
  const cvId = String(cv._id || cv.id || "");

  const analysisCvId =
    a.cvId?._id ||
    a.cvId?.id ||
    a.cvId ||
    a.cv?._id ||
    a.cv ||
    a.resumeId?._id ||
    a.resumeId ||
    "";

  return String(analysisCvId) === cvId;
});

        // استخراج السكور المتاح
   const score = matchingAnalysis
  ? parseInt(
      matchingAnalysis.matchScore ??
      matchingAnalysis.atsScore ??
      matchingAnalysis.score ??
      0,
      10
    )
  : 0;

let jobTitle = "Targeted Job Role";
if (matchingAnalysis) {
  jobTitle = matchingAnalysis.jobId?.title || 
             matchingAnalysis.jobTitle || 
             "Targeted Job Role";
}
console.log("Found Analysis?", !!matchingAnalysis);
if (matchingAnalysis) {
  console.log("Analysis Data:", {
    cvId: matchingAnalysis.cvId,
    score: matchingAnalysis.atsScore || matchingAnalysis.matchScore || matchingAnalysis.score,
    jobTitle: matchingAnalysis.jobTitle || matchingAnalysis.jobId?.title
  });
}else if (cv.fileName) {
  const fileName = cv.fileName?.toLowerCase() || "";

  if (fileName.includes("frontend")) {
    jobTitle = "Frontend Developer";
  } else if (fileName.includes("react")) {
    jobTitle = "React Developer";
  } else if (
    fileName.includes("fullstack") ||
    fileName.includes("resume")
  ) {
    jobTitle = "Full Stack Developer";
  }
}
console.log("CV ID:", cv._id);
console.log("Matching Analysis:", matchingAnalysis);
  return {
  _id: cv._id || cv.id,
  analysisId: matchingAnalysis?._id || null,
  jobTitle,
  matchScore: score,
  fileName: cv.fileName || "Uploaded_Resume.pdf",
  version: cv.version || 1,
  hasAnalysis: !!matchingAnalysis,
  analysisDate: cv.createdAt
    ? new Date(cv.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Uploaded Recently",
};
}); // إغلاق الـ map



      setAnalyses(formatted);
      
      // حساب الإحصائيات العلوية بناءً على الملفات التي تملك سكور حقيقي فقط
      const analysesWithScores = formatted.filter(item => item.hasAnalysis && item.matchScore > 0);
      const total = analysesWithScores.length;
      const avgScore = total > 0 ? Math.round(analysesWithScores.reduce((acc, item) => acc + item.matchScore, 0) / total) : 0;
      const bestScore = total > 0 ? Math.max(...analysesWithScores.map(item => item.matchScore)) : 0;

      setStats({ total, avgScore, bestScore });

    }catch (err) {
      console.error("Error loading CV data:", err);
      setError("Failed to sync CV analyses history.");
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
      console.log(JSON.stringify(analyses, null, 2));
    try {
      const response = await getAllJobs();
      const jobs = response?.jobs || response?.data?.jobs || response?.data || response || [];
      setJobList(Array.isArray(jobs) ? jobs : []);
    } catch (err) {
      setJobList([]);
    }
  };

  useEffect(() => {
    fetchAnalysesData();
    fetchJobs();
  }, []);

 


  const handleDelete = async (cvId, e) => {
  e.stopPropagation();
  setSelectedCvId(cvId);
  setConfirmOpen(true);

};
const confirmDelete = async () => {
  if (!selectedCvId) return;

  try {
    setDeleteLoading(true);

    await deleteCV(selectedCvId);

    await fetchAnalysesData();

    setConfirmOpen(false);
    setSelectedCvId(null);
  } catch (err) {
    console.error("Delete failed:", err);
  } finally {
    setDeleteLoading(false);
  }
};
  const getScoreStyles = (score, hasAnalysis) => {
    if (!hasAnalysis || score === 0) {
      return {
        text: "text-gray-400",
        stroke: "#e5e7eb",
        badge: "bg-gray-100 text-gray-500 border-gray-200",
        label: "No analysis yet"
      };
    }
    if (score >= 80) {
      return { 
        text: "text-emerald-500", 
        stroke: "#10b981", 
        badge: "bg-emerald-50 text-emerald-700 border-emerald-100", 
        label: "Strong match" 
      };
    } else if (score >= 65) {
      return { 
        text: "text-amber-500", 
        stroke: "#f59e0b", 
        badge: "bg-amber-50 text-amber-700 border-amber-100", 
        label: "Moderate match" 
      };
    } else {
      return { 
        text: "text-rose-500", 
        stroke: "#ef4444", 
        badge: "bg-rose-50 text-rose-700 border-rose-100", 
        label: "Low match" 
      };
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-indigo-600">
        <Loader2 className="w-9 h-9 animate-spin" />
      </div>
    );
  }

  if (error) return <div className="p-6 text-red-500 text-center font-medium">{error}</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto font-sans text-gray-800 antialiased">
      
      {/* Top Counters Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">CV Analysis</h1>
          <p className="text-sm text-gray-500 mt-1.5 font-medium">
            {stats.total} analyses · Avg score {stats.avgScore}% · Best {stats.bestScore}%
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

      {/* Main History Box */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-50">
          <h2 className="text-xl font-bold text-gray-900">Analysis History</h2>
          <span className="text-sm font-semibold text-gray-400">{analyses.length} records</span>
        </div>

        <div className="divide-y divide-gray-50">
          {analyses.length === 0 ? (
            <p className="text-center text-gray-400 py-12 font-medium">No CVs uploaded yet.</p>
          ) : (
            analyses.map((item) => {
              const score = item.matchScore || 0;
              const styles = getScoreStyles(score, item.hasAnalysis);
              
              const radius = 22;
              const circumference = 2 * Math.PI * radius;
              const strokeDashoffset = circumference - (score / 100) * circumference;

              return (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-5 hover:bg-slate-50/50 transition-all group relative"
                >
                  <div className="flex items-center gap-5">
                    {/* Circle Indicator */}
                    <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="24" cy="24" r={radius} className="stroke-gray-100" strokeWidth="4" fill="transparent" />
                        <circle
                          cx="24" cy="24" r={radius}
                          stroke={styles.stroke} strokeWidth="4" fill="transparent"
                          strokeDasharray={circumference}
                          strokeDashoffset={item.hasAnalysis && score > 0 ? strokeDashoffset : circumference}
                          strokeLinecap="round"
                          className="transition-all duration-500 ease-out"
                        />
                      </svg>
                      <span className={`absolute font-bold text-xs ${styles.text}`}>
                        {item.hasAnalysis && score > 0 ? `${score}` : "-"}
                      </span>
                    </div>

                    {/* Meta Info */}
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="font-bold text-gray-800 text-base tracking-tight group-hover:text-indigo-600 transition duration-150">
                          {item.jobTitle}
                        </h3>
                        <span className={`text-[11px] px-2.5 py-0.5 font-bold rounded-full border ${styles.badge}`}>
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

                  {/* Actions buttons */}
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={(e) => handleDelete(item._id, e)}
                      className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-150"
                      title="Delete entry"
                    >
                      <Trash2 size={16} />
                    </button>
                    <ChevronRight className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all duration-150" size={18} />
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
    setSelectedCvId(null);
  }}
  title="Delete CV"
  message="Are you sure you want to delete this CV and its analysis history? This action cannot be undone."
  confirmLabel="Delete"
  cancelLabel="Cancel"
  confirmVariant="destructive"
  onConfirm={confirmDelete}
  isLoading={deleteLoading}
/>
    
    </div>
  );
}