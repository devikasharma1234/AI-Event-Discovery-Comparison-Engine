import assert from "node:assert/strict";
import { test } from "node:test";
import type { Request, Response } from "express";

test("SerpApi listings power discovery and preserve unknown ticket details", async (context) => {
  const previousDemo = process.env.DEMO_MODE;
  const previousSource = process.env.EVENT_SOURCE;
  const previousKey = process.env.SERPAPI_API_KEY;
  delete process.env.DEMO_MODE;
  delete process.env.EVENT_SOURCE;
  process.env.SERPAPI_API_KEY = "fixture-key";
  context.after(() => {
    for (const [key, value] of Object.entries({
      DEMO_MODE: previousDemo, EVENT_SOURCE: previousSource, SERPAPI_API_KEY: previousKey,
    })) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
  context.mock.timers.enable({ apis: ["Date"], now: new Date("2026-11-16T09:00:00Z") });
  const fetchMock = context.mock.method(globalThis, "fetch", async (input: string) => {
    const query = new URL(input);
    if (query.searchParams.get("engine") === "google_event_details") {
      assert.equal(query.searchParams.get("event_token"), "fixture-token");
      return Response.json({ event_details: {
        description: "A jazz trio plays two sets.",
        price: "From ₹499",
        venue: { name: "Jazz Room" },
        ticket_info: [{ source: "Organizer", link: "https://example.org/event", price: "₹499" }],
      } });
    }
    assert.equal(query.searchParams.get("engine"), "google");
    assert.equal(query.searchParams.get("device"), "mobile");
    assert.equal(query.searchParams.get("location"), "Mumbai, India");
    assert.match(query.searchParams.get("q") ?? "", /Mumbai/);
    return Response.json({ events_results: [{
      title: "Mumbai Jazz Concert",
      event_token: "fixture-token",
      date: { start_date: "Nov 22", when: "Nov 22, 2026" },
      ticket_info: [{ source: "Organizer", link: "https://example.org/event" }],
    }] });
  });
  const { searchEvents } = await import("../src/services/search.service.js");
  const { normalizeLiveEvent } = await import("../src/services/live-event.service.js");
  const mobile = normalizeLiveEvent(
    { title: "An evening out", date: "18 Dec", type: "Live music", venue: "Community Hall" },
    "Delhi", "2026-11-16"
  );
  assert.equal(mobile?.date.toISOString(), "2026-12-18T18:29:59.000Z");
  assert.equal(mobile?.category, "Music");
  assert.equal(mobile?.venue, "Community Hall");
  const [event] = await searchEvents({ city: "Mumbai", category: "Music", people: 2 });
  assert.equal(event?.title, "Mumbai Jazz Concert");
  assert.equal(event?.cheapestTotalCost, 998);
  assert.equal(event?.minAge, null);
  assert.equal(event?.ticketListings[0]?.bookingUrl, "https://example.org/event");
  const [withinBudget] = await searchEvents({ city: "Mumbai", budget: 1500, people: 2 });
  assert.equal(withinBudget?.cheapestTotalCost, 998);
  assert.deepEqual(await searchEvents({ city: "Mumbai", budget: 997, people: 2 }), []);
  assert.deepEqual(await searchEvents({ city: "Mumbai", age: 8, people: 2 }), []);
  assert.equal(fetchMock.mock.callCount(), 2);
  const { getEventById } = await import("../src/services/event.service.js");
  const enriched = await getEventById(event!._id.toString(), "Mumbai");
  assert.equal(enriched?.description, "A jazz trio plays two sets.");
  assert.equal(enriched?.ticketListings[0]?.price, 499);
  await getEventById(event!._id.toString(), "Mumbai");
  assert.equal(fetchMock.mock.callCount(), 2);
});

async function call(handler: (req: Request, res: Response) => Promise<void>, body: unknown) {
  let status = 200;
  let payload: Record<string, any> = {};
  const response = {
    status(code: number) { status = code; return this; },
    json(value: Record<string, any>) { payload = value; },
  };
  await handler({ body } as Request, response as unknown as Response);
  return { status, payload };
}

test("family search retains dates, group cost, and age eligibility through refinements", async (context) => {
  context.mock.timers.enable({ apis: ["Date"], now: new Date("2026-11-16T09:00:00Z") });
  process.env.DEMO_MODE = "true";
  process.env.BASIC_SEARCH = "true";
  const { handleAIChat } = await import("../src/controllers/ai.controller.js");
  const { fetchRecommendations } = await import("../src/controllers/recommendation.controller.js");
  const { getAllEvents } = await import("../src/services/event.service.js");
  assert.equal((await getAllEvents(1, 25)).pagination.total, 15);
  for (const city of ["Bengaluru", "Hyderabad", "Jaipur", "Chennai", "Kolkata"]) {
    const result = await call(fetchRecommendations, { city });
    assert.equal(result.payload.count, 1);
    const [event] = result.payload.recommendations;
    assert.equal(event.city, city);
    assert.ok(event.ticketListings.every((ticket: { platform: string; isDemo: boolean }) =>
      ticket.isDemo && ["District", "BookMyShow"].includes(ticket.platform)));
  }

  const first = await call(handleAIChat, {
    message: "Find events for 4 people, including 1 child under 18, this weekend, under ₹1500 in Delhi",
  });
  assert.equal(first.status, 200);
  assert.equal(first.payload.needsClarification, true);
  assert.deepEqual(first.payload.activeFilters, {
    city: "Delhi", people: 4, children: 1, budget: 1500, date: "2026-11-21", endDate: "2026-11-22",
  });

  const followup = await call(handleAIChat, {
    message: "8", previousFilters: first.payload.activeFilters, awaitingAge: true,
  });
  assert.equal(followup.status, 200);
  assert.equal(followup.payload.activeFilters.age, 8);
  assert.equal(followup.payload.activeFilters.people, 4);
  assert.ok(followup.payload.count > 0);
  for (const event of followup.payload.recommendations) {
    assert.ok(event.minAge <= 8);
    assert.ok(event.cheapestTotalCost <= 1500);
    for (const ticket of event.ticketListings) {
      assert.equal(ticket.totalCost, ticket.price * 4);
      assert.ok(ticket.totalCost <= 1500);
    }
  }

  const refined = await call(handleAIChat, {
    message: "Chandigarh instead, any date, increase budget by ₹2,000", previousFilters: followup.payload.activeFilters,
  });
  assert.equal(refined.status, 200);
  assert.equal(refined.payload.activeFilters.city, "Chandigarh");
  assert.equal(refined.payload.activeFilters.budget, 3500);
  assert.equal(refined.payload.activeFilters.date, undefined);
  assert.equal(refined.payload.activeFilters.endDate, undefined);
  assert.equal(refined.payload.activeFilters.age, 8);
  assert.ok(refined.payload.count > 0);

  assert.equal((await call(fetchRecommendations, { people: 4, date: "2026-02-31" })).status, 400);
  assert.equal((await call(fetchRecommendations, { people: 1, children: 2 })).status, 400);
  assert.equal((await call(fetchRecommendations, { people: 2, children: 1, age: 18 })).status, 400);
  const withoutAge = await call(fetchRecommendations, { people: 2, children: 1 });
  assert.ok(withoutAge.payload.recommendations.length > 0);
  assert.ok(withoutAge.payload.recommendations.every((event: { minAge: number }) => event.minAge === 0));
  const empty = await call(fetchRecommendations, { people: 4, city: "Delhi", budget: 50 });
  assert.equal(empty.status, 200);
  assert.equal(empty.payload.count, 0);

  const rankingScenarios = [
    { filters: { city: "Delhi", preferences: ["indie"] }, expected: "Delhi Acoustic Sessions" },
    { filters: { preferences: ["jazz"] }, expected: "Bengaluru After Hours Jazz" },
    { filters: { city: "Chandigarh", age: 8 }, expected: "City Lights Cricket" },
  ];
  for (const { filters, expected } of rankingScenarios) {
    const ranked = await call(fetchRecommendations, filters);
    assert.equal(ranked.status, 200);
    const [first] = ranked.payload.recommendations;
    assert.equal(first.title, expected, JSON.stringify(filters));
    assert.equal(Object.values(first.scoreWeights as Record<string, number>).reduce((sum, weight) => sum + weight, 0), 1);
    assert.equal(first.scoreBreakdown.total, first.recommendationScore);
    const weighted = Object.entries(first.scoreWeights as Record<string, number>)
      .reduce((sum, [key, weight]) => sum + weight * first.scoreBreakdown[key], 0);
    assert.ok(Math.abs(weighted - first.recommendationScore) <= 1);
  }
});
