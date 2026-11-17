import { ArrowUpRight, Bookmark, CalendarDays, GitCompareArrows, MapPin, Star } from "lucide-react";
import type { Event } from "../types/event";
import { categories, eventDate, money } from "../lib/presentation";

interface Props {
  event: Event;
  saved: boolean;
  compared: boolean;
  compareFull: boolean;
  isSearch: boolean;
  onSave: () => void;
  onCompare: () => void;
  onOpen: () => void;
}

export default function EventCard({ event, saved, compared, compareFull, isSearch, onSave, onCompare, onOpen }: Props) {
  const art = categories.find((item) => item.value === event.category)?.art ?? "music";
  return (
    <article className="event-card">
      <div className={`event-photo art-${art}`} style={event.imageUrl?.startsWith("https://") ? { backgroundImage: `url("${event.imageUrl.replaceAll('"', '%22')}")`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>
        <span className="event-category">{event.category}{event.isSampleFallback ? " · Sample event" : ""}</span>
        <button className="save-button" type="button" onClick={onSave} aria-pressed={saved} aria-label={saved ? `Remove ${event.title} from saved events` : `Save ${event.title}`}>
          <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="event-body">
        <div className="event-meta">
          <span><CalendarDays size={15} /> {eventDate(event.date)}</span>
          {event.rating !== null && <span aria-label={`Sample rating ${event.rating} out of 5`}><Star size={14} fill="currentColor" /> {event.rating.toFixed(1)}</span>}
        </div>
        <h3><button type="button" onClick={onOpen}>{event.title}</button></h3>
        <p className="event-venue"><MapPin size={15} /> {event.venue}, {event.city}</p>
        {isSearch && <p className="event-match"><span>{event.recommendationScore}% match</span> {event.explanation}</p>}
        <div className="event-bottom">
          <p><small>{event.demoPrice !== undefined ? (isSearch ? "Estimated group total" : "Estimated ticket price") : event.cheapestTotalCost === null ? event.source : isSearch ? "Group total from" : "Tickets from"}</small><strong>{event.cheapestTotalCost === null
            ? event.startingPrice === 0 ? "Free entry" : event.startingPrice != null ? `From ${money(event.startingPrice)}` : "Price not published"
            : money(event.cheapestTotalCost)}</strong></p>
          <div>
            <button className="compare-button" title={compareFull && !compared ? "You can compare up to three events" : "Compare event"} aria-label={`Compare ${event.title}`} aria-pressed={compared} disabled={compareFull && !compared} type="button" onClick={onCompare}><GitCompareArrows size={17} /></button>
            <button className="details-button" onClick={onOpen} type="button">Details <ArrowUpRight size={15} /></button>
          </div>
        </div>
      </div>
    </article>
  );
}
