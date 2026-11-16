import { ArrowUpRight, CalendarDays, Clock, MapPin, ShieldCheck } from "lucide-react";
import { eventDate, money } from "../lib/presentation";
import type { Event, TicketListing } from "../types/event";

const demoPlatforms: Record<string, { name: string; url: string }> = {
  DemoTickets: { name: "BookMyShow", url: "https://in.bookmyshow.com/" },
  "EventHub Demo": { name: "District", url: "https://www.district.in/" },
  CinemaDemo: { name: "BookMyShow", url: "https://in.bookmyshow.com/" },
  FestivalDemo: { name: "District", url: "https://www.district.in/" },
};

function listingDestination(listing: TicketListing) {
  const platform = listing.isDemo ? demoPlatforms[listing.platform] : undefined;
  try {
    const url = new URL(platform?.url ?? listing.bookingUrl);
    if (url.protocol === "https:" && url.hostname !== "example.com") return { name: platform?.name ?? listing.platform, url: url.href };
  } catch {}
  return { name: listing.platform };
}

export function TicketOptions({ event }: { event: Event }) {
  return <div className="ticket-options">
    {event.ticketListings.map((listing, index) => {
      const destination = listingDestination(listing);
      return <div className="ticket-option" key={`${listing.platform}-${index}`}>
        <div><strong>{destination.name}</strong><small>{money(listing.price)} per person{listing.totalCost !== undefined && listing.totalCost !== listing.price ? ` · ${money(listing.totalCost)} group total` : ""}</small></div>
        {destination.url && <a className="text-link" href={destination.url} target="_blank" rel="noopener noreferrer">{listing.isDemo ? "Visit platform" : "View tickets"} <ArrowUpRight size={15} /></a>}
      </div>;
    })}
  </div>;
}

export default function EventDetails({ event, saved, onSave }: { event: Event; saved: boolean; onSave: () => void }) {
  return <>
    <p className="detail-description">{event.description}</p>
    <div className="detail-meta">
      <span><CalendarDays size={16} /> {eventDate(event.date, true)} IST</span>
      <span><MapPin size={16} /> {event.venue}, {event.city}</span>
      <span><Clock size={16} /> {event.durationMinutes} min</span>
      <span><ShieldCheck size={16} /> {event.minAge ? `Ages ${event.minAge}+` : "All ages"}</span>
    </div>
    {event.scoreBreakdown && <details className="ranking-details">
      <summary>Why this ranks here · {event.recommendationScore}/100</summary>
      <p className="muted">Events first pass your search filters. These signals determine the order of the eligible results.</p>
      <dl>
        {([
          ["budget", "Budget fit"], ["rating", "Sample rating"],
          ["preference", "Interest match"], ["date", "Date proximity"],
        ] as const).map(([key, label]) => {
          const weight = event.scoreWeights?.[key];
          const score = event.scoreBreakdown[key];
          return <div className="ranking-signal" key={key}>
            <dt>{label}{weight !== undefined && <small> · {Math.round(weight * 100)}% weight</small>}</dt>
            <dd><meter aria-label={label} min={0} max={100} value={score} /> <span>{score}/100</span></dd>
          </div>;
        })}
      </dl>
    </details>}
    <h3 className="dialog-subtitle">Ticket options</h3>
    {event.ticketListings.some((listing) => listing.isDemo) && <p className="muted">Sample prices. Platform links open the provider’s homepage.</p>}
    <TicketOptions event={event} />
    <button className="outline-button" type="button" onClick={onSave}>{saved ? "Remove from saved" : "Save event"}</button>
  </>;
}
