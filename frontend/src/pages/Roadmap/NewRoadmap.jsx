import { useState } from 'react';
import SkillAnalysisForm from '../../components/roadmap/SkillAnalysisForm';
import RoleTransformationForm from '../../components/roadmap/RoleTransformationForm';

const NewRoadmap = () => {
    const [activeTab, setActiveTab] = useState('skill');
    return (
    <div className="p-8 max-w-3xl mx-auto bg-background min-h-screen text-foreground">
        <h1 className="text-2xl font-bold mb-2">Generate New Roadmap</h1>
        <p className="text-muted-foreground mb-6">Tell the AI where you are and where you want to go</p>

        {/* Tabs Header */}
        <div className="flex bg-muted p-1 rounded-lg w-full mb-6 border border-border">
        <button
            onClick={() => setActiveTab('skill')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === 'skill' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'
            }`}
        >
            Skill Analysis
        </button>
        <button
            onClick={() => setActiveTab('role')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === 'role' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'
            }`}
        >
            Role Transformation
        </button>
        </div>

        {/* Content Area */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
        {activeTab === 'skill' ? <SkillAnalysisForm /> : <RoleTransformationForm />}
        </div>
    </div>
    )
}

export default NewRoadmap