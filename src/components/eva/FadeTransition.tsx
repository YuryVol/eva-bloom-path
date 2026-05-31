import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";

export function FadeTransition({ k, children }: { k: string; children: ReactNode }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={k}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="h-full w-full min-h-0 overflow-y-auto"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
