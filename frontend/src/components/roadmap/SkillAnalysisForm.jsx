/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { getAnalyses, postRoadmap } from '../../services/roadmapService';
import { useNavigate } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';
import { usePlanLimitModal } from '@/hooks/usePlanLimitModal';

export default function SkillAnalysisForm() {
  const { handleError, modal: upgradeModal } = usePlanLimitModal();
  const [analyses, setAnalyses] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [commitment, setCommitment] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getAnalyses().then(res => {
      const data = res.data?.data || [];
      const formatted = data.map(item => ({
        id: item._id,
        title: item.jobId?.title || "Targeted Job Role",
        version: `v${item.version || 1}`,
        date: new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      }));
      setAnalyses(formatted);
    }).catch(err => console.error("Error:", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedId || !commitment) return;
    
    setLoading(true);
    try {
      const payload = {
        analysisId: selectedId,
        hoursPerWeek: Number(commitment)
      };

      const response = await postRoadmap(payload);
      
      console.log("Roadmap API Success:", response.data);

      const newRoadmapId = response.data?._id || response.data?.data?._id; 
      if (newRoadmapId) {
        navigate(`/roadmap/result/${newRoadmapId}`); 
      }
    //   navigate('/roadmap-view'); 
    } catch (err) {
      if (!handleError(err, "roadmap")) {
        console.error("Submission failed - Server Response:", err.response?.data || err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <label className="block text-sm font-medium text-foreground ml-1">
          Select from your AI-Analyzed Skillsets
        </label>
        
        {analyses.length > 0 ? (
          analyses.map((item) => (
            <div 
              key={item.id} 
              onClick={() => setSelectedId(item.id)}
              className={`p-4 border rounded-xl cursor-pointer flex items-center justify-between transition-all duration-200 ${
                selectedId === item.id 
                  ? 'border-brand-primary bg-secondary' 
                  : 'border-border bg-card hover:border-brand-primary/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${selectedId === item.id ? 'bg-brand-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                  <BarChart3 size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">
                    {item.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {item.version} • {selectedId === item.id ? 'Active' : 'Inactive'} • {item.date}
                  </span>
                </div>
              </div>

              
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedId === item.id ? 'border-brand-primary' : 'border-border'
              }`}>
                {selectedId === item.id && <div className="w-2.5 h-2.5 bg-brand-primary rounded-full" />}
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center border-2 border-dashed border-border rounded-xl bg-card">
            <p className="text-muted-foreground">No analyses found. Please run an analysis first.</p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground ml-1">
          Daily Study Commitment
        </label>
        <input 
          className="w-full bg-input-background border border-border p-4 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all" 
          placeholder="Enter hours per day (e.g., 2 hours)" 
          value={commitment}
          onChange={(e) => setCommitment(e.target.value)} 
        />
      </div>
      
      <button 
        type="submit"
        disabled={loading || !selectedId} 
        className="w-full bg-brand-primary text-primary-foreground py-4 rounded-xl font-bold hover:bg-brand-primary-hover disabled:opacity-50 transition-all shadow-lg"
      >
        {loading ? 'Generating...' : 'Generate AI Roadmap'}
      </button>

      {upgradeModal}
    </form>
  );
}