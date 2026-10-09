"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { requestUserLocation } from "@/components/LocationSelector";
import { saveAnswers, saveRestaurants } from "@/lib/storage";
import type { UserLocation } from "@/lib/types";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function surpriseMe() {
    setLoading(true);
    saveRestaurants([]);

    let location: UserLocation | null = null;
    try {
      location = await requestUserLocation();
    } catch {
      // Continue without location if denied or unavailable
    }

    saveAnswers({
      people: 2,
      budget: 800,
      preferences: ["surprise"],
      mood: "whatever",
      location,
    });
    router.push("/result");
  }

  return (
    <main className="relative flex min-h-full flex-col">
      <div className="app-shell flex flex-1 flex-col justify-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex flex-col items-center text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05, duration: 0.4 }}
            className="mb-8 text-6xl sm:text-7xl"
            aria-hidden="true"
          >
            🍽️
          </motion.div>

          <h1 className="text-5xl font-extrabold tracking-tight text-[var(--accent)] sm:text-6xl">
            EatDecide
          </h1>

          <p className="mt-5 text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
            What should we eat?
          </p>

          <p className="mt-3 max-w-xs text-base text-[var(--muted)] sm:text-lg">
            Stop thinking. Let us decide.
          </p>

          <div className="mt-10 flex w-full flex-col gap-3">
            <button
              type="button"
              onClick={surpriseMe}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? "Getting location..." : "🎰 Surprise Me"}
            </button>
            <Link href="/choose" className="btn-secondary">
              Help Me Choose
            </Link>
          </div>
        </motion.div>
      </div>

      <footer className="app-shell pb-8 text-center text-xs text-[var(--muted)]">
        <p>Stop thinking. Start eating.</p>
      </footer>
    </main>
  );
}
