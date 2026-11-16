import { createHash } from "node:crypto";
import { indianDate } from "../utils/query-parser.js";

const cities = ["Delhi", "Mumbai", "Bengaluru", "Chandigarh", "Chennai", "Hyderabad", "Jaipur", "Kolkata"];
const ttl = 30 * 60 * 60 * 1000;
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export interface LiveEvent {
  _id: string;
  title: string;
  category: string;
  description: string;
  city: string;
  date: Date;
  dateOnly: true;
  schedule?: string;
  address?: string[];
  startingPrice?: number | null;
  detailsLoaded?: boolean;
  venue: string;
  imageUrl: string;
  minAge: null;
  durationMinutes: null;
  rating: null;
  tags: string[];
  source: "Google Events via SerpApi";
  ticketListings: { platform: string; bookingUrl: string; price: number | null; isDemo: false; officialListing?: boolean }[];
}

export const usesLiveEvents = () => process.env.DEMO_MODE !== "true" && process.env.EVENT_SOURCE !== "mongodb";

function url(value: unknown): string {
  if (typeof value !== "string") return "";
  try { const parsed = new URL(value); return parsed.protocol === "https:" ? parsed.href : ""; } catch { return ""; }
}

function parseDate(start: string, when: string, today: string): Date | undefined {
  const match = /^(?:([A-Za-z]{3})\s+(\d{1,2})|(\d{1,2})\s+([A-Za-z]{3}))(?:[ ,]+(20\d{2}))?$/.exec(start.trim());
  if (!match) return;
  const month = months.findIndex((name) => name.toLowerCase() === (match[1] ?? match[4])?.toLowerCase()) + 1;
  const day = Number(match[2] ?? match[3]);
  if (!month || day < 1 || day > 31) return;
  const suffix = `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const explicitYear = match[5] ?? when.match(/\b20\d{2}\b/)?.[0];
  const currentYear = Number(today.slice(0, 4));
  const year = explicitYear ? Number(explicitYear) : currentYear + Number(suffix < today.slice(5));
  const calendarDate = `${year}-${suffix}`;
  const validation = new Date(`${calendarDate}T12:00:00Z`);
  if (Number.isNaN(+validation) || validation.toISOString().slice(0, 10) !== calendarDate) return;
  return new Date(`${calendarDate}T23:59:59+05:30`);
}

interface SearchResult {
  title?: string;
  description?: string;
  address?: string[];
  date?: string | { start_date?: string; when?: string };
  type?: string;
  time?: string;
  event_token?: string;
  price?: string;
  link?: string;
  thumbnail?: string;
  image?: string;
  venue?: string | { name?: string } | { name?: string }[];
  ticket_info?: { source?: string; link?: string; price?: string }[];
}

function inrPrice(label: unknown): number | null {
  if (typeof label !== "string") return null;
  if (/^free(?: entry)?$/i.test(label.trim())) return 0;
  const value = label.match(/^(?:from\s+)?(?:₹|INR|Rs\.?)\s*([\d,]+(?:\.\d{1,2})?)(?:\+|\s*onwards)?$/i)?.[1];
  const amount = value ? Number(value.replaceAll(",", "")) : NaN;
  return Number.isFinite(amount) ? amount : null;
}

const tokens = new WeakMap<LiveEvent, string>();

export function normalizeLiveEvent(row: SearchResult, city: string, today = indianDate(), knownDate?: Date): LiveEvent | undefined {
  const title = typeof row.title === "string" ? row.title.trim() : "";
  const when = typeof row.date === "object" ? row.date?.when ?? "" : "";
  const start = typeof row.date === "string" ? row.date : row.date?.start_date;
  const date = knownDate ?? parseDate(start ?? "", when, today);
  if (!title || !date) return;
  const description = typeof row.description === "string" ? row.description : "";
  const categories = [
    ["Comedy", /stand.?up|comedy/i], ["Movies", /cinema|film screening|movie/i],
    ["Sports", /cricket|football|marathon|tournament|sports/i],
    ["Music", /concert|live music|orchestra|\bjazz\b|\bdj\b/i], ["Festival", /festival|mela|fair/i],
  ] as const;
  const category = categories.find(([, pattern]) => pattern.test(`${title} ${row.type ?? ""}`))?.[0] ?? "Other";
  const venue = (typeof row.venue === "string" ? row.venue : Array.isArray(row.venue) ? row.venue[0]?.name : row.venue?.name) || row.address?.[0] || "Venue not provided";
  const listingUrls = new Map<string, LiveEvent["ticketListings"][number]>();
  for (const listing of row.ticket_info ?? []) {
    const bookingUrl = url(listing.link);
    if (bookingUrl) listingUrls.set(bookingUrl, { bookingUrl, platform: listing.source || "Event provider", price: inrPrice(listing.price), isDemo: false });
  }
  const link = url(row.link);
  if (!listingUrls.size && link) listingUrls.set(link, { bookingUrl: link, platform: "Event listing", price: null, isDemo: false, officialListing: true });
  const id = createHash("sha256").update(JSON.stringify([city, title, indianDate(date), venue, when || undefined])).digest("hex").slice(0, 24);
  const event: LiveEvent = {
    _id: id, city, title, description, category, venue, date, dateOnly: true,
    imageUrl: url(row.image) || url(row.thumbnail), minAge: null, rating: null, durationMinutes: null,
    tags: [category.toLowerCase(), ...title.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean)],
    source: "Google Events via SerpApi", ticketListings: [...listingUrls.values()],
    schedule: when || row.time || "",
    address: row.address ?? [],
    startingPrice: inrPrice(row.price),
  };
  if (typeof row.event_token === "string" && row.event_token) tokens.set(event, row.event_token);
  return event;
}

const cache = new Map<string, { expires: number; events: LiveEvent[] }>();
const pending = new Map<string, Promise<LiveEvent[]>>();
const detailRequests = new WeakMap<LiveEvent, Promise<LiveEvent>>();

export function enrichLiveEvent(event: LiveEvent): Promise<LiveEvent> {
  const token = tokens.get(event);
  if (!token) return Promise.resolve(event);
  const existing = detailRequests.get(event);
  if (existing) return existing;

  const request = (async () => {
    const query = new URLSearchParams({
      engine: "google_event_details", event_token: token,
      hl: "en", gl: "in", api_key: process.env.SERPAPI_API_KEY ?? "",
    });
    const response = await fetch(`https://serpapi.com/search.json?${query}`, { signal: AbortSignal.timeout(12000) })
      .catch(() => { throw new Error("SerpApi event details connection failed"); });
    if (!response.ok) throw new Error(`SerpApi event details returned HTTP ${response.status}`);
    const data = await response.json() as { event_details?: SearchResult };
    if (!data.event_details) throw new Error("SerpApi supplied no details for this event");
    const details = normalizeLiveEvent({ ...data.event_details, title: event.title }, event.city, undefined, event.date);
    return {
      ...event,
      description: details?.description || event.description,
      venue: details?.venue && details.venue !== "Venue not provided" ? details.venue : event.venue,
      address: details?.address?.length ? details.address : event.address ?? [],
      schedule: (typeof data.event_details.date === "object" ? data.event_details.date?.when : undefined) || details?.schedule || event.schedule || "",
      startingPrice: details?.startingPrice ?? event.startingPrice ?? null,
      detailsLoaded: true,
      ticketListings: details?.ticketListings.length ? details.ticketListings : event.ticketListings,
    };
  })().catch((error: unknown) => {
    detailRequests.delete(event);
    throw error;
  });
  detailRequests.set(event, request);
  return request;
}

async function fetchCity(city: string): Promise<LiveEvent[]> {
  const key = process.env.SERPAPI_API_KEY;
  if (!key) throw new Error("SERPAPI_API_KEY is required for live events");
  const place = city === "Delhi" ? "New Delhi" : city;
  const query = new URLSearchParams({
    engine: "google", q: `events in ${place}`, location: `${city}, India`,
    device: "mobile", hl: "en", gl: "in", api_key: key,
  });
  const response = await fetch(`https://serpapi.com/search.json?${query}`, { signal: AbortSignal.timeout(8000) })
    .catch(() => { throw new Error("SerpApi connection failed"); });
  if (!response.ok) throw new Error(`SerpApi returned HTTP ${response.status}`);
  const data = await response.json() as { error?: string; events_results?: unknown };
  if (data.error) throw new Error("SerpApi search failed");
  const rows = Array.isArray(data.events_results) ? data.events_results as SearchResult[] : [];
  const events = new Map<string, LiveEvent>();
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const event = normalizeLiveEvent(row, city);
    if (event) events.set(event._id, event);
  }
  return [...events.values()];
}

export function getLiveEvents(city?: string): Promise<LiveEvent[]> {
  const selected = city
    ? cities.filter((candidate) => candidate.toLowerCase() === city.toLowerCase() ||
        (candidate === "Bengaluru" && /^bangalore$/i.test(city)) || (candidate === "Delhi" && /^new delhi$/i.test(city)))
    : cities;
  return Promise.all(selected.map((name) => {
    const cached = cache.get(name);
    if (cached && cached.expires > Date.now()) return Promise.resolve(cached.events);
    const existing = pending.get(name);
    if (existing) return existing;
    const request = fetchCity(name).then((events) => {
      cache.set(name, { expires: Date.now() + ttl, events });
      return events;
    }).finally(() => pending.delete(name));
    pending.set(name, request);
    return request;
  })).then((groups) => groups.flat());
}
