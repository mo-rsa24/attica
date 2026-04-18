import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    quote: "Pilates Circle has completely transformed the way I move and feel. The instructors are incredibly attentive and the space is unlike anything I've experienced.",
    name: "Kavya M.",
    location: "HSR Layout",
  },
  {
    quote: "The reformer classes here are world-class. I've tried many studios in Bangalore, but the attention to detail and warmth at Pilates Circle is unmatched.",
    name: "Rohit S.",
    location: "Indiranagar",
  },
  {
    quote: "As someone recovering from a back injury, the personalised sessions have been life-changing. My posture and core strength have improved dramatically.",
    name: "Sneha R.",
    location: "Koramangala",
  },
  {
    quote: "The ambiance is so calming and the equipment is top-notch. Every session feels like a wellness retreat. Truly a bespoke pilates experience.",
    name: "Aditya K.",
    location: "HSR Layout",
  },
];

const TestimonialsSection = () => {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent((c) => (c + 1) % testimonials.length);

  return (
    <section id="testimonials" className="py-20 md:py-32 px-6 md:px-12 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-5xl font-display font-medium text-foreground mb-4">
          What Our Members Say
        </h2>
      </motion.div>

      <div className="max-w-3xl mx-auto relative">
        <div className="min-h-[200px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="text-center px-8"
            >
              <p className="text-lg md:text-2xl font-display font-normal text-foreground leading-relaxed mb-8 italic">
                "{testimonials[current].quote}"
              </p>
              <p className="font-body font-medium text-foreground text-sm">
                {testimonials[current].name}
              </p>
              <p className="font-body font-light text-muted-foreground text-xs">
                {testimonials[current].location}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-center gap-6 mt-10">
          <button
            onClick={prev}
            className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === current ? "bg-terracotta" : "bg-border"
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
          <button
            onClick={next}
            className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
            aria-label="Next testimonial"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
