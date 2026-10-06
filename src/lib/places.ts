import { distanceKm } from "./distance";
import type { FoodPreference, Restaurant } from "./types";

type GooglePlace = {
  id?: string;
  displayName?: { text?: string };
  location?: { latitude?: number; longitude?: number };
  rating?: number;
  formattedAddress?: string;
  googleMapsUri?: string;
  currentOpeningHours?: { openNow?: boolean };
  businessStatus?: string;
};

/** Map food preferences to a Places text search query */
export function preferenceToSearchQuery(
  preferences: FoodPreference[]
): string {
  const concrete = preferences.filter((p) => p !== "surprise");

  if (concrete.length === 0) {
    return "restaurant";
  }

  const queryMap: Record<Exclude<FoodPreference, "surprise">, string> = {
    chicken: "chicken restaurant",
    burger: "burger restaurant",
    pizza: "pizza restaurant",
    noodles: "noodles ramen restaurant",
    japanese: "japanese restaurant sushi",
    filipino: "filipino restaurant",
    mexican: "mexican restaurant tacos",
    pasta: "pasta italian restaurant",
    healthy: "healthy salad restaurant",
    spicy: "spicy restaurant",
    dessert: "dessert cafe milk tea",
  };

  const first = concrete[0];
  return queryMap[first] ?? "restaurant";
}

function normalizePlace(
  place: GooglePlace,
  userLat: number,
  userLng: number
): Restaurant | null {
  const lat = place.location?.latitude;
  const lng = place.location?.longitude;
  const name = place.displayName?.text;

  if (!place.id || !name || lat == null || lng == null) {
    return null;
  }

  const isOpen =
    place.businessStatus === "OPERATIONAL"
      ? place.currentOpeningHours?.openNow
      : false;

  return {
    id: place.id,
    name,
    latitude: lat,
    longitude: lng,
    distanceKm: distanceKm(userLat, userLng, lat, lng),
    rating: place.rating,
    address: place.formattedAddress,
    isOpen,
    googleMapsUrl: place.googleMapsUri,
  };
}

async function searchText(
  apiKey: string,
  textQuery: string,
  lat: number,
  lng: number,
  radiusMeters: number
): Promise<Restaurant[]> {
  const response = await fetch(
    "https://places.googleapis.com/v1/places:searchText",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.location,places.rating,places.formattedAddress,places.googleMapsUri,places.currentOpeningHours,places.businessStatus",
      },
      body: JSON.stringify({
        textQuery,
        maxResultCount: 20,
        locationBias: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: radiusMeters,
          },
        },
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    console.error("Google Places error:", response.status, text);
    throw new Error("places_api_error");
  }

  const data = (await response.json()) as { places?: GooglePlace[] };
  const places = data.places ?? [];

  return places
    .map((p) => normalizePlace(p, lat, lng))
    .filter((r): r is Restaurant => r !== null)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

/**
 * Find nearby restaurants. Tries 5 km first, then 10 km if empty.
 * API key stays on the server only.
 */
export async function findNearbyRestaurants(
  lat: number,
  lng: number,
  preferences: FoodPreference[]
): Promise<{ restaurants: Restaurant[]; searchQuery: string }> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error("missing_api_key");
  }

  const searchQuery = preferenceToSearchQuery(preferences);
  let restaurants = await searchText(apiKey, searchQuery, lat, lng, 5000);

  if (restaurants.length === 0) {
    restaurants = await searchText(apiKey, searchQuery, lat, lng, 10000);
  }

  // Broader fallback for surprise / empty results
  if (restaurants.length === 0 && searchQuery !== "restaurant") {
    restaurants = await searchText(apiKey, "restaurant", lat, lng, 10000);
  }

  return { restaurants, searchQuery };
}

export function directionsUrl(
  userLat: number,
  userLng: number,
  restaurant: Restaurant
): string {
  if (restaurant.googleMapsUrl) {
    return restaurant.googleMapsUrl;
  }

  const dest = `${restaurant.latitude},${restaurant.longitude}`;
  const origin = `${userLat},${userLng}`;
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}`;
}
