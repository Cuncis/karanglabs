import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    LayoutDashboard, BookOpen, Puzzle, User, LogOut, Menu, X, ArrowLeft, Sun, Moon,
} from 'lucide-react';
import { ENGINES, ACCENT } from '@/studioEngines';

const LOGO = 'https://cdn.libradigital.id/logo-01%20(1)%20(1).png';

function NavItem({ href, active, icon: Icon, children, accent }) {
    const accentText = accent ? ACCENT[accent].text : 'text-emerald-600 dark:text-emerald-400';

    return (
        <Link
            href={href}
            className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                active ? 'bg-[#E8E8EB] dark:bg-[#1A1A1A] text-[#18181B] dark:text-white' : 'text-[#52525B] dark:text-[#A1A1AA] hover:bg-[#EFEFF1] dark:hover:bg-[#141414] hover:text-[#18181B] dark:hover:text-white'
            }`}
        >
            <Icon className={`h-4 w-4 ${active ? accentText : 'text-[#8A8A93] dark:text-[#666] group-hover:text-[#52525B] dark:group-hover:text-[#A1A1AA]'}`} />
            <span className="truncate">{children}</span>
        </Link>
    );
}

export default function StudioLayout({ children }) {
    const { auth } = usePage().props;
    const currentUrl = usePage().url;
    const [open, setOpen] = useState(false);
    const [theme, setTheme] = useState(
        () => (typeof document !== 'undefined' && !document.documentElement.classList.contains('dark')) ? 'light' : 'dark',
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
                localStorage.setItem('studioTheme', next);
            } catch (e) {
                // ignore storage errors (private mode, etc.)
            }
            return next;
        });
    };

    const themeButtonClasses = 'rounded-lg p-2 text-[#8A8A93] dark:text-[#666] transition-colors hover:bg-[#EFEFF1] dark:hover:bg-[#141414] hover:text-[#18181B] dark:hover:text-white';

    const isActive = (path) => currentUrl === path || currentUrl.startsWith(path + '?');

    const sidebar = (
        <div className="flex h-full flex-col">
            <div className="flex items-center justify-between px-3 py-5">
                <div className="flex items-center gap-2.5">
                    <img src={LOGO} alt="Karanglabs" className="h-8 w-8 rounded-md object-contain" />
                    <div>
                        <div className="text-sm font-bold leading-tight text-[#18181B] dark:text-white">Karanglabs</div>
                        <div className="text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Studio</div>
                    </div>
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
                    <NavItem href={route('studio.index')} active={isActive('/studio')} icon={LayoutDashboard}>
                        Dashboard
                    </NavItem>
                </div>

                <div>
                    <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-[#9CA3AF] dark:text-[#555]">Buat Website</p>
                    <div className="space-y-1">
                        {ENGINES.map((engine) => (
                            <NavItem
                                key={engine.slug}
                                href={route('studio.engine', { engine: engine.slug })}
                                active={isActive(`/studio/${engine.slug}`)}
                                icon={engine.icon}
                                accent={engine.accent}
                            >
                                {engine.name}
                                {engine.star && <span className="ml-1 text-amber-400">★</span>}
                            </NavItem>
                        ))}
                    </div>
                </div>

                <div>
                    <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-[#9CA3AF] dark:text-[#555]">Belajar</p>
                    <div className="space-y-1">
                        <NavItem href={route('studio.guides')} active={isActive('/studio/guides')} icon={BookOpen}>
                            Panduan Online
                        </NavItem>
                        <NavItem href={route('studio.addons')} active={isActive('/studio/addons')} icon={Puzzle}>
                            Add-ons
                        </NavItem>
                    </div>
                </div>
            </nav>

            <div className="border-t border-[#EBEBEE] dark:border-[#1a1a1a] px-3 py-4">
                <div className="mb-3 flex items-center gap-3 rounded-lg bg-white dark:bg-[#111] px-3 py-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400/15 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                        {auth?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-[#18181B] dark:text-white">{auth?.user?.name}</div>
                        <div className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Member aktif
                        </div>
                    </div>
                </div>
                <div className="space-y-1">
                    <Link href={route('profile.edit')} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#52525B] dark:text-[#A1A1AA] transition-colors hover:bg-[#EFEFF1] dark:hover:bg-[#141414] hover:text-[#18181B] dark:hover:text-white">
                        <User className="h-4 w-4 text-[#8A8A93] dark:text-[#666]" /> Akun
                    </Link>
                    <Link href={route('home')} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#52525B] dark:text-[#A1A1AA] transition-colors hover:bg-[#EFEFF1] dark:hover:bg-[#141414] hover:text-[#18181B] dark:hover:text-white">
                        <ArrowLeft className="h-4 w-4 text-[#8A8A93] dark:text-[#666]" /> AI Tools Directory
                    </Link>
                    <Link href={route('logout')} method="post" as="button" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-[#52525B] dark:text-[#A1A1AA] transition-colors hover:bg-[#EFEFF1] dark:hover:bg-[#141414] hover:text-[#18181B] dark:hover:text-white">
                        <LogOut className="h-4 w-4 text-[#8A8A93] dark:text-[#666]" /> Log out
                    </Link>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F4F4F5] dark:bg-[#0A0A0A] font-sans text-[#27272A] dark:text-[#EDEDED] antialiased selection:bg-emerald-400 selection:text-black">
            {/* Desktop sidebar */}
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-[#EBEBEE] dark:border-[#1a1a1a] bg-white dark:bg-[#0B0B0B] lg:block">
                {sidebar}
            </aside>

            {/* Mobile top bar */}
            <div className="sticky top-0 z-40 flex items-center justify-between border-b border-[#EBEBEE] dark:border-[#1a1a1a] bg-[#F4F4F5] dark:bg-[#0A0A0A]/90 px-4 py-3 backdrop-blur lg:hidden">
                <div className="flex items-center gap-2 font-bold text-[#18181B] dark:text-white">
                    <img src={LOGO} alt="Karanglabs" className="h-7 w-7 rounded object-contain" />
                    Studio
                </div>
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={toggleTheme}
                        className={themeButtonClasses}
                        aria-label="Ganti tema terang/gelap"
                    >
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
