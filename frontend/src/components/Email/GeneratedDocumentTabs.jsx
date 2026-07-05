import { useState } from "react";
import { Copy, Check, FileText, Mail, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import PdfIcon from "@/components/common/PdfIcon";

const TABS = [
    { id: "coverLetter", label: "Cover Letter", icon: FileText },
    { id: "email", label: "Email", icon: Mail },
];

const parseEmailContent = (content = "") => {
    const trimmed = content.trim();
    const subjectMatch = trimmed.match(/^Subject:\s*(.+?)(?:\n\n|\n$)/i);

    if (!subjectMatch) {
        return { subject: null, body: trimmed };
    }

    const body = trimmed.slice(subjectMatch[0].length).trim();
    return { subject: subjectMatch[1].trim(), body };
};

const GeneratedDocumentTabs = ({
    coverLetter = "",
    email = "",
    jobTitle = "",
    companyName = "",
}) => {
    const [activeTab, setActiveTab] = useState("coverLetter");
    const [copied, setCopied] = useState(false);
    const [downloading, setDownloading] = useState(false);

    const { subject, body } = parseEmailContent(email);
    const activeContent = activeTab === "coverLetter" ? coverLetter : email;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(activeContent);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const handleDownloadPdf = async () => {
        if (!coverLetter) return;

        setDownloading(true);
        try {
            const { downloadCoverLetterPdf } = await import("./CoverLetterPdfDocument");
            await downloadCoverLetterPdf({ coverLetter, jobTitle, companyName });
            toast.success("Cover letter PDF downloaded!");
        } catch (err) {
            console.error("PDF generation failed:", err);
            toast.error("Failed to generate PDF. Please try again.");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <Card className="overflow-hidden py-0 shadow-none">
            <CardContent className="p-0">
                <div className="flex items-center justify-between gap-4 border-b border-border px-4 sm:px-6">
                    <div className="flex overflow-x-auto">
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "flex shrink-0 items-center gap-2 px-4 py-4 text-sm font-medium whitespace-nowrap transition-colors sm:flex-1 sm:justify-center",
                                        activeTab === tab.id
                                            ? "border-b-2 border-brand-primary text-brand-primary"
                                            : "text-muted-foreground hover:text-foreground",
                                    )}
                                >
                                    <Icon className="size-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                        {activeTab === "coverLetter" && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleDownloadPdf}
                                disabled={downloading || !coverLetter}
                                className="cursor-pointer"
                            >
                                {downloading ? (
                                    <Loader2 className="size-3.5 animate-spin" />
                                ) : (
                                    <PdfIcon className="size-3.5" />
                                )}
                                <span className="ml-1.5 hidden sm:inline">Download PDF</span>
                            </Button>
                        )}

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleCopy}
                            className="cursor-pointer"
                        >
                            {copied ? (
                                <>
                                    <Check className="mr-1.5 size-3.5" />
                                    Copied
                                </>
                            ) : (
                                <>
                                    <Copy className="mr-1.5 size-3.5" />
                                    Copy
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                <div className="p-5 sm:p-6">
                    {activeTab === "email" && subject && (
                        <div className="mb-4 rounded-xl border border-border bg-muted/40 px-4 py-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Subject
                            </p>
                            <p className="mt-1 text-sm font-medium text-foreground">
                                {subject}
                            </p>
                        </div>
                    )}

                    <div className="rounded-xl border border-border bg-muted/20 p-5">
                        <pre className="font-sans text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                            {activeTab === "email" && subject ? body : activeContent}
                        </pre>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default GeneratedDocumentTabs;
