"use client";

import { motion } from "framer-motion";
import { formatPeso } from "@/lib/format";
import { formatDistance } from "@/lib/distance";
import { directionsUrl as buildDirectionsUrl } from "@/lib/places";
import RestaurantCard from "@/components/RestaurantCard";
import type { Recommendation, RestaurantOption } from "@/lib/types";

type RecommendationResultProps = {
  result: Recommendation;
  saved: boolean;
  userLocation: { latitude: number; longitude: number } | null;
  restaurantsWarning: string | null;
  onTryAgain: () => void;
  onChangeChoices: () => void;
  onSave: () => void;
  onPickAlternative: (restaurantId: string) => void;
};

export default function RecommendationResult({
  result,
  saved,
  userLocation,
  restaurantsWarning,
  onTryAgain,
  onChangeChoices,
  onSave,
  onPickAlternative,
}: RecommendationResultProps) {
  const {
    food,
    people,
    budget,
    costPerPerson,
    totalCost,
    split,
    restaurant,
    alternatives,
    hasLocation,
    isSurprise,
  } = result;

  const remaining = budget - totalCost;
  const withinBudget = remaining >= 0;

  const primaryDirections =
    restaurant && userLocation
      ? buildDirectionsUrl(
          userLocation.latitude,
          userLocation.longitude,
          restaurant
        )
      : restaurant?.googleMapsUrl;

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
          {isSurprise ? "Surprise!" : "We decided"}
        </p>
        <h1 className="mt-2 text-3xl font-bold uppercase tracking-tight sm:text-4xl">
          {food.name}
        </h1>
        <p className="mt-3 text-[var(--muted)]">
          {isSurprise
            ? "You weren't expecting that — but it fits your vibe."
            : `Looks like ${food.name.toLowerCase()} is the answer.`}
        </p>
        {restaurant && (
          <p className="mt-3 text-sm font-medium text-[var(--foreground)]">
            We found a good match {hasLocation ? "near you" : "for you"}.
          </p>
        )}
      </div>

      {restaurant && primaryDirections && (
        <>
          <RestaurantCard
            restaurant={restaurant}
            foodEmoji={food.emoji}
            costPerPerson={costPerPerson}
            featured
            directionsUrl={primaryDirections}
          />
          {withinBudget && hasLocation && (
            <p className="-mt-4 text-center text-sm font-medium">
              You&apos;re nearby and it&apos;s within your budget. Go get it! 😋
            </p>
          )}
        </>
      )}

      {hasLocation && !restaurant && restaurantsWarning && (
        <section className="rounded-3xl bg-[var(--surface)] p-6 text-center shadow-[var(--shadow)]">
          <p className="text-2xl">😕</p>
          <p className="mt-3 font-semibold">
            We couldn&apos;t find restaurants nearby.
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Try increasing your search area, choosing another food, or trying
            again.
          </p>
        </section>
      )}

      {hasLocation && !restaurant && !restaurantsWarning && (
        <p className="text-center text-sm text-[var(--muted)]">
          No nearby restaurants matched — here&apos;s your food pick and
          estimates.
        </p>
      )}

      <section className="rounded-3xl bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
          Group cost
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {people} {people === 1 ? "person" : "people"}
        </p>
        <p className="mt-3 text-2xl font-bold">
          {formatPeso(costPerPerson)} × {people}
        </p>
        <p className="mt-1 text-xl font-bold">{formatPeso(totalCost)} total</p>
        <div className="mt-4 space-y-2 rounded-2xl bg-[var(--surface-muted)] px-4 py-3 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--muted)]">Your budget</span>
            <span className="font-semibold tabular-nums">
              {formatPeso(budget)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--muted)]">Estimated cost</span>
            <span className="font-semibold tabular-nums">
              {formatPeso(totalCost)}
            </span>
          </div>
          <div
            className={`flex justify-between border-t border-[var(--border)] pt-2 font-bold ${
              withinBudget ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
            }`}
          >
            <span>{withinBudget ? "Remaining" : "Over budget"}</span>
            <span className="tabular-nums">
              {formatPeso(Math.abs(remaining))}
            </span>
          </div>
        </div>
        <p className="mt-3 text-xs text-[var(--muted)]">
          Estimated prices from EatDecide — not official restaurant prices.
        </p>
      </section>

      <section className="rounded-3xl bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
          Estimated split
        </h2>
        <ul className="space-y-3">
          {split.map((person) => (
            <li key={person.name} className="flex justify-between text-sm">
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

      {alternatives.length > 1 && (
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
            More nearby options
          </h2>
          <ul className="space-y-3">
            {alternatives.map((option, index) => (
              <AlternativeRow
                key={option.id}
                rank={index + 1}
                option={option}
                foodEmoji={food.emoji}
                isPrimary={option.id === restaurant?.id}
                userLocation={userLocation}
                onSelect={() => onPickAlternative(option.id)}
              />
            ))}
          </ul>
        </section>
      )}

      <div className="flex flex-col gap-3">
        <button type="button" onClick={onTryAgain} className="btn-primary">
          🎰 Try Another
        </button>
        <button type="button" onClick={onChangeChoices} className="btn-secondary">
          ← Change Choices
        </button>
        <button type="button" onClick={onSave} className="btn-ghost">
          {saved ? "❤️ Saved" : "❤️ Save"}
        </button>
      </div>
    </motion.div>
  );
}

function AlternativeRow({
  rank,
  option,
  foodEmoji,
  isPrimary,
  userLocation,
  onSelect,
}: {
  rank: number;
  option: RestaurantOption;
  foodEmoji: string;
  isPrimary: boolean;
  userLocation: { latitude: number; longitude: number } | null;
  onSelect: () => void;
}) {
  const dirUrl =
    userLocation &&
    buildDirectionsUrl(userLocation.latitude, userLocation.longitude, option);

  return (
    <li className="rounded-2xl bg-[var(--surface)] p-4 shadow-[var(--shadow)]">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold">
            {rank}. {isPrimary ? "🏆 " : `${foodEmoji} `}
            {option.name}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {formatDistance(option.distanceKm)}
            {option.rating != null && <> · ⭐ {option.rating.toFixed(1)}</>}
            {option.isOpen === true && <> · Open</>}
          </p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        {!isPrimary && (
          <button
            type="button"
            onClick={onSelect}
            className="flex-1 rounded-xl bg-[var(--surface-muted)] px-3 py-2 text-xs font-semibold"
          >
            Pick this
          </button>
        )}
        {dirUrl && (
          <a
            href={dirUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-xl bg-[var(--accent-soft)] px-3 py-2 text-center text-xs font-semibold text-[var(--accent)] no-underline"
          >
            Directions
          </a>
        )}
      </div>
    </li>
  );
}
