import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

const EmptyAnalysisState = () => {
    const navigate = useNavigate();

    return (
        <div className="p-8">
            <Empty className="py-12">
                <EmptyHeader>
                    <EmptyMedia variant="icon" className="w-12 h-12 p-4 bg-brand-primary/10 rounded-2xl text-brand-primary mx-auto w-fit">
                        <BarChart3 className="size-8" />
                    </EmptyMedia>

                    <EmptyTitle className="text-xl font-bold text-foreground mt-4">
                        No analyses yet
                    </EmptyTitle>

                    <EmptyDescription className="text-sm text-muted-foreground max-w-sm mx-auto mt-1">
                        Run your first CV analysis to see your match score, strengths, and skill gaps.
                    </EmptyDescription>
                </EmptyHeader>

                <EmptyContent className="flex justify-center">
                    <Button
                        onClick={() => navigate("/new-analysis")}
                        className="bg-brand-primary hover:bg-brand-primary/90 text-white font-medium rounded-xl px-6 py-5 cursor-pointer shadow-sm"
                    >
                        Start New Analysis
                    </Button>
                </EmptyContent>
            </Empty>
        </div>
    );
};

export default EmptyAnalysisState;
