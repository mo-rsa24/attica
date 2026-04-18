import { motion } from "framer-motion";

const Footer = () => {
  const address = "52 Lutyens St. CE 2, Vanderbijlpark";
  const mapQuery = encodeURIComponent(address);
  const mapSrc = `https://maps.google.com/maps?q=${mapQuery}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  return (
    <footer className="bg-foreground relative overflow-hidden">
      {/* Map Section */}
      <div className="relative">
        <div className="grid md:grid-cols-2">
          {/* Map embed */}
          <div className="h-[250px] sm:h-[300px] md:h-[400px] relative">
            <iframe
              src={mapSrc}
              title="Dr. Matilda Molefe Office Location"
              className="absolute inset-0 w-full h-full border-0 grayscale-[30%] contrast-[1.1]"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Map info overlay */}
          <div className="flex items-center justify-center p-6 sm:p-8 md:p-12 bg-foreground">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center md:text-left"
            >
              <p className="font-body text-[10px] uppercase tracking-[0.3em] text-primary-foreground/40 mb-3">
                Visit Us
              </p>
              <p className="font-display text-xl md:text-2xl text-primary-foreground/90 mb-3">
                Our Practice
              </p>
              <p className="font-body text-sm text-primary-foreground/60 leading-relaxed mb-5 max-w-xs">
                {address}
              </p>
              <a
                href={`https://maps.google.com/?q=${mapQuery}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block font-body text-xs uppercase tracking-wider text-primary-foreground/50 border border-primary-foreground/20 rounded-full px-5 py-2 hover:text-primary-foreground/80 hover:border-primary-foreground/40 transition-all duration-300"
              >
                Get Directions →
              </a>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-primary-foreground/10 py-8 px-6 text-center">
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(hsl(var(--primary-foreground)) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <p className="font-display text-lg text-primary-foreground/90 mb-1">
            Dr. Matilda Molefe
          </p>
          <p className="font-body text-xs text-primary-foreground/40 tracking-wider uppercase">
            Clinical Psychologist · Vanderbijlpark
          </p>
          <div className="w-12 h-[1px] bg-primary-foreground/20 mx-auto my-4" />
          <p className="font-body text-xs text-primary-foreground/30">
            © {new Date().getFullYear()} All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
