import { useState, useEffect } from 'react';
import { useParams, Link } from "react-router-dom";
import { ChevronDown, ChevronUp, CheckCircle2, Circle, ArrowLeft, ExternalLink, Loader2 } from 'lucide-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Button } from "@/components/ui/button";
import { getRoadmapById, toggleWeekStatus } from '@/services/roadmapService'; 
import { toast } from "react-hot-toast";
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { getRoadmapProgressColor } from '@/utils/helpers';
const RoadmapResults = () => {
    const { id } = useParams(); 
    const [roadmap, setRoadmap] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openWeekId, setOpenWeekId] = useState(null); 
    const [updatingWeekId, setUpdatingWeekId] = useState(null); 

    useEffect(() => {
        const fetchRoadmap = async () => {
            try {
                setLoading(true);
                const data = await getRoadmapById(id);
                setRoadmap(data);
                
                if (data.weeks && data.weeks.length > 0) {
                    const firstIncomplete = data.weeks.find(w => !w.completed);
                    if (firstIncomplete) {
                        setOpenWeekId(firstIncomplete._id);
                    } else {
                        setOpenWeekId(data.weeks[0]._id);
                    }
                }
                setError(null);
            } catch (err) {
                console.error("Error fetching roadmap:", err);
                setError(err.response?.data?.message || "Failed to load the roadmap plan.");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchRoadmap();
    }, [id]);
    
    const totalCompletedWeeks = roadmap && roadmap.weeks ? roadmap.weeks.filter(w => w.completed).length : 0;
    const progressPercentage = roadmap ? roadmap.progress : 0; 
    
    const toggleWeek = (weekId) => {
        setOpenWeekId(openWeekId === weekId ? null : weekId);
    };

    const handleToggleWeekCompletion = async (week) => { 
        if (updatingWeekId) return;
        try {
            setUpdatingWeekId(week._id);
            const updatedRoadmap = await toggleWeekStatus(roadmap._id, week.weekNumber, week.completed);
            setRoadmap(updatedRoadmap);
        } catch (err) {
            console.error("Error updating week status:", err);
            toast.error('Could not update status. Please try again.'); 
        } finally {
            setUpdatingWeekId(null); 
        }
    };

    if (loading) {
        return (
            <LoadingSpinner/>
        );
    }

    if (error || !roadmap) {
        return (
            <div className="mx-auto w-full max-w-4xl p-6 text-center space-y-4">
                <p className="text-status-error font-medium">{error || "Roadmap not found"}</p>
                <Link to="/roadmap">
                    <Button  className="gap-2 p-5 cursor-pointer hover:bg-primary/90">
                        <ArrowLeft className="w-4 h-4" /> Back to Roadmaps
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-4xl space-y-4 pb-2 sm:space-y-6 sm:pb-0">
            <Link to="/roadmap" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                <ArrowLeft className="size-4" />
                Back to roadmaps
            </Link>

            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-card border border-border rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-xs">
                
                    <div className="mx-auto w-28 h-28 sm:w-32 sm:h-32 flex flex-col items-center justify-center shrink-0 sm:mx-0">
                        <div className="relative w-full h-full">
                            <CircularProgressbar
                                value={progressPercentage}
                                strokeWidth={9}
                                styles={buildStyles({
                                    trailColor: 'var(--muted)',
                                    pathColor: getRoadmapProgressColor(progressPercentage, roadmap.status),
                                    pathTransitionDuration: 0.5,
                                })}
                            />
                            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                                <span className="text-2xl font-bold tracking-tight leading-none text-foreground sm:text-3xl">
                                    {progressPercentage}%
                                </span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mt-0.5">
                                    done
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight">
                            Your {roadmap.totalWeeks}-Week AI Plan to <span className="text-brand-primary">{roadmap.targetRole}</span>
                        </h1>
                        <p className="text-sm text-muted-foreground font-normal">
                            Status: <span className="capitalize font-medium text-foreground">{roadmap.status}</span>
                        </p>
                        <p className="text-sm text-muted-foreground font-normal inline-flex items-center">
                            <Circle size={14} fill="currentColor" className="text-primary me-2" />  {totalCompletedWeeks} of {roadmap.totalWeeks} weeks completed
                        </p>
                    </div>
                </div>

                {/* Weeks Roadmap List*/}
                <div className="space-y-4">
                    {roadmap.weeks && roadmap.weeks.map((week) => {
                        const isOpen = openWeekId === week._id;
                        const isCurrentUpdating = updatingWeekId === week._id;
                        const currentCardStyles = week.completed
                            ? "border-status-success border-2 ring-status-success/30 ring-2 shadow-none"
                            : isOpen 
                                ? "border-brand-primary border-2 ring-brand-primary/40 ring-2" 
                                : "border-border hover:border-muted-foreground/30";
                        
                        return (
                            <div key={week._id} className={`bg-card rounded-xl border transition-all ${currentCardStyles}`}>
                                <button onClick={() => toggleWeek(week._id)}className="w-full flex items-start justify-between p-5 text-left gap-4 cursor-pointer">
                                    <div className="flex gap-4 items-start">
                                        {week.completed ? (
                                            <CheckCircle2 className="w-8 h-8 text-status-success shrink-0 mt-0.5" />
                                        ) : (
                                            <div className={`w-8 h-8 rounded-full ${isOpen?"bg-primary text-muted":"bg-muted text-muted-foreground"} flex items-center justify-center text-md font-bold shrink-0 mt-0.5`}>
                                                {week.weekNumber}
                                            </div>
                                        )}

                                        <div>
                                            <h3 className="font-bold text-base">Week {week.weekNumber}: {week.theme}</h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {week.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-muted-foreground shrink-0 pt-1">
                                        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    </div>
                                </button>

                                {isOpen && (
                                    <div className="px-5 pb-5 pt-1 border-t border-border/50 space-y-4 bg-muted/10 rounded-b-xl transition-all">
                                        <div className="space-y-3 gap-1 flex flex-col">
                                            <span className="text-[11px] font-bold text-muted-foreground tracking-wider uppercase block pt-2">
                                                Resources
                                            </span>
                                            
                                            {week.resources && week.resources.length > 0 ? (
                                                week.resources.map((resource) => (
                                                    <Link to={resource.url} target="_blank" rel="noreferrer" key={resource._id}>
                                                        <div className="flex items-center justify-between gap-1 p-4 bg-card hover:bg-primary/10 border border-border rounded-lg hover:border-brand-primary/40 transition-colors">
                                                            <span className="text-sm font-medium">{resource.title}</span>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground font-semibold uppercase">{resource.platform}</span>
                                                                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                                                                    resource.isFree 
                                                                        ? 'bg-status-success/10 text-status-success' 
                                                                        : 'bg-status-warning/10 text-status-warning'
                                                                }`}>
                                                                    {resource.isFree ? 'Free' : 'Paid'}
                                                                </span>
                                                                <ExternalLink className="w-4 h-4 text-muted-foreground" />
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))
                                            ) : (
                                                <p className="text-sm text-muted-foreground italic">No core resources specified for this week.</p>
                                            )}
                                        </div>

                                        {/* Action Button */}
                                        <div className="pt-2">
                                            <Button 
                                                onClick={() => handleToggleWeekCompletion(week)}
                                                disabled={isCurrentUpdating}
                                                className={`flex bg-muted/10 items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-all shadow-xs cursor-pointer ${
                                                    week.completed 
                                                        ? 'border-status-error/30 hover:bg-status-error/5 text-status-error' 
                                                        : 'border-brand-primary text-brand-primary hover:bg-primary/10'
                                                }`}
                                            >
                                                {isCurrentUpdating ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : week.completed ? (
                                                    <CheckCircle2 className="w-4 h-4" />
                                                ) : (
                                                    <Circle className="w-4 h-4" />
                                                )}
                                                {isCurrentUpdating ? 'Updating...' : week.completed ? 'Mark Incomplete' : 'Mark Complete'}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default RoadmapResults;