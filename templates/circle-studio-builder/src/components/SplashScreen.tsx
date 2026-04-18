import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import heroImage from "@/assets/hero-pilates.jpg";
import logo from "@/assets/pilates-circle-logo.png";

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 800);
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
        >
          {/* Blurred background */}
          <div className="absolute inset-0">
            <img
              src={heroImage}
              alt=""
              className="w-full h-full object-cover blur-xl scale-110"
            />
            <div className="absolute inset-0 bg-terracotta/40" />
          </div>

          {/* Animated circles */}
          <div className="absolute inset-0 flex items-center justify-center">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.8, opacity: 0, rotate: -30 }}
                animate={{ scale: 1, opacity: 0.15, rotate: 0 }}
                transition={{ delay: 0.3 + i * 0.2, duration: 1.2, ease: "easeOut" }}
                className="absolute rounded-full border border-cream/30"
                style={{
                  width: `${220 + i * 60}px`,
                  height: `${220 + i * 60}px`,
                }}
              />
            ))}
          </div>

          {/* Floating particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 0.4, 0],
                y: [0, -30, -60],
                x: [0, (i % 2 === 0 ? 10 : -10)],
              }}
              transition={{
                duration: 3,
                delay: 0.5 + i * 0.3,
                repeat: Infinity,
                repeatDelay: 1,
              }}
              className="absolute w-1 h-1 rounded-full bg-cream/50"
              style={{
                left: `${20 + i * 12}%`,
                top: `${40 + (i % 3) * 15}%`,
              }}
            />
          ))}

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="relative z-10"
          >
            <img src={logo} alt="Pilates Circle by Cult" className="w-48 md:w-64" />
          </motion.div>

          {/* Bottom loading bar */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
            className="absolute bottom-[40%] left-1/2 -translate-x-1/2 w-24 h-[2px] bg-cream/40 origin-left rounded-full"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
