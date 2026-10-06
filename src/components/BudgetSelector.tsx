"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { formatPeso } from "@/lib/format";

const PRESETS = [100, 200, 300, 500, 800, 1000, 1500, 2000];

type BudgetSelectorProps = {
  value: number;
  people: number;
  onChange: (value: number) => void;
};

export default function BudgetSelector({
  value,
  people,
  onChange,
}: BudgetSelectorProps) {
  const [customMode, setCustomMode] = useState(!PRESETS.includes(value) && value !== 2000);
  const [customInput, setCustomInput] = useState(String(value));
  const perPerson = Math.round(value / people);
  const isPlus = value >= 2000 && PRESETS.includes(2000) && value === 2000;

  function selectPreset(amount: number) {
    setCustomMode(false);
    onChange(amount);
    setCustomInput(String(amount));
  }

  function applyCustom(raw: string) {
    setCustomInput(raw);
    const num = Number(raw.replace(/[^0-9]/g, ""));
    if (num > 0) onChange(num);
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="rounded-3xl bg-[var(--surface)] p-6 text-center shadow-[var(--shadow)]">
        <p className="text-sm font-medium uppercase tracking-wider text-[var(--muted)]">
          Group budget
        </p>
        <motion.p
          key={value}
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl"
        >
          {formatPeso(value)}
          {isPlus && value === 2000 ? "+" : ""}
        </motion.p>
        <p className="mt-2 text-[var(--muted)]">
          About {formatPeso(perPerson)} per person
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {PRESETS.map((amount) => {
          const selected = !customMode && value === amount;
          const label = amount === 2000 ? "₱2,000+" : formatPeso(amount);

          return (
            <button
              key={amount}
              type="button"
              onClick={() => selectPreset(amount)}
              className={`rounded-2xl px-3 py-4 text-sm font-semibold transition active:scale-[0.98] ${
                selected
                  ? "bg-[var(--accent)] text-white shadow-md"
                  : "bg-[var(--surface)] text-[var(--foreground)] shadow-[var(--shadow)] hover:bg-[var(--surface-muted)]"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div>
        {!customMode ? (
          <button
            type="button"
            onClick={() => setCustomMode(true)}
            className="w-full rounded-2xl border border-dashed border-[var(--border)] px-4 py-3 text-sm font-medium text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            Enter custom amount
          </button>
        ) : (
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[var(--muted)]">
              Custom amount (₱)
            </span>
            <input
              type="number"
              min={50}
              step={50}
              value={customInput}
              onChange={(e) => applyCustom(e.target.value)}
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-lg font-semibold outline-none ring-[var(--accent)] focus:ring-2"
              placeholder="e.g. 750"
            />
          </label>
        )}
      </div>
    </div>
  );
}
