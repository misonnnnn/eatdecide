"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ShuffleAnimation from "@/components/ShuffleAnimation";
import RecommendationResult from "@/components/RecommendationResult";
import {
  isFavorite,
  loadAnswers,
  saveFavorite,
  saveResult,
} from "@/lib/storage";
import type { Recommendation } from "@/lib/types";

export default function ResultPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<"loading" | "shuffle" | "result">(
    "loading"
  );
  const [result, setResult] = useState<Recommendation | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendation = useCallback(async (excludeId?: number) => {
    const answers = loadAnswers();
    if (!answers) {
      router.replace("/");
      return null;
    }

    const response = await fetch("/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers, excludeId }),
    });

    if (!response.ok) {
      throw new Error("Could not get a recommendation");
    }

    const data = (await response.json()) as { recommendation: Recommendation };
    return data.recommendation;
  }, [router]);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const recommendation = await fetchRecommendation();
        if (cancelled || !recommendation) return;
        setResult(recommendation);
        saveResult(recommendation);
        setSaved(isFavorite(recommendation.food.id));
        setPhase("shuffle");
      } catch {
        if (!cancelled) setError("Something went wrong. Please try again.");
      }
    }

    start();
    return () => {
      cancelled = true;
    };
  }, [fetchRecommendation]);

  const handleShuffleDone = useCallback(() => {
    setPhase("result");
  }, []);

  async function handleTryAgain() {
    if (!result) return;
    setPhase("loading");
    setError(null);
    try {
      const next = await fetchRecommendation(result.food.id);
      if (!next) return;
      setResult(next);
      saveResult(next);
      setSaved(isFavorite(next.food.id));
      setPhase("shuffle");
    } catch {
      setError("Something went wrong. Please try again.");
      setPhase("result");
    }
  }

  function handleSave() {
    if (!result) return;
    saveFavorite(result);
    setSaved(true);
  }

  if (error && !result) {
    return (
      <main className="app-shell flex min-h-full flex-col items-center justify-center gap-4 py-12 text-center">
        <p className="text-[var(--muted)]">{error}</p>
        <button type="button" onClick={() => router.push("/")} className="btn-primary">
          Start over
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-full">
      <div className="app-shell py-8">
        {phase === "loading" && (
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              Getting ready...
            </p>
            <span className="animate-bounce text-5xl" aria-hidden="true">
              🍽️
            </span>
          </div>
        )}

        {phase === "shuffle" && (
          <ShuffleAnimation onDone={handleShuffleDone} />
        )}

        {phase === "result" && result && (
          <RecommendationResult
            result={result}
            saved={saved}
            onTryAgain={handleTryAgain}
            onChangeChoices={() => router.push("/choose")}
            onSave={handleSave}
          />
        )}

        {error && phase === "result" && (
          <p className="mt-4 text-center text-sm text-red-500">{error}</p>
        )}
      </div>
    </main>
  );
}
