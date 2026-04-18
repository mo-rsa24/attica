import { Brain, Heart, Users, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const services = [
  {
    icon: Brain,
    title: "Individual Therapy",
    description:
      "One-on-one sessions tailored to address anxiety, depression, trauma, and personal development.",
  },
  {
    icon: Users,
    title: "Couples & Family Therapy",
    description:
      "Helping families and partners navigate conflict, improve communication, and strengthen bonds.",
  },
  {
    icon: Heart,
    title: "Trauma & Grief Counselling",
    description:
      "Compassionate support for processing loss, trauma, and life transitions with evidence-based approaches.",
  },
  {
    icon: Sparkles,
    title: "Psychological Assessments",
    description:
      "Comprehensive evaluations for diagnostic clarity, career guidance, and personal insight.",
  },
];

const ServicesSection = () => {
  return (
    <section id="services" className="section-padding bg-secondary relative overflow-hidden" aria-label="Services">
      {/* Decorative accent */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      
      <div className="max-w-5xl mx-auto relative">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="font-body text-sm uppercase tracking-[0.25em] text-primary mb-3 text-center"
        >
          Services
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-display text-3xl md:text-5xl font-semibold text-foreground text-center mb-4"
        >
          How I Can Help
        </motion.h2>
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-16 h-[2px] bg-primary mx-auto mb-16"
        />

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-8">
          {services.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              whileHover={{ y: -4, boxShadow: "var(--shadow-elevated)" }}
              className="bg-background rounded-2xl p-6 sm:p-8 border shadow-soft transition-all duration-300 group relative overflow-hidden focus-within:ring-2 focus-within:ring-primary"
            >
              {/* Hover gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/15 transition-colors duration-300">
                  <s.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                  {s.title}
                </h3>
                <p className="font-body text-muted-foreground text-sm leading-relaxed">
                  {s.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
