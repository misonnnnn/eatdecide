import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseFoodRow } from "@/lib/recommendation";

export async function GET() {
  try {
    const rows = await prisma.food.findMany({ orderBy: { name: "asc" } });
    const foods = rows.map(parseFoodRow);
    return NextResponse.json({ foods });
  } catch (error) {
    console.error("Failed to fetch foods:", error);
    return NextResponse.json(
      { error: "Could not load foods" },
      { status: 500 }
    );
  }
}
