const WhyCareerForgeSection = () => {
  const reasons = [
    {
      title: "All-in-One Ecosystem",
      desc: "Stop jumping between separate resume checkers, roadmap builders, and interview prep tools. CareerForge connects them all seamlessly — every feature feeds the next.",
    },
    {
      title: "Hyper-Personalized Growth",
      desc: "No generic advice. The entire platform adapts dynamically to your specific CV data and target job requirements, so every insight is relevant to your exact situation.",
    },
    {
      title: "Data-Driven Confidence",
      desc: "Train with AI that mimics real recruiter logic, giving you quantified scores so you know exactly when you're ready to apply — no more guessing.",
    },
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-16 items-start">
        <div>
          <span className="text-brand-primary text-sm font-medium uppercase tracking-wider">
            OUR BELIEF
          </span>

          <h2 className="font-bold text-3xl md:text-4xl lg:text-6xl leading-tight mt-4">
            Why <br />
            <span >CareerForge?</span>
          </h2>

          <p className="mt-6 text-muted-foreground leading-relaxed">
            Traditional job hunting is broken. We built a continuous, AI-powered ecosystem to guide you
            from resume scanning to your dream offer.
          </p>
        </div>

        {/* Right Side */}
        <div className="space-y-8">
          {reasons.map((item) => (
            <div key={item.title} className="border-b border-border pb-8">
              <div className="flex items-start gap-4">
                <div className="mt-2 h-2.5 w-2.5 rounded-full bg-brand-primary shrink-0" />
                <div>
                  <h3 className="font-semibold text-2xl text-foreground transition-colors group-hover:text-brand-primary">
                    {item.title}
                  </h3>

                  <p className="text-muted-foreground mt-3 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyCareerForgeSection;