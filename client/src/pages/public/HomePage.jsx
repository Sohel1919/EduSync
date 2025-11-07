import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import HeroSection from "../../components/home/HeroSection";
import StatsSection from "../../components/home/StatsSection";
import CausesSection from "../../components/home/CausesSection";
import StorySection from "../../components/home/StorySection";
import CTASection from "../../components/home/CTASection";


export default function HomePage() {
  const [activeTab, setActiveTab] = useState("mission");

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50">
      <HeroSection />
      <StatsSection />
      <CausesSection />
      <StorySection activeTab={activeTab} setActiveTab={setActiveTab} />
      <CTASection />
    </div>
  );
}
