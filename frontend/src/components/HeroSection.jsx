import React from "react";

const HeroSection = () => (
  <section className="bg-gray-100 py-12">
    <div className="container mx-auto px-4 text-center">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">Find your perfect stay</h1>
      <input
        type="text"
        placeholder="Search destinations"
        className="border rounded w-full max-w-md mx-auto p-2"
      />
    </div>
  </section>
);

export default HeroSection;