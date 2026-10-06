import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Choose Your Food",
  description:
    "Answer a few quick questions about your group size, budget, cravings, and mood — then let EatDecide pick what to eat.",
};

export default function ChooseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
