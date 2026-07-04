import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MoveRight, BarChart3, Calendar } from "lucide-react";
import { FileText } from "lucide-react";
import { useNavigate } from "react-router";

const SelectAnalysisStep = ({loading, analyses, selectedAnalysis, setSelectedAnalysis, onNext}) => {
    const navigate = useNavigate();

    if (loading) {
        return (
            <Card>
                <CardContent className="space-y-4 p-6">
                    <Skeleton className="h-24 w-full rounded-xl" />
                    <Skeleton className="h-24 w-full rounded-xl" />
                    <Skeleton className="h-24 w-full rounded-xl" />
                </CardContent>
            </Card>
        );
    }

    if (analyses.length === 0) {
        return <div className="flex flex-col items-center py-16 text-center">
            <div className="mb-4 rounded-full bg-secondary p-4">
                <FileText className="h-8 w-8 text-primary" />
            </div>

            <h3 className="text-xl font-semibold">
                No Analysis Available
            </h3>

            <p className="mt-2 text-muted-foreground">
                No analysis available. Analyze your CV before generating an email.
            </p>

            <Button className="mt-6" onClick={() => navigate("/new-analysis")}>
                Create Analysis
            </Button>
        </div>;
    }

    const formatDate = (date) =>
        new Date(date).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });

    return (
        <Card>
            <CardContent className="p-6">
                <h3 className="font-semibold">
                    Select Analysis
                </h3>

                <p className="mt-1 mb-5 text-sm text-muted-foreground">
                    Choose which CV analysis you want to generate a cover letter from.
                </p>

                <div className="space-y-3">
                    {analyses.map((analysis) => {
                        const analysisId = analysis._id;
                        return (
                            <button key={analysisId} type="button" onClick={() => setSelectedAnalysis(analysisId)}
                                className={`w-full rounded-xl border-2p-4 text-left transition cursor-pointer
                                    ${
                                        selectedAnalysis === analysisId
                                            ? "border-primary bg-secondary/60"
                                            : "bg-muted hover:border-primary/40"
                                    }
                                `}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="rounded-2xl bg-primary p-3">
                                            <BarChart3 className="size-5 text-white" />
                                        </div>

                                        <div>
                                            <h4 className="font-semibold">
                                                {analysis.jobId?.title || "Untitled Job"}
                                            </h4>

                                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <FileText size={13} />
                                                    {analysis.cvId?.fileName || "Uploaded_Resume.pdf"}
                                                </span>

                                                <span>•</span>

                                                <span className="flex items-center gap-1">
                                                    <Calendar className="size-3" />
                                                    {formatDate(analysis.createdAt)}
                                                </span>

                                                <span>•</span>

                                                <span className="text-status-success font-semibold bg-status-success/10 px-1.5 py-0.5 rounded">
                                                    Match: {analysis.matchScore ?? 0}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <input type="radio" checked={selectedAnalysis === analysisId} onChange={() =>setSelectedAnalysis(analysisId)} className="h-4 w-4 accent-primary"/>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <Button className="mt-6 w-full py-6 cursor-pointer hover:bg-primary/90" disabled={!selectedAnalysis} onClick={onNext}>
                    Continue
                    <MoveRight className="ml-2 size-4" />
                </Button>
            </CardContent>
        </Card>
    );
}

export default SelectAnalysisStep