import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Plus, Mail, Calendar, User, ChevronRight, Trash2, Building2} from "lucide-react";
import { Button } from "@/components/ui/button";
import HistoryListSkeleton from "../../components/common/HistoryListSkeleton";
import { toast } from "react-hot-toast";
import ConfirmModal from "@/components/common/ConfirmModal";
import EmptyCoverLetterState from "@/components/Email/EmptyEmailState";
import {getAllEmails, deleteEmail} from "@/services/emailService";
import { Badge } from "@/components/ui/badge";

const EmailHistory = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoading(true);
                const data = await getAllEmails();
                setHistory(data || []);
            }catch (err) {
                console.error(err);
                toast.error(err.response?.data?.message || "Failed to load generation history.");
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-US", {month: "short", day: "numeric", year: "numeric"});
    };

    const handleDeleteClick = (id, e) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedId(id);
        setConfirmOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedId) return;

        try {
            setDeleteLoading(true);
            await deleteEmail(selectedId);
            setHistory((prev) =>
                prev.filter((item) => item._id !== selectedId)
            );

            toast.success("Deleted successfully.");
            setConfirmOpen(false);
            setSelectedId(null);
        } catch (err) {
            toast.error(err.response?.data?.message || "Unable to delete this document.");
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-3xl font-bold tracking-tight">
                    Job Email Generator
                </h1>

                <Button onClick={() => navigate("/email/new")} className="bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl p-5 gap-2 cursor-pointer">
                    <Plus className="size-4" />
                    Generate Email
                </Button>
            </div>

            <div className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-border">
                    <h2 className="text-lg font-bold">
                        Generation History
                    </h2>

                    <span className="text-xs font-semibold uppercase text-muted-foreground bg-muted px-2 py-1 rounded-md">
                        {history.length} records
                    </span>
                </div>

                {loading ? (
                    <HistoryListSkeleton />
                ) : history.length === 0 ? (
                    <EmptyCoverLetterState />
                ) : (
                    <div className="divide-y divide-border">
                        {history.map((item) => (
                            <Link key={item._id} to={`/email/${item._id}`} className="flex flex-col sm:flex-row items-center justify-between p-5 gap-4 hover:bg-muted/30 transition-colors group">
                                <div className="flex items-center gap-5 w-full">
                                    <div className={`size-12 rounded-2xl flex items-center justify-center shrink-0 bg-primary/10 text-primary`}>
                                        <Mail className="size-5" />
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="font-bold text-base group-hover:text-brand-primary transition-colors">
                                                {item.jobTitle}
                                            </h3>

                                            <Badge className="rounded-full uppercase text-[11px] font-bold px-2.5 py-0.5 bg-status-info/10 text-status-info border-status-info/20">
                                                {item.templateType}
                                            </Badge>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="size-3.5" />
                                                {formatDate(item.createdAt)}
                                            </span>

                                            <span className="hidden sm:inline">
                                                •
                                            </span>

                                            <span className="flex items-center gap-1">
                                                <Building2 className="size-3.5" />
                                                {item.companyName}
                                            </span>

                                            {item.hrName && <> 
                                                <span className="hidden sm:inline">
                                                    •
                                                </span>

                                                <span className="flex items-center gap-1">
                                                    <User className="size-3.5" />
                                                    {item.hrName}
                                                </span>
                                            </>}
                                        </div>
                                    </div>
                                </div>

                                {/* actions */}
                                <div className="flex items-center gap-3 w-full sm:w-auto justify-end border-t sm:border-none pt-3 sm:pt-0">
                                    <button
                                        type="button"
                                        onClick={(e) => handleDeleteClick(item._id, e)}
                                        className="p-2 rounded-xl hover:bg-status-error/10 text-status-error/70 hover:text-status-error opacity-100 sm:opacity-0 group-hover:opacity-100 transition cursor-pointer"
                                        title="Delete Email"
                                    >
                                        <Trash2 className="size-4.5" />
                                    </button>

                                    <div className="p-2 hover:bg-primary/10 rounded-xl group-hover:translate-x-1 transition-transform text-muted-foreground">
                                        <ChevronRight className="size-4.5" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <ConfirmModal
                open={confirmOpen}
                onClose={() => {
                    setConfirmOpen(false);
                    setSelectedId(null);
                }}
                title="Delete Email"
                message="Are you sure you want to delete this generated email?"
                confirmLabel="Delete"
                cancelLabel="Cancel"
                confirmVariant="destructive"
                onConfirm={handleDelete}
                isLoading={deleteLoading}
            />
        </div>
    );
}

export default EmailHistory