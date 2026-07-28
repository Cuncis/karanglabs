# Whitelabel Website Builder — Setup Guide

This is your own copy of the website-builder product: a static site (no server, no monthly hosting cost) with your branding, your price, and your own customer login via a Google Sheet. This file is written as a step-by-step you can follow while recording your own tutorial video for buyers.

## What's included / what's not

- All engine pages (Landing Page, Toko Online, Company Profile, Undangan, etc.) with the same prompt-builder logic.
- Panduan Online (deploy guide) and Add-ons pages.
- Customer login gated by a Google Sheet you control (no server needed).
- "Simpan project" saves to the customer's own browser (localStorage) — it does not sync across devices, since there's no database here.
- **Not included:** the "Isi Acak (AI)" random-fill button. That feature calls a paid AI API from a server, which contradicts the "no server cost" model of this package. If you want it, you'd need to run your own small backend and API key — talk to us first.

## Step 1 — Rebrand

Open `src/config.js` and edit:

- `brandName`, `logoInitials`, `tagline` — your name/logo/pitch.
- `accentColor` — one hex color; every button/highlight in the app re-colors from this automatically, no design work needed.
- `priceLabel`, `priceNote`, `paymentUrl` — your price and your own payment link (Midtrans, Trakteer, QRIS, WhatsApp order, etc.).
- `whatsapp` — your support number.
- `appsScriptUrl` — filled in during Step 2 below.

## Step 2 — Set up customer login (Google Sheet)

1. Create a new Google Sheet. Rename the first tab to `Customers`.
2. Add a header row: `Email | Kode Akses | Status`.
3. Go to **Extensions > Apps Script**, delete the placeholder code, and paste in the contents of `google-apps-script/Code.gs` from this package.
4. Click **Deploy > New deployment**. Type: **Web app**. Execute as: **Me**. Who has access: **Anyone**.
5. Click **Deploy**, authorize the permissions Google asks for, then copy the URL ending in `/exec`.
6. Paste that URL into `appsScriptUrl` in `src/config.js`.

Whenever someone pays you, add a row to the `Customers` sheet: their email, a short access code you send them, and `active` in Status. To revoke access later, change Status to `inactive` — no need to delete the row.

## Step 3 — Build

```
npm install
npm run build
```

This produces a `dist/` folder — a plain static site, ready to deploy.

## Step 4 — Deploy for free (same flow as the in-app guide)

1. Zip the contents of `dist/` into one `.zip` (or just the folder if your host accepts folders).
2. Open https://vercel.com/drop, log in first (GitHub, GitLab, or email).
3. Drag & drop the zipped `dist/` folder onto the upload area.
4. Your site is live immediately at a free `yourname.vercel.app` address.

(Netlify's https://app.netlify.com/drop works the same way if you prefer it.)

## Step 5 — Sell it

Send buyers to your live URL. After they pay through your `paymentUrl`, add their row to the Google Sheet, then send them their email + access code so they can log in at `yourdomain/#/login`.

## Re-deploying after a rebrand change

Any time you edit `src/config.js`, repeat Step 3 (build) and Step 4 (drop the new `dist/` folder) — static sites need a rebuild to pick up config changes, there's no live server to restart.
