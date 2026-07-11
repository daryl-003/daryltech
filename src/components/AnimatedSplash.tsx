import { motion } from "framer-motion";

/**
 * Decorative animated splash for hero/section backgrounds.
 * Uses two slow-drifting blurred gradient blobs + a fine grid overlay.
 * Pointer-events disabled; safe to drop behind any content.
 */
const AnimatedSplash = ({
  className = "",
  intensity = "medium",
}: {
  className?: string;
  intensity?: "soft" | "medium" | "strong";
}) => {
  const opacity = intensity === "soft" ? 0.25 : intensity === "strong" ? 0.7 : 0.45;
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <motion.div
        className="absolute -top-32 -left-32 h-[520px] w-[520px] rounded-full bg-primary/30 blur-3xl"
        style={{ opacity }}
        animate={{ x: [0, 60, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 -right-32 h-[600px] w-[600px] rounded-full blur-3xl"
        style={{
          opacity,
          background: "radial-gradient(closest-side, hsl(var(--gradient-end) / 0.4), transparent)",
        }}
        animate={{ x: [0, -50, 0], y: [0, -40, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        }}
      />
    </div>
  );
};

export default AnimatedSplash;
