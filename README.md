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

To use MongoDB, put `MONGODB_URI` in `backend/.env`, leave `DEMO_MODE` unset, and run `npm run seed` from `backend` to load or refresh the sample catalog. The seed updates sample records by city and title.

To enable Gemini, set `GEMINI_API_KEY` and optionally `GEMINI_MODEL` in `backend/.env`. Leave `BASIC_SEARCH` unset to enable the Gemini path. Common searches still work through the basic parser if Gemini is unavailable.

For hosted environments set `FRONTEND_URL` on the backend to the frontend origin, and set `NEXT_PUBLIC_API_URL` on the frontend to the Express server URL. Keep MongoDB and Gemini credentials on the backend.

Profiles, saved events, and search history are stored per browser. Use saved profile preferences to rank events based on your preferred city and categories.

Run `npm test` from `backend` to check family searches, date ranges, age eligibility, group pricing, and follow-up refinements.

## Main endpoints

- `GET /api/events` lists the catalog with pagination.
- `GET /api/search` filters upcoming events.
- `POST /api/recommendations` ranks events using structured filters.
- `POST /api/ai/chat` takes a message, previous filters, and an optional age clarification flag.
