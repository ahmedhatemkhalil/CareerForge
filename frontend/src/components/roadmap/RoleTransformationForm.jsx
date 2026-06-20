import { useState } from 'react';
import { postRoadmap } from '../../services/roadmapService';

export default function RoleTransformationForm() {
  const [form, setForm] = useState({ currentRole: '', targetRole: '', commitment: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.currentRole || !form.targetRole || !form.commitment) return;

    setLoading(true);
    try {
      // تعديل الـ payload ليتطابق مع ما يتوقعه الـ API
      const payload = {
        currentRole: form.currentRole,
        targetRole: form.targetRole,
        // تأكدي من اسم الحقل الخاص بالساعات، إذا كان API الرول مختلف عن API السكيل:
        hoursPerWeek: Number(form.commitment) 
      };

      const response = await postRoadmap({ type: 'role', ...payload });
      console.log("Role Roadmap Success:", response.data);
      // أضيفي هنا navigate('/roadmap-view') إذا أردتِ التوجيه
    } catch (err) {
      console.error("Submission failed:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {[ 
        {name:'currentRole', label:'Current Role'}, 
        {name:'targetRole', label:'Target Role'}, 
        {name:'commitment', label:'Weekly Study Commitment'} 
      ].map(field => (
        <div key={field.name} className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">{field.label}</label>
          <input 
            className="w-full bg-input-background border border-border p-3 rounded-lg text-foreground outline-none focus:ring-2 focus:ring-brand-primary"
            placeholder={`e.g. ${field.label}`} 
            value={form[field.name]}
            onChange={e => setForm({...form, [field.name]: e.target.value})} 
          />
        </div>
      ))}
      <button 
        disabled={loading}
        className="w-full bg-brand-primary text-primary-foreground py-3 rounded-lg mt-4 font-bold hover:bg-brand-primary-hover disabled:opacity-50"
      >
        {loading ? 'Generating...' : '✨ Generate AI Roadmap'}
      </button>
    </form>
  );
}