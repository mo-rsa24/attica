import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import heroImage from "@/assets/hero-pilates.jpg";

const locations = ["HSR Layout", "Indiranagar", "Koramangala"];

const HeroSection = () => {
  const [selectedLocation, setSelectedLocation] = useState("");

  return (
    <section className="relative min-h-screen flex items-end overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Pilates studio"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-warm-brown/60 via-warm-brown/30 to-warm-brown/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-warm-brown/50 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full px-6 md:px-12 pb-16 md:pb-24">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-12">
          {/* Left: Headline */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-xl"
          >
            <h1 className="text-cream text-5xl md:text-7xl lg:text-8xl font-display font-medium leading-[0.95] mb-6">
              Move, full<br />circle.
            </h1>
            <p className="text-cream/80 text-lg md:text-xl font-body font-light leading-relaxed max-w-md">
              Experience pilates, the most authentic way at our one-of-a-kind studio.
            </p>
          </motion.div>

          {/* Right: Callback Form */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="w-full max-w-sm bg-cream/10 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-cream/20"
          >
            <h3 className="text-cream text-xl font-display font-medium mb-1 text-center">
              Begin Your Transformation
            </h3>
            <p className="text-cream/70 text-sm font-body text-center mb-5">
              Starting from ₹900 per session
            </p>

            <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
              <input
                type="text"
                placeholder="Full Name"
                className="w-full px-4 py-3 bg-cream/10 border border-cream/20 rounded-lg text-cream placeholder:text-cream/40 font-body text-sm focus:outline-none focus:border-cream/50 transition-colors"
              />
              <input
                type="tel"
                placeholder="Enter Phone Number"
                className="w-full px-4 py-3 bg-cream/10 border border-cream/20 rounded-lg text-cream placeholder:text-cream/40 font-body text-sm focus:outline-none focus:border-cream/50 transition-colors"
              />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-4 py-3 bg-cream/10 border border-cream/20 rounded-lg text-cream/60 font-body text-sm focus:outline-none focus:border-cream/50 transition-colors appearance-none"
              >
                <option value="" className="bg-foreground">Choose your location *</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc} className="bg-foreground">{loc}</option>
                ))}
              </select>
              <textarea
                placeholder="Message (Optional)"
                rows={2}
                className="w-full px-4 py-3 bg-cream/10 border border-cream/20 rounded-lg text-cream placeholder:text-cream/40 font-body text-sm focus:outline-none focus:border-cream/50 transition-colors resize-none"
              />
              <button
                type="submit"
                className="w-full py-3 bg-cream text-foreground font-body font-medium text-sm rounded-lg hover:bg-cream/90 transition-colors"
              >
                Request A Callback
              </button>
            </form>
          </motion.div>
        </div>

        {/* Discover More */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="flex flex-col items-center mt-12"
        >
          <span className="text-cream/60 text-sm font-body tracking-wide mb-2">Discover More</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <ChevronDown className="text-cream/60" size={24} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
