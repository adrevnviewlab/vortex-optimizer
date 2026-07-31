"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "../lib/cn";
import { Card } from "./Card";

export interface FlipCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export function FlipCard({ title, description, icon }: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="h-48 cursor-pointer [perspective:1000px] md:h-52"
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      onClick={() => setFlipped((f) => !f)}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative h-full w-full [transform-style:preserve-3d] motion-reduce:transition-none"
        style={{ transformStyle: "preserve-3d" }}
      >
        <Card
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center text-center [backface-visibility:hidden]",
            "hover:translate-y-0 hover:shadow-[var(--shadow-sm)]"
          )}
        >
          {icon && (
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--brand-primary-subtle)]">
              {icon}
            </div>
          )}
          <h3 className="text-[var(--font-h3)] font-semibold">{title}</h3>
        </Card>
        <Card
          className={cn(
            "absolute inset-0 flex items-center justify-center p-6 text-center [backface-visibility:hidden]",
            "hover:translate-y-0 hover:shadow-[var(--shadow-sm)]"
          )}
          style={{ transform: "rotateY(180deg)" }}
        >
          <p className="text-[var(--font-body-sm)] text-[var(--text-secondary)]">{description}</p>
        </Card>
      </motion.div>
    </div>
  );
}
