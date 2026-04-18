import { motion } from "framer-motion";

const classes = [
  {
    name: "Reformer Pilates",
    duration: "55 min",
    level: "All Levels",
    price: "₹1,200",
    description: "Full-body workout on the reformer machine targeting strength, flexibility, and posture.",
  },
  {
    name: "Mat Pilates",
    duration: "50 min",
    level: "Beginner",
    price: "₹900",
    description: "Classic floor-based pilates focusing on core strength and body awareness.",
  },
  {
    name: "Wunda Chair",
    duration: "45 min",
    level: "Intermediate",
    price: "₹1,100",
    description: "Dynamic strength training using the Wunda chair for targeted muscle engagement.",
  },
  {
    name: "Private Session",
    duration: "60 min",
    level: "Personalised",
    price: "₹2,500",
    description: "One-on-one training tailored to your specific goals and body needs.",
  },
];

const ClassesSection = () => {
  return (
    <section id="classes" className="py-20 md:py-32 px-6 md:px-12 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-5xl font-display font-medium text-foreground mb-4">
          Our Classes
        </h2>
        <p className="text-muted-foreground font-body font-light text-lg max-w-lg mx-auto">
          Find the perfect practice for your journey.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {classes.map((cls, i) => (
          <motion.div
            key={cls.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="bg-secondary rounded-2xl p-6 flex flex-col justify-between group hover:bg-terracotta/10 transition-colors duration-300"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-body font-light text-muted-foreground tracking-wider uppercase">
                  {cls.level}
                </span>
                <span className="text-xs font-body text-muted-foreground">
                  {cls.duration}
                </span>
              </div>
              <h3 className="text-lg font-display font-medium text-foreground mb-2">
                {cls.name}
              </h3>
              <p className="text-muted-foreground font-body font-light text-sm mb-6">
                {cls.description}
              </p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <span className="text-xl font-display font-medium text-foreground">
                {cls.price}
              </span>
              <span className="text-xs font-body text-muted-foreground">per session</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default ClassesSection;
