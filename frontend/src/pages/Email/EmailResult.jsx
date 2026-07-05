import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router";
import { ArrowLeft, Building2, User, Calendar, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import GeneratedDocumentTabs from "@/components/Email/GeneratedDocumentTabs";
import { getEmailById } from "@/services/emailService";
import useAuthStore from "@/stores/authStore";

const applyUserName = (text = "", userName = "") => {
    if (!userName) return text;
    return text.replaceAll("[Your Name]", userName);
};

const EmailResult = () => {
    const { id } = useParams();
    const location = useLocation();
    const user = useAuthStore((state) => state.user);
    const [result, setResult] = useState(location.state?.document ?? null);
    const [loading, setLoading] = useState(!location.state?.document);

    useEffect(() => {
        if (location.state?.document) return;

        const loadDocument = async () => {
            try {
                const data = await getEmailById(id);
                setResult(data);
            } catch (err) {
                console.error(err);
                toast.error(err.response?.data?.message || "Failed to load cover letter and email.");
            } finally {
                setLoading(false);
            }
        };

        loadDocument();
    }, [id, location.state?.document]);

    const coverLetter = useMemo(
        () => applyUserName(result?.generatedCoverLetter, user?.name),
        [result?.generatedCoverLetter, user?.name],
    );

    const email = useMemo(
        () => applyUserName(result?.generatedEmail, user?.name),
        [result?.generatedEmail, user?.name],
    );

    const formatDate = (date) =>
        new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });

    if (loading) {
        return (
            <div className="flex min-h-[40vh] items-center justify-center">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!result) {
        return (
            <div className="mx-auto w-full max-w-4xl space-y-4 text-center">
                <p className="text-muted-foreground">Cover letter and email not found.</p>
                <Link
                    to="/email"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-primary hover:underline"
                >
                    <ArrowLeft className="size-4" />
                    Back to history
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-4xl space-y-6">
            <Link
                to="/email"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
                <ArrowLeft className="size-4" />
                Back to history
            </Link>

            <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-bold sm:text-3xl">
                        {result.jobTitle}
                    </h1>

                    <Badge className="rounded-full uppercase text-[11px] font-bold px-2.5 py-0.5 bg-status-info/10 text-status-info border-status-info/20">
                        {result.templateType}
                    </Badge>
                </div>

                <p className="text-muted-foreground">
                    Generated cover letter and email for your application.
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-border bg-card px-5 py-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                    <Building2 className="size-4" />
                    {result.companyName}
                </span>

                {result.hrName && (
                    <span className="flex items-center gap-1.5">
                        <User className="size-4" />
                        {result.hrName}
                    </span>
                )}

                <span className="flex items-center gap-1.5">
                    <Calendar className="size-4" />
                    {formatDate(result.createdAt)}
                </span>
            </div>

            <GeneratedDocumentTabs
                coverLetter={coverLetter}
                email={email}
                jobTitle={result.jobTitle}
                companyName={result.companyName}
            />
        </div>
    );
};

export default EmailResult;
