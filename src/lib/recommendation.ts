import type {
  ChooseAnswers,
  FoodItem,
  FoodPreference,
  Mood,
  OrderItem,
  Recommendation,
} from "./types";

/** Map UI preference chips to food categories / tags */
const preferenceMap: Record<Exclude<FoodPreference, "surprise">, string[]> = {
  chicken: ["chicken"],
  burger: ["burger"],
  pizza: ["pizza"],
  noodles: ["noodles"],
  japanese: ["japanese"],
  filipino: ["filipino"],
  mexican: ["mexican"],
  pasta: ["pasta"],
  healthy: ["healthy", "salad"],
  spicy: ["spicy"],
  dessert: ["dessert"],
};

const moodMap: Record<Exclude<Mood, "whatever">, string> = {
  hungry: "hungry",
  delicious: "delicious",
  filling: "filling",
  budget: "budget",
  healthy: "healthy",
  spicy: "spicy",
  sweet: "sweet",
};

function scoreFood(
  food: FoodItem,
  preferences: FoodPreference[],
  mood: Mood | null,
  budgetPerPerson: number
): number {
  let score = 0;

  const wantsSurprise = preferences.includes("surprise") || preferences.length === 0;
  const concretePrefs = preferences.filter((p) => p !== "surprise");

  if (wantsSurprise && concretePrefs.length === 0) {
    // Pure surprise — everyone starts equal, randomness decides later
    score += 5;
  }

  for (const pref of concretePrefs) {
    const keywords = preferenceMap[pref];
    if (keywords.some((k) => food.category === k || food.tags.includes(k))) {
      score += 10;
    }
  }

  if (mood && mood !== "whatever") {
    const moodKey = moodMap[mood];
    if (food.moods.includes(moodKey)) {
      score += 6;
    }
  }

  // Prefer foods within budget; soft penalty for going over
  if (food.estimatedPricePerPerson <= budgetPerPerson) {
    score += 8;
    // Slight boost for using most of the budget (feels more satisfying)
    const usage = food.estimatedPricePerPerson / budgetPerPerson;
    score += usage * 3;
  } else {
    const overBy = food.estimatedPricePerPerson - budgetPerPerson;
    score -= Math.min(12, overBy / 20);
  }

  return score;
}

function buildSuggestedOrder(
  food: FoodItem,
  people: number,
  budget: number
): OrderItem[] {
  const mealPrice = food.estimatedPricePerPerson;
  const mealsTotal = mealPrice * people;

  const items: OrderItem[] = [
    {
      label: `${food.name} meals`,
      quantity: people,
      price: mealsTotal,
    },
  ];

  let remaining = budget - mealsTotal;

  // Add simple sides/drinks if budget allows
  if (remaining >= 80 && people >= 2) {
    const friesQty = Math.max(1, Math.floor(people / 2));
    const friesPrice = friesQty * 80;
    if (friesPrice <= remaining) {
      items.push({ label: "Fries", quantity: friesQty, price: friesPrice });
      remaining -= friesPrice;
    }
  }

  if (remaining >= 50) {
    const drinkPrice = Math.min(remaining, people * 40);
    const drinkQty = Math.max(1, Math.round(drinkPrice / 40));
    items.push({
      label: "Drinks",
      quantity: drinkQty,
      price: drinkQty * 40,
    });
  }

  return items;
}

function buildSplit(people: number, totalCost: number) {
  const base = Math.floor(totalCost / people);
  const remainder = totalCost - base * people;

  return Array.from({ length: people }, (_, i) => ({
    name: `Person ${i + 1}`,
    // Give leftover pesos to the first few people so the total matches
    amount: base + (i < remainder ? 1 : 0),
  }));
}

/**
 * Pick a food based on preferences, mood, and budget.
 * Kept intentionally simple and readable.
 */
export function recommendFood(
  foods: FoodItem[],
  answers: ChooseAnswers,
  excludeId?: number
): Recommendation {
  const budgetPerPerson = answers.budget / answers.people;
  const pool = excludeId ? foods.filter((f) => f.id !== excludeId) : foods;
  const candidates = pool.length > 0 ? pool : foods;

  const scored = candidates.map((food) => ({
    food,
    score: scoreFood(food, answers.preferences, answers.mood, budgetPerPerson),
  }));

  scored.sort((a, b) => b.score - a.score);

  // Pick randomly from the top few so "Try Again" feels fresh
  const topCount = Math.min(5, scored.length);
  const top = scored.slice(0, topCount);
  const pick = top[Math.floor(Math.random() * top.length)].food;

  const suggestedOrder = buildSuggestedOrder(pick, answers.people, answers.budget);
  const totalCost = suggestedOrder.reduce((sum, item) => sum + item.price, 0);
  const costPerPerson = Math.round(totalCost / answers.people);

  return {
    food: pick,
    people: answers.people,
    budget: answers.budget,
    costPerPerson,
    totalCost,
    suggestedOrder,
    split: buildSplit(answers.people, totalCost),
  };
}

/** Convert a Prisma food row (moods/tags as JSON strings) into a FoodItem */
export function parseFoodRow(row: {
  id: number;
  name: string;
  emoji: string;
  category: string;
  estimatedPricePerPerson: number;
  description: string;
  moods: string;
  tags: string;
}): FoodItem {
  return {
    id: row.id,
    name: row.name,
    emoji: row.emoji,
    category: row.category,
    estimatedPricePerPerson: row.estimatedPricePerPerson,
    description: row.description,
    moods: JSON.parse(row.moods) as string[],
    tags: JSON.parse(row.tags) as string[],
  };
}
