"use client";

import { AnimatePresence, motion } from "framer-motion";

type PeopleSelectorProps = {
  value: number;
  onChange: (value: number) => void;
};

export default function PeopleSelector({ value, onChange }: PeopleSelectorProps) {
  const min = 1;
  const max = 20;

  function decrease() {
    if (value > min) onChange(value - 1);
  }

  function increase() {
    if (value < max) onChange(value + 1);
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={decrease}
          disabled={value <= min}
          aria-label="Fewer people"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--surface)] text-2xl font-semibold text-[var(--foreground)] shadow-[var(--shadow)] transition active:scale-95 disabled:opacity-30"
        >
          −
        </button>

        <div className="min-w-[4rem] text-center">
          <motion.span
            key={value}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-block text-5xl font-bold tracking-tight"
          >
            {value}
          </motion.span>
        </div>

        <button
          type="button"
          onClick={increase}
          disabled={value >= max}
          aria-label="More people"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--surface)] text-2xl font-semibold text-[var(--foreground)] shadow-[var(--shadow)] transition active:scale-95 disabled:opacity-30"
        >
          +
        </button>
      </div>

      <div className="flex max-w-xs flex-wrap justify-center gap-2">
        <AnimatePresence mode="popLayout">
          {Array.from({ length: value }, (_, i) => (
            <motion.span
              key={i}
              layout
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              className="text-2xl"
              aria-hidden="true"
            >
              👤
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      <p className="text-[var(--muted)]">
        {value === 1 ? "1 person" : `${value} people`}
      </p>
    </div>
  );
}
