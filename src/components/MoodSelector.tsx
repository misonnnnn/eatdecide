"use client";

import type { Mood } from "@/lib/types";

const OPTIONS: { id: Mood; label: string; emoji: string }[] = [
  { id: "hungry", label: "I'm hungry", emoji: "😋" },
  { id: "delicious", label: "Something delicious", emoji: "🤤" },
  { id: "filling", label: "Something filling", emoji: "🍗" },
  { id: "budget", label: "I'm on a budget", emoji: "💸" },
  { id: "healthy", label: "Something healthy", emoji: "🥗" },
  { id: "spicy", label: "Something spicy", emoji: "🌶️" },
  { id: "sweet", label: "Something sweet", emoji: "🍰" },
  { id: "whatever", label: "I don't care", emoji: "🤷" },
];

type MoodSelectorProps = {
  selected: Mood | null;
  onChange: (mood: Mood) => void;
};

export default function MoodSelector({ selected, onChange }: MoodSelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      {OPTIONS.map((option) => {
        const isSelected = selected === option.id;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`flex items-center gap-4 rounded-2xl px-5 py-4 text-left transition duration-200 active:scale-[0.99] ${
              isSelected
                ? "bg-[var(--accent)] text-white shadow-lg"
                : "bg-[var(--surface)] text-[var(--foreground)] shadow-[var(--shadow)] hover:bg-[var(--surface-muted)]"
            }`}
          >
            <span className="text-2xl" aria-hidden="true">
              {option.emoji}
            </span>
            <span className="font-semibold">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
