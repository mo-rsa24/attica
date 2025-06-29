import React from "react";
import HeroSection from "../components/HeroSection";
import CategoryTabs from "../components/CategoryTabs";
import ListingGrid from "../components/ListingGrid";

const LandingPage = () => {
  return (
    <div className="pt-16">
      <HeroSection />
      <CategoryTabs />
      <ListingGrid />
    </div>
  );
};

export default LandingPage;
