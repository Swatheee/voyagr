# Voyagr — Travel Planner

Voyagr is a React travel-planning app for exploring destinations, saving places, shaping an itinerary around interests and budget, and chatting with a travel assistant. It includes a Vite frontend, optional Supabase authentication/storage, and a Vercel serverless assistant endpoint.

## Features

- Destination inspiration and interest-based match scores
- Trip preference flow and itinerary planner
- Saved places and trip overview screens
- Email/password and email OTP authentication through Supabase
- Optional Google and GitHub OAuth through Supabase
- Travel assistant with a local fallback and optional OpenAI-powered responses
- Responsive interface styled with CSS

## Requirements

- Node.js (LTS recommended) and npm
- A Supabase project for hosted authentication and database features (optional for local demo mode)
- A Vercel deployment for the `/api/assistant` serverless function

## Run locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in the values you plan to use. See [Environment variables](#environment-variables).

3. Start the Vite development server:

   ```bash
   npm run dev
   ```

4. Open the local URL printed by Vite, usually `http://localhost:5173`.

Without Supabase credentials, the frontend can run in demo mode. Authentication and saved data will not have Supabase-backed persistence in that mode. The Vercel API route is not served by the Vite dev server; for local testing of that route, use the Vercel CLI (`vercel dev`) after configuring the Vercel environment variables.

## Environment variables

Create a local `.env` file from `.env.example`. Never commit real secrets. The repository ignores `.env`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | For Supabase | Supabase project URL used by the browser client |
| `VITE_SUPABASE_ANON_KEY` | For Supabase | Supabase publishable/anon key; safe for frontend use when database RLS is configured correctly |
| `VITE_SUPABASE_GOOGLE_ENABLED` | Optional | Set to `true` to show Google sign-in; the Google provider must also be configured in Supabase |
| `VITE_SUPABASE_GITHUB_ENABLED` | Optional | Set to `true` to show GitHub sign-in; the GitHub provider must also be configured in Supabase |
| `OPENAI_API_KEY` | Optional | Server-side key used by the Vercel assistant endpoint; do not prefix with `VITE_` or expose it to browser code |
| `OPENAI_MODEL` | Optional | Model used by the assistant endpoint; defaults to `gpt-4o-mini` |

Changing Vite variables requires restarting the development server and rebuilding/redeploying the app.

## Supabase setup

1. Create a Supabase project and copy its project URL and anon/publishable key into `.env` locally. Add the same frontend variables to your hosting provider for production.
2. In Supabase Authentication settings, enable Email. Configure an SMTP sender for reliable production OTP and confirmation emails.
3. For Google and GitHub sign-in, enable each provider in Supabase and enter the OAuth credentials from the corresponding provider console.
4. Add the local and deployed app URLs to Supabase's allowed redirect URLs, for example `http://localhost:5173` and `https://your-domain.example`.
5. Review and apply [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL Editor if you want to create the included database tables and row-level security policies.

The current OTP request sets `shouldCreateUser: false`, so the email must already belong to a Supabase user. Supabase email/SMTP settings control delivery; the app requests Supabase's email OTP and does not generate codes locally.

> Database note: the included `saved_places` table references `public.users`. Ensure a matching profile row is created for each authenticated Supabase user before relying on saved-place database writes. Review the schema and policies against your project's auth/profile design before production use.

## Assistant setup

The assistant endpoint is [`api/assistant.js`](api/assistant.js). On Vercel, add `OPENAI_API_KEY` as a server-side environment variable to enable generated responses. `OPENAI_MODEL` is optional. If no key is configured, the endpoint returns a built-in fallback response. Do not put the OpenAI key in any `VITE_` variable.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |

## Deployment

The project is configured for Vercel-style deployment: the frontend is built by Vite and the assistant backend is in `api/assistant.js`.

1. Import the repository into Vercel or deploy it using the Vercel CLI.
2. Set the production environment variables in the Vercel project settings. Add the Supabase client variables and OAuth feature flags as needed; add `OPENAI_API_KEY` only if using AI-generated assistant replies.
3. Deploy, then add the production domain to Supabase's allowed redirect URLs.
4. Validate the deployment by signing in and testing OTP/provider login, saved-place access, and the assistant endpoint.

## Project structure

```text
.
├── api/
│   └── assistant.js       # Vercel serverless travel assistant endpoint
├── src/
│   ├── lib/
│   │   └── supabase.js    # Supabase browser client
│   ├── main.jsx           # React app and screen/auth flows
│   ├── rich.css           # Additional app styles
│   └── styles.css         # Base styles
├── supabase/
│   └── schema.sql         # Database tables and RLS policies
├── index.html
├── package.json
└── .env.example
```

## Security notes

- Keep `.env` and all secret keys out of source control.
- Frontend Supabase keys are public by design; secure data with correctly scoped Row Level Security policies.
- Keep OpenAI and OAuth client secrets on the server/provider configuration, never in frontend variables.
- The app's local demo account flow is for prototyping only; use Supabase for real user authentication.
