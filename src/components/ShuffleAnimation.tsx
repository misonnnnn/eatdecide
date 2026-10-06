"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const SHUFFLE_EMOJIS = ["🍕", "🍜", "🍗", "🍔", "🍣", "🌮", "🍝", "🥗", "🍰", "🍚"];

type ShuffleAnimationProps = {
  onDone: () => void;
  durationMs?: number;
};

export default function ShuffleAnimation({
  onDone,
  durationMs = 1600,
}: ShuffleAnimationProps) {
  const [emoji, setEmoji] = useState(SHUFFLE_EMOJIS[0]);

  useEffect(() => {
    const start = Date.now();
    let frame = 0;

    const interval = setInterval(() => {
      frame += 1;
      setEmoji(SHUFFLE_EMOJIS[frame % SHUFFLE_EMOJIS.length]);

      if (Date.now() - start >= durationMs) {
        clearInterval(interval);
        onDone();
      }
    }, 120);

    return () => clearInterval(interval);
  }, [durationMs, onDone]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
        Let&apos;s decide...
      </p>
      <motion.div
        key={emoji}
        initial={{ scale: 0.6, rotate: -12, opacity: 0.5 }}
        animate={{ scale: 1.15, rotate: 0, opacity: 1 }}
        className="text-7xl sm:text-8xl"
      >
        {emoji}
      </motion.div>
      <div className="flex gap-2">
        {SHUFFLE_EMOJIS.slice(0, 5).map((e, i) => (
          <span
            key={`${e}-${i}`}
            className="animate-pulse text-2xl opacity-40"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            {e}
          </span>
        ))}
      </div>
    </div>
  );
}
