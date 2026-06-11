import { Brain, Mic, Map } from "lucide-react";

const features = [
  {
    title: "CV Analysis",
    desc: "Get a deep AI-powered breakdown of your resume against any job description. Discover skill gaps and get actionable improvement suggestions.",
    icon: Brain,
  },
  {
    title: "Mock Interview",
    desc: "Practice with our AI interviewer that adapts questions to your target role. Receive real-time scoring and detailed feedback on each answer.",
    icon: Mic,
  },
  {
    title: "AI Roadmaps",
    desc: "Generate a customized week-by-week learning plan to get from where you are today to your dream role with curated resources.",
    icon: Map,
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-16">
      <div className="text-center mb-14">
        <span className="text-sm font-medium text-brand-primary">FEATURES</span>
        <h2 className="text-3xl md:text-4xl font-bold mt-2">
          Everything you need to land your dream job
        </h2>
        <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
          Three powerful AI tools to accelerate your career growth
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {features.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="group relative bg-card border border-border rounded-2xl p-8 hover:shadow-2xl hover:shadow-brand-primary/10 transition-all duration-300 hover:-translate-y-2 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-brand-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:bg-gradient-to-r group-hover:from-brand-primary group-hover:to-brand-secondary">
                  <Icon className="w-7 h-7 text-brand-primary group-hover:text-white transition-colors duration-300" />
                </div>

                <h3 className="mt-6 font-bold text-xl text-foreground">
                  {item.title}
                </h3>

                <p className="mt-3 text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
                <div className="mt-6 w-12 h-0.5 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full group-hover:w-20 transition-all duration-300" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  )
}

export default FeaturesSection;