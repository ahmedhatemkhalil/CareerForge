import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MoveLeft, Loader2 } from 'lucide-react';

const jobSchema = z.object({
    title: z.string()
        .min(1, "Job title is required")
        .min(3, "Title must be at least 3 characters")
        .max(100, "Title cannot exceed 100 characters"),
    description: z.string()
        .min(1, "Job description text is required")
        .min(20, "Description must be at least 20 characters")
});

const JobDetailsStep = ({ title, setTitle, description, setDescription, onBack, onAnalyze, isAnalyzing }) => {
    
    const { 
        register, 
        handleSubmit, 
        formState: { errors } 
    } = useForm({
        resolver: zodResolver(jobSchema),
        defaultValues: {
            title: title,
            description: description
        }
    });

    const { onChange: onTitleChange, ...titleRegister } = register("title");
    const { onChange: onDescChange, ...descRegister } = register("description");

    const onSubmit = (data) => {
        setTitle(data.title);
        setDescription(data.description);
        onAnalyze(data);
    };

    return (
        <Card>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-5 p-6">
                    <div>
                        <label className="mb-1 block font-bold">
                            Job Title
                        </label>
                        <p className="mb-2 text-sm text-muted-foreground">
                            The exact title of the role you are targeting.
                        </p>
                        <Input 
                            {...titleRegister}
                            disabled={isAnalyzing}
                            onChange={(e) => {
                                onTitleChange(e);
                                setTitle(e.target.value);
                            }}
                            placeholder="e.g. Senior Frontend Engineer" 
                            className={`border-2 bg-input-background p-5 text-foreground transition-all focus-visible:ring-2
                                ${errors.title 
                                    ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20" 
                                    : "border-border focus-visible:border-brand-primary focus-visible:ring-brand-primary/20"
                                }`}
                        />
                        {errors.title && (
                            <p className="mt-1.5 text-xs font-medium text-destructive">
                                {errors.title.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block font-bold">
                            Job Description
                        </label>
                        <p className="mb-2 text-sm text-muted-foreground">
                            A detailed overview of the responsibilities and requirements for the role.
                        </p>
                        <Textarea 
                            {...descRegister}
                            disabled={isAnalyzing} 
                            onChange={(e) => {
                                onDescChange(e);
                                setDescription(e.target.value);
                            }}
                            rows={10} 
                            placeholder="Paste the full job description here — responsibilities, requirements, nice-to-haves, company background..." 
                            className={`min-h-[220px] rounded-2xl border-2 bg-input-background p-5 text-foreground transition-all focus-visible:ring-2
                                ${errors.description 
                                    ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20" 
                                    : "border-border focus-visible:border-brand-primary focus-visible:ring-brand-primary/20"
                                }`}
                        />
                        {errors.description && (
                            <p className="mt-1.5 text-xs font-medium text-destructive">
                                {errors.description.message}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-between gap-4">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={onBack} 
                            className="p-6"
                            disabled={isAnalyzing} 
                        >
                            <MoveLeft className="mr-2 h-4 w-4" /> Back
                        </Button>

                        <Button 
                            type="submit" 
                            className="flex-1 py-6" 
                            disabled={isAnalyzing} 
                        >
                            {isAnalyzing ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Analyzing with AI...
                                </span>
                            ) : (
                                "Analyze My CV"
                            )}
                        </Button>
                    </div>
                </CardContent>
            </form>
        </Card>
    );
};

export default JobDetailsStep;