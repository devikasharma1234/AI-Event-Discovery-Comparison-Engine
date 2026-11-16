import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PlanBee | Find your next event",
  description: "Discover concerts, comedy, movies, sports, and festivals with a conversational event search and ticket comparison.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="en"><body>{children}</body></html>;
}
