import { useState } from 'react';
import { LayoutDashboard, BookOpen, Puzzle, LogOut, Menu, X, Sun, Moon, Star } from 'lucide-react';
import { ENGINES, ACCENT } from '@/studioEngines';
import { CONFIG } from '@/config';
import { getSession, logout } from '@/lib/auth';

function NavItem({ href, active, icon: Icon, children, accent }) {
    const accentText = accent ? ACCENT[accent].text : 'text-brand-600 dark:text-brand-400';

    return (
        <a
            href={href}
            className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                active ? 'bg-[#E8E8EB] dark:bg-[#1A1A1A] text-[#18181B] dark:text-white' : 'text-[#52525B] dark:text-[#A1A1AA] hover:bg-[#EFEFF1] dark:hover:bg-[#141414] hover:text-[#18181B] dark:hover:text-white'
            }`}
        >
            <Icon className={`h-4 w-4 ${active ? accentText : 'text-[#8A8A93] dark:text-[#666] group-hover:text-[#52525B] dark:group-hover:text-[#A1A1AA]'}`} />
            <span className="truncate">{children}</span>
        </a>
    );
}

/**
 * `active` is one of 'dashboard' | 'guides' | 'addons' | an engine slug,
 * set by whichever page in src/pages renders this layout.
 */
export default function AppLayout({ children, active }) {
    const session = getSession();
    const [open, setOpen] = useState(false);
    const [theme, setTheme] = useState(
        () => (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) ? 'dark' : 'light',
    );

    const toggleTheme = () => {
        setTheme((prev) => {
            const next = prev === 'dark' ? 'light' : 'dark';
            const root = document.documentElement;
            if (next === 'dark') {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
            try {
                localStorage.setItem('wl_theme', next);
            } catch {
                // ignore storage errors (private mode, etc.)
            }
            return next;
        });
    };

    const themeButtonClasses = 'rounded-lg p-2 text-[#8A8A93] dark:text-[#666] transition-colors hover:bg-[#EFEFF1] dark:hover:bg-[#141414] hover:text-[#18181B] dark:hover:text-white';

    const handleLogout = () => {
        logout();
        window.location.hash = '#/login';
    };

    const sidebar = (
        <div className="flex h-full flex-col">
            <div className="flex items-center justify-between px-3 py-5">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-400/15 text-xs font-bold text-brand-700 dark:text-brand-300">
                        {CONFIG.logoInitials}
                    </div>
                    <div className="text-sm font-bold leading-tight text-[#18181B] dark:text-white">{CONFIG.brandName}</div>
                </div>
                <button
                    type="button"
                    onClick={toggleTheme}
                    className={themeButtonClasses}
                    aria-label="Ganti tema terang/gelap"
                    title={theme === 'dark' ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
                >
                    {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
            </div>

            <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-6">
                <div className="space-y-1">
                    <NavItem href="#/app" active={active === 'dashboard'} icon={LayoutDashboard}>
                        Dashboard
                    </NavItem>
                </div>

                <div>
                    <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-[#9CA3AF] dark:text-[#555]">Buat Website</p>
                    <div className="space-y-1">
                        {ENGINES.map((engine) => (
                            <NavItem
                                key={engine.slug}
                                href={`#/app/e/${engine.slug}`}
                                active={active === engine.slug}
                                icon={engine.icon}
                                accent={engine.accent}
                            >
                                {engine.name}
                                {engine.star && <Star className="ml-1 inline h-3 w-3 fill-amber-500 text-amber-500" />}
                            </NavItem>
                        ))}
                    </div>
                </div>

                <div>
                    <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-[#9CA3AF] dark:text-[#555]">Belajar</p>
                    <div className="space-y-1">
                        <NavItem href="#/app/guides" active={active === 'guides'} icon={BookOpen}>
                            Panduan Online
                        </NavItem>
                        <NavItem href="#/app/addons" active={active === 'addons'} icon={Puzzle}>
                            Add-ons
                        </NavItem>
                    </div>
                </div>
            </nav>

            <div className="border-t border-[#EBEBEE] dark:border-[#1a1a1a] px-3 py-4">
                <div className="mb-3 flex items-center gap-3 rounded-lg bg-white dark:bg-[#111] px-3 py-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-400/15 text-sm font-semibold text-brand-700 dark:text-brand-300">
                        {session?.email?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-[#18181B] dark:text-white">{session?.email}</div>
                        <div className="flex items-center gap-1 text-[10px] font-medium text-brand-600 dark:text-brand-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-brand-400" /> Aktif
                        </div>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-[#52525B] dark:text-[#A1A1AA] transition-colors hover:bg-[#EFEFF1] dark:hover:bg-[#141414] hover:text-[#18181B] dark:hover:text-white"
                >
                    <LogOut className="h-4 w-4 text-[#8A8A93] dark:text-[#666]" /> Keluar
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F4F4F5] dark:bg-[#0A0A0A] font-sans text-[#27272A] dark:text-[#EDEDED] antialiased selection:bg-brand-400 selection:text-black">
            {/* Desktop sidebar */}
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-[#EBEBEE] dark:border-[#1a1a1a] bg-white dark:bg-[#0B0B0B] lg:block">
                {sidebar}
            </aside>

            {/* Mobile top bar */}
            <div className="sticky top-0 z-40 flex items-center justify-between border-b border-[#EBEBEE] dark:border-[#1a1a1a] bg-[#F4F4F5] dark:bg-[#0A0A0A]/90 px-4 py-3 backdrop-blur lg:hidden">
                <div className="flex items-center gap-2 font-bold text-[#18181B] dark:text-white">
                    <div className="flex h-7 w-7 items-center justify-center rounded bg-brand-400/15 text-[11px] font-bold text-brand-700 dark:text-brand-300">
                        {CONFIG.logoInitials}
                    </div>
                    {CONFIG.brandName}
                </div>
                <div className="flex items-center gap-1">
                    <button type="button" onClick={toggleTheme} className={themeButtonClasses} aria-label="Ganti tema terang/gelap">
                        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>
                    <button type="button" onClick={() => setOpen(true)} aria-label="Menu">
                        <Menu className="h-6 w-6 text-[#18181B] dark:text-white" />
                    </button>
                </div>
            </div>

            {/* Mobile drawer */}
            {open && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
                    <aside className="absolute inset-y-0 left-0 w-72 border-r border-[#EBEBEE] dark:border-[#1a1a1a] bg-white dark:bg-[#0B0B0B]">
                        <button type="button" onClick={() => setOpen(false)} className="absolute right-3 top-4 text-[#71717A] dark:text-[#888]" aria-label="Tutup">
                            <X className="h-5 w-5" />
                        </button>
                        {sidebar}
                    </aside>
                </div>
            )}

            <main className="lg:pl-64">
                <div className="mx-auto max-w-5xl px-5 py-8 lg:px-10 lg:py-12">
                    {children}
                </div>
            </main>
        </div>
    );
}
