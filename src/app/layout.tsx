import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "What Should I Eat? | EatDecide",
    template: "%s | EatDecide",
  },
  description:
    "Can't decide what to eat? EatDecide helps you choose food based on your budget, group size, cravings, mood, and nearby restaurants.",
  keywords: [
    "what should I eat",
    "what should I eat tonight",
    "what should I eat for dinner",
    "what should we eat",
    "food picker",
    "random food picker",
    "what to eat",
    "what to eat for dinner",
  ],
  openGraph: {
    title: "What Should I Eat? | EatDecide",
    description:
      "Can't decide what to eat? EatDecide helps you choose food based on your budget, group size, cravings, mood, and nearby restaurants.",
    siteName: "EatDecide",
    type: "website",
    locale: "en_PH",
  },
  twitter: {
    card: "summary_large_image",
    title: "What Should I Eat? | EatDecide",
    description:
      "Stop thinking. Start eating. Food picks, nearby restaurants, and budget estimates for your group.",
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
