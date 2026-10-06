export type FoodItem = {
  id: number;
  name: string;
  emoji: string;
  category: string;
  estimatedPricePerPerson: number;
  description: string;
  moods: string[];
  tags: string[];
};

export type FoodPreference =
  | "chicken"
  | "burger"
  | "pizza"
  | "noodles"
  | "japanese"
  | "filipino"
  | "mexican"
  | "pasta"
  | "healthy"
  | "spicy"
  | "dessert"
  | "surprise";

export type Mood =
  | "hungry"
  | "delicious"
  | "filling"
  | "budget"
  | "healthy"
  | "spicy"
  | "sweet"
  | "whatever";

export type UserLocation = {
  latitude: number;
  longitude: number;
};

export type ChooseAnswers = {
  people: number;
  budget: number;
  preferences: FoodPreference[];
  mood: Mood | null;
  location: UserLocation | null;
};

export type OrderItem = {
  label: string;
  quantity: number;
  price: number;
};

export type Restaurant = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  rating?: number;
  address?: string;
  isOpen?: boolean;
  googleMapsUrl?: string;
};

export type RestaurantOption = Restaurant & {
  score: number;
  costPerPerson: number;
  totalCost: number;
};

export type Recommendation = {
  food: FoodItem;
  people: number;
  budget: number;
  costPerPerson: number;
  totalCost: number;
  suggestedOrder: OrderItem[];
  split: { name: string; amount: number }[];
  restaurant: Restaurant | null;
  alternatives: RestaurantOption[];
  hasLocation: boolean;
  isSurprise: boolean;
};
