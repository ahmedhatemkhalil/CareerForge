import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { Mic } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const EmptyAnalysisState = () => {
    const navigate = useNavigate();
    return (
        <div className="p-8">
            <Empty className="py-12">
                <EmptyHeader>
                    <EmptyMedia variant="icon" className="w-12 h-12 p-4 bg-brand-primary/10 rounded-2xl text-brand-primary mx-auto w-fit">
                        <Mic className="size-8" />
                    </EmptyMedia>
                    <EmptyTitle className="text-xl font-bold text-foreground mt-4">
                        No Analysis yet
                    </EmptyTitle>
                    <EmptyDescription className="text-sm text-muted-foreground max-w-sm mx-auto mt-1">
                        Start your first AI analysis to evaluate your CV and uncover skill gaps.
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent className="flex justify-center">
                    <Button 
                        onClick={() => { navigate('/new-analysis') }}  
                        className="bg-brand-primary hover:bg-brand-primary/90 text-white font-medium rounded-xl px-6 py-5 cursor-pointer shadow-sm"
                    >
                        Start New Analysis
                    </Button>
                </EmptyContent>
            </Empty>
        </div>
    );
}

export default EmptyAnalysisState