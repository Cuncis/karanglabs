import { Head, Link, usePage } from '@inertiajs/react';
import { Sparkles, FolderOpen, Layers, ArrowRight, Star } from 'lucide-react';
import StudioLayout from '@/Layouts/StudioLayout';
import { ENGINES, ACCENT } from '@/studioEngines';

function timeAgo(dateString) {
    const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (diff < 60) return 'baru saja';
    if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    return `${Math.floor(diff / 86400)} hari lalu`;
}

export default function Dashboard() {
    const { auth, recentProjects, projectCount, engineCount } = usePage().props;
    const firstName = auth?.user?.name?.split(' ')[0] || 'Kamu';

    const engineName = (slug) => ENGINES.find((e) => e.slug === slug)?.name || slug;

    return (
        <StudioLayout>
            <Head title="Dashboard Studio" />

            <div className="mb-10">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                    <Sparkles className="h-3.5 w-3.5" /> Selamat datang, Member
                </span>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#18181B] dark:text-white">Halo, {firstName} 👋</h1>
                <p className="mt-2 max-w-2xl text-[#52525B] dark:text-[#A1A1AA]">
                    Pilih jenis website yang mau kamu buat, isi brief singkat, dan Studio akan meracik prompt siap-paste ke AI favoritmu.
                </p>
            </div>

            {/* Stats */}
            <div className="mb-10 grid gap-4 sm:grid-cols-3">
                {[
                    { icon: Layers, label: 'Engine tersedia', value: engineCount },
                    { icon: FolderOpen, label: 'Project tersimpan', value: projectCount },
                    { icon: Sparkles, label: 'Generate harian', value: '∞' },
                ].map((s) => (
                    <div key={s.label} className="rounded-xl border border-[#E4E4E7] dark:border-[#222] bg-white dark:bg-[#111] p-5">
                        <s.icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        <div className="mt-3 text-2xl font-bold text-[#18181B] dark:text-white">{s.value}</div>
                        <div className="text-sm text-[#71717A] dark:text-[#888]">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Engines */}
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#8A8A93] dark:text-[#666]">Buat website baru</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {ENGINES.map((engine) => {
                    const accent = ACCENT[engine.accent];
                    return (
                        <Link
                            key={engine.slug}
                            href={route('studio.engine', { engine: engine.slug })}
                            className="group flex flex-col rounded-xl border border-[#E4E4E7] dark:border-[#222] bg-white dark:bg-[#111] p-5 transition-all hover:border-[#C4C4C8] dark:hover:border-[#3a3a3a] hover:bg-[#EFEFF1] dark:hover:bg-[#161616]"
                        >
                            <div className="flex items-center justify-between">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${accent.bg} ${accent.ring} transition-colors`}>
                                    <engine.icon className={`h-5 w-5 ${accent.text}`} />
                                </div>
                                <span className="font-mono text-xs text-[#9CA3AF] dark:text-[#555]">{engine.code}</span>
                            </div>
                            <h3 className="mt-4 flex items-center gap-1.5 text-base font-semibold text-[#18181B] dark:text-white">
                                {engine.name}
                                {engine.star && <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />}
                            </h3>
                            <p className="mt-1.5 flex-1 text-sm leading-relaxed text-[#71717A] dark:text-[#888]">{engine.tagline}</p>
                            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400 opacity-0 transition-opacity group-hover:opacity-100">
                                Buat sekarang <ArrowRight className="h-4 w-4" />
                            </span>
                        </Link>
                    );
                })}
            </div>

            {/* Recent projects */}
            {recentProjects.length > 0 && (
                <div className="mt-12">
                    <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#8A8A93] dark:text-[#666]">Project terakhir</h2>
                    <div className="divide-y divide-[#EBEBEE] dark:divide-[#1a1a1a] overflow-hidden rounded-xl border border-[#E4E4E7] dark:border-[#222] bg-white dark:bg-[#111]">
                        {recentProjects.map((p) => (
                            <Link
                                key={p.id}
                                href={route('studio.engine', { engine: p.engine })}
                                className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-[#EFEFF1] dark:hover:bg-[#161616]"
                            >
                                <div className="min-w-0">
                                    <div className="truncate font-medium text-[#18181B] dark:text-white">{p.title}</div>
                                    <div className="text-xs text-[#8A8A93] dark:text-[#666]">{engineName(p.engine)} · {timeAgo(p.created_at)}</div>
                                </div>
                                <ArrowRight className="h-4 w-4 flex-shrink-0 text-[#9CA3AF] dark:text-[#555]" />
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </StudioLayout>
    );
}
