import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router";
import SelectAnalysisStep from "@/components/Email/SelectAnalysisStep";
import EmailDetailsStep from "@/components/Email/EmailDetailsStep";
import { getAllAnalyses } from "@/services/analysisService";
import { generateEmail } from "@/services/emailService";

const NewEmail = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [analyses, setAnalyses] = useState([]);
    const [selectedAnalysis, setSelectedAnalysis] = useState(null);
    const [companyName, setCompanyName] = useState("");
    const [jobTitle, setJobTitle] = useState("");
    const [hrName, setHrName] = useState("");
    const [templateType, setTemplateType] = useState("formal");

    useEffect(() => {
        const loadAnalyses = async () => {
            try {
                setLoading(true);
                const {data} = await getAllAnalyses();
                setAnalyses(data || []);
                if (data.length > 0) {
                    setSelectedAnalysis(data[0]._id);
                }
            } catch (err) {
                console.error(err);
                toast.error(err.response?.data?.message || "Failed to load your analyses.");
            } finally {
                setLoading(false);
            }
        };

        loadAnalyses();
    }, []);

    const handleGenerate = async (formData) => {
        if (!selectedAnalysis) {
            toast.error("Please select an analysis.");
            return;
        }

        try {
            setIsGenerating(true);

            const result = await generateEmail({
                analysisId: selectedAnalysis,
                companyName: formData.companyName,
                jobTitle: formData.jobTitle,
                hrName: formData.hrName,
                templateType: formData.templateType,
            });

            toast.success("Email generated successfully!");
            navigate(`/email/${result?._id}`);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to generate email.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="mx-auto w-full max-w-5xl">
            <h1 className="text-3xl font-bold">
                Generate Email
            </h1>

            <p className="mt-2 text-muted-foreground">
                Create a professional email using one of your previous AI analyses.
            </p>

            {/* Stepper */}
            <div className="my-8 flex justify-center items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm text-white ${step > 1 ? "bg-status-success" : "bg-primary"}`}>
                        {step > 1 ? <Check size={16} /> : "1"}
                    </div>

                    <span className={step === 1 ? "font-medium" : "text-muted-foreground"}>
                        Select Analysis
                    </span>
                </div>

                <div className={`h-px w-12 ${step > 1 ? "bg-status-success" : "bg-border"}`}/>
                    <div className="flex items-center gap-2">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${step === 2 ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                            2
                        </div>

                        <span className={step === 2 ? "font-medium": "text-muted-foreground"}>
                            Email Details
                        </span>
                    </div>
                </div>

            {step === 1 && (
                <SelectAnalysisStep
                    loading={loading}
                    analyses={analyses}
                    selectedAnalysis={selectedAnalysis}
                    setSelectedAnalysis={setSelectedAnalysis}
                    onNext={() => setStep(2)}
                />
            )}

            {step === 2 && (
                <EmailDetailsStep
                    companyName={companyName}
                    setCompanyName={setCompanyName}
                    jobTitle={jobTitle}
                    setJobTitle={setJobTitle}
                    hrName={hrName}
                    setHrName={setHrName}
                    templateType={templateType}
                    setTemplateType={setTemplateType}
                    onBack={() => setStep(1)}
                    onGenerate={handleGenerate}
                    isGenerating={isGenerating}
                />
            )}
        </div>
    );
};

export default NewEmail;