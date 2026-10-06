import type {
  ChooseAnswers,
  FoodItem,
  FoodPreference,
  Mood,
  OrderItem,
  Recommendation,
  Restaurant,
  RestaurantOption,
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

/** Keywords to match restaurant names to a food category */
const restaurantKeywords: Record<
  Exclude<FoodPreference, "surprise">,
  string[]
> = {
  chicken: ["chicken", "inasal", "jollibee", "kfc", "chooks"],
  burger: ["burger", "mcdonald", "shake shack", "army navy"],
  pizza: ["pizza", "yellow cab", "domino"],
  noodles: ["noodle", "ramen", "mami", "pancit", "lomi"],
  japanese: ["japanese", "sushi", "ramen", "teriyaki", "tokyo"],
  filipino: ["filipino", "silog", "adobo", "max", "chowking"],
  mexican: ["mexican", "taco", "burrito"],
  pasta: ["pasta", "italian", "spaghetti"],
  healthy: ["salad", "healthy", "green", "bowl"],
  spicy: ["spicy", "sriracha", "pepper"],
  dessert: ["dessert", "cafe", "milk tea", "coffee", "boba"],
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

  const wantsSurprise =
    preferences.includes("surprise") || preferences.length === 0;
  const concretePrefs = preferences.filter((p) => p !== "surprise");

  if (wantsSurprise && concretePrefs.length === 0) {
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

  if (food.estimatedPricePerPerson <= budgetPerPerson) {
    score += 8;
    const usage = food.estimatedPricePerPerson / budgetPerPerson;
    score += usage * 3;
  } else {
    const overBy = food.estimatedPricePerPerson - budgetPerPerson;
    score -= Math.min(12, overBy / 20);
  }

  return score;
}

function restaurantFoodMatchScore(
  restaurant: Restaurant,
  preferences: FoodPreference[],
  food: FoodItem
): number {
  const name = restaurant.name.toLowerCase();
  let score = 0;

  const concrete = preferences.filter((p) => p !== "surprise");
  const prefs =
    concrete.length > 0 ? concrete : ([food.category] as FoodPreference[]);

  for (const pref of prefs) {
    if (pref === "surprise") continue;
    const words = restaurantKeywords[pref] ?? [pref];
    if (words.some((w) => name.includes(w))) {
      score = 40;
      break;
    }
  }

  // Soft match from food name/tags
  if (score < 40) {
    const foodWords = [food.name, ...food.tags, food.category]
      .join(" ")
      .toLowerCase()
      .split(/\s+/);
    if (foodWords.some((w) => w.length > 3 && name.includes(w))) {
      score = 30;
    }
  }

  // General restaurant still gets some points
  if (score === 0) {
    score = 15;
  }

  return Math.min(40, score);
}

/** Score a restaurant 0–100 using the simple rubric from the spec */
export function scoreRestaurant(
  restaurant: Restaurant,
  answers: ChooseAnswers,
  food: FoodItem
): number {
  const budgetPerPerson = answers.budget / answers.people;
  let score = 0;

  score += restaurantFoodMatchScore(
    restaurant,
    answers.preferences,
    food
  );

  if (food.estimatedPricePerPerson <= budgetPerPerson) {
    score += 25;
  } else {
    score += Math.max(0, 25 - (food.estimatedPricePerPerson - budgetPerPerson) / 10);
  }

  // Distance: full 20 pts at 0 km, fades by 5 km
  const distScore = Math.max(0, 20 - (restaurant.distanceKm / 5) * 20);
  score += distScore;

  if (restaurant.rating != null) {
    score += (restaurant.rating / 5) * 10;
  }

  if (restaurant.isOpen === true) {
    score += 5;
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

  if (remaining >= 80 && people >= 2) {
    const friesQty = Math.max(1, Math.floor(people / 2));
    const friesPrice = friesQty * 80;
    if (friesPrice <= remaining) {
      items.push({ label: "Fries", quantity: friesQty, price: friesPrice });
      remaining -= friesPrice;
    }
  }

  if (remaining >= 50) {
    const drinkQty = Math.max(1, Math.round(Math.min(remaining, people * 40) / 40));
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
    amount: base + (i < remainder ? 1 : 0),
  }));
}

function pickFood(
  foods: FoodItem[],
  answers: ChooseAnswers,
  excludeFoodId?: number
): FoodItem {
  const budgetPerPerson = answers.budget / answers.people;
  const isSurprise =
    answers.preferences.includes("surprise") ||
    answers.preferences.length === 0;

  const pool = excludeFoodId
    ? foods.filter((f) => f.id !== excludeFoodId)
    : foods;
  const candidates = pool.length > 0 ? pool : foods;

  const scored = candidates.map((food) => ({
    food,
    score: scoreFood(
      food,
      answers.preferences,
      answers.mood,
      budgetPerPerson
    ),
  }));

  scored.sort((a, b) => b.score - a.score);

  const topCount = isSurprise ? Math.min(8, scored.length) : Math.min(5, scored.length);
  const top = scored.slice(0, topCount);
  return top[Math.floor(Math.random() * top.length)].food;
}

function rankRestaurants(
  restaurants: Restaurant[],
  answers: ChooseAnswers,
  food: FoodItem,
  excludeRestaurantId?: string
): RestaurantOption[] {
  const pool = excludeRestaurantId
    ? restaurants.filter((r) => r.id !== excludeRestaurantId)
    : restaurants;

  const costPerPerson = food.estimatedPricePerPerson;
  const totalCost = costPerPerson * answers.people;

  return pool
    .map((restaurant) => ({
      ...restaurant,
      score: scoreRestaurant(restaurant, answers, food),
      costPerPerson,
      totalCost,
    }))
    .sort((a, b) => b.score - a.score);
}

export type RecommendOptions = {
  excludeFoodId?: number;
  excludeRestaurantId?: string;
  restaurants?: Restaurant[];
};

/**
 * Build food + optional nearby restaurant recommendation.
 */
export function buildRecommendation(
  foods: FoodItem[],
  answers: ChooseAnswers,
  options: RecommendOptions = {}
): Recommendation {
  const isSurprise =
    answers.preferences.includes("surprise") ||
    answers.preferences.length === 0;

  const food = pickFood(foods, answers, options.excludeFoodId);
  const suggestedOrder = buildSuggestedOrder(
    food,
    answers.people,
    answers.budget
  );
  const totalCost = suggestedOrder.reduce((sum, item) => sum + item.price, 0);
  const costPerPerson = Math.round(totalCost / answers.people);

  let restaurant: Restaurant | null = null;
  let alternatives: RestaurantOption[] = [];

  if (options.restaurants && options.restaurants.length > 0) {
    alternatives = rankRestaurants(
      options.restaurants,
      answers,
      food,
      options.excludeRestaurantId
    );
    restaurant = alternatives[0] ?? null;
    alternatives = alternatives.slice(0, 5);
  }

  return {
    food,
    people: answers.people,
    budget: answers.budget,
    costPerPerson,
    totalCost,
    suggestedOrder,
    split: buildSplit(answers.people, totalCost),
    restaurant,
    alternatives,
    hasLocation: answers.location != null,
    isSurprise,
  };
}

/** @deprecated use buildRecommendation — kept for clarity in API */
export function recommendFood(
  foods: FoodItem[],
  answers: ChooseAnswers,
  excludeId?: number
): Recommendation {
  return buildRecommendation(foods, answers, { excludeFoodId: excludeId });
}

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
