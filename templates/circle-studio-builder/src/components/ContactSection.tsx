import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

const locations = [
  {
    name: "HSR Layout",
    address: "No. 27, 14th Main Road, HSR Layout, Sector 4, Bangalore - 560102",
    phone: "+91 98765 43210",
  },
  {
    name: "Indiranagar",
    address: "No. 312, 100 Feet Road, Indiranagar, Bangalore - 560038",
    phone: "+91 98765 43211",
  },
  {
    name: "Koramangala",
    address: "No. 55, 80 Feet Road, Koramangala 4th Block, Bangalore - 560034",
    phone: "+91 98765 43212",
  },
];

const ContactSection = () => {
  return (
    <section id="contact" className="py-20 md:py-32 px-6 md:px-12 bg-secondary">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-5xl font-display font-medium text-foreground mb-4">
          Visit Us
        </h2>
        <p className="text-muted-foreground font-body font-light text-lg">
          Find your nearest studio.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
        {locations.map((loc, i) => (
          <motion.div
            key={loc.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="bg-background rounded-2xl p-6"
          >
            <h3 className="text-lg font-display font-medium text-foreground mb-4">
              {loc.name}
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-terracotta mt-0.5 shrink-0" />
                <p className="text-muted-foreground font-body font-light text-sm">{loc.address}</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-terracotta shrink-0" />
                <p className="text-muted-foreground font-body font-light text-sm">{loc.phone}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-2">
          <Clock size={16} className="text-terracotta" />
          <span className="font-body font-medium text-foreground text-sm">Studio Hours</span>
        </div>
        <p className="text-muted-foreground font-body font-light text-sm">
          Monday – Saturday: 6:00 AM – 9:00 PM
        </p>
        <p className="text-muted-foreground font-body font-light text-sm">
          Sunday: 7:00 AM – 1:00 PM
        </p>
        <div className="flex items-center justify-center gap-3 mt-4">
          <Mail size={16} className="text-terracotta" />
          <a href="mailto:hello@pilatescircle.in" className="text-terracotta font-body text-sm hover:underline">
            hello@pilatescircle.in
          </a>
        </div>
      </motion.div>
    </section>
  );
};

export default ContactSection;
