import { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronRight, Calendar } from 'lucide-react'; 
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-hot-toast";
import ConfirmModal from "../../components/common/ConfirmModal"; 
import { getRoadmapProgressColor } from '@/utils/helpers'; 
import EmptyRoadmapsState from '@/components/Roadmap/EmptyRoadmapsState';
import { getAllRoadmaps, deleteRoadmapById } from '@/services/roadmapService';
import HistoryListSkeleton from '@/components/common/HistoryListSkeleton';

const Roadmap = () => {
    const [roadmaps, setRoadmaps] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedRoadmapId, setSelectedRoadmapId] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const navigate = useNavigate()
    useEffect(() => {
        const fetchRoadmaps = async () => {
            try {
                setIsLoading(true);
                const data = await getAllRoadmaps();
                setRoadmaps(data || []);
            } catch (err) {
                console.error("Error fetching roadmaps history:", err);
                const errorMessage = err.response?.data?.message || "Failed to load your roadmap history.";
                toast.error(errorMessage, { id: 'fetch-history-error' }); 
            } finally {
                setIsLoading(false);
            }
        };

        fetchRoadmaps();
    }, []);

    const totalRoadmaps = roadmaps.length;
    const completedCount = roadmaps.filter(r => r.status === 'completed').length;
    const inProgressCount = roadmaps.filter(r => r.status === 'active').length;

    const handleDeleteClick = (id, e) => {
        e.preventDefault(); 
        e.stopPropagation();
        setSelectedRoadmapId(id);
        setConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedRoadmapId) return;
        
        setDeleteLoading(true);
        try {
            await deleteRoadmapById(selectedRoadmapId);
            setRoadmaps(prev => prev.filter(r => r._id !== selectedRoadmapId));
            setConfirmOpen(false);
            setSelectedRoadmapId(null);
            toast.success("Roadmap deleted successfully!");
        } catch (err) {
            console.error("Delete failed:", err);
            const errorMessage = err.response?.data?.message || "Could not delete the roadmap. Please try again.";
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
        <div className="mx-auto w-full max-w-5xl space-y-4  sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Career Roadmaps</h1>
                    <div className="text-sm text-muted-foreground font-medium">
                        {isLoading ? (
                            <Skeleton className="h-4 w-64 mt-1" />
                        ) : (
                            `${totalRoadmaps} roadmaps · ${completedCount} completed · ${inProgressCount} active`
                        )}
                    </div>
                </div>
                
                <Button onClick={() => navigate("/new-roadmap")} className="bg-brand-primary hover:bg-brand-primary/90 text-white font-medium inline-flex items-center gap-2 rounded-xl p-5 shadow-xs cursor-pointer w-full sm:w-fit">
                    <Plus className="size-4" />
                    Generate New Roadmap
                </Button>
            </div>

            <div className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
                
                <div className="flex items-center justify-between p-5 border-b border-border bg-card">
                    <h2 className="text-lg font-bold tracking-tight">Roadmap History</h2>
                    <span className="text-xs font-semibold text-muted-foreground uppercase bg-muted/50 px-2.5 py-1 rounded-md">
                        {totalRoadmaps} records
                    </span>
                </div>

                <div>
                    {isLoading ? (
                        <HistoryListSkeleton/>
                    ) : roadmaps.length === 0 ? (
                        <EmptyRoadmapsState />
                    ) : (
                        <div className="divide-y divide-border">
                            {roadmaps.map((item) => {
                                const isCompleted = item.status === 'completed';

                                return (
                                    <Link 
                                        to={`/roadmap/result/${item._id}`} 
                                        key={item._id}
                                        className="flex flex-col sm:flex-row items-center justify-between p-5 gap-4 hover:bg-muted/5 transition-colors group"
                                    >
                                        <div className="flex items-start sm:items-center gap-5 w-full sm:w-auto">
                                            <div className="relative size-14 shrink-0 flex items-center justify-center font-bold">
                                                <CircularProgressbar
                                                    value={item.progress}
                                                    text={`${item.progress}%`}
                                                    styles={buildStyles({
                                                        textSize: '24px',
                                                        textColor: 'currentColor', 
                                                        pathColor: getRoadmapProgressColor(item.progress, item.status),
                                                        trailColor: 'var(--muted)', 
                                                        strokeLinecap: 'round',
                                                        pathTransitionDuration: 0.5,
                                                    })}
                                                />
                                            </div>

                                            {/* Details Section */}
                                            <div className="space-y-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="font-bold text-base text-foreground group-hover:text-brand-primary transition-colors">
                                                        {item.targetRole}
                                                    </h3>
                                                    
                                                    {isCompleted ? (
                                                        <Badge className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-status-success/10 text-status-success border border-status-success/20 ">
                                                            Completed
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                                                            Week {item.completedWeeks}/{item.totalWeeks}
                                                        </Badge>
                                                    )}
                                                </div>
                                                
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                                                    {item.currentRole && <span>From: {item.currentRole}</span>}
                                                    {item.currentRole && <span className="hidden sm:inline text-muted/60">•</span>}
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="size-3.5" />
                                                        {formatDate(item.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions Section */}
                                        <div className="flex items-center gap-3 w-full sm:w-auto justify-end border-t sm:border-none pt-3 sm:pt-0">
                                            <button 
                                                type="button"
                                                onClick={(e) => handleDeleteClick(item._id, e)}
                                                className="p-2 text-status-error/70 hover:text-status-error hover:bg-status-error/10 rounded-xl transition-all opacity-100 sm:opacity-0 group-hover:opacity-100 cursor-pointer"
                                                title="Delete Roadmap"
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
                    setSelectedRoadmapId(null);
                }}
                title="Delete Roadmap"
                message="Are you sure you want to delete this career roadmap? This action will permanently remove your progress data."
                confirmLabel="Delete"
                cancelLabel="Cancel"
                confirmVariant="destructive" 
                onConfirm={handleConfirmDelete}
                isLoading={deleteLoading}
            />
        </div>
    );
};

export default Roadmap;