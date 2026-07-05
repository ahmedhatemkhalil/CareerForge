const WorkflowSection = () => {
  return (
    <section className="py-16">
      {/* Header */}
      <div className="text-center mb-14">
        <span className="text-brand-primary text-sm font-medium uppercase tracking-wider">
          The Workflow
        </span>
        <h2 className="text-3xl md:text-4xl font-bold">
          Your AI-Powered Career Journey
        </h2>

        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          Start from your CV analysis, then unlock intelligent AI tools that guide your growth.
        </p>
      </div>

      {/* <div className="w-full min-w-100 overflow-hidden rounded-2xl border border-border shadow-lg mb-14">
        <img
          src="/images/workFlow.jpg"
          alt="CareerForge workflow from CV analysis to interview and roadmap"
          className="w-full min-h-[240px] sm:min-h-[120px] md:min-h-[200px] object-cove object-center"
        />
      </div> */}

      <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 items-center">
        <div className="space-y-6">
          <div className="border rounded-3xl p-6 bg-card hover:border-brand-primary transition">
            <h4 className="font-bold mt-2 text-brand-primary">
              Mock Interview
            </h4>

            <p className="text-muted-foreground mt-3">
              Ready to apply? Launch an AI mock interview tailored perfectly to your analyzed CV and target role to practice behavioral and technical questions.
            </p>
          </div>
        </div>

        <div className="relative border-2 border-brand-primary rounded-3xl p-10 bg-card text-center shadow-lg">
          <h3 className="text-2xl font-bold mt-3 text-brand-primary">
            CV Analysis
          </h3>

          <p className="text-muted-foreground mt-4">
            Upload your resume and target job description. Our AI analyzes your match score and extracts your exact skill gaps instantly — giving you a precise, actionable starting point.
          </p>
        </div>

        <div className="space-y-6">
          <div className="border rounded-3xl p-6 bg-card hover:border-brand-primary transition">
            <h4 className="font-bold mt-2 text-brand-primary">
              Learning Roadmap
            </h4>

            <p className="text-muted-foreground mt-3">
              Found missing skills? Generate a customized interactive learning roadmap to study and master those specific gaps week-by-week.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};

export default WorkflowSection;