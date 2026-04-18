import { useState, useCallback, useEffect } from "react";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const testimonials = [
  {
    name: "Thandi M.",
    text: "Dr. Molefe helped me navigate one of the most difficult periods of my life. Her warmth and expertise made me feel safe to open up and truly heal.",
    service: "Individual Therapy",
  },
  {
    name: "James K.",
    text: "After years of struggling with anxiety, I finally found someone who truly listens. Dr. Molefe's approach is compassionate, thorough, and genuinely transformative.",
    service: "Individual Therapy",
  },
  {
    name: "Lerato & Sipho N.",
    text: "Our marriage was on the brink. Dr. Molefe gave us the tools to communicate again and rebuild our relationship. We are deeply grateful.",
    service: "Couples Therapy",
  },
  {
    name: "Nomsa P.",
    text: "The psychological assessment was incredibly insightful. Dr. Molefe explained everything clearly and helped me understand myself in ways I never had before.",
    service: "Psychological Assessment",
  },
  {
    name: "David R.",
    text: "Losing my father was devastating. Dr. Molefe walked with me through my grief with such patience and care. I wouldn't have made it without her support.",
    service: "Grief Counselling",
  },
  {
    name: "Palesa S.",
    text: "Professional, empathetic, and incredibly knowledgeable. Dr. Molefe is exactly the kind of psychologist everyone deserves access to.",
    service: "Individual Therapy",
  },
];

const TestimonialsSection = () => {
  const [active, setActive] = useState(0);
  const total = testimonials.length;

  const next = useCallback(() => setActive((i) => (i + 1) % total), [total]);
  const prev = useCallback(() => setActive((i) => (i - 1 + total) % total), [total]);

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev]);

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const getSlideStyle = (index: number) => {
    const offset = index - active;
    // Wrap around for smooth circular feel
    let normalizedOffset = offset;
    if (offset > total / 2) normalizedOffset = offset - total;
    if (offset < -total / 2) normalizedOffset = offset + total;

    const absOffset = Math.abs(normalizedOffset);
    const rotateY = normalizedOffset * 45;
    const translateX = normalizedOffset * 280;
    const translateZ = -absOffset * 200;
    const scale = 1 - absOffset * 0.15;
    const opacity = absOffset > 2 ? 0 : 1 - absOffset * 0.3;
    const zIndex = total - absOffset;

    return {
      transform: `perspective(1200px) translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
      opacity: Math.max(0, opacity),
      zIndex,
      filter: absOffset > 0 ? `blur(${absOffset * 1}px)` : "none",
    };
  };

  return (
    <section id="testimonials" className="section-padding bg-background relative overflow-hidden" aria-label="Patient testimonials" role="region">
      <div className="max-w-6xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="font-body text-sm uppercase tracking-[0.25em] text-primary mb-3 text-center"
        >
          Testimonials
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-display text-3xl md:text-5xl font-semibold text-foreground text-center mb-4"
        >
          What Patients Say
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="font-body text-muted-foreground text-center max-w-xl mx-auto mb-16 leading-relaxed"
        >
          Real stories from patients whose lives have been touched by Dr. Molefe's care.
        </motion.p>

        {/* 3D Coverflow Carousel */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative"
        >
          {/* Carousel container */}
          <div
            className="relative mx-auto flex items-center justify-center"
            style={{ height: 340, perspective: "1200px" }}
            role="group"
            aria-roledescription="carousel"
            aria-label="Patient testimonials"
          >
            {testimonials.map((t, i) => {
              const style = getSlideStyle(i);
              return (
                <div
                  key={i}
                  onClick={() => setActive(i)}
                  className="absolute w-[320px] md:w-[380px] cursor-pointer"
                  style={{
                    ...style,
                    transition: "all 0.6s cubic-bezier(0.23, 1, 0.32, 1)",
                    transformStyle: "preserve-3d",
                    pointerEvents: Math.abs(i - active) > 2 ? "none" : "auto",
                  }}
                >
                  <div className={`bg-card rounded-2xl border p-7 flex flex-col shadow-soft transition-shadow duration-300 ${
                    i === active ? "shadow-elevated ring-1 ring-primary/10" : ""
                  }`}>
                    <Quote className="w-7 h-7 text-primary/25 mb-4 shrink-0" />
                    <p className="font-body text-sm text-foreground leading-relaxed flex-1 mb-5">
                      "{t.text}"
                    </p>
                    <div className="border-t pt-4">
                      <p className="font-body font-semibold text-sm text-foreground">{t.name}</p>
                      <p className="font-body text-xs text-muted-foreground">{t.service}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation arrows */}
          <div className="flex items-center justify-center gap-6 mt-8">
            <button
              onClick={prev}
              aria-label="Previous testimonial"
              className="w-11 h-11 rounded-full border bg-card flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 hover:shadow-soft transition-all duration-200"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`Go to testimonial ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === active
                      ? "w-6 bg-primary"
                      : "w-2 bg-border hover:bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              aria-label="Next testimonial"
              className="w-11 h-11 rounded-full border bg-card flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 hover:shadow-soft transition-all duration-200"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
