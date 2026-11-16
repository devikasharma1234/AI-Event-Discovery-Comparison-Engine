import { CalendarDays, Clapperboard, Grid2X2, Mic2, Music2, PartyPopper, SearchX, SlidersHorizontal, Trophy } from "lucide-react";
import EventCard from "./EventCard";
import type { Event, SearchFilters } from "../types/event";
import { categories, money } from "../lib/presentation";

const icons = [Grid2X2, Music2, Mic2, Clapperboard, PartyPopper, Trophy];

interface Props {
  events: Event[];
  busy: boolean;
  error: string;
  category: string;
  filters?: SearchFilters;
  awaitingAge: boolean;
  saved: Event[];
  compared: Event[];
  onCategory: (category: string) => void;
  onOpenFilters: () => void;
  onReset: () => void;
  onSave: (event: Event) => void;
  onCompare: (event: Event) => void;
  onOpen: (event: Event) => void;
}

export default function EventResults(props: Props) {
  const { events, busy, error, filters, awaitingAge, category } = props;
  return (
    <section id="discover" className="discovery" aria-labelledby="discover-title">
      <div className="section-heading">
        <div>
          <h2 id="discover-title">{filters ? "Your recommendations" : "Explore upcoming events"}</h2>
          <p>{awaitingAge ? "Answer the assistant’s question to see age-eligible events." : filters ? "Explore your matches and check available ticket information." : "Browse the event catalog or narrow your search by city and category."}</p>
        </div>
        <button className="outline-button" onClick={props.onOpenFilters}><SlidersHorizontal size={16} /> Filters</button>
      </div>
      <div className="filter-row">
        {categories.map((item, index) => {
          const Icon = icons[index];
          return <button className="category-button" key={item.value} aria-pressed={category === item.value} onClick={() => props.onCategory(item.value)}><Icon size={16} /> {item.label}</button>;
        })}
      </div>
      {filters && <div className="active-filters">
        {filters.city && <span>{filters.city}</span>}
        {filters.budget !== undefined && <span>Up to {money(filters.budget)}</span>}
        <span>{filters.people} {filters.people === 1 ? "person" : "people"}</span>
        {filters.children !== undefined && filters.children > 0 && <span>{filters.people - filters.children} adults · {filters.children} {filters.children === 1 ? "child" : "children"}</span>}
        {filters.age !== undefined && <span>Youngest age {filters.age}</span>}
        {filters.date && <span><CalendarDays size={13} /> {filters.date}{filters.endDate ? ` – ${filters.endDate}` : ""}</span>}
        <button onClick={props.onReset}>Clear search</button>
      </div>}
      <div className="results-status" aria-live="polite" aria-atomic="true">
        {busy ? "Loading events…" : !error && !awaitingAge ? `${events.length} ${events.length === 1 ? "event" : "events"}` : ""}
      </div>
      {busy ? <div className="event-grid" aria-hidden="true">{[1, 2, 3].map((index) => <div className="event-skeleton" key={index} />)}</div>
        : awaitingAge ? null
        : error || events.length === 0 ? <div className="empty-state">
          <SearchX size={28} />
          <h3>{error ? "Couldn’t load events" : "No matching events"}</h3>
          <p>{error || "Try different filters. Live listings with unknown prices or age limits are excluded when those details are required."}</p>
          <button className="outline-button" onClick={error ? props.onReset : props.onOpenFilters}>{error ? "Try again" : "Edit filters"}</button>
        </div> : <div className="event-grid">
          {events.map((event) => <EventCard key={event._id} event={event} isSearch={Boolean(filters)}
            saved={props.saved.some((item) => item._id === event._id)}
            compared={props.compared.some((item) => item._id === event._id)}
            compareFull={props.compared.length >= 3}
            onSave={() => props.onSave(event)} onCompare={() => props.onCompare(event)} onOpen={() => props.onOpen(event)} />)}
        </div>}
    </section>
  );
}
