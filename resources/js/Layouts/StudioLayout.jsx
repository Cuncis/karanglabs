import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    LayoutDashboard, BookOpen, Puzzle, User, LogOut, Menu, X, ArrowLeft,
} from 'lucide-react';
import { ENGINES, ACCENT } from '@/studioEngines';

const LOGO = 'https://cdn.libradigital.id/logo-01%20(1)%20(1).png';

function NavItem({ href, active, icon: Icon, children, accent }) {
    const accentText = accent ? ACCENT[accent].text : 'text-emerald-400';

    return (
        <Link
            href={href}
            className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                active ? 'bg-[#1A1A1A] text-white' : 'text-[#A1A1AA] hover:bg-[#141414] hover:text-white'
            }`}
        >
            <Icon className={`h-4 w-4 ${active ? accentText : 'text-[#666] group-hover:text-[#A1A1AA]'}`} />
            <span className="truncate">{children}</span>
        </Link>
    );
}

export default function StudioLayout({ children }) {
    const { auth } = usePage().props;
    const currentUrl = usePage().url;
    const [open, setOpen] = useState(false);

    const isActive = (path) => currentUrl === path || currentUrl.startsWith(path + '?');

    const sidebar = (
        <div className="flex h-full flex-col">
            <div className="flex items-center gap-2.5 px-3 py-5">
                <img src={LOGO} alt="Karanglabs" className="h-8 w-8 rounded-md object-contain" />
                <div>
                    <div className="text-sm font-bold leading-tight text-white">Karanglabs</div>
                    <div className="text-[10px] uppercase tracking-widest text-emerald-400">Studio</div>
                </div>
            </div>

            <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-6">
                <div className="space-y-1">
                    <NavItem href={route('studio.index')} active={isActive('/studio')} icon={LayoutDashboard}>
                        Dashboard
                    </NavItem>
                </div>

                <div>
                    <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-[#555]">Buat Website</p>
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
                    <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-[#555]">Belajar</p>
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

            <div className="border-t border-[#1a1a1a] px-3 py-4">
                <div className="mb-3 flex items-center gap-3 rounded-lg bg-[#111] px-3 py-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400/15 text-sm font-semibold text-emerald-300">
                        {auth?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-white">{auth?.user?.name}</div>
                        <div className="flex items-center gap-1 text-[10px] font-medium text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Member aktif
                        </div>
                    </div>
                </div>
                <div className="space-y-1">
                    <Link href={route('profile.edit')} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#A1A1AA] transition-colors hover:bg-[#141414] hover:text-white">
                        <User className="h-4 w-4 text-[#666]" /> Akun
                    </Link>
                    <Link href={route('home')} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#A1A1AA] transition-colors hover:bg-[#141414] hover:text-white">
                        <ArrowLeft className="h-4 w-4 text-[#666]" /> AI Tools Directory
                    </Link>
                    <Link href={route('logout')} method="post" as="button" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-[#A1A1AA] transition-colors hover:bg-[#141414] hover:text-white">
                        <LogOut className="h-4 w-4 text-[#666]" /> Log out
                    </Link>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0A0A0A] font-sans text-[#EDEDED] antialiased selection:bg-emerald-400 selection:text-black">
            {/* Desktop sidebar */}
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-[#1a1a1a] bg-[#0B0B0B] lg:block">
                {sidebar}
            </aside>

            {/* Mobile top bar */}
            <div className="sticky top-0 z-40 flex items-center justify-between border-b border-[#1a1a1a] bg-[#0A0A0A]/90 px-4 py-3 backdrop-blur lg:hidden">
                <div className="flex items-center gap-2 font-bold text-white">
                    <img src={LOGO} alt="Karanglabs" className="h-7 w-7 rounded object-contain" />
                    Studio
                </div>
                <button type="button" onClick={() => setOpen(true)} aria-label="Menu">
                    <Menu className="h-6 w-6 text-white" />
                </button>
            </div>

            {/* Mobile drawer */}
            {open && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
                    <aside className="absolute inset-y-0 left-0 w-72 border-r border-[#1a1a1a] bg-[#0B0B0B]">
                        <button type="button" onClick={() => setOpen(false)} className="absolute right-3 top-4 text-[#888]" aria-label="Tutup">
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
