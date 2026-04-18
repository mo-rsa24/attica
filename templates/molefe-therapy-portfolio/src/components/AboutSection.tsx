import { GraduationCap, Stethoscope, BookOpen, Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";

const qualifications = [
  { degree: "DLitt et Phil (Psychology)", institution: "University of Johannesburg", icon: BookOpen, tier: "doctoral" },
  { degree: "M.A. Psychology", institution: "University of Johannesburg", icon: BookOpen, tier: "masters" },
  { degree: "B.Psych", institution: "University of Johannesburg", icon: GraduationCap, tier: "bachelors" },
  { degree: "B.Com", institution: "Vista University", icon: Building2, tier: "bachelors" },
  { degree: "Diploma in General Nursing", institution: "Healthcare", icon: Stethoscope, tier: "diploma" },
  { degree: "Diploma in Midwifery", institution: "Healthcare", icon: Stethoscope, tier: "diploma" },
  { degree: "Diploma in Intensive Care", institution: "Healthcare", icon: Stethoscope, tier: "diploma" },
];

const aboutImages = [
  "/images/about-1.png",
  "/images/about-2.jpg",
  "/images/about-3.png",
  "/images/about-4.png",
];

const AboutSection = () => {
  const [activeImage, setActiveImage] = useState(0);

  // Preload all carousel images
  useEffect(() => {
    aboutImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  const next = useCallback(() => {
    setActiveImage((prev) => (prev + 1) % aboutImages.length);
  }, []);

  const prev = useCallback(() => {
    setActiveImage((prev) => (prev - 1 + aboutImages.length) % aboutImages.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section id="about" className="section-padding bg-background relative overflow-hidden">
      {/* Subtle background texture */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="max-w-6xl mx-auto relative">
        {/* Section label */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="font-body text-sm uppercase tracking-[0.25em] text-primary mb-3 text-center"
        >
          About
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-display text-3xl md:text-5xl font-semibold text-foreground text-center mb-16"
        >
          A Lifetime of Healing
          <br />
          <span className="italic font-normal text-primary">& Expertise</span>
        </motion.h2>

        {/* Two-column: Bio + Image Carousel */}
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center mb-24">
          {/* Left: Bio */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="space-y-5"
          >
            <p className="font-body text-muted-foreground leading-relaxed">
              Dr. Matilda Molefe is a distinguished clinical psychologist with a
              career spanning decades of dedicated service in mental health care.
              Her unique journey from nursing to psychology gives her an
              unparalleled understanding of both the body and mind.
            </p>
            <p className="font-body text-muted-foreground leading-relaxed">
              With a Doctorate in Psychology from the University of Johannesburg,
              she combines rigorous academic training with deep empathy and
              clinical intuition. Her practice is rooted in evidence-based
              approaches, tailored to each individual's needs.
            </p>
            <p className="font-body text-muted-foreground leading-relaxed">
              Whether working with individuals, couples, or families, Dr. Molefe
              creates a safe, non-judgmental space where healing can truly begin.
              Her holistic background ensures every dimension of wellbeing is
              considered.
            </p>
            <div className="pt-2">
              <span className="inline-block font-body text-xs uppercase tracking-widest text-primary/70 border-b border-primary/30 pb-0.5">
                HPCSA Registered
              </span>
            </div>
          </motion.div>

          {/* Right: Image Carousel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative"
          >
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-elevated bg-card group">
              <AnimatePresence initial={false}>
                <motion.img
                  key={activeImage}
                  src={aboutImages[activeImage]}
                  alt={`Dr. Matilda Molefe - Photo ${activeImage + 1}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </AnimatePresence>

              {/* Gradient overlay at bottom */}
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-foreground/30 to-transparent pointer-events-none" />

              {/* Navigation arrows - visible on hover */}
              <button
                onClick={prev}
                aria-label="Previous photo"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-background/80 text-foreground"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={next}
                aria-label="Next photo"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-background/80 text-foreground"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {aboutImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    aria-label={`View photo ${idx + 1}`}
                    className={`w-2 h-2 rounded-full transition-all duration-400 ${
                      idx === activeImage
                        ? "bg-primary-foreground w-5"
                        : "bg-primary-foreground/50 hover:bg-primary-foreground/70"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Decorative accent */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-2xl border border-primary/20 -z-10" />
            <div className="absolute -top-4 -left-4 w-16 h-16 rounded-xl bg-primary/5 -z-10" />
          </motion.div>
        </div>

        {/* Qualifications Timeline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="font-body text-sm uppercase tracking-[0.25em] text-primary mb-3 text-center"
        >
          Qualifications
        </motion.p>
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-display text-2xl md:text-3xl font-semibold text-foreground text-center mb-16"
        >
          Academic <span className="italic font-normal text-primary">Journey</span>
        </motion.h3>

        <div className="relative">
          {/* Center spine */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px md:-translate-x-px">
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="w-full h-full origin-top bg-gradient-to-b from-primary via-primary/40 to-border"
            />
          </div>

          <div className="space-y-8 md:space-y-12">
            {qualifications.map((q, i) => {
              const isLeft = i % 2 === 0;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, delay: i * 0.08 }}
                  className={`relative flex items-start gap-6 md:gap-0 ${
                    isLeft ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Timeline node */}
                  <div className="absolute left-6 md:left-1/2 -translate-x-1/2 z-10">
                    <motion.div
                      whileInView={{ scale: [0, 1.2, 1] }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.08 + 0.3 }}
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-soft ${
                        q.tier === "doctoral"
                          ? "bg-primary border-primary text-primary-foreground"
                          : q.tier === "masters"
                          ? "bg-primary/15 border-primary text-primary"
                          : q.tier === "bachelors"
                          ? "bg-accent/15 border-accent text-accent"
                          : "bg-card border-border text-muted-foreground"
                      }`}
                    >
                      <q.icon className="w-5 h-5" />
                    </motion.div>
                  </div>

                  {/* Card */}
                  <div
                    className={`ml-16 md:ml-0 md:w-[calc(50%-40px)] ${
                      isLeft ? "md:pr-0 md:text-right" : "md:pl-0 md:text-left"
                    }`}
                  >
                    <motion.div
                      whileHover={{ y: -2, boxShadow: "var(--shadow-elevated)" }}
                      className={`inline-block rounded-2xl border bg-card p-5 shadow-soft transition-all duration-300 group relative overflow-hidden ${
                        q.tier === "doctoral" ? "ring-1 ring-primary/15" : ""
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="relative">
                        {q.tier === "doctoral" && (
                          <span className="inline-block font-body text-[10px] uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-0.5 rounded-full mb-2">
                            Doctorate
                          </span>
                        )}
                        <p className="font-display text-base font-semibold text-foreground leading-snug">
                          {q.degree}
                        </p>
                        <p className="font-body text-xs text-muted-foreground mt-1">
                          {q.institution}
                        </p>
                      </div>
                    </motion.div>
                  </div>

                  <div className="hidden md:block md:w-[calc(50%-40px)]" />
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
            className="absolute left-6 md:left-1/2 -translate-x-1/2 -bottom-3 w-3 h-3 rounded-full bg-border"
          />
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
