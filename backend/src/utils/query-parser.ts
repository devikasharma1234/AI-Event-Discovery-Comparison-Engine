import { filterUpdateSchema } from "../types/ai.types.js";
import type { RecommendationFilters } from "../types/search.types.js";

export const indianDate = (date = new Date()) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(date);

const addDays = (day: string, count: number) => {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + count);
  return date.toISOString().slice(0, 10);
};

export const upcomingWeekend = (today = indianDate()) => {
  const weekday = new Date(`${today}T00:00:00Z`).getUTCDay();
  const saturday = addDays(today, weekday === 0 ? -1 : 6 - weekday);
  return { date: saturday, endDate: addDays(saturday, 1) };
};

export function parseCommonQuery(message: string, previous?: RecommendationFilters) {
  const text = message.toLowerCase();
  const city = ["Delhi", "Chandigarh", "Mumbai", "Bengaluru", "Bangalore", "Hyderabad", "Pune", "Jaipur", "Chennai", "Kolkata", "Noida", "Gurugram"].find((value) =>
    new RegExp(`\\b${value.toLowerCase()}\\b`).test(text)
  );
  const categories = [
    ["Music", /\b(music|concerts?|gigs?|edm)\b/],
    ["Comedy", /\b(comedy|stand[ -]?up)\b/],
    ["Movies", /\b(movies?|cinema|films?|screening)\b/],
    ["Sports", /\b(sports?|cricket|football)\b/],
    ["Festival", /\b(festivals?|street food|food and culture)\b/],
  ] as const;
  const category = categories.find(([, pattern]) => pattern.test(text))?.[0];
  const age = text.match(/\b(?:aged?|turning)\s*(\d{1,3})\b|\b(\d{1,3})[ -]year[ -]old\b|\b(?:child|kid|minor|youngest)(?:'s age)?\s+is\s+(\d{1,3})\b|^\s*(\d{1,3})(?:\s+years? old)?[.!]?\s*$/);
  const adults = text.match(/\b(\d+)\s+adults?\b/);
  const children = text.match(/\b(\d+)\s+(?:child(?:ren)?|kids?|minors?)\b/);
  const group = text.match(/\b(?:group of|party of|for)\s+(\d+)\b|\b(\d+)\s+(?:people|attendees|tickets|guests)\b/);
  const budgetChange = text.match(/\b(increase|raise|lower|reduce|decrease)\s+(?:the\s+)?budget\s+by\s*(?:₹|rs\.?\s*)?([\d,]+(?:\.\d+)?)/);
  const budgetText = /\b(child(?:ren)?|kids?|minors?)\b/.test(text)
    ? text.replace(/\bunder\s+18\b/g, "") : text;
  const budget = budgetText.match(/(?:\b(?:under|below|up to|budget(?:\s+(?:is|of|to))?)\s*(?:₹\s*|rs\.?\s*|inr\s*)?|₹\s*)([\d,]+(?:\.\d+)?)(?![\d,.]|\s*(?:years?|children|kids|adults|people)\b)/);
  const dates = text.match(/\b\d{4}-\d{2}-\d{2}\b/g) ?? [];
  const weekend = /\bweekends?\b/.test(text) ? upcomingWeekend() : undefined;
  const weekendOffset = /\bnext weekend\b/.test(text) ? 7 : 0;
  const relativeDate = /\btomorrow\b/.test(text) ? addDays(indianDate(), 1)
    : /\btoday|tonight\b/.test(text) ? indianDate() : undefined;
  const clear = [
    [/\b(any city|anywhere)\b/, "city"],
    [/\b(any|all) categor(?:y|ies)\b/, "category"],
    [/\b(no budget|any budget)\b/, "budget"],
    [/\b(adults only|no children|no kids)\b/, "age"],
    [/\b(any date|any time|anytime)\b/, "date"],
    [/\b(no preferences|any interests)\b/, "preferences"],
  ].filter(([pattern]) => (pattern as RegExp).test(text)).map(([, field]) => field);
  const number = (value: string) => Number(value.replaceAll(",", ""));

  return filterUpdateSchema.parse({
    city: city ?? null,
    category: category ?? null,
    people: group ? number((group[1] ?? group[2])!) :
      adults ? number(adults[1]!) + Number(children?.[1] ?? 0) :
      children && !previous?.children ? Math.max(Number(children[1]), previous?.people ?? 1) : null,
    children: /\b(adults only|no children|no kids)\b/.test(text) ? 0 : children ? Number(children[1]) : null,
    budget: budgetChange && previous?.budget !== undefined
      ? previous.budget + (/increase|raise/.test(budgetChange[1]!) ? 1 : -1) * number(budgetChange[2]!)
      : budget ? number(budget[1]!) : null,
    age: age ? Number(age.slice(1).find(Boolean)) : /\bfamily[ -]friendly\b/.test(text) ? 0 : null,
    date: dates[0] ?? (weekend && addDays(weekend.date, weekendOffset)) ?? relativeDate ?? null,
    endDate: dates[1] ?? (!dates[0] && weekend ? addDays(weekend.endDate, weekendOffset) : null),
    preferences: /\bfamily\b/.test(text) ? ["family"] : null,
    clear,
  });
}
