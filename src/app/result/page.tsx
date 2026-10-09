"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ShuffleAnimation from "@/components/ShuffleAnimation";
import LoadingSteps from "@/components/LoadingSteps";
import RecommendationResult from "@/components/RecommendationResult";
import {
  isFavorite,
  loadAnswers,
  loadRestaurants,
  saveFavorite,
  saveRestaurants,
  saveResult,
} from "@/lib/storage";
import type { Recommendation, Restaurant, UserLocation } from "@/lib/types";

export default function ResultPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<"loading" | "shuffle" | "result">(
    "loading"
  );
  const [result, setResult] = useState<Recommendation | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [restaurantsWarning, setRestaurantsWarning] = useState<string | null>(
    null
  );
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLocation, setHasLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

  const fetchRecommendation = useCallback(
    async (options?: {
      excludeFoodId?: number;
      excludeRestaurantId?: string;
      cachedRestaurants?: Restaurant[];
    }) => {
      const answers = loadAnswers();
      if (!answers) {
        router.replace("/");
        return null;
      }

      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          excludeFoodId: options?.excludeFoodId,
          excludeRestaurantId: options?.excludeRestaurantId,
          restaurants: options?.cachedRestaurants,
        }),
      });

      if (!response.ok) {
        throw new Error("Could not get a recommendation");
      }

      const data = (await response.json()) as {
        recommendation: Recommendation;
        restaurants: Restaurant[];
        restaurantsError?: string | null;
      };

      if (data.restaurants?.length) {
        setRestaurants(data.restaurants);
        saveRestaurants(data.restaurants);
      }

      if (data.restaurantsError && answers.location) {
        setRestaurantsWarning(data.restaurantsError);
      } else if (
        answers.location &&
        data.restaurants?.length === 0 &&
        !data.recommendation.restaurant
      ) {
        setRestaurantsWarning("no_results");
      }

      return data.recommendation;
    },
    [router]
  );

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const answers = loadAnswers();
        if (!cancelled) {
          setHasLocation(Boolean(answers?.location));
          setUserLocation(answers?.location ?? null);
        }
        const cached = loadRestaurants();
        const recommendation = await fetchRecommendation({
          cachedRestaurants: cached.length > 0 ? cached : undefined,
        });
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
      const cached = restaurants.length > 0 ? restaurants : loadRestaurants();
      const next = await fetchRecommendation({
        excludeFoodId: result.food.id,
        excludeRestaurantId: result.restaurant?.id,
        cachedRestaurants: cached.length > 0 ? cached : undefined,
      });
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

  function handlePickAlternative(restaurantId: string) {
    if (!result) return;
    const picked = result.alternatives.find((r) => r.id === restaurantId);
    if (!picked) return;

    const updated: Recommendation = {
      ...result,
      restaurant: picked,
    };
    setResult(updated);
    saveResult(updated);
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
        <button
          type="button"
          onClick={() => router.push("/")}
          className="btn-primary"
        >
          Start over
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-full">
      <div className="app-shell py-8">
        {phase === "loading" && <LoadingSteps hasLocation={hasLocation} />}

        {phase === "shuffle" && (
          <ShuffleAnimation
            onDone={handleShuffleDone}
            subtitle={
              hasLocation
                ? "Finding something nearby..."
                : "Picking your food..."
            }
          />
        )}

        {phase === "result" && result && (
          <RecommendationResult
            result={result}
            saved={saved}
            userLocation={userLocation}
            restaurantsWarning={restaurantsWarning}
            onTryAgain={handleTryAgain}
            onChangeChoices={() => router.push("/choose")}
            onSave={handleSave}
            onPickAlternative={handlePickAlternative}
          />
        )}

        {error && phase === "result" && (
          <p className="mt-4 text-center text-sm text-red-500">{error}</p>
        )}
      </div>
    </main>
  );
}
