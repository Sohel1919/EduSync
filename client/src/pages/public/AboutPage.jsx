import { useState } from "react";
import AboutHeroSection from "../../components/about/AboutHero";
import TeamSection from "../../components/about/TeamSection";
import TimelineSection from "../../components/about/TimelineSection";
import PartnersSection from "../../components/about/PartnersSection";
import ImpactSection from "../../components/about/ImpactSection";


export default function AboutPage() {
  const [activeTeamTab, setActiveTeamTab] = useState("leadership");

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50">
      <AboutHeroSection />
      <TimelineSection />
      <TeamSection activeTab={activeTeamTab} setActiveTab={setActiveTeamTab} />
      <ImpactSection />
      <PartnersSection />
    </div>
  );
}