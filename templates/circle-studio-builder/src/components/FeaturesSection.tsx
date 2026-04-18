import { motion } from "framer-motion";
import bespokeImg from "@/assets/bespoke-space.jpg";
import immersiveImg from "@/assets/immersive-workouts.jpg";
import trainersImg from "@/assets/intuitive-trainers.jpg";

const features = [
  {
    title: "Bespoke Space",
    description: "Thoughtfully curated, intricately designed.",
    image: bespokeImg,
  },
  {
    title: "Immersive Workouts",
    description: "Deeply rooted in timeless traditions.",
    image: immersiveImg,
  },
  {
    title: "Intuitive Trainers",
    description: "Expert guidance for unique journeys.",
    image: trainersImg,
  },
];

const FeaturesSection = () => {
  return (
    <section id="why-pilates" className="py-20 md:py-32 px-6 md:px-12 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-5xl font-display font-medium text-foreground">
          A studio where control meets calm.
        </h2>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.15 }}
            className="group cursor-pointer"
          >
            <div className="overflow-hidden rounded-2xl mb-5 aspect-square">
              <img
                src={feature.image}
                alt={feature.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <h3 className="text-xl font-display font-medium text-foreground mb-2">
              {feature.title}
            </h3>
            <p className="text-muted-foreground font-body font-light text-sm">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
