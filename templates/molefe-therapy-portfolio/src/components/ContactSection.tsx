import { Mail, Phone, MapPin, PhoneCall } from "lucide-react";
import { motion } from "framer-motion";

const contactItems = [
  {
    icon: Mail,
    label: "Email",
    value: "ngimolefe@yahoo.com",
    href: "mailto:ngimolefe@yahoo.com",
  },
  {
    icon: Phone,
    label: "Cell",
    value: "082 302 8366",
    href: "tel:+27823028366",
  },
  {
    icon: PhoneCall,
    label: "Office",
    value: "016 931 2961",
    href: "tel:+27169312961",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "52 Lutyens St. CE 2, Vanderbijlpark",
    href: "https://maps.google.com/?q=52+Lutyens+St+CE+2+Vanderbijlpark",
  },
];

const ContactSection = () => {
  return (
    <section id="contact" className="section-padding bg-background relative" aria-label="Contact information">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="max-w-4xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="font-body text-sm uppercase tracking-[0.25em] text-primary mb-3 text-center"
        >
          Get in Touch
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-display text-3xl md:text-5xl font-semibold text-foreground text-center mb-6"
        >
          Contact Dr. Molefe
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="font-body text-muted-foreground text-center max-w-lg mx-auto mb-14 leading-relaxed"
        >
          Ready to take the first step? Reach out to schedule a consultation or ask any questions.
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {contactItems.map((item, i) => (
            <motion.a
              key={i}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              whileHover={{ y: -3, boxShadow: "var(--shadow-elevated)" }}
              href={item.href}
              target={item.icon === MapPin ? "_blank" : undefined}
              rel={item.icon === MapPin ? "noopener noreferrer" : undefined}
              className="flex items-start gap-4 p-5 sm:p-6 rounded-2xl bg-card border shadow-soft transition-all duration-300 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              aria-label={`${item.label}: ${item.value}`}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 group-hover:shadow-glow transition-all duration-300">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  {item.label}
                </p>
                <p className="font-body text-sm font-medium text-foreground">
                  {item.value}
                </p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
