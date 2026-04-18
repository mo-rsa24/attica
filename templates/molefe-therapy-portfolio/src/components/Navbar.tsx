import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { label: "Home", href: "/#home" },
  { label: "About", href: "/#about" },
  { label: "Services", href: "/#services" },
  { label: "Testimonials", href: "/#testimonials" },
  { label: "Book", href: "/book" },
  { label: "My Portal", href: "/my-appointments" },
  { label: "Contact", href: "/#contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("/#")) {
      e.preventDefault();
      const hash = href.slice(1);
      if (location.pathname !== "/") {
        navigate("/" + hash);
      } else {
        const el = document.querySelector(hash);
        el?.scrollIntoView({ behavior: "smooth" });
      }
      setOpen(false);
    } else {
      setOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, href: string) => {
    if (e.key === "Escape") setOpen(false);
  };

  const isActive = (href: string) => {
    if (href.startsWith("/#")) return location.pathname === "/" && location.hash === href.slice(1);
    return location.pathname === href;
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass shadow-soft" : "bg-transparent"
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
        <a
          href="/"
          onClick={(e) => handleClick(e, "/#home")}
          className="font-display text-lg sm:text-xl font-semibold text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
        >
          Dr. Matilda Molefe
        </a>

        {/* Desktop */}
        <ul className="hidden lg:flex gap-6 xl:gap-8" role="menubar">
          {links.map((l) => (
            <li key={l.href} role="none">
              <a
                href={l.href}
                onClick={(e) => handleClick(e, l.href)}
                role="menuitem"
                aria-current={isActive(l.href) ? "page" : undefined}
                className={`font-body text-sm font-medium transition-colors relative group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm px-1 py-0.5 ${
                  isActive(l.href) ? "text-primary" : "text-muted-foreground hover:text-primary"
                }`}
              >
                {l.label}
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-primary group-hover:w-full transition-all duration-300" />
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile toggle */}
        <button
          className="lg:hidden text-foreground p-2 -mr-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 top-[56px] bg-foreground/20 backdrop-blur-sm lg:hidden z-40"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden glass border-t overflow-hidden relative z-50"
              role="menu"
            >
              <ul className="flex flex-col gap-1 px-6 py-4">
                {links.map((l, i) => (
                  <motion.li
                    key={l.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    role="none"
                  >
                    <a
                      href={l.href}
                      onClick={(e) => handleClick(e, l.href)}
                      role="menuitem"
                      tabIndex={0}
                      className={`font-body text-sm font-medium transition-colors block py-3 px-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        isActive(l.href)
                          ? "text-primary bg-primary/5"
                          : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                      }`}
                    >
                      {l.label}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
