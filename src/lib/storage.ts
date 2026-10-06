import type { ChooseAnswers, Recommendation } from "./types";

const ANSWERS_KEY = "eatdecide-answers";
const RESULT_KEY = "eatdecide-result";
const SAVED_KEY = "eatdecide-saved";

export function saveAnswers(answers: ChooseAnswers) {
  sessionStorage.setItem(ANSWERS_KEY, JSON.stringify(answers));
}

export function loadAnswers(): ChooseAnswers | null {
  const raw = sessionStorage.getItem(ANSWERS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ChooseAnswers;
  } catch {
    return null;
  }
}

export function saveResult(result: Recommendation) {
  sessionStorage.setItem(RESULT_KEY, JSON.stringify(result));
}

export function loadResult(): Recommendation | null {
  const raw = sessionStorage.getItem(RESULT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Recommendation;
  } catch {
    return null;
  }
}

export function saveFavorite(result: Recommendation) {
  const existing = loadFavorites();
  const next = [
    {
      id: result.food.id,
      name: result.food.name,
      emoji: result.food.emoji,
      savedAt: new Date().toISOString(),
    },
    ...existing.filter((f) => f.id !== result.food.id),
  ].slice(0, 20);
  localStorage.setItem(SAVED_KEY, JSON.stringify(next));
}

export function loadFavorites(): {
  id: number;
  name: string;
  emoji: string;
  savedAt: string;
}[] {
  const raw = localStorage.getItem(SAVED_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as {
      id: number;
      name: string;
      emoji: string;
      savedAt: string;
    }[];
  } catch {
    return [];
  }
}

export function isFavorite(foodId: number): boolean {
  return loadFavorites().some((f) => f.id === foodId);
}
