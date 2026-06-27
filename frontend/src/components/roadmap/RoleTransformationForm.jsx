import { useState } from 'react';
import { postRoadmap } from '../../services/roadmapService';
import { useNavigate } from 'react-router-dom';
import { usePlanLimitModal } from '@/hooks/usePlanLimitModal';
import WeeklyCommitmentSlider, { DEFAULT_WEEKLY_HOURS } from './WeeklyCommitmentSlider';

export default function RoleTransformationForm() {
  const { handleError, modal: upgradeModal } = usePlanLimitModal();
  const [form, setForm] = useState({ currentRole: '', targetRole: '' });
  const [hoursPerWeek, setHoursPerWeek] = useState(DEFAULT_WEEKLY_HOURS);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.currentRole.trim() || !form.targetRole.trim()) return;

    setLoading(true);
    try {
      const payload = {
        currentRole: form.currentRole,
        targetRole: form.targetRole,
        hoursPerWeek,
      };

      const response = await postRoadmap({ type: 'role', ...payload });
      console.log("Role Roadmap Success:", response.data);
      const newRoadmapId = response.data?._id || response.data?.data?._id;
      if (newRoadmapId) {
        navigate(`/roadmap/result/${newRoadmapId}`);
      }
    } catch (err) {
      if (!handleError(err, "roadmap")) {
        console.error("Submission failed:", err.response?.data || err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {[
        { name: 'currentRole', label: 'Your Current Role' },
        { name: 'targetRole', label: 'Your Target Role' },
      ].map((field) => (
        <div key={field.name} className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">{field.label}</label>
          <input
            className="w-full bg-input-background border border-border p-3 rounded-lg text-foreground outline-none focus:ring-2 focus:ring-brand-primary"
            placeholder={`e.g. ${field.label}`}
            value={form[field.name]}
            onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
          />
        </div>
      ))}

      <WeeklyCommitmentSlider
        value={hoursPerWeek}
        onChange={setHoursPerWeek}
      />
      <button 
        type="submit"
        disabled={loading || !form.currentRole.trim() || !form.targetRole.trim()}
        className="w-full bg-brand-primary text-primary-foreground py-3 rounded-lg mt-4 font-bold hover:bg-brand-primary-hover disabled:opacity-50"
      >
        {loading ? 'Generating...' : 'Generate AI Roadmap'}
      </button>

      {upgradeModal}
    </form>
  );
}