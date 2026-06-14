import { useEffect, useState } from "react";
import SelectCVStep from "../../components/NewAnalysis/SelectCVStep";
import JobDetailsStep from "../../components/NewAnalysis/JobDetailsStep";
import { Check } from "lucide-react"; 

import { getMyCVs } from "../../services/cvService";
import { createJobDescription } from "../../services/jobService";
import { createAnalysis } from "../../services/analysisService"; 
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast"; 

const NewAnalysis = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [cvs, setCvs] = useState([]);
    const [selectedCV, setSelectedCV] = useState(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(true); 
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        const loadCVs = async () => {
            try {
                const data = await getMyCVs();
                setCvs(data);

                const activeCv = data.find(
                    (cv) => cv.isActive === true || cv.isActive === 'true'
                );

                if (activeCv) {
                    setSelectedCV(activeCv._id);
                }
            } catch (error) {
                console.error("Error loading CVs:", error);
                toast.error("Failed to fetch your resumes. Please refresh the page.");
            } finally {
                setLoading(false);
            }
        };

        loadCVs();
    }, []);

    const handleAnalyze = async (formData) => {
        if (!selectedCV) {
            toast.error("Please go back and select a CV first.");
            return;
        }

        setIsAnalyzing(true);
        
        try {
            const jobData = await createJobDescription({
                title: formData.title,
                descriptionText: formData.description,
            });

            const jobId = jobData.id;
            const analysisResult = await createAnalysis(selectedCV, jobId);

            if (analysisResult.success) {
                const selectedCv = cvs.find((cv) => cv._id === selectedCV);

                toast.success("Analysis completed successfully!");
                navigate(`/analyze/results/${analysisResult.data._id}`, {
                    state: {
                        analysis: analysisResult.data,
                        jobTitle: formData.title,
                        jobDescription: formData.description,
                        cvFileName: selectedCv?.fileName,
                    },
                });
            }
        } catch (error) {
            console.error("Analysis failed:", error);
            toast.error(error.response?.data?.message || "Something went wrong during AI analysis. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="mx-auto max-w-4xl p-4">
            <h1 className="text-3xl font-bold">New CV Analysis</h1>
            <p className="mt-2 text-muted-foreground">
                Let AI analyze how well your resume matches the job requirements.
            </p>

            <div className="my-8 flex justify-center items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm text-white
                        ${step > 1 ? "bg-status-success" : "bg-primary"}`}
                    >
                        {step > 1 ? <Check size={16} /> : "1"}
                    </div>
                    <span className={step === 1 ? "font-medium" : "text-muted-foreground"}>Select CV</span>
                </div>

                <div className={`h-px w-12 transition-colors duration-300 ${step > 1 ? "bg-status-success" : "bg-border"}`} />
                
                <div className="flex items-center gap-2">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm
                        ${step === 2 ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}
                    >
                        2
                    </div>
                    <span className={step === 2 ? "font-medium" : "text-muted-foreground"}>Job Details</span>
                </div>
            </div>

            {step === 1 && (
                <SelectCVStep
                    loading={loading}
                    cvs={cvs}
                    selectedCV={selectedCV}
                    setSelectedCV={setSelectedCV}
                    onNext={() => setStep(2)}
                />
            )}

            {step === 2 && (
                <JobDetailsStep
                    title={title}
                    setTitle={setTitle}
                    description={description}
                    setDescription={setDescription}
                    onBack={() => setStep(1)}
                    onAnalyze={handleAnalyze} 
                    isAnalyzing={isAnalyzing} 
                />
            )}
        </div>
    );
};

export default NewAnalysis;