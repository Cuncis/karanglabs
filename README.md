# KarangLabs Studio

<p align="center">
  <img src="https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel"/>
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"/>
  <img src="https://img.shields.io/badge/Inertia.js-9553E9?style=for-the-badge&logo=inertia&logoColor=white" alt="Inertia"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind"/>
</p>

**Studio turns a short brief into a ready-to-paste AI prompt for building a website — no coding required.**

Pick a website type (landing page, online shop, company profile, portfolio, digital wedding invite, link-in-bio, F&B menu, or a services page), fill in a short form, and Studio assembles a detailed, well-structured prompt. Paste that prompt into Claude, ChatGPT, Gemini, v0, or Lovable, and the AI generates the full website. From there, the user drags the result onto `vercel.com/drop` and it's live for free.

---

## How it works

1. **Pick an engine.** Each engine (`Landing Page`, `Toko Online`, `Company Profile`, `Portfolio`, `Undangan Digital`, `Link-in-Bio`, `Menu F&B`, `Halaman Jasa`, ...) has its own tailored brief form — brand name, visual style, color palette, typography, copy, optional add-ons (contact form, floating WhatsApp button, Google Analytics, Meta Pixel, basic SEO, Google Maps).
2. **Fill the brief.** Every field maps into a prompt template. A "Isi Acak (AI)" button can also generate a realistic demo brief automatically, rate-limited per user.
3. **Copy the generated prompt.** Studio composes a single, ready-to-use prompt from the brief and shows it live as the form is filled in.
4. **Paste into an AI tool.** The user pastes the prompt into their AI of choice and gets back full website code.
5. **Deploy for free.** Drag the AI's output onto `vercel.com/drop` (or connect a custom domain afterward) and the site is live.

Projects (brief + generated prompt) can be saved per user and revisited later from the Studio dashboard.

---

## Access & licensing

- **Early Access** — one-time purchase that unlocks the Studio dashboard and all engines.
- **Reseller / Whitelabel license** — unlocks a downloadable whitelabel package plus a license key, so buyers can rebrand and resell Studio under their own name, pricing, and payment link, keeping 100% of what they charge.
- Checkout and invoicing run through [Mayar](https://mayar.id/); a successful payment provisions Studio access for the buyer's email automatically.
- In-app guides (`/studio/guides`) walk end users through the full flow, from pasting the prompt into an AI to deploying and connecting a custom domain — matched to what plays out in the tutorial video.

---

## Tech stack

- **Backend:** Laravel 13 (PHP 8.4)
- **Frontend:** Inertia.js v2 + React 18, Tailwind CSS v3
- **Auth:** Laravel Breeze + Sanctum
- **Payments:** Mayar
- **Testing:** PHPUnit

---

## Installation

1. **Clone the repository and install dependencies:**
   ```bash
   git clone <your-repo-url> karanglabs
   cd karanglabs
   composer install
   npm install
   ```

2. **Set up the environment file:**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

3. **Configure the database (SQLite by default):**
   ```bash
   touch database/database.sqlite
   php artisan migrate
   ```

4. **Configure Studio in `.env`:**
   ```env
   ANTHROPIC_API_KEY="sk-ant-api03-..."   # powers the "Isi Acak (AI)" random brief generator
   PLAN_EARLY_ACCESS_AMOUNT=149000
   PLAN_RESELLER_AMOUNT=490000
   ADMIN_EMAILS="you@example.com"
   ```

5. **Run the dev servers:**
   ```bash
   composer run dev
   ```
   This runs the Laravel server, queue listener, and Vite dev server together. Alternatively, run `php artisan serve` and `npm run dev` in separate terminals.

---

## Testing

```bash
php artisan test --compact
```
