import { NextResponse } from "next/server";
import { findNearbyRestaurants } from "@/lib/places";
import type { FoodPreference } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      latitude?: number;
      longitude?: number;
      preferences?: FoodPreference[];
    };

    if (body.latitude == null || body.longitude == null) {
      return NextResponse.json(
        { error: "Missing latitude or longitude" },
        { status: 400 }
      );
    }

    if (!process.env.GOOGLE_MAPS_API_KEY) {
      return NextResponse.json(
        { error: "missing_api_key", restaurants: [] },
        { status: 503 }
      );
    }

    const preferences = body.preferences?.length
      ? body.preferences
      : (["surprise"] as FoodPreference[]);

    const { restaurants, searchQuery } = await findNearbyRestaurants(
      body.latitude,
      body.longitude,
      preferences
    );

    return NextResponse.json({ restaurants, searchQuery });
  } catch (error) {
    console.error("Restaurant search failed:", error);
    const message =
      error instanceof Error && error.message === "missing_api_key"
        ? "missing_api_key"
        : "places_api_error";

    return NextResponse.json(
      { error: message, restaurants: [] },
      { status: message === "missing_api_key" ? 503 : 502 }
    );
  }
}
