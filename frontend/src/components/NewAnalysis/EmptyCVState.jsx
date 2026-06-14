import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
const EmptyCVState = () => {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col items-center py-16 text-center">
        <div className="mb-4 rounded-full bg-secondary p-4">
            <FileText className="h-8 w-8 text-primary" />
        </div>

        <h3 className="text-xl font-semibold">
            No CV Available
        </h3>

        <p className="mt-2 text-muted-foreground">
            You need to upload a CV before starting a new analysis.
        </p>

        <Button className="mt-6" onClick={() => navigate("/cv")}>
            Upload CV
        </Button>
    </div>
    )
}

export default EmptyCVState