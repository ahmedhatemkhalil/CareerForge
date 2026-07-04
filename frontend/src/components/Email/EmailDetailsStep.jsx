import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MoveLeft, Loader2 } from "lucide-react";

const emailSchema = z.object({
    companyName: z.string() .min(2, "Company name is required").max(100),
    jobTitle: z.string().min(2, "Job title is required").max(100),
    hrName: z.string().optional(),
    templateType: z.enum(["formal", "technical", "creative"]),
});

const TemplateStyle = [
    {
        value: "formal",
        title: "Formal",
        desc: "Professional & classic",
    },
    {
        value: "technical",
        title: "Technical",
        desc: "Engineering focused",
    },
    {
        value: "creative",
        title: "Creative",
        desc: "Friendly & modern",
    },
]

const EmailDetailsStep = ({companyName, setCompanyName, jobTitle,setJobTitle, hrName, setHrName, templateType, setTemplateType, onBack, onGenerate, isGenerating}) => {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(emailSchema),
        defaultValues: {
            companyName,
            jobTitle,
            hrName,
            templateType,
        },
    });

    const {onChange: companyOnChange, ...companyRegister} = register("companyName");
    const {onChange: jobOnChange, ...jobRegister} = register("jobTitle");
    const {onChange: hrOnChange, ...hrRegister} = register("hrName");
    const selectedTemplate = watch("templateType");
    const onSubmit = (data) => {
        setCompanyName(data.companyName);
        setJobTitle(data.jobTitle);
        setHrName(data.hrName || "");
        setTemplateType(data.templateType);
        onGenerate(data);
    };

    return (
        <Card>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-6 p-6">
                    <div>
                        <label className="font-bold mb-2 block">
                            Company Name
                        </label>

                        <Input
                            {...companyRegister}
                            disabled={isGenerating}
                            onChange={(e) => {
                                companyOnChange(e);
                                setCompanyName(e.target.value);
                            }}
                            placeholder="Enter the company you're applying to."
                            className={`border-2 bg-input-background p-5 text-foreground transition-all focus-visible:ring-2 ${
                                errors.companyName
                                    ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
                                    : "border-border focus-visible:border-brand-primary focus-visible:ring-brand-primary/20"
                            }`}
                        />

                        {errors.companyName && (
                            <p className="text-xs text-destructive mt-1">
                                {errors.companyName.message}
                            </p>
                        )}
                    </div>

                    {/* job */}
                    <div>
                        <label className="font-bold mb-2 block">
                            Job Title
                        </label>

                        <Input
                            {...jobRegister}
                            disabled={isGenerating}
                            onChange={(e) => {
                                jobOnChange(e);
                                setJobTitle(e.target.value);
                            }}
                            placeholder="e.g. Frontend Developer"
                            className={`border-2 bg-input-background p-5 text-foreground transition-all focus-visible:ring-2 ${
                                errors.jobTitle
                                    ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
                                    : "border-border focus-visible:border-brand-primary focus-visible:ring-brand-primary/20"
                            }`}
                        />

                        {errors.jobTitle && (
                            <p className="text-xs text-destructive mt-1">
                                {errors.jobTitle.message}
                            </p>
                        )}
                    </div>

                    {/* hr */}
                    <div>
                        <label className="font-bold mb-2 block">
                            Hiring Manager <span className="text-sm text-muted-foreground">( Optional )</span>
                        </label>

                        <Input
                            {...hrRegister}
                            disabled={isGenerating}
                            onChange={(e) => {
                                hrOnChange(e);
                                setHrName(e.target.value);
                            }}
                            placeholder="e.g. Mr. John Smith"
                            className="border-border border-2 bg-input-background p-5 text-foreground  focus-visible:ring-2  focus-visible:border-brand-primary focus-visible:ring-brand-primary/20 transition-all"
                        />
                    </div>

                    {/* template */}
                    <div>
                        <label className="font-bold block mb-3">
                            Template Style
                        </label>
                        <div className="grid md:grid-cols-3 gap-4">
                            {TemplateStyle.map((template) => (
                                <label key={template.value} className={`rounded-xl border-2 p-4 cursor-pointer transition
                                        ${
                                        selectedTemplate === template.value
                                            ? "border-primary bg-secondary"
                                            : "border-border hover:border-primary/40"
                                        }
                                    `}
                                >
                                    <input type="radio" value={template.value} {...register("templateType")} className="hidden"/>

                                    <div className="font-semibold">
                                        {template.title}
                                    </div>

                                    <div className="text-sm text-muted-foreground mt-1">
                                        {template.desc}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-between gap-4">
                        <Button type="button" variant="outline" className="p-6 cursor-pointer" disabled={isGenerating} onClick={onBack}>
                            <MoveLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>

                        <Button type="submit" className="flex-1 py-6 cursor-pointer hover:bg-primary/90" disabled={isGenerating}>
                            {isGenerating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                "Generate Email"
                            )}
                        </Button>
                    </div>
                </CardContent>
            </form>
        </Card>
    );
};

export default EmailDetailsStep;