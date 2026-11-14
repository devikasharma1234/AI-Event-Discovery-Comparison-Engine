
import EventCard from "./EventCard";
import type { Event } from "../types/event";

interface EventResultsProps {
  events: Event[];
  hasSearched: boolean;
}

export default function EventResults({
  events,
  hasSearched,
}: EventResultsProps) {
  if (!hasSearched) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-slate-400">
        Your recommended events will appear here.
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center">
        <h3 className="text-lg font-semibold text-white">
          No matching events found
        </h3>

        <p className="mt-2 text-sm text-slate-400">
          Try changing your city, budget, or event category.
        </p>
      </div>
    );
  }

  return (
    <section id="recommendations">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          Recommended for you
        </h2>

        <span className="text-sm text-slate-400">
          {events.length} events found
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event._id} event={event} />
        ))}
      </div>
    </section>
  );
}
