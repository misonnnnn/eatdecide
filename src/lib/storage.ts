import type { ChooseAnswers, Recommendation, Restaurant } from "./types";

const ANSWERS_KEY = "eatdecide-answers";
const RESULT_KEY = "eatdecide-result";
const RESTAURANTS_KEY = "eatdecide-restaurants";
const SAVED_KEY = "eatdecide-saved";

const defaultAnswers: ChooseAnswers = {
  people: 2,
  budget: 800,
  preferences: [],
  mood: null,
  location: null,
};

function canUseBrowserStorage() {
  return typeof window !== "undefined";
}

export function saveAnswers(answers: ChooseAnswers) {
  if (!canUseBrowserStorage()) return;
  sessionStorage.setItem(ANSWERS_KEY, JSON.stringify(answers));
}

export function loadAnswers(): ChooseAnswers | null {
  if (!canUseBrowserStorage()) return null;
  const raw = sessionStorage.getItem(ANSWERS_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ChooseAnswers>;
    return { ...defaultAnswers, ...parsed };
  } catch {
    return null;
  }
}

export function saveRestaurants(restaurants: Restaurant[]) {
  if (!canUseBrowserStorage()) return;
  sessionStorage.setItem(RESTAURANTS_KEY, JSON.stringify(restaurants));
}

export function loadRestaurants(): Restaurant[] {
  if (!canUseBrowserStorage()) return [];
  const raw = sessionStorage.getItem(RESTAURANTS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Restaurant[];
  } catch {
    return [];
  }
}

export function saveResult(result: Recommendation) {
  if (!canUseBrowserStorage()) return;
  sessionStorage.setItem(RESULT_KEY, JSON.stringify(result));
}

export function loadResult(): Recommendation | null {
  if (!canUseBrowserStorage()) return null;
  const raw = sessionStorage.getItem(RESULT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Recommendation;
  } catch {
    return null;
  }
}

export function saveFavorite(result: Recommendation) {
  if (!canUseBrowserStorage()) return;
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
  if (!canUseBrowserStorage()) return [];
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
