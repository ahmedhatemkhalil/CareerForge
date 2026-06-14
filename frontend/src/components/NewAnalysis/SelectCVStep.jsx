import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyCVState from "./EmptyCVState";
import { MoveRight } from 'lucide-react';
import { FileText } from "lucide-react";
const SelectCVStep = ({loading, cvs, selectedCV, setSelectedCV, onNext}) => {
    if (loading) {
        return (
        <Card>
            <CardContent className="space-y-4 p-6">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </CardContent>
        </Card>
        );
    }

    if (cvs.length === 0) {
        return <EmptyCVState />;
    }
    
    return (
        <Card>
            <CardContent className="p-6">
                <h3 className="font-semibold">
                    Select CV
                </h3>

                <p className="mb-5 mt-1 text-sm text-muted-foreground">
                    Choose the resume version you want to analyze.
                </p>

                <div className="space-y-3">
                    {cvs.map((cv) => {
                        const cvId = cv._id ; 
                        const formattedDate = new Date(cv.createdAt).toLocaleDateString("en-US", {month: "long", day: "numeric", year: "numeric"});
                        return (
                            <button
                                key={cvId}
                                type="button" 
                                onClick={() => setSelectedCV(cvId)}
                                className={`w-full rounded-xl border border-2 p-4 text-left cursor-pointer transition
                                ${
                                    selectedCV === cvId
                                        ? "border-primary bg-secondary/60" 
                                        : "hover:border-primary/40 bg-muted"
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="rounded-2xl bg-primary p-3">
                                            <FileText className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium">
                                                {cv.fileName}
                                            </h4>

                                            <p className="text-xs text-muted-foreground font-semibold">
                                                V{cv.version} {cv.isActive && " • Active"} • {formattedDate}
                                            </p>
                                        </div>
                                    </div>

                                    <input 
                                        type="radio" 
                                        name="active-cv-selection" 
                                        checked={selectedCV === cvId} 
                                        onChange={() => setSelectedCV(cvId)} 
                                        className="h-4 w-4 accent-primary"
                                    />
                                </div>
                            </button>
                        );
                    })}
                </div>

                <Button className="mt-6 w-full py-6" onClick={onNext}>
                    Continue to Job Details <MoveRight />
                </Button>
            </CardContent>
        </Card>
    )
}

export default SelectCVStep