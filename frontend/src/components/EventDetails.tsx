import { ArrowUpRight, CalendarDays, Clock, MapPin, ShieldCheck } from "lucide-react";
import { eventDate, money } from "../lib/presentation";
import { useEffect, useState } from "react";
import type { Event, TicketListing } from "../types/event";

const demoPlatforms: Record<string, { name: string; url: string }> = {
  DemoTickets: { name: "BookMyShow", url: "https://in.bookmyshow.com/" },
  "EventHub Demo": { name: "District", url: "https://www.district.in/" },
  CinemaDemo: { name: "BookMyShow", url: "https://in.bookmyshow.com/" },
  FestivalDemo: { name: "District", url: "https://www.district.in/" },
};

export function startingTicketPrice(event: Event): number | null {
  const prices = event.ticketListings.flatMap(({ price }) => price === null ? [] : [price]);
  if (event.startingPrice != null) prices.push(event.startingPrice);
  return prices.length ? Math.min(...prices) : event.demoPrice ?? null;
}

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
        <div><strong>{destination.name}</strong><small>{listing.price === null ? "Price unknown" : `${money(listing.price)} per person`}{listing.totalCost !== undefined && listing.totalCost !== listing.price ? ` · ${money(listing.totalCost)} group total` : ""}</small></div>
        {destination.url && <a className="text-link" href={destination.url} target="_blank" rel="noopener noreferrer">{listing.isDemo ? "Visit platform" : listing.officialListing ? "View event listing" : `Book on ${destination.name}`} <ArrowUpRight size={15} /></a>}
      </div>;
    })}
  </div>;
}

export default function EventDetails({ event: original, saved, onSave }: { event: Event; saved: boolean; onSave: () => void }) {
  const [details, setDetails] = useState<{ event?: Event; error?: boolean }>();
  const { _id, city, source } = original;
  const shouldLoad = Boolean(source && !original.detailsLoaded);
  useEffect(() => {
    if (!shouldLoad) return;
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch(`/api/events/${encodeURIComponent(_id)}?city=${encodeURIComponent(city)}`, { signal: controller.signal });
        if (!response.ok) throw new Error("Event details unavailable");
        const { event } = await response.json() as { event: Event };
        if (!controller.signal.aborted) setDetails({ event });
      } catch {
        if (!controller.signal.aborted) setDetails({ error: true });
      }
    }
    void load();
    return () => controller.abort();
  }, [_id, city, shouldLoad]);

  const event = details?.event ? { ...original, ...details.event } : original;
  const price = startingTicketPrice(event);
  return <>
    <p className="detail-description">{event.description}</p>
    <div className="detail-meta">
      <span><CalendarDays size={16} /> {eventDate(event.date, !event.dateOnly)}{event.dateOnly ? "" : " IST"}{event.schedule ? ` · ${event.schedule}` : ""}</span>
      <span><MapPin size={16} /> {[...new Set([event.venue, ...(event.address ?? []), event.city])].join(", ")}</span>
      {event.durationMinutes !== null && <span><Clock size={16} /> {event.durationMinutes} min</span>}
      <span><ShieldCheck size={16} /> {event.minAge === null ? "Age limit unknown" : event.minAge ? `Ages ${event.minAge}+` : "All ages"}</span>
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
    {event.source && price !== null && <p>{event.demoPrice !== undefined
      ? `${money(price)} per person · Demo estimate. Check the provider for the actual price.`
      : price === 0 ? "Free entry" : `From ${money(price)}`}</p>}
    {shouldLoad && !details && <p className="muted" role="status">Checking prices and booking links…</p>}
    {details?.error && <p className="muted" role="status">The provider’s extra details could not be loaded. Reopen this event to retry.</p>}
    {(event.detailsLoaded || details?.event) && !event.ticketListings.length && <p className="muted">The provider supplied no booking link for this event.</p>}
    {event.ticketListings.some((listing) => listing.isDemo) && <p className="muted">Sample prices. Platform links open the provider’s homepage.</p>}
    {event.source && <p className="muted">Listings from {event.source}. Check the provider for current prices and eligibility.</p>}
    <TicketOptions event={event} />
    <button className="outline-button" type="button" onClick={onSave}>{saved ? "Remove from saved" : "Save event"}</button>
  </>;
}
