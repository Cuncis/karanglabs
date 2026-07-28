import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/App';
import { CONFIG } from '@/config';
import { applyBrandColor } from '@/lib/theme';
import '@/index.css';

document.title = CONFIG.brandName;
applyBrandColor(CONFIG.accentColor);

try {
    if (localStorage.getItem('wl_theme') === 'dark') {
        document.documentElement.classList.add('dark');
    }
} catch {
    // ignore storage errors (private mode, etc.)
}

createRoot(document.getElementById('app')).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
