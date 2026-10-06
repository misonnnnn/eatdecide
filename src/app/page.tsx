"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { saveAnswers } from "@/lib/storage";

export default function HomePage() {
  const router = useRouter();

  function surpriseMe() {
    saveAnswers({
      people: 2,
      budget: 800,
      preferences: ["surprise"],
      mood: "whatever",
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
          <p className="mb-6 text-sm font-bold uppercase tracking-[0.25em] text-[var(--accent)]">
            EatDecide
          </p>

          <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            What should we eat?
          </h1>

          <p className="mt-4 max-w-xs text-lg text-[var(--muted)]">
            Stop thinking. Let us decide.
          </p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="mt-10 mb-12 text-7xl"
            aria-hidden="true"
          >
            🍽️
          </motion.div>

          <div className="flex w-full flex-col gap-3">
            <button type="button" onClick={surpriseMe} className="btn-primary">
              🎰 Surprise Me
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
