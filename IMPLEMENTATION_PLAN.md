# TripStash - Implementation Plan

## 1. Product Summary

TripStash is a mobile-first travel inspiration and itinerary planner.

The first version should let a user save travel links through Telegram or the web app, classify those links with AI, and later generate a practical day-by-day itinerary based on the saved ideas.

The product should not try to become a full travel booking platform in the MVP. The core promise is:

> Save travel links casually now. Turn them into a useful trip plan later.

## 2. MVP Goal

Build a working product where one user can:

1. Send a travel link to a Telegram bot.
2. Save a travel link manually in the web app.
3. See all saved travel inspirations in a mobile-friendly interface.
4. Let AI extract basic travel information from the link.
5. Create a trip by entering destination and dates.
6. Generate a structured itinerary using saved links and user preferences.
7. See which saved links influenced each itinerary item.
8. Open map/search links for places.
9. Edit or correct saved item details when AI extraction is wrong.
10. Save plain travel notes without a URL.

## 2.1 Confirmed MVP Decisions

These decisions are confirmed for the first version:

- Authentication should be Telegram-only.
- Bali should be used as the first test destination and demo dataset.
- The product should support broad worldwide destinations later.
- Users should be able to save both links and plain notes.
- Low-confidence Telegram saves should ask a follow-up question in Telegram.
- Users should also be able to fix low-confidence saved items later in the web app.
- Google APIs can be considered later where useful, but the MVP should avoid paid Google Maps/Places dependencies.
- UI should use shadcn/ui components with Tailwind CSS.
- The selected shadcn preset is `https://ui.shadcn.com/create?preset=b7BFgTjg8`.
- The app should support both light mode and dark mode from the first version.
- The first screen should be a travel memory inbox with visual cards.

### Telegram Login Clarification

The first idea was: user enters a Telegram phone number in the web app, receives an OTP through the Telegram bot, and logs in.

That exact flow is not reliable with the Telegram Bot API because a bot cannot send a message to a phone number that has not already started the bot. Telegram bots communicate with Telegram users by chat ID, not by arbitrary phone number.

Recommended MVP auth flow:

1. User opens the web app.
2. User clicks "Log in with Telegram".
3. App shows a short code and a button/link to open the Telegram bot.
4. User starts the bot and sends `/login <code>`, or taps a deep link that includes the code.
5. Bot receives the Telegram user ID.
6. Backend links that Telegram user ID to the pending web login session.
7. Web app confirms login.

Alternative later:

- Use the official Telegram Login Widget.
- Use Telegram Web App authentication if the product is launched directly inside Telegram.

The MVP should use the bot-code login flow because it is simple, Telegram-only, and works without email/password.

## 3. Non-Goals For MVP

These should not be built in the first version:

- Native iOS or Android app.
- Full group planning.
- Real-time collaboration.
- Cost splitting.
- Booking integrations.
- Payment flows.
- Live hotel or flight search.
- Live ratings and reviews from paid APIs.
- Automatic private Instagram/TikTok account import.
- Heavy scraping of social platforms.
- Offline itinerary mode.
- Complex route optimization.
- Perfect AI travel research.

The MVP should stay focused on saving, organizing, and planning from links.

## 4. Recommended Tech Stack

### Frontend

- **Next.js**
  - Good for full-stack apps.
  - Can serve frontend and backend from one project.
  - Easy deployment to Vercel.

- **React**
  - Standard frontend framework.
  - Good component model for itinerary cards, saved items, trip forms, and detail views.

- **TypeScript**
  - Helps keep AI-generated JSON, database models, and API responses safer.

- **Tailwind CSS**
  - Fast for building mobile-first UI.
  - Good enough for MVP without introducing a large component system.

- **shadcn/ui**
  - Component system for the MVP UI.
  - Should be initialized with the selected preset: `https://ui.shadcn.com/create?preset=b7BFgTjg8`.
  - Provides reusable components without making the product feel like a generic dashboard.

- **lucide-react**
  - Icon set to use inside buttons, tabs, navigation, empty states, and quick actions.
  - Prefer Lucide icons over custom inline SVGs wherever a matching icon exists.

- **next-themes**
  - Recommended for light/dark mode support.
  - The MVP should support both themes from day one.

### Backend

- **Next.js API routes or route handlers**
  - Keeps frontend and backend in one app.
  - Good enough for the MVP.
  - Can expose endpoints for Telegram webhooks, link saving, AI classification, and itinerary generation.

### Database

- **Supabase Postgres**
  - Free tier available.
  - Real Postgres database.
  - Built-in auth is available if needed later.
  - Good developer experience.

### ORM / Database Client

- **Prisma**
  - Strong schema definitions.
  - Good migrations.
  - Easy local development.

Alternative: use Supabase client directly. Prisma is recommended if we want stricter schema control.

### AI

- **Google Gemini API free tier**
  - Free tier available for testing/prototyping.
  - Requires Google login and API key.
  - Good enough for link classification and itinerary generation.

Alternative later:

- OpenAI API with structured outputs.
- Anthropic Claude API.
- OpenRouter.

For now, Gemini is preferred because the requirement is free/free-tier usage.

### Telegram

- **Telegram Bot API**
  - Free.
  - Requires a Telegram bot token from BotFather.
  - Used for link ingestion and Telegram-only login.
  - Cannot send OTPs to arbitrary phone numbers before the user starts the bot.

### Metadata Extraction

Start with simple, non-scraping metadata:

- URL parsing.
- Open Graph tags when available.
- HTML title when available.
- User-provided notes.

Avoid aggressive scraping. If a page cannot provide metadata, store the URL and ask the user to add a short note.

### Maps

For MVP:

- Generate Google Maps search links manually.
- Example: `https://www.google.com/maps/search/?api=1&query=<place>`

Do not use paid Google Maps APIs in the first version.

Optional free/free-tier later:

- OpenStreetMap links.
- Nominatim for light geocoding only, respecting usage limits.
- Geoapify free tier if an API key is acceptable.
- Google Places Autocomplete, Places, Maps, and Routes APIs if billing/free-tier constraints are acceptable later.

### Hosting

Recommended:

- **Vercel free tier** for the Next.js app.
- **Supabase free tier** for database.

For Telegram webhook, the deployed app must have a public HTTPS URL.

## 5. Required Accounts And API Keys

### Required For MVP

1. **Telegram account**
   - Needed to create bot through BotFather.
   - Provides `TELEGRAM_BOT_TOKEN`.

2. **Supabase account**
   - Needed for hosted Postgres database.
   - Provides database URL and Supabase project credentials.

3. **Google AI Studio account**
   - Needed for Gemini API key.
   - Provides `GEMINI_API_KEY`.

4. **Vercel account**
   - Needed for deployment.
   - Provides public HTTPS app URL for Telegram webhook.

### Optional Later

1. **Geoapify account**
   - For free-tier geocoding/routing/place search.

2. **Mapbox account**
   - For richer maps if needed.

3. **Google Maps Platform account**
   - Avoid for MVP because it can require billing setup.

4. **OpenAI account**
   - Optional alternative to Gemini.

## 6. Environment Variables

Expected environment variables:

```bash
DATABASE_URL=
DIRECT_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_SECRET=
GEMINI_API_KEY=
APP_BASE_URL=
SESSION_SECRET=
```

Notes:

- `DATABASE_URL` is used by Prisma.
- `DIRECT_URL` may be needed for Prisma migrations with Supabase.
- `TELEGRAM_WEBHOOK_SECRET` should be used to verify webhook calls.
- `APP_BASE_URL` is the deployed URL, such as `https://tripstash.vercel.app`.
- `SESSION_SECRET` is used to sign the web login session.

## 7. Core User Flows

### Flow 1: Telegram-Only Login

1. User opens the web app.
2. User clicks "Log in with Telegram".
3. Backend creates a short-lived login code.
4. Web app shows the code and a button to open the Telegram bot.
5. User starts the bot and sends `/login <code>`.
6. Backend verifies the code.
7. Backend creates or finds a user by Telegram ID.
8. Web app receives a signed session.
9. User is logged in.

Important:

- The MVP should not ask for a Telegram phone number and try to send an OTP directly.
- The bot can only message users who have already started the bot.

### Flow 2: Save Link Or Note Through Telegram

1. User sends a link, note, or link plus note to the Telegram bot.
2. Telegram sends webhook event to backend.
3. Backend identifies the Telegram user.
4. Backend extracts URL if present.
5. Backend keeps plain text as a user note if no URL is present.
6. Backend fetches basic metadata if a URL is available.
7. Backend asks AI to classify the saved item.
8. Backend saves the structured item to the database.
9. Bot replies with a short confirmation:

```text
Saved: Bali sunrise viewpoint
Detected: Bali, viewpoint, nature
You can edit this later in the app.
```

If the system is unsure:

```text
Saved the link, but I could not detect the place clearly.
Reply with a short note like: "scuba diving in Bali".
```

If the user sends a plain note:

```text
Saved note: vegetarian cafes near Ubud
Detected: Bali, food, vegetarian
```

### Flow 3: Save Link Or Note Through Web App

1. User opens web app.
2. User pastes a link, writes a note, or provides both.
3. Backend extracts metadata if URL exists.
4. AI classifies item.
5. Item appears in saved inspirations list.
6. User can edit detected destination, category, tags, and importance.

### Flow 4: View Saved Inspirations

1. User opens home screen.
2. User sees saved items grouped by destination or category.
3. User can search/filter by:
   - destination
   - category
   - source
   - saved date
   - tag
4. User can tap an item to see details.

### Flow 5: Create Trip

1. User clicks or taps "Plan Trip".
2. User enters:
   - destination
   - start date
   - end date
   - pace
   - budget level
   - optional notes
3. App finds saved items related to that destination.
4. App also finds saved items that show general interests.
5. Backend sends structured context to AI.
6. AI returns structured itinerary JSON.
7. App saves generated itinerary.
8. User sees mobile itinerary timeline.

### Flow 6: View Itinerary

1. User opens generated trip.
2. User sees day tabs.
3. Each day shows morning, afternoon, evening, and food suggestions.
4. Each card shows:
   - title
   - selected place/activity
   - estimated cost range
   - best time
   - reason
   - saved link influence
   - map/search action
5. User taps a card for details and alternatives.

### Flow 7: Edit AI Mistakes

1. User opens a saved item.
2. User edits:
   - title
   - destination
   - place name
   - category
   - tags
   - note
   - must-visit flag
3. App saves corrections.
4. Future itinerary generation uses corrected data.

## 8. Main Screens

## 8.1 UI Direction

The product should not feel like a generic travel planner or admin dashboard.

The UI direction is:

> Travel memory inbox with visual cards.

The home screen should feel like a place where travel inspiration is collected, remembered, and turned into plans later.

Reference qualities:

- More like a visual memory system than a dashboard.
- More practical than a mood board.
- More structured than scattered bookmarks.
- Mobile-first and useful immediately after login.
- Clear enough for normal users who are not technical.

The main app should use a bottom navigation pattern on mobile:

- `Saved`
- `Plan`
- `Trips`
- `Profile`

The desktop layout can use a centered mobile-first content column at first. A wider desktop layout can be added later if needed.

### Visual Style

Use:

- shadcn/ui components.
- Tailwind CSS utilities.
- Light and dark mode.
- Visual cards for saved memories.
- Small badges for destination, category, confidence, and source.
- Clean typography and readable spacing.
- Rounded but restrained components.
- Travel imagery only when available from metadata or user-provided content.

Avoid:

- A generic SaaS dashboard look.
- A marketing landing page as the main experience.
- A chat-first interface for the MVP.
- A map-first interface for the MVP.
- Overly decorative gradients or visual noise.
- Hiding core actions behind complex menus.

### shadcn Components To Use

Recommended MVP components:

- `Button`
- `Card`
- `Input`
- `Textarea`
- `Badge`
- `Tabs`
- `Sheet`
- `Drawer`
- `Dialog`
- `Calendar`
- `Select`
- `Switch`
- `Avatar`
- `Skeleton`
- `Sonner`
- `Command`
- `Accordion`
- `Separator`

Component usage:

- Use `Card` for saved inspiration cards and itinerary cards.
- Use `Tabs` for itinerary days.
- Use `Sheet` or `Drawer` for mobile item details.
- Use `Badge` for tags like `Bali`, `Food`, `Saved`, `Low confidence`.
- Use `Command` for searching saved memories and destinations.
- Use `Calendar` for trip dates.
- Use `Sonner` for success/error messages.
- Use `Skeleton` for loading states.
- Use `Avatar` for Telegram identity.
- Use `Accordion` for reasoning and alternatives.

### 1. Saved Inspirations Home

Purpose:

- Default first screen.
- Show saved links and quick actions.
- Make saved travel memories feel visual, personal, and actionable.

Required UI:

- Compact add box that accepts a link, note, or both.
- Visual saved-memory cards.
- Thumbnail/image area when metadata provides one.
- Fallback source/category icon when no image exists.
- Destination and category chips.
- Source badge, such as Telegram, YouTube, Reddit, Maps, Blog, Note.
- Confidence/status badge when AI extraction is uncertain.
- Quick action to plan with a saved memory.
- Destination/category filters.
- Search.
- Clear "Plan Trip" action.

Saved memory card content:

- Title.
- Short summary or user note.
- Detected destination.
- Category tags.
- Source platform.
- Thumbnail if available.
- Saved date.
- Must-visit state if enabled.
- Low-confidence state if correction is needed.

### 2. Saved Item Detail

Purpose:

- Let user inspect and correct AI classification.

Required UI:

- Original URL.
- Source platform.
- Title.
- Summary.
- Detected destination.
- Detected place.
- Category.
- Tags.
- Confidence level.
- Notes.
- Must-visit toggle.
- Delete/archive action.

### 3. Plan Trip Screen

Purpose:

- Collect minimum required trip details.

Required UI:

- Destination input.
- Start date.
- End date.
- Pace selector: relaxed, balanced, packed.
- Budget selector: low, medium, high.
- Optional text note.
- Related saved items preview.
- Generate itinerary button.

### 4. Itinerary Timeline

Purpose:

- Show the generated plan in a mobile-friendly way.
- Make the trip feel like a practical daily companion, not a long AI article.

Required UI:

- Trip header.
- Day tabs.
- Timeline cards.
- Cost/time summary.
- Saved-link labels.
- Map/search actions.
- Tappable cards that open detail drawers or pages.
- Clear morning, afternoon, evening, and food blocks.
- Small explanation of which saved memories influenced each item.

### 5. Itinerary Item Detail

Purpose:

- Show reasoning and alternatives.

Required UI:

- Main recommendation.
- Why selected.
- Saved items that influenced it.
- Alternatives.
- Pros/cons.
- Best time.
- Estimated cost.
- Source links.
- Replace/edit option.

Display pattern:

- Open as a mobile drawer/sheet when possible.
- Show the chosen recommendation first.
- Show saved memory influence clearly.
- Put alternatives and AI reasoning below the main recommendation.
- Keep external actions like map/search/source links visible.

### 6. Settings / API Status

Purpose:

- Useful during MVP development.

Required UI:

- Telegram connection status.
- AI provider status.
- User profile.
- Debug info only in development mode.

## 9. Data Model

### User

Fields:

- `id`
- `name`
- `telegramId`
- `telegramUsername`
- `telegramFirstName`
- `telegramLastName`
- `telegramPhotoUrl`
- `createdAt`
- `updatedAt`

Notes:

- In MVP, Telegram ID may be enough.
- Email login can be added later.

### LoginCode

Fields:

- `id`
- `codeHash`
- `telegramId`
- `status`
- `expiresAt`
- `createdAt`
- `consumedAt`

Possible `status` values:

- `pending`
- `consumed`
- `expired`

Notes:

- Store a hash of the login code, not the raw code.
- Login codes should expire quickly, for example after 10 minutes.
- Codes should be single-use.

### SavedItem

Fields:

- `id`
- `userId`
- `inputType`
- `originalUrl`
- `sourcePlatform`
- `title`
- `summary`
- `thumbnailUrl`
- `rawMetadata`
- `userNote`
- `detectedPlaceName`
- `detectedDestination`
- `latitude`
- `longitude`
- `category`
- `tags`
- `confidence`
- `importance`
- `isMustVisit`
- `status`
- `createdAt`
- `updatedAt`

Possible `inputType` values:

- `url`
- `note`
- `url_with_note`

Possible `category` values:

- `restaurant`
- `cafe`
- `activity`
- `viewpoint`
- `beach`
- `hotel`
- `area`
- `route`
- `tip`
- `shopping`
- `nightlife`
- `culture`
- `nature`
- `other`

Possible `status` values:

- `active`
- `archived`
- `failed_extraction`

### Trip

Fields:

- `id`
- `userId`
- `destination`
- `startDate`
- `endDate`
- `pace`
- `budgetLevel`
- `notes`
- `status`
- `createdAt`
- `updatedAt`

Possible `pace` values:

- `relaxed`
- `balanced`
- `packed`

Possible `budgetLevel` values:

- `low`
- `medium`
- `high`

### Itinerary

Fields:

- `id`
- `tripId`
- `summary`
- `estimatedCostRange`
- `aiModel`
- `generationInput`
- `generationOutput`
- `createdAt`
- `updatedAt`

### ItineraryDay

Fields:

- `id`
- `itineraryId`
- `dayNumber`
- `date`
- `area`
- `summary`
- `createdAt`
- `updatedAt`

### ItineraryItem

Fields:

- `id`
- `itineraryDayId`
- `timeBlock`
- `title`
- `selectedOptionName`
- `category`
- `description`
- `bestTime`
- `estimatedCost`
- `travelTimeNote`
- `reasoning`
- `mapSearchUrl`
- `sortOrder`
- `createdAt`
- `updatedAt`

Possible `timeBlock` values:

- `morning`
- `breakfast`
- `afternoon`
- `evening`
- `dinner`
- `late_night`
- `flex`

### RecommendationOption

Fields:

- `id`
- `itineraryItemId`
- `name`
- `area`
- `rating`
- `priceRange`
- `pros`
- `cons`
- `bestFor`
- `sourceUrls`
- `savedItemId`
- `rank`
- `createdAt`
- `updatedAt`

### SavedItemInfluence

Purpose:

- Link saved items to itinerary items.

Fields:

- `id`
- `savedItemId`
- `itineraryItemId`
- `influenceReason`
- `createdAt`

## 10. AI Workflows

### AI Workflow 1: Saved Link Classification

Input:

- URL.
- Metadata title.
- Metadata description.
- User note.
- Source platform.

Output:

```json
{
  "title": "string",
  "summary": "string",
  "detectedDestination": "string | null",
  "detectedPlaceName": "string | null",
  "category": "activity",
  "tags": ["adventure", "water sports"],
  "confidence": 0.82,
  "needsUserClarification": false,
  "clarifyingQuestion": null
}
```

Rules:

- AI must not invent exact coordinates.
- If the place is unclear, confidence should be low.
- If the URL has weak metadata, rely more on user note.
- If unsure, ask for a short user note.

### AI Workflow 2: Trip Context Builder

Before calling AI for itinerary generation, backend should prepare:

- Trip destination.
- Trip dates.
- Number of days.
- Budget level.
- Pace.
- Directly related saved items.
- Indirect interest signals.
- Must-visit saved items.

Directly related examples:

- Saved item destination is "Bali" and trip destination is "Bali".

Indirect interest examples:

- User saved scuba diving in Thailand.
- User is planning Bali.
- This should become an interest signal for water activities.

### AI Workflow 3: Itinerary Generation

Input:

- Trip details.
- Related saved items.
- Interest profile.
- User notes.

Output:

```json
{
  "summary": "string",
  "estimatedCostRange": "string",
  "days": [
    {
      "dayNumber": 1,
      "date": "2026-06-10",
      "area": "Ubud",
      "summary": "string",
      "items": [
        {
          "timeBlock": "morning",
          "title": "Sunrise viewpoint",
          "selectedOptionName": "Campuhan Ridge Walk",
          "category": "nature",
          "description": "string",
          "bestTime": "6:00 AM",
          "estimatedCost": "Free",
          "travelTimeNote": "Short ride from central Ubud",
          "reasoning": "Matches saved sunrise inspiration and keeps arrival day light.",
          "savedItemInfluences": [
            {
              "savedItemId": "saved_item_id",
              "reason": "User saved a Bali sunrise viewpoint."
            }
          ],
          "alternatives": [
            {
              "name": "Mount Batur Sunrise Trek",
              "area": "Kintamani",
              "priceRange": "$35-$70",
              "pros": ["Iconic sunrise", "Adventure experience"],
              "cons": ["Very early start", "Physically demanding"],
              "bestFor": "Adventure travelers",
              "sourceUrls": []
            }
          ]
        }
      ]
    }
  ]
}
```

Rules:

- AI must return structured JSON.
- AI must include must-visit saved items where feasible.
- AI must not overload a day with too many places.
- AI must explain saved-item influence.
- AI should include uncertainty when exact data is not available.
- AI should avoid pretending it has live ratings/prices unless a source provides them.

## 11. API Endpoints

### Public / App Endpoints

#### `POST /api/saved-items`

Purpose:

- Save a link, note, or link plus note from the web app.

Request:

```json
{
  "url": "string | null",
  "note": "string | null"
}
```

Response:

```json
{
  "savedItem": {}
}
```

#### `GET /api/saved-items`

Purpose:

- List saved items for current user.

Query params:

- `destination`
- `category`
- `q`

#### `GET /api/saved-items/:id`

Purpose:

- Get one saved item.

#### `PATCH /api/saved-items/:id`

Purpose:

- Edit saved item details.

#### `DELETE /api/saved-items/:id`

Purpose:

- Archive or delete saved item.

#### `POST /api/trips`

Purpose:

- Create a trip.

#### `POST /api/trips/:id/generate-itinerary`

Purpose:

- Generate itinerary for a trip.

#### `GET /api/trips/:id/itinerary`

Purpose:

- Get saved itinerary.

### Auth Endpoints

#### `POST /api/auth/telegram/start`

Purpose:

- Create a short-lived login code for Telegram-only login.

Response:

```json
{
  "code": "123456",
  "botDeepLink": "https://t.me/<bot_username>?start=login_123456",
  "expiresAt": "2026-06-10T10:00:00.000Z"
}
```

#### `GET /api/auth/telegram/status`

Purpose:

- Poll whether the login code has been consumed by the Telegram bot.

#### `POST /api/auth/logout`

Purpose:

- Clear the user's session.

### Telegram Endpoint

#### `POST /api/telegram/webhook`

Purpose:

- Receive Telegram messages.

Responsibilities:

- Verify secret.
- Parse incoming message.
- Handle `/start login_<code>`.
- Handle `/login <code>`.
- Identify user by Telegram ID.
- Extract URL and optional note for save messages.
- Save and classify link.
- Save and classify plain note.
- Reply to user through Telegram API.

## 12. Implementation Phases

## Phase 0: Project Setup

Goal:

- Create the technical foundation.

Tasks:

- Initialize Next.js app.
- Add TypeScript.
- Add Tailwind CSS.
- Initialize shadcn/ui using preset `b7BFgTjg8`.
- Add initial shadcn components required for the MVP.
- Add `next-themes` for light/dark mode.
- Add `lucide-react` icons.
- Add linting and formatting.
- Set up environment variable template.
- Set up Supabase project.
- Set up Prisma.
- Create initial database schema.
- Add basic deployment target.

Deliverable:

- Empty app running locally.
- Database connected.
- Basic themed app shell.
- Light/dark mode toggle.
- Basic travel memory inbox home screen skeleton.

Estimated time:

- 0.5 to 1 day.

## Phase 1: Saved Links Foundation

Goal:

- User can save links and plain notes manually in the web app.

Tasks:

- Build saved item database model.
- Build add-link form.
- Support plain note-only saved items.
- Build saved item list.
- Build saved item detail page.
- Implement basic URL validation.
- Implement basic metadata extraction.
- Store original URL, title, description, source platform.
- Add edit form for saved item details.

Deliverable:

- User can paste links, add notes, and see saved inspirations.

Estimated time:

- 2 to 3 days.

## Phase 2: AI Classification

Goal:

- AI classifies saved links into useful travel memory fields.

Tasks:

- Create Gemini client wrapper.
- Define classification schema.
- Add classification service.
- Store AI output in database.
- Add confidence field.
- Add failed extraction state.
- Show confidence in UI.
- Add manual correction flow.

Deliverable:

- Saved links get destination/category/tags automatically.

Estimated time:

- 2 to 3 days.

## Phase 3: Telegram Bot Link Saving

Goal:

- User can log in with Telegram and save links/notes from Telegram.

Tasks:

- Create bot through BotFather.
- Add `TELEGRAM_BOT_TOKEN`.
- Build Telegram webhook endpoint.
- Build Telegram login-code flow.
- Handle `/start login_<code>`.
- Handle `/login <code>`.
- Parse incoming messages.
- Extract URL and note.
- Support note-only messages.
- Create or find user by Telegram ID.
- Reuse saved-item creation service.
- Reuse AI classification service.
- Send confirmation message.
- Handle unclear links with a simple follow-up request.
- Add local testing approach using ngrok or deployed Vercel preview.

Deliverable:

- User can log in through Telegram and save links/notes into the app.

Estimated time:

- 2 to 4 days.

## Phase 4: Trip Creation

Goal:

- User can create a trip from the web app.

Tasks:

- Build trip database model.
- Build plan-trip form.
- Add destination input.
- Add date inputs.
- Add pace selector.
- Add budget selector.
- Show related saved items preview.
- Save trip.

Deliverable:

- User can create a trip for a destination/date range.

Estimated time:

- 1 to 2 days.

## Phase 5: Itinerary Generation

Goal:

- AI generates structured itinerary from saved links.

Tasks:

- Build trip context builder.
- Find directly related saved items.
- Find indirect interest signals.
- Define itinerary JSON schema.
- Create Gemini itinerary generation call.
- Validate generated JSON.
- Store itinerary, days, items, options, and saved-item influences.
- Add retry/error handling.
- Add fallback response if generation fails.

Deliverable:

- User can generate and save a structured itinerary.

Estimated time:

- 3 to 5 days.

## Phase 6: Mobile Itinerary UI

Goal:

- Itinerary is usable on a phone.

Tasks:

- Build trip detail page.
- Build day tabs.
- Build timeline card UI.
- Add saved-link labels.
- Add estimated cost and best-time display.
- Add map/search links.
- Add itinerary item detail screen.
- Add alternatives section.
- Add reasoning section.
- Add replace/edit placeholder actions.

Deliverable:

- User can view itinerary clearly on mobile.

Estimated time:

- 3 to 5 days.

## Phase 7: Polish And Reliability

Goal:

- Make MVP usable enough for personal testing.

Tasks:

- Add loading states.
- Add empty states.
- Add error states.
- Add mobile layout checks.
- Add delete/archive saved item.
- Add regenerate itinerary.
- Add basic auth/session handling.
- Add seed/demo data.
- Add logging for AI failures.
- Add tests for core services.

Deliverable:

- MVP ready for testing with a real trip.

Estimated time:

- 3 to 5 days.

## 13. Total Time Estimate

### Fast Prototype

Estimated time:

- 5 to 7 days.

Includes:

- Manual link saving.
- Basic AI classification.
- Mock or simple itinerary generation.
- Basic mobile UI.

### Usable MVP

Estimated time:

- 2 to 3 weeks.

Includes:

- Telegram bot.
- Real database.
- AI classification.
- Trip creation.
- Structured itinerary generation.
- Mobile itinerary cards.

### Polished Personal Version

Estimated time:

- 4 to 6 weeks.

Includes:

- Better UI.
- Better editing.
- More robust AI handling.
- Better saved-item influence.
- Better itinerary detail screens.
- Basic test coverage.

## 14. Free API Strategy

### What We Can Do For Free

- Save Telegram messages.
- Store data in Supabase free tier.
- Host prototype on Vercel free tier.
- Use Gemini free tier for AI.
- Use basic metadata extraction from public web pages.
- Generate Google Maps search links without Maps API.
- Use OpenStreetMap links.

### What We Should Avoid In MVP

- Google Places API.
- Google Routes API.
- Paid SERP APIs.
- Paid review/rating APIs.
- Paid social media APIs.
- Paid flight/hotel APIs.
- Heavy scraping services.

### What Requires Login/API Key But Can Be Free

- Telegram bot token.
- Supabase API keys.
- Gemini API key.
- Vercel account.
- Optional Geoapify key.
- Optional Mapbox key.

## 15. Error Handling Requirements

### Link Save Errors

Handle:

- Invalid URL.
- Unsupported URL.
- URL metadata unavailable.
- AI classification failure.
- Duplicate URL.

Expected behavior:

- Never lose the original link.
- Save with `failed_extraction` if needed.
- Ask user for a short note when confidence is low.

### AI Errors

Handle:

- API unavailable.
- Rate limit reached.
- Invalid JSON output.
- Missing required fields.
- Low-confidence classification.

Expected behavior:

- Show friendly error.
- Allow retry.
- Keep saved link intact.
- Log raw error in development.

### Telegram Errors

Handle:

- Missing message text.
- Message has no URL.
- Unknown Telegram user.
- Telegram send-message failure.

Expected behavior:

- Reply with simple instructions.
- Avoid crashing webhook.

## 16. Testing Plan

### Unit Tests

Test:

- URL extraction from text.
- Source platform detection.
- Metadata normalization.
- AI output validation.
- Trip date calculations.
- Saved item filtering.

### Integration Tests

Test:

- Save link endpoint.
- Telegram webhook endpoint.
- AI classification service with mocked AI.
- Itinerary generation with mocked AI.
- Database writes for itinerary structure.

### Manual Tests

Use test cases:

- Instagram reel URL.
- YouTube video URL.
- Reddit thread URL.
- Google Maps URL.
- Travel blog URL.
- Plain note with no URL.
- Telegram login code.
- Expired Telegram login code.
- Consumed Telegram login code.
- Bad URL.
- Duplicate URL.
- Bali trip with saved Bali links.
- Bali trip with Thailand scuba diving link as interest signal.

### UI Tests

Check:

- Mobile layout.
- Saved item card text wrapping.
- Itinerary timeline readability.
- Loading states.
- Empty states.
- Error states.

## 17. Suggested Folder Structure

When implementation starts, use a single Next.js app structure:

```text
travel-memory-ai/
  app/
    page.tsx
    saved/
    trips/
    api/
      saved-items/
      trips/
      telegram/
  components/
    app-shell/
    saved-items/
    trips/
    itinerary/
    ui/
    theme/
  lib/
    ai/
    db/
    metadata/
    telegram/
    travel/
    validation/
  prisma/
    schema.prisma
    migrations/
  public/
  tests/
  .env.example
  README.md
  IMPLEMENTATION_PLAN.md
```

## 18. Development Order

Recommended order:

1. Initialize app.
2. Initialize shadcn/ui with the selected preset.
3. Add theme provider and light/dark mode.
4. Build the mobile-first app shell.
5. Set up database.
6. Create saved item model.
7. Build the travel memory inbox skeleton.
8. Build manual link/note saving.
9. Add metadata extraction.
10. Add AI classification.
11. Add saved item correction UI.
12. Add Telegram login and webhook.
13. Add trip model.
14. Add trip creation form.
15. Build itinerary generation service.
16. Store itinerary result.
17. Build mobile itinerary UI.
18. Add error/loading states.
19. Deploy.
20. Connect Telegram webhook to deployed URL.
21. Test with real travel links.

## 19. Acceptance Criteria For MVP

The MVP is complete when:

- User can log in with Telegram identity.
- A Telegram message with a URL creates a saved item.
- A Telegram message with only a note creates a saved item.
- A web form URL creates a saved item.
- A web form note creates a saved item.
- Saved items persist in the database.
- AI classifies saved items with destination/category/tags.
- User can edit incorrect AI fields.
- User can create a trip with destination and dates.
- AI generates a structured itinerary.
- Itinerary is saved in the database.
- Itinerary is shown as mobile-friendly day cards.
- Itinerary items show saved-link influence.
- Map/search links open externally.
- App handles failed metadata and AI errors without losing data.
- UI uses shadcn/ui components and Tailwind CSS.
- UI supports light and dark mode.
- First screen is a travel memory inbox with visual cards.
- Mobile layout is usable without a laptop.

## 20. Future Expansion Plan

### Version 2: Simple Group Trips

Features:

- Create shared trip.
- Invite link.
- Members can add links.
- Show "saved by" labels.
- Generate itinerary from all members' saved items.

### Version 3: Better Place Data

Features:

- Free-tier geocoding.
- Map view.
- Area grouping.
- Approximate route feasibility.
- Place correction workflow.

### Version 4: Travel Mode

Features:

- Today view.
- Next activity.
- Map link.
- Notes.
- Nearby alternatives.
- Emergency info/manual notes.

### Version 5: Native Mobile Or PWA Polish

Features:

- Installable PWA.
- Push notifications.
- Offline saved itinerary.
- Share sheet support.

## 21. Open Questions

These should be answered before implementation starts:

1. Should we use Gemini only, or keep the AI provider abstraction ready for OpenAI later?
2. Should saved links be private by default, even when group trips are added later?
3. Should Google APIs be added in the MVP only if the free tier is enough, or should all Google Places/Maps API work wait until after the first MVP?

## 22. Recommended First Build Decision

The first implementation should be a monorepo-style single Next.js app running on one server.

Reason:

- Simpler deployment.
- Fewer moving parts.
- Frontend and backend can share TypeScript types.
- Telegram webhook can live inside the same app.
- Good enough for MVP.

A separate backend should only be introduced later if background jobs, queues, heavy AI processing, or multiple clients make the single-app setup hard to maintain.
