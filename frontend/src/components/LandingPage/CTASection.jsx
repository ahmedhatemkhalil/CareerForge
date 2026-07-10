import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Rocket } from "lucide-react";

const CTASection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-16">
      <div className="relative overflow-hidden rounded-4xl bg-gradient-to-r from-brand-primary via-brand-primary/90 to-brand-secondary p-12 text-center text-white transition-all duration-300 hover:shadow-2xl">
        <Sparkles className="absolute top-8 left-8 w-8 h-8 text-white/20 " />
        <Rocket className="absolute bottom-8 right-8 w-12 h-12 text-white/20 " />

        <div className="relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold">
            Ready to forge your career?
          </h2>

          <p className="mt-4 opacity-90 max-w-2xl mx-auto">
            Join thousands of professionals who have accelerated their careers using CareerForge's AI tools.
          </p>

          <Button variant="secondary" size="lg" className="mt-8 font-bold px-8 py-6 text-base cursor-pointer hover:scale-105" onClick={() => navigate("/register")}>
            Create Free Account
            <ArrowRight className="ml-2 w-5 h-5"/>
          </Button>
        </div>
      </div>
    </section>
  )
}

export default CTASection;