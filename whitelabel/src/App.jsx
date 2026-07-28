import { useEffect, useState } from 'react';
import { isAuthenticated } from '@/lib/auth';
import { findEngine } from '@/studioEngines';
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Engine from '@/pages/Engine';
import Guides from '@/pages/Guides';
import Addons from '@/pages/Addons';

// Hash-based routing on purpose: this app is dropped as a static zip onto
// Vercel/Netlify with no server-side rewrite rules, so path-based routes
// would 404 on refresh/direct-link. Hash routes always resolve to index.html.
function currentPath() {
    const hash = window.location.hash || '#/';

    return hash.slice(1) || '/';
}

export default function App() {
    const [path, setPath] = useState(currentPath());

    useEffect(() => {
        const onHashChange = () => setPath(currentPath());
        window.addEventListener('hashchange', onHashChange);

        return () => window.removeEventListener('hashchange', onHashChange);
    }, []);

    const authed = isAuthenticated();

    if (path.startsWith('/app')) {
        if (!authed) {
            window.location.hash = '#/login';

            return null;
        }

        const sub = path.slice(4);

        if (sub.startsWith('/e/')) {
            const slug = sub.slice(3);
            if (findEngine(slug)) {
                return <Engine slug={slug} />;
            }
        } else if (sub === '/guides') {
            return <Guides />;
        } else if (sub === '/addons') {
            return <Addons />;
        }

        return <Dashboard />;
    }

    if (path === '/login') {
        if (authed) {
            window.location.hash = '#/app';

            return null;
        }

        return <Login />;
    }

    return <Landing />;
}
