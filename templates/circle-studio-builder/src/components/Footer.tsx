const Footer = () => {
  return (
    <footer className="bg-warm-brown py-16 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          <div>
            <h3 className="font-display text-cream text-2xl font-semibold leading-tight mb-4">
              pilates circle
            </h3>
            <p className="text-cream/50 font-body text-sm font-light max-w-xs">
              Experience pilates, the most authentic way at our one-of-a-kind studio.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-16 gap-y-3">
            {["Why Pilates", "Our Studio", "Classes", "Teachers", "Testimonials", "Contact"].map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(/\s/g, "-")}`}
                className="text-cream/60 hover:text-cream text-sm font-body font-light transition-colors"
              >
                {link}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-cream/10">
          <p className="text-cream/30 text-xs font-body text-center">
            © 2026 Pilates Circle by Cult. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
