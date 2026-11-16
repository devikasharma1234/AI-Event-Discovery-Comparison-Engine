"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Bookmark, GitCompareArrows, History, X } from "lucide-react";
import Navbar from "./Navbar";

import AIChat, { type SearchEntry } from "./AIChat";
import HeroSection from "./HeroSection";
import EventResults from "./EventResults";
import Footer from "./Footer";
import Dialog from "./Dialog";
import EventDetails, { TicketOptions } from "./EventDetails";
import { FilterForm } from "./SettingsForms";
import { getRecommendations } from "../lib/api";
import { eventDate, money } from "../lib/presentation";
import { updateWorkspace, useWorkspace } from "../lib/workspace";
import type { Event, SearchFilters } from "../types/event";

type Panel = "saved" | "history" | "filters" | "compare";
const initialFilters: SearchFilters = { people: 1 };
const interestTags: Record<string, string[]> = {
  Music: ["live music", "concert", "indie", "classical", "edm"],
  Comedy: ["comedy", "standup"],
  Movies: ["movies", "cinema"],
  Festival: ["food", "culture"],
  Sports: ["sports", "cricket", "football"],
};

export default function DiscoverWorkspace({ city, personalized = false, chat = false }: { city: string; personalized?: boolean; chat?: boolean }) {
  const { profile } = useWorkspace();
  const preferences = personalized ? profile.interests.flatMap((item) => interestTags[item] ?? []) : undefined;
  return <Discovery key={JSON.stringify(preferences)} city={city} preferences={preferences} chat={chat} />;
}

function Discovery({ city, preferences, chat }: { city: string; preferences?: string[]; chat: boolean }) {
  const { saved, history } = useWorkspace();
  const startingFilters = { people: 1, city: city || undefined, preferences };
  const [catalogRequest, setCatalogRequest] = useState<SearchFilters | null>(chat ? null : startingFilters);
  const [events, setEvents] = useState<Event[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [filters, setFilters] = useState<SearchFilters | undefined>(city || preferences ? startingFilters : undefined);
  const [awaitingAge, setAwaitingAge] = useState(false);
  const [busy, setBusy] = useState(!chat);
  const [error, setError] = useState("");
  const [compared, setCompared] = useState<Event[]>([]);
  const [panel, setPanel] = useState<Panel>();
  const [selected, setSelected] = useState<Event>();
  const [chatKey, setChatKey] = useState(0);
  const [chatContext, setChatContext] = useState<SearchEntry | undefined>(city || preferences ? { message: "", filters: startingFilters, awaitingAge: false } : undefined);

  useEffect(() => {
    if (!catalogRequest) return;
    const controller = new AbortController();
    getRecommendations(catalogRequest, controller.signal).then(setEvents, (error: Error) => {
      if (!controller.signal.aborted) setError(error.message);
    }).finally(() => {
      if (!controller.signal.aborted) setBusy(false);
    });
    return () => controller.abort();
  }, [catalogRequest]);

  function resetChat(context?: SearchEntry) {
    setChatContext(context);
    setChatKey((value) => value + 1);
  }

  function loadCatalog(next?: SearchFilters) {
    setError("");
    setBusy(true);
    setAwaitingAge(false);
    setFilters(next);
    setCatalogRequest({ ...(next ?? initialFilters) });
  }

  function clearSearch() {
    resetChat();
    if (chat) {
      setCatalogRequest(null);
      setFilters(undefined);
      setHasSearched(false);
      setAwaitingAge(false);
      setBusy(false);
      setError("");
    } else loadCatalog();
  }

  function applyFilters(next: SearchFilters) {
    resetChat({ message: "", filters: next, awaitingAge: false });
    loadCatalog(next);
    setPanel(undefined);
  }

  function openEvent(event: Event) {
    setPanel(undefined);
    setSelected(event);
  }

  function toggleSaved(event: Event) {
    updateWorkspace((current) => ({
      ...current,
      saved: current.saved.some((item) => item._id === event._id)
        ? current.saved.filter((item) => item._id !== event._id)
        : [event, ...current.saved],
    }));
  }

  function toggleCompared(event: Event) {
    setCompared((current) => current.some((item) => item._id === event._id)
      ? current.filter((item) => item._id !== event._id)
      : current.length < 3 ? [...current, event] : current);
  }

  function restoreSearch(entry: SearchEntry) {
    setPanel(undefined);
    resetChat(entry);
    document.getElementById("search")?.scrollIntoView({ behavior: "smooth" });
  }



  const closePanel = () => setPanel(undefined);
  const category = filters?.category ?? "";

  return (
    <>
      <Navbar city={filters?.city ?? ""} onCity={(value) => {
        const next = { ...(filters ?? initialFilters), city: value || undefined };
        if (awaitingAge) {
          setFilters(next);
          resetChat({ message: "", filters: next, awaitingAge: true });
        } else if (chat && !hasSearched) {
          setFilters(next);
          resetChat({ message: "", filters: next, awaitingAge: false });
        } else applyFilters(next);
      }} savedCount={saved.length} onSaved={() => setPanel("saved")} onHistory={chat ? () => setPanel("history") : undefined} />
      <main className={chat ? "shell home-chat-page" : "shell catalog-page"}>
        {chat && <HeroSection />}
        {!chat && <header className="page-intro"><h1>Discover events</h1><p>Browse the catalog by city, category, date, or budget.</p></header>}

        {chat && <AIChat key={chatKey} context={chatContext} onReset={clearSearch}
          onSearch={(entry) => updateWorkspace((current) => ({
            ...current, history: [entry, ...current.history.filter((item) =>
              item.message !== entry.message || JSON.stringify(item.filters) !== JSON.stringify(entry.filters)
            )].slice(0, 20),
          }))}
          onResults={(results, next, needsAge) => {
            setCatalogRequest(null);
            setHasSearched(true);
            setEvents(results);
            setFilters(next);
            setAwaitingAge(needsAge);
            setBusy(false);
            setError("");
          }}
        />}
        {(!chat || hasSearched) && <EventResults events={events} busy={busy} error={error} category={category} filters={filters} awaitingAge={awaitingAge}
          saved={saved} compared={compared}
          onCategory={(value) => {
            if (value === category) return;
            if (awaitingAge) {
              const next = { ...(filters ?? initialFilters), category: value || undefined };
              setFilters(next);
              resetChat({ message: "", filters: next, awaitingAge: true });
              document.getElementById("search")?.scrollIntoView({ behavior: "smooth" });
              return;
            }
            applyFilters({ ...(filters ?? initialFilters), category: value || undefined });
          }}
          onOpenFilters={() => setPanel("filters")}
          onReset={clearSearch} onSave={toggleSaved} onCompare={toggleCompared} onOpen={openEvent} />}
      </main>
      <Footer onSaved={() => setPanel("saved")} />
      {compared.length > 0 && <aside className="compare-tray" aria-label="Selected events">
        <button className="icon-button" aria-label="Clear comparison" onClick={() => setCompared([])}><X size={17} /></button>
        <span><GitCompareArrows size={17} /> {compared.length} of 3 selected</span>
        <button className="primary-button" disabled={compared.length < 2} onClick={() => setPanel("compare")}>Compare events</button>
      </aside>}
      {selected && <Dialog title={selected.title} onClose={() => setSelected(undefined)}>
        <EventDetails event={selected} saved={saved.some((event) => event._id === selected._id)} onSave={() => toggleSaved(selected)} />
      </Dialog>}

      {panel === "filters" && <Dialog title="Filter events" onClose={closePanel}>
        <FilterForm initial={filters} onApply={(next) => {
          if (chat && (awaitingAge || (next.children ?? 0) > 0) && next.children !== 0 && next.age === undefined) {
            setFilters(next);
            setAwaitingAge(true);
            setCatalogRequest(null);
            setBusy(false);
            setError("");
            resetChat({ message: "", filters: next, awaitingAge: true });
            closePanel();
            document.getElementById("search")?.scrollIntoView({ behavior: "smooth" });
            return;
          }
          applyFilters(next);
        }} onClear={() => { clearSearch(); closePanel(); }} />
      </Dialog>}
      {panel === "saved" && <Dialog title="Saved events" onClose={closePanel}>
        {saved.length ? <ul className="panel-list">{saved.map((event) => <li key={event._id}>
          <button className="list-item" onClick={() => openEvent(events.find((item) => item._id === event._id) ?? event)}><strong>{event.title}</strong><small>{event.city} · {eventDate(event.date)}</small></button>
          <button className="icon-button" onClick={() => toggleSaved(event)} aria-label={`Remove ${event.title}`}><X size={17} /></button>
        </li>)}</ul> : <p className="panel-empty"><Bookmark size={22} /> Bookmark an event to find it here later.</p>}
      </Dialog>}
      {panel === "history" && <Dialog title="Search history" onClose={closePanel}>
        {history.length ? <>
          <ul className="panel-list">{history.map((entry, index) => <li key={index}><button className="list-item history-item" onClick={() => restoreSearch(entry)}>{entry.message}<ArrowRight size={16} /></button></li>)}</ul>
          <button className="outline-button" onClick={() => updateWorkspace((current) => ({ ...current, history: [] }))}>Clear history</button>
        </> : <p className="panel-empty"><History size={22} /> Searches appear here after you use Ask PlanBee.</p>}
      </Dialog>}
      {panel === "compare" && <Dialog title="Compare events" wide onClose={closePanel}>
        <p className="muted">Compare per-person prices, dates, and age requirements. Sample listings link to platform homepages.</p>
        <div className="comparison-grid">{compared.map((event) => <article key={event._id}>
          <h3>{event.title}</h3>
          <dl>
            <dt>When</dt><dd>{eventDate(event.date, true)} IST</dd>
            <dt>Where</dt><dd>{event.venue}, {event.city}</dd>
            <dt>Age eligibility</dt><dd>{event.minAge ? `Ages ${event.minAge}+` : "All ages"}</dd>
            <dt>Sample rating</dt><dd>{event.rating.toFixed(1)} / 5</dd>
            <dt>From</dt><dd>{money(Math.min(...event.ticketListings.map((listing) => listing.price)))} per person</dd>
          </dl>
          <TicketOptions event={{ ...event, ticketListings: event.ticketListings.map((listing) => ({ ...listing, totalCost: undefined })) }} />
        </article>)}</div>
      </Dialog>}
    </>
  );
}
