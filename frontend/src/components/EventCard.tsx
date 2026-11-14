
import {
  CalendarDays,
  MapPin,
  Star,
  Ticket,
  Sparkles,
} from "lucide-react";

import type { Event } from "../types/event";

interface EventCardProps {
  event: Event;
}

export default function EventCard({
  event,
}: EventCardProps) {
  const date = new Date(event.date);

  const formattedDate = Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-[#111827] transition hover:border-violet-500/40">
      <div className="relative flex h-44 items-center justify-center bg-gradient-to-br from-violet-900/50 to-slate-900">
        <Ticket className="h-12 w-12 text-violet-400/60" />

        <span className="absolute right-4 top-4 rounded-full bg-violet-600 px-3 py-1 text-xs font-semibold text-white">
          {event.recommendationScore}% Match
        </span>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <span className="text-xs font-medium uppercase tracking-wider text-violet-400">
            {event.category}
          </span>

          <h3 className="mt-2 text-xl font-semibold text-white">
            {event.title}
          </h3>

          <p className="mt-2 line-clamp-2 text-sm text-slate-400">
            {event.description}
          </p>
        </div>

        <div className="space-y-2 text-sm text-slate-300">
          <div className="flex items-center gap-2">
            <CalendarDays size={16} className="text-violet-400" />
            {formattedDate}
          </div>

          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-violet-400" />
            {event.venue}, {event.city}
          </div>

          <div className="flex items-center gap-2">
            <Star size={16} className="text-amber-400" />
            {event.rating}/5
            <span className="text-xs text-slate-500">
              (sample rating)
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-3">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-violet-300">
            <Sparkles size={15} />
            Why this event?
          </div>

          <p className="text-xs leading-relaxed text-slate-300">
            {event.explanation}
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <div>
            <p className="text-xs text-slate-400">
              Estimated group cost
            </p>
            <p className="text-xl font-bold text-white">
              ₹{event.cheapestTotalCost.toLocaleString("en-IN")}
            </p>
          </div>

          <span className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300">
            Demo event
          </span>
        </div>
      </div>
    </article>
  );
}
