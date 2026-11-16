import assert from "node:assert/strict";
import { test } from "node:test";
import type { Request, Response } from "express";

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
