import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { findNearbyRestaurants } from "@/lib/places";
import { buildRecommendation, parseFoodRow } from "@/lib/recommendation";
import type { ChooseAnswers, Restaurant } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      answers: ChooseAnswers;
      excludeFoodId?: number;
      excludeRestaurantId?: string;
      /** Pass cached restaurants from the client to avoid extra Google calls */
      restaurants?: Restaurant[];
    };

    if (!body.answers?.people || !body.answers?.budget) {
      return NextResponse.json(
        { error: "Missing people or budget" },
        { status: 400 }
      );
    }

    const rows = await prisma.food.findMany();
    const foods = rows.map(parseFoodRow);

    let restaurants = body.restaurants ?? [];
    let restaurantsError: string | null = null;

    // Fetch restaurants once when we have location and no cache yet
    if (
      restaurants.length === 0 &&
      body.answers.location &&
      process.env.GOOGLE_MAPS_API_KEY
    ) {
      try {
        const result = await findNearbyRestaurants(
          body.answers.location.latitude,
          body.answers.location.longitude,
          body.answers.preferences
        );
        restaurants = result.restaurants;
      } catch (error) {
        console.error("Places lookup in recommend:", error);
        restaurantsError = "places_api_error";
      }
    } else if (
      restaurants.length === 0 &&
      body.answers.location &&
      !process.env.GOOGLE_MAPS_API_KEY
    ) {
      restaurantsError = "missing_api_key";
    }

    const recommendation = buildRecommendation(foods, body.answers, {
      excludeFoodId: body.excludeFoodId,
      excludeRestaurantId: body.excludeRestaurantId,
      restaurants,
    });

    return NextResponse.json({
      recommendation,
      restaurants,
      restaurantsError,
    });
  } catch (error) {
    console.error("Failed to recommend:", error);
    return NextResponse.json(
      { error: "Could not generate recommendation" },
      { status: 500 }
    );
  }
}
