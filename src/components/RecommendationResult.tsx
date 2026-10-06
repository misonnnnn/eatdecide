"use client";

import { motion } from "framer-motion";
import { formatPeso } from "@/lib/format";
import type { Recommendation } from "@/lib/types";

type RecommendationResultProps = {
  result: Recommendation;
  saved: boolean;
  onTryAgain: () => void;
  onChangeChoices: () => void;
  onSave: () => void;
};

export default function RecommendationResult({
  result,
  saved,
  onTryAgain,
  onChangeChoices,
  onSave,
}: RecommendationResultProps) {
  const { food, people, budget, costPerPerson, totalCost, suggestedOrder, split } =
    result;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mx-auto flex w-full max-w-md flex-col gap-8 pb-10"
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.5, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 16 }}
          className="mb-4 text-7xl"
        >
          {food.emoji}
        </motion.div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
          We decided
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
          {food.name}
        </h1>
        <p className="mt-3 text-[var(--muted)]">{food.description}</p>
        <p className="mt-4 text-sm text-[var(--muted)]">
          For {people} {people === 1 ? "person" : "people"} · Budget:{" "}
          {formatPeso(budget)}
        </p>
      </div>

      <section className="rounded-3xl bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
          Estimated cost
        </h2>
        <p className="mt-3 text-3xl font-bold">
          {formatPeso(costPerPerson)}{" "}
          <span className="text-base font-medium text-[var(--muted)]">
            / person
          </span>
        </p>
        <p className="mt-1 text-lg font-semibold text-[var(--muted)]">
          {formatPeso(totalCost)} total
        </p>
        <p className="mt-3 text-xs text-[var(--muted)]">
          Prices are rough estimates — not live restaurant prices.
        </p>
      </section>

      <section className="rounded-3xl bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
          Suggested order
        </h2>
        <ul className="space-y-3">
          {suggestedOrder.map((item) => (
            <li
              key={item.label}
              className="flex items-baseline justify-between gap-4 text-sm"
            >
              <span>
                {item.label} × {item.quantity}
              </span>
              <span className="font-semibold tabular-nums">
                {formatPeso(item.price)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-[var(--border)] pt-4 font-bold">
          <span>Estimated total</span>
          <span className="tabular-nums">{formatPeso(totalCost)}</span>
        </div>
      </section>

      <section className="rounded-3xl bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
          Estimated split
        </h2>
        <ul className="space-y-3">
          {split.map((person) => (
            <li
              key={person.name}
              className="flex justify-between text-sm"
            >
              <span>{person.name}</span>
              <span className="font-semibold tabular-nums">
                {formatPeso(person.amount)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-[var(--border)] pt-4 font-bold">
          <span>Total</span>
          <span className="tabular-nums">{formatPeso(totalCost)}</span>
        </div>
      </section>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={onTryAgain}
          className="btn-primary"
        >
          🎰 Try Again
        </button>
        <button
          type="button"
          onClick={onChangeChoices}
          className="btn-secondary"
        >
          ← Change Choices
        </button>
        <button
          type="button"
          onClick={onSave}
          className="btn-ghost"
        >
          {saved ? "❤️ Saved" : "❤️ Save"}
        </button>
      </div>
    </motion.div>
  );
}
