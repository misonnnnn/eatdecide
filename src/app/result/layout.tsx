import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Food Recommendation",
  description:
    "See your EatDecide food pick with estimated cost per person, suggested order, and split breakdown.",
};

export default function ResultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
