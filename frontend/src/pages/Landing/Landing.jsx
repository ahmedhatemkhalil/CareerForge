import CTASection from "@/components/LandingPage/CTASection"
import FeaturesSection from "@/components/LandingPage/FeaturesSection"
import HeroSection from "@/components/LandingPage/HeroSection"
import WhyCareerForgeSection from "@/components/LandingPage/WhyCareerForgeSection"
import WorkflowSection from "@/components/LandingPage/WorkflowSection"
import Footer from "@/components/layout/Footer"
import Navbar from "@/components/layout/Navbar"

const Landing = () => {
  return (
    <>
    <Navbar/>
    <div className="bg-background min-h-screen mx-auto w-full max-w-8xl px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <HeroSection/>
      <hr className="max-w-4xl mx-auto border-t-2 "/>
      <FeaturesSection/>
      <hr className="max-w-4xl mx-auto border-t-2 "/>
      <WhyCareerForgeSection />
      <WorkflowSection />
      <CTASection />
    </div>
    <Footer/>
    </>
  )
}

export default Landing