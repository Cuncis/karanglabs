// ============================================================================
// REBRAND CONFIG — this is the ONE file you edit to make this your own product.
// After changing anything here, run `npm run build` again before re-deploying.
// ============================================================================
export const CONFIG = {
    // Shown in the sidebar, browser tab, and landing page.
    brandName: 'Karanglabs',
    // Short initials shown in the small logo tile (2-3 letters).
    logoInitials: 'KL',
    // One-line pitch shown on the landing page hero.
    tagline: 'Bikin website sendiri pakai AI, tanpa coding.',

    // A single hex color. Every "brand-*" accent in the UI (buttons, active nav,
    // highlights) is derived from this at runtime — no rebuild needed to reskin.
    accentColor: '#34d399',

    // Pricing shown on the landing page. Purely display text, not enforced here.
    priceLabel: 'Rp 149.000',
    priceNote: 'sekali bayar, akses selamanya',

    // Where the "Beli sekarang" button on the landing page sends buyers —
    // your own payment link (Midtrans, Trakteer, QRIS, WhatsApp order, etc.).
    paymentUrl: 'https://your-payment-link.example.com',

    // WhatsApp number customers can contact for support (numbers only, country code, no +/spaces).
    whatsapp: '6283',

    // Your Google Apps Script Web App URL (see google-apps-script/Code.gs and
    // README.md for how to create and deploy this under your own Google account).
    // Customer login checks email + access code against your Google Sheet through this URL.
    appsScriptUrl: 'https://script.google.com/macros/s/REPLACE_WITH_YOUR_DEPLOYMENT_ID/exec',

    // Tutorial videos shown behind the "Tutorial" button on every page.
    // Leave videoUrl empty to show a placeholder instead of an embed.
    tutorialVideos: [
        { title: 'Cara Pakai', videoUrl: '' },
    ],
};
