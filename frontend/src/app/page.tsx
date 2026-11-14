
"use client";

import { useState } from "react";

import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import AIChat from "../components/AIChat";
import EventResults from "../components/EventResults";

import type {
  Event,
  SearchFilters,
} from "../types/event";

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filters, setFilters] =
    useState<SearchFilters | null>(null);

  const [hasSearched, setHasSearched] = useState(false);

  const handleResults = (results: Event[]) => {
    setEvents(results);
    setHasSearched(true);
  };

  return (
    <main className="min-h-screen bg-[#0B1020]">
      <Navbar />

      <HeroSection />

      <div className="mx-auto max-w-7xl space-y-12 px-6 pb-20">
        <AIChat
          onResults={handleResults}
          onFiltersChange={setFilters}
        />

        {filters && (
          <div className="flex flex-wrap gap-2">
            {filters.city && (
              <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-white">
                📍 {filters.city}
              </span>
            )}

            {filters.category && (
              <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-white">
                {filters.category}
              </span>
            )}

            {filters.budget !== undefined && (
              <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-white">
                Budget: ₹{filters.budget}
              </span>
            )}

            <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-white">
              {filters.people} people
            </span>
          </div>
        )}

        <EventResults
          events={events}
          hasSearched={hasSearched}
        />
      </div>
    </main>
  );
}
