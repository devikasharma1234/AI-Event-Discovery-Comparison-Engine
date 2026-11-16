# PlanBee

PlanBee is a full-stack event discovery app for sample concerts, comedy shows, movies, festivals, and sports in India. Search in natural language, refine a conversation, or apply filters directly. Recommendations use group ticket cost, age eligibility, dates in IST, ratings, and interests.

The catalog contains fictional listings and illustrative prices. Provider links for sample events open BookMyShow or District. PlanBee does not handle reservations or payments.

## Run locally

Install dependencies in both packages with `npm ci`. Run the frontend and backend in separate terminals.

### Demo mode

The demo catalog runs in memory with upcoming dates and works without credentials. Start the backend in PowerShell from the repository root.

```powershell
cd backend
$env:DEMO_MODE = "true"
$env:BASIC_SEARCH = "true"
npm run dev
```

Start the frontend in the second terminal.

```powershell
cd frontend
npm run dev
```

Open http://localhost:3000. The frontend uses http://localhost:8080 by default. If port 8080 is unavailable, set `PORT` on the backend and point `NEXT_PUBLIC_API_URL` at that port on the frontend.

### MongoDB and Gemini

To use MongoDB, set `EVENT_SOURCE=mongodb` and `MONGODB_URI` in `backend/.env`, leave `DEMO_MODE` unset, and run `npm run seed` from `backend` to load or refresh the sample catalog. The seed updates sample records by city and title.

To enable Gemini, set `GEMINI_API_KEY` and optionally `GEMINI_MODEL` in `backend/.env`. Leave `BASIC_SEARCH` unset to enable the Gemini path. Common searches still work through the basic parser if Gemini is unavailable.

For hosted environments set `FRONTEND_URL` on the backend to the frontend origin, and set `NEXT_PUBLIC_API_URL` on the frontend to the Express server URL. Keep MongoDB and Gemini credentials on the backend.

Profiles, saved events, and search history are stored per browser. Use saved profile preferences to rank events based on your preferred city and categories.

Run `npm test` from `backend` to check family searches, date ranges, age eligibility, group pricing, and follow-up refinements.

## Main endpoints

- `GET /api/events` lists the catalog with pagination.
- `GET /api/search` filters upcoming events.
- `POST /api/recommendations` ranks events using structured filters.
- `POST /api/ai/chat` takes a message, previous filters, and an optional age clarification flag.

## Live events in India

The backend defaults to SerpApi. Set `SERPAPI_API_KEY` in `backend/.env`, leave `DEMO_MODE` unset, and restart the backend. PlanBee uses the regular Google Search endpoint and reads its `events_results` field. Keep the API key on the server.

Live results are cached in memory per city for 30 hours. A single continuously running backend querying all eight cities about once per cache window uses roughly 200 searches in a 31-day month. Restarts and multiple backend instances increase usage.

Live listings show dates and provider links when supplied. Price, age limit, and rating are unknown in this integration. Budget and age-restricted searches exclude these listings. Provider pages remain the source of current ticket details.

Set `DEMO_MODE=true` for the fixture catalog or `EVENT_SOURCE=mongodb` for the existing MongoDB catalog.

## Google sign-in

Create a Web application OAuth client in Google Cloud. Add `http://localhost:3000/api/auth/callback/google` under Authorized redirect URIs. For a deployment, register the same callback path with your frontend HTTPS origin. If the OAuth app is in testing mode, add the Google accounts that will sign in as test users.

Set these server-only variables in `frontend/.env.local` and restart Next.js.

```dotenv
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
AUTH_SECRET=your-random-auth-secret
```

Generate the auth secret from the frontend with `npx auth secret`. Keep all three values out of Git. Open `/profile` to sign in or out. When Google sign-in is configured, the profile page requires a session. Event discovery remains public. Preferences, saved events, and history are stored in this browser.
