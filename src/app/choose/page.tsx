"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import ProgressBar from "@/components/ProgressBar";
import PeopleSelector from "@/components/PeopleSelector";
import BudgetSelector from "@/components/BudgetSelector";
import FoodSelector from "@/components/FoodSelector";
import MoodSelector from "@/components/MoodSelector";
import { loadAnswers, saveAnswers } from "@/lib/storage";
import type { FoodPreference, Mood } from "@/lib/types";

const TOTAL_STEPS = 4;

const defaults = {
  people: 2,
  budget: 800,
  preferences: [] as FoodPreference[],
  mood: null as Mood | null,
};

function subscribe() {
  return () => {};
}

function getClientAnswers() {
  return JSON.stringify(loadAnswers() ?? defaults);
}

function getServerAnswers() {
  return JSON.stringify(defaults);
}

const slide = {
  enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
};

export default function ChoosePage() {
  // Restore previous answers from sessionStorage after hydration
  const stored = useSyncExternalStore(
    subscribe,
    getClientAnswers,
    getServerAnswers
  );
  const initial = JSON.parse(stored) as typeof defaults;

  return <ChooseForm key={stored} initial={initial} />;
}

function ChooseForm({ initial }: { initial: typeof defaults }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [people, setPeople] = useState(initial.people);
  const [budget, setBudget] = useState(initial.budget);
  const [preferences, setPreferences] = useState<FoodPreference[]>(
    initial.preferences
  );
  const [mood, setMood] = useState<Mood | null>(initial.mood);

  function goNext() {
    if (step < TOTAL_STEPS) {
      setDirection(1);
      setStep(step + 1);
      return;
    }
    finish(mood);
  }

  function goBack() {
    if (step === 1) {
      router.push("/");
      return;
    }
    setDirection(-1);
    setStep(step - 1);
  }

  function finish(selectedMood: Mood | null) {
    saveAnswers({
      people,
      budget,
      preferences: preferences.length > 0 ? preferences : ["surprise"],
      mood: selectedMood,
    });
    router.push("/result");
  }

  function canContinue() {
    if (step === 3) return preferences.length > 0;
    return true;
  }

  return (
    <main className="min-h-full">
      <div className="app-shell flex min-h-full flex-col py-6">
        <header className="mb-8">
          <button
            type="button"
            onClick={goBack}
            className="mb-4 text-sm font-medium text-[var(--muted)] transition hover:text-[var(--foreground)]"
          >
            ← Back
          </button>
          <ProgressBar step={step} total={TOTAL_STEPS} />
        </header>

        <div className="relative flex-1 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="flex flex-col"
            >
              {step === 1 && (
                <>
                  <h1 className="mb-8 text-center text-3xl font-bold tracking-tight sm:text-4xl">
                    How many people are eating?
                  </h1>
                  <PeopleSelector value={people} onChange={setPeople} />
                </>
              )}

              {step === 2 && (
                <>
                  <h1 className="mb-2 text-center text-3xl font-bold tracking-tight sm:text-4xl">
                    What&apos;s your total budget?
                  </h1>
                  <p className="mb-8 text-center text-[var(--muted)]">
                    This is for the whole group
                  </p>
                  <BudgetSelector
                    value={budget}
                    people={people}
                    onChange={setBudget}
                  />
                </>
              )}

              {step === 3 && (
                <>
                  <h1 className="mb-2 text-center text-3xl font-bold tracking-tight sm:text-4xl">
                    What sounds good?
                  </h1>
                  <p className="mb-8 text-center text-[var(--muted)]">
                    Pick one or more
                  </p>
                  <FoodSelector
                    selected={preferences}
                    onChange={setPreferences}
                  />
                </>
              )}

              {step === 4 && (
                <>
                  <h1 className="mb-2 text-center text-3xl font-bold tracking-tight sm:text-4xl">
                    What&apos;s your mood?
                  </h1>
                  <p className="mb-8 text-center text-[var(--muted)]">
                    Optional — skip if you want
                  </p>
                  <MoodSelector selected={mood} onChange={setMood} />
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="sticky bottom-0 mt-8 space-y-3 bg-[var(--background)]/90 py-4 backdrop-blur-sm">
          {step === 4 && (
            <button
              type="button"
              onClick={() => finish(null)}
              className="btn-ghost"
            >
              Skip this
            </button>
          )}
          <button
            type="button"
            onClick={goNext}
            disabled={!canContinue()}
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            {step === TOTAL_STEPS ? "🎰 Let's Decide" : "Continue"}
          </button>
        </div>
      </div>
    </main>
  );
}
