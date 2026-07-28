import { CONFIG } from '@/config';

const SESSION_KEY = 'wl_session';
const SESSION_DAYS = 7;

export function getSession() {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) {
            return null;
        }

        const session = JSON.parse(raw);
        if (!session.expiresAt || Date.now() > session.expiresAt) {
            localStorage.removeItem(SESSION_KEY);

            return null;
        }

        return session;
    } catch {
        return null;
    }
}

export function isAuthenticated() {
    return getSession() !== null;
}

export function logout() {
    localStorage.removeItem(SESSION_KEY);
}

/**
 * Checks the email + access code against the reseller's Google Sheet via the
 * Apps Script Web App configured in config.js (see google-apps-script/Code.gs).
 * On success, stores a local session so the customer stays logged in on this
 * browser for SESSION_DAYS without re-checking the sheet every visit.
 */
export async function login(email, code) {
    const url = new URL(CONFIG.appsScriptUrl);
    url.searchParams.set('email', email.trim().toLowerCase());
    url.searchParams.set('code', code.trim());

    let data;
    try {
        const res = await fetch(url.toString());
        data = await res.json();
    } catch {
        return { ok: false, reason: 'network' };
    }

    if (!data.ok) {
        return { ok: false, reason: data.reason || 'not_found' };
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify({
        email: email.trim().toLowerCase(),
        expiresAt: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
    }));

    return { ok: true };
}
