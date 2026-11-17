# PlanBee

**From What's the Plan? to Let's Go!**

PlanBee is an AI-assisted event discovery and comparison app for India. Describe your plans in plain language, browse by city and category, or compare ticket options for your group.

![PlanBee's purple event-ticket artwork](frontend/public/assets/planbee-ticket-hero.webp)

## What you can do

- **Ask PlanBee** on Home. Try “Music in Delhi under ₹1,000” and refine your search with a follow-up such as “Make that for two people.”
- **Browse Discover** for upcoming events across eight supported cities. Filter by city, category, dates, group budget, or attendee age.
- **Compare up to three events** by per-person price, group total, venue, and ticket options. Open the provider’s event page when a booking link is available.
- **See why an event ranks higher.** The details panel breaks down the weighted score for budget fit, event rating, interest match, and date proximity.
- **Sign in with Google** to open your profile and manage preferences. Saved events, preferences, and recent searches are stored in the current browser.

## Where results come from

| Mode | What you get |
| --- | --- |
| Live (default) | Google Events listings via SerpAPI, enriched with provider details, prices, and links when available. |
| Demo | An in-memory catalog of 15 fictional events with rolling dates. Runs without API credentials. |
| MongoDB | The sample catalog stored in MongoDB. Seed it before starting the server. |

Live listings with missing prices receive a consistent **prototype estimate**. Estimates participate in price comparisons and budget filters. Confirm the actual price and availability on the provider’s website. When no live matches are available for a targeted search, matching sample events can appear with a **Sample event** label. Live age eligibility is unavailable, so searches that require it use eligible sample listings.

PlanBee links out to providers. Reservations and payments happen on the provider’s site. Sample listings link to provider homepages.

## How it works

**Next.js + React + TypeScript** power the interface. **Express + Node.js** handle discovery and ranking. **Gemini** extracts structured filters from natural-language queries, with a built-in parser for common searches when Gemini is unavailable. **MongoDB** is optional for the sample catalog. **Auth.js** manages Google sign-in in the frontend.

The backend filters by the search constraints before ranking eligible results. The weighted score uses budget fit (30%), interest match (30%), event rating (25%), and date proximity (15%). Gemini can rephrase the top match explanations using those results.

## Run locally

Use Node.js 22 or later. From the repository root, install both packages.

```powershell
npm --prefix backend ci
npm --prefix frontend ci
```

For a credential-free run, start the backend in one PowerShell terminal.

```powershell
cd backend
$env:DEMO_MODE = "true"
$env:BASIC_SEARCH = "true"
npm run dev
```

Start the frontend in a separate terminal from the repository root.

```powershell
cd frontend
npm run dev
```

Open [PlanBee](http://localhost:3000). The frontend proxies backend requests to port 8080 by default.

### Backend configuration

Add the settings you need to `backend/.env` and restart the backend. Keep credentials out of Git.

| Variable | Purpose |
| --- | --- |
| `SERPAPI_API_KEY` | Required for live event search. Start a fresh terminal without demo mode to use it. |
| `DEMO_MODE` | Set to `true` for the in-memory sample catalog. |
| `EVENT_SOURCE` | Set to `mongodb` to use MongoDB. Set `MONGODB_URI` and run `npm --prefix backend run seed` before starting. |
| `MONGODB_URI` | Connection string for MongoDB mode. |
| `GEMINI_API_KEY`, `GEMINI_MODEL` | Enable Gemini and optionally select a model. |
| `BASIC_SEARCH` | Set to `true` to use the built-in parser. |
| `PORT` | Backend port. Defaults to `8080`. |
| `FRONTEND_URL` | Allowed frontend origin for direct cross-origin API calls. Defaults to `http://localhost:3000`. |

Live searches and event details are cached in memory. Provider requests draw from your SerpAPI quota, and a server restart clears its cache.

### Frontend configuration and Google sign-in

Set these values in `frontend/.env.local` for local development or in your frontend host’s environment for a deployment.

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:8080
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
AUTH_SECRET=your-generated-session-secret
```

Set `NEXT_PUBLIC_API_URL` to the Express backend’s public URL when deploying the frontend. The three Auth.js settings are optional for guest browsing. Generate `AUTH_SECRET` by running `npx auth secret` from `frontend`.

Create a **Web application** OAuth client in Google Cloud. Under **Authorized redirect URIs**, register `http://localhost:3000/api/auth/callback/google` for local development. For production, register the same path on your deployed **frontend** HTTPS origin. If the OAuth app is in testing mode, add the accounts that will sign in as test users. Restart or redeploy Next.js, then open **Profile** and choose **Continue with Google**.

## API and checks

| Method and path | Purpose |
| --- | --- |
| `GET /api/health` | Check backend availability. |
| `GET /api/events` | Browse the paginated catalog. |
| `GET /api/events/:id?city=Delhi` | Load event details and available ticket options. Pass the event city for live listings. |
| `GET /api/search` | Find events using query-string filters. |
| `POST /api/recommendations` | Rank events using structured filters. |
| `POST /api/ai/chat` | Search or refine a conversation with a message and previous filters. |

Run these checks from the repository root.

```powershell
npm --prefix backend test
npm --prefix backend run typecheck
npm --prefix frontend run lint
npm --prefix frontend run build
```
