import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import studioWunda from "@/assets/studio-wunda.jpg";
import studioReformer from "@/assets/studio-reformer.jpg";
import studioReception from "@/assets/studio-reception.jpg";
import studioInterior from "@/assets/studio-interior.jpg";

const studios = [
  { title: "Wunda Chair Studio", description: "Dynamic strength training with the iconic Wunda chair equipment", image: studioWunda },
  { title: "Reformer Training Area", description: "Professional reformer machines arranged for group classes", image: studioReformer },
  { title: "Reception Area", description: "Modern reception area with comfortable seating", image: studioReception },
  { title: "Studio Interior", description: "Bright and airy practice space with natural lighting", image: studioInterior },
];

const StudioTourSection = () => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0); // -1 = left, 1 = right

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((c) => (c - 1 + studios.length) % studios.length);
  }, []);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((c) => (c + 1) % studios.length);
  }, []);

  const getIndex = (offset: number) => (current + offset + studios.length) % studios.length;

  const cards = [
    { position: "left", index: getIndex(-1) },
    { position: "center", index: getIndex(0) },
    { position: "right", index: getIndex(1) },
  ];

  const positionStyles: Record<string, { x: string; scale: number; rotateY: number; opacity: number }> = {
    left: { x: "-60%", scale: 0.75, rotateY: 18, opacity: 0.6 },
    center: { x: "0%", scale: 1, rotateY: 0, opacity: 1 },
    right: { x: "60%", scale: 0.75, rotateY: -18, opacity: 0.6 },
  };

  return (
    <section id="our-studio" className="py-20 md:py-32 px-6 md:px-12 bg-gradient-to-b from-terracotta-dark to-warm-brown relative overflow-hidden">
      {/* Subtle decorative dots */}
      <div className="absolute top-20 left-10 w-2 h-2 rounded-full bg-cream/20" />
      <div className="absolute top-40 left-20 w-1.5 h-1.5 rounded-full bg-cream/15" />
      <div className="absolute bottom-32 right-16 w-2 h-2 rounded-full bg-cream/20" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-5xl font-display font-medium text-cream mb-4">
          Tour our Space
        </h2>
        <p className="text-cream/70 font-body font-light text-lg">
          Experience our studio in immersive 3D.
        </p>
      </motion.div>

      {/* 3D Carousel */}
      <div className="relative max-w-5xl mx-auto h-[400px] md:h-[500px] flex items-center justify-center" style={{ perspective: "1200px" }}>
        {/* Nav Arrows */}
        <button
          onClick={prev}
          className="absolute left-0 md:-left-4 z-30 w-12 h-12 rounded-full bg-cream/15 backdrop-blur-sm border border-cream/20 flex items-center justify-center text-cream/70 hover:bg-cream/25 hover:text-cream transition-all"
          aria-label="Previous slide"
        >
          <ChevronLeft size={22} />
        </button>
        <button
          onClick={next}
          className="absolute right-0 md:-right-4 z-30 w-12 h-12 rounded-full bg-cream/15 backdrop-blur-sm border border-cream/20 flex items-center justify-center text-cream/70 hover:bg-cream/25 hover:text-cream transition-all"
          aria-label="Next slide"
        >
          <ChevronRight size={22} />
        </button>

        {/* Cards */}
        <div className="relative w-full h-full flex items-center justify-center" style={{ transformStyle: "preserve-3d" }}>
          <AnimatePresence initial={false} mode="sync">
            {cards.map(({ position, index }) => {
              const studio = studios[index];
              const style = positionStyles[position];

              // Enter from the direction of the click
              const enterX = direction > 0
                ? (position === "right" ? "120%" : style.x)
                : (position === "left" ? "-120%" : style.x);

              return (
                <motion.div
                  key={`${index}`}
                  initial={{
                    x: enterX,
                    scale: 0.65,
                    rotateY: direction > 0 ? -25 : 25,
                    opacity: 0,
                  }}
                  animate={{
                    x: style.x,
                    scale: style.scale,
                    rotateY: style.rotateY,
                    opacity: style.opacity,
                    zIndex: position === "center" ? 20 : 10,
                  }}
                  exit={{
                    x: direction > 0 ? "-120%" : "120%",
                    scale: 0.65,
                    rotateY: direction > 0 ? 25 : -25,
                    opacity: 0,
                  }}
                  transition={{ duration: 0.6, ease: [0.42, 0, 0.2, 1] }}
                  className="absolute w-[260px] md:w-[360px] h-[340px] md:h-[440px] rounded-2xl overflow-hidden shadow-2xl cursor-pointer"
                  style={{ transformStyle: "preserve-3d" }}
                  onClick={() => {
                    if (position === "left") prev();
                    if (position === "right") next();
                  }}
                >
                  <img
                    src={studio.image}
                    alt={studio.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-warm-brown/80 via-transparent to-transparent" />
                  {position === "center" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="absolute bottom-0 left-0 right-0 p-6"
                    >
                      <h3 className="text-cream text-lg md:text-xl font-display font-medium mb-1">
                        {studio.title}
                      </h3>
                      <p className="text-cream/70 text-sm font-body font-light">
                        {studio.description}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default StudioTourSection;
