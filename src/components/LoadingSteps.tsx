"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "📍 Checking what's nearby...",
  "🔎 Looking for food...",
  "🎰 Finding your best match...",
];

type LoadingStepsProps = {
  hasLocation: boolean;
};

export default function LoadingSteps({ hasLocation }: LoadingStepsProps) {
  const [index, setIndex] = useState(0);

  const messages = hasLocation
    ? STEPS
    : ["🍽️ Picking something tasty...", "🎰 Almost there..."];

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length);
    }, 900);
    return () => clearInterval(timer);
  }, [messages.length]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <span className="animate-bounce text-5xl" aria-hidden="true">
        🍽️
      </span>
      <p className="text-sm font-semibold text-[var(--muted)] transition-opacity">
        {messages[index]}
      </p>
    </div>
  );
}
