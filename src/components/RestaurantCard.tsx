"use client";

import { motion } from "framer-motion";
import { formatPeso } from "@/lib/format";
import { formatDistance } from "@/lib/distance";
import type { Restaurant } from "@/lib/types";

type RestaurantCardProps = {
  restaurant: Restaurant;
  foodEmoji: string;
  costPerPerson: number;
  featured?: boolean;
  directionsUrl?: string;
};

export default function RestaurantCard({
  restaurant,
  foodEmoji,
  costPerPerson,
  featured = false,
  directionsUrl,
}: RestaurantCardProps) {
  return (
    <motion.article
      initial={featured ? { opacity: 0, y: 16 } : false}
      animate={featured ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.35 }}
      className={`rounded-3xl bg-[var(--surface)] p-6 shadow-[var(--shadow)] ${
        featured ? "ring-2 ring-[var(--accent-soft)]" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl" aria-hidden="true">
          {foodEmoji}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-bold leading-tight">{restaurant.name}</h3>
          <p className="mt-2 text-sm text-[var(--muted)]">
            📍 {formatDistance(restaurant.distanceKm)}
            {restaurant.rating != null && (
              <> · ⭐ {restaurant.rating.toFixed(1)}</>
            )}
            {restaurant.isOpen === true && (
              <span className="ml-1 text-emerald-600 dark:text-emerald-400">
                · Open
              </span>
            )}
            {restaurant.isOpen === false && (
              <span className="ml-1 text-[var(--muted)]"> · Closed</span>
            )}
          </p>
          {restaurant.address && (
            <p className="mt-1 truncate text-xs text-[var(--muted)]">
              {restaurant.address}
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-[var(--surface-muted)] px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          Estimated price
        </p>
        <p className="mt-1 text-lg font-bold">
          {formatPeso(costPerPerson)}{" "}
          <span className="text-sm font-medium text-[var(--muted)]">/ person</span>
        </p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          EatDecide estimate — may vary by restaurant.
        </p>
      </div>

      {featured && directionsUrl && (
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary mt-5 text-center no-underline"
        >
          📍 Get Directions
        </a>
      )}
    </motion.article>
  );
}
