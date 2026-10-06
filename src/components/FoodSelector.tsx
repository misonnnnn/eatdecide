"use client";

import type { FoodPreference } from "@/lib/types";

const OPTIONS: { id: FoodPreference; label: string; emoji: string }[] = [
  { id: "chicken", label: "Chicken", emoji: "🍗" },
  { id: "burger", label: "Burger", emoji: "🍔" },
  { id: "pizza", label: "Pizza", emoji: "🍕" },
  { id: "noodles", label: "Noodles", emoji: "🍜" },
  { id: "japanese", label: "Japanese", emoji: "🍣" },
  { id: "filipino", label: "Filipino", emoji: "🍚" },
  { id: "mexican", label: "Mexican", emoji: "🌮" },
  { id: "pasta", label: "Pasta", emoji: "🍝" },
  { id: "healthy", label: "Healthy", emoji: "🥗" },
  { id: "spicy", label: "Spicy", emoji: "🌶️" },
  { id: "dessert", label: "Dessert", emoji: "🍰" },
  { id: "surprise", label: "Surprise me", emoji: "🎲" },
];

type FoodSelectorProps = {
  selected: FoodPreference[];
  onChange: (selected: FoodPreference[]) => void;
};

export default function FoodSelector({ selected, onChange }: FoodSelectorProps) {
  function toggle(id: FoodPreference) {
    if (id === "surprise") {
      // Surprise replaces other selections
      onChange(selected.includes("surprise") ? [] : ["surprise"]);
      return;
    }

    const withoutSurprise = selected.filter((s) => s !== "surprise");
    if (withoutSurprise.includes(id)) {
      onChange(withoutSurprise.filter((s) => s !== id));
    } else {
      onChange([...withoutSurprise, id]);
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {OPTIONS.map((option) => {
        const isSelected = selected.includes(option.id);

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => toggle(option.id)}
            className={`flex flex-col items-center gap-2 rounded-3xl px-3 py-5 text-center transition duration-200 active:scale-[0.97] ${
              isSelected
                ? "scale-[1.02] bg-[var(--accent)] text-white shadow-lg"
                : "bg-[var(--surface)] text-[var(--foreground)] shadow-[var(--shadow)] hover:bg-[var(--surface-muted)]"
            }`}
          >
            <span className="text-3xl" aria-hidden="true">
              {option.emoji}
            </span>
            <span className="text-sm font-semibold">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
