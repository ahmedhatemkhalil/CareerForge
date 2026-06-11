import { Button } from "@/components/ui/button";
import { CircleCheckBig, ArrowRight } from 'lucide-react';
import { useNavigate } from "react-router-dom";
const HeroSection = () => {
    const navigate = useNavigate();
    return (
        <section className="py-16" id="hero">
            <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                    Forge Your Career,
                    <span className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                    {" "}Ace Your Interview
                    </span>
                    <br />
                    Own Your Future
                </h1>

                <p className="mt-8 text-muted-foreground text-lg max-w-2xl mx-auto">
                    CareerForge uses advanced AI to analyze your CV,
                    simulate real interviews, and create personalized
                    career roadmaps - all in one platform. 
                </p>

                <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                    <Button size="lg" 
                        className="font-bold px-8 py-6 text-base hover:opacity-90 cursor-pointer"
                        onClick={() => navigate("/register")}
                    >
                        Create Free Account <ArrowRight className="ml-1 w-4 h-4" />
                    </Button>

                    <Button variant="outline" size="lg" className="cursor-pointer font-bold px-8 py-6 text-base border-2 hover:bg-accent transition-all " onClick={() => navigate("/login")}>
                        Sign In
                    </Button>
                </div>

                <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <CircleCheckBig className="w-4 h-4 text-status-success" />
                        <span>No credit card required</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <CircleCheckBig className="w-4 h-4 text-status-success" />
                        <span>Free forever plan</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <CircleCheckBig className="w-4 h-4 text-status-success" />
                        <span>Get started in 1 minute</span>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default HeroSection