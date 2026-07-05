import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";

import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

const EmptyEmailState = () => {
    const navigate = useNavigate();

    return (
        <div className="p-8">
            <Empty className="py-12">
                <EmptyHeader>
                    <EmptyMedia variant="icon" className="w-12 h-12 p-4 bg-brand-primary/10 rounded-2xl text-brand-primary mx-auto">
                        <Mail className="size-8" />
                    </EmptyMedia>

                    <EmptyTitle className="text-xl font-bold mt-4">
                        No application documents yet
                    </EmptyTitle>

                    <EmptyDescription className="text-sm text-muted-foreground max-w-sm mx-auto mt-1">
                        Generate your first cover letter and follow-up email.
                    </EmptyDescription>
                </EmptyHeader>

                <EmptyContent className="flex justify-center">
                    <Button onClick={() => navigate("/email/new")} className="bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl px-6 py-5 cursor-pointer">
                        Generate Documents
                    </Button>
                </EmptyContent>
            </Empty>
        </div>
    );
};

export default EmptyEmailState;