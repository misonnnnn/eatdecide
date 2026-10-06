import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseFoodRow, recommendFood } from "@/lib/recommendation";
import type { ChooseAnswers } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      answers: ChooseAnswers;
      excludeId?: number;
    };

    if (!body.answers?.people || !body.answers?.budget) {
      return NextResponse.json(
        { error: "Missing people or budget" },
        { status: 400 }
      );
    }

    const rows = await prisma.food.findMany();
    const foods = rows.map(parseFoodRow);
    const recommendation = recommendFood(
      foods,
      body.answers,
      body.excludeId
    );

    return NextResponse.json({ recommendation });
  } catch (error) {
    console.error("Failed to recommend:", error);
    return NextResponse.json(
      { error: "Could not generate recommendation" },
      { status: 500 }
    );
  }
}
