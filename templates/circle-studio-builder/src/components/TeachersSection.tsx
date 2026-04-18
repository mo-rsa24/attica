import { motion } from "framer-motion";

const teachers = [
  {
    name: "Priya Sharma",
    specialty: "Reformer & Mat Pilates",
    experience: "8+ years",
    bio: "Certified PMA instructor with a focus on rehabilitation and posture correction.",
  },
  {
    name: "Ananya Reddy",
    specialty: "Wunda Chair & Cadillac",
    experience: "6+ years",
    bio: "Specialises in dynamic strength training and advanced apparatus work.",
  },
  {
    name: "Meera Iyer",
    specialty: "Pre & Postnatal Pilates",
    experience: "10+ years",
    bio: "Expert in adaptive pilates for all life stages with gentle, mindful approach.",
  },
];

const TeachersSection = () => {
  return (
    <section id="teachers" className="py-20 md:py-32 px-6 md:px-12 bg-secondary">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-5xl font-display font-medium text-foreground mb-4">
          Our Teachers
        </h2>
        <p className="text-muted-foreground font-body font-light text-lg max-w-lg mx-auto">
          Guided by passion, driven by expertise.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {teachers.map((teacher, i) => (
          <motion.div
            key={teacher.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            className="text-center"
          >
            <div className="w-28 h-28 mx-auto mb-6 rounded-full bg-terracotta/20 flex items-center justify-center">
              <span className="text-3xl font-display font-medium text-terracotta">
                {teacher.name.split(" ").map(n => n[0]).join("")}
              </span>
            </div>
            <h3 className="text-xl font-display font-medium text-foreground mb-1">
              {teacher.name}
            </h3>
            <p className="text-terracotta font-body text-sm font-medium mb-1">
              {teacher.specialty}
            </p>
            <p className="text-muted-foreground font-body text-xs mb-3">
              {teacher.experience} experience
            </p>
            <p className="text-muted-foreground font-body font-light text-sm">
              {teacher.bio}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default TeachersSection;
