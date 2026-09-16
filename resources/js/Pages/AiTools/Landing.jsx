import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

const LOGO = 'https://cdn.libradigital.id/logo-01%20(1)%20(1).png';

const FLAGSHIP_TOOLS = [
    { title: 'Planner', desc: 'Organize your day and track your goals with an intelligent planner.' },
    { title: 'Micro-Copy Master', desc: 'High-converting UX copy for any component, in seconds.' },
    { title: 'Regex & Schema', desc: 'Describe what you need, get the exact regex, SQL, or query.' },
    { title: 'Social Media Repurposer', desc: 'One paragraph in, six platform-ready posts out.' },
    { title: 'PDF Image Extractor', desc: 'Pull every embedded image out of a PDF at full quality.' },
    { title: 'Job Application Tailor', desc: 'Fit analysis, resume bullets, cover letter, interview prep.' },
];

const PLANS = [
    {
        tier: 'tools',
        name: 'AI Tools',
        price: 'Rp 49.000',
        period: '/bulan',
        tag: null,
        features: [
            'Akses semua AI Tools',
            'Tools & update baru otomatis masuk',
            'Riwayat hasil generate tersimpan',
            'Batal kapan saja',
        ],
    },
    {
        tier: 'bundle',
        name: 'AI Tools + Studio',
        price: 'Rp 69.000',
        period: '/bulan',
        tag: 'Paling hemat',
        features: [
            'Semua yang ada di paket AI Tools',
            'Akses Karanglabs Studio (generator website)',
            'Tools & update baru otomatis masuk',
            'Batal kapan saja',
        ],
    },
];

export default function AiToolsLanding({ mainSiteUrl }) {
    const { auth, flash } = usePage().props;

    const [checkoutTier, setCheckoutTier] = useState(null);
    const [form, setForm] = useState({ name: '', email: '', phone: '' });
    const [submitting, setSubmitting] = useState(false);
    const [checkoutError, setCheckoutError] = useState('');
    const [registered, setRegistered] = useState(false);

    const openCheckout = (tier) => {
        setForm({ name: '', email: '', phone: '' });
        setCheckoutError('');
        setRegistered(false);
        setCheckoutTier(tier);
    };

    const closeCheckout = () => setCheckoutTier(null);

    const submitCheckout = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setCheckoutError('');
        try {
            await window.axios.post(route('aitools.subscribe'), { ...form, tier: checkoutTier });
            setRegistered(true);
        } catch (err) {
            setCheckoutError(err?.response?.data?.message || 'Terjadi kesalahan. Coba lagi sebentar lagi.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <Head title="Karanglabs AI Tools" />

            <div className="min-h-screen bg-[#0A0A0A] font-sans text-[#EDEDED] antialiased selection:bg-emerald-400 selection:text-black">
                <header className="border-b border-[#1a1a1a]">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                        <a href={mainSiteUrl} className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white">
                            <img src={LOGO} alt="Karanglabs" className="h-8 w-8 rounded-md object-contain" />
                            Karanglabs <span className="text-emerald-400">AI Tools</span>
                        </a>

                        <nav className="hidden items-center gap-6 md:flex">
                            <a href="#harga" className="text-sm text-[#A1A1AA] transition-colors hover:text-white">Harga</a>
                        </nav>

                        <div className="flex items-center gap-3">
                            {auth?.user ? (
                                <Link href={route('aitools.index')} className="rounded-md bg-emerald-400 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-emerald-300">
                                    Buka Tools
                                </Link>
                            ) : (
                                <Link href={route('login')} className="rounded-md bg-emerald-400 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-emerald-300">
                                    Masuk
                                </Link>
                            )}
                        </div>
                    </div>
                </header>

                {flash?.error && (
                    <div className="border-b border-amber-400/20 bg-amber-400/[0.06] px-6 py-3 text-center text-sm text-amber-300">
                        {flash.error}
                    </div>
                )}

                <main>
                    <section className="relative overflow-hidden border-b border-[#141414]">
                        <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-white/[0.03] blur-[120px]" />
                        <div className="relative mx-auto max-w-3xl px-6 py-24 text-center">
                            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium tracking-wide text-emerald-300">
                                Langganan bulanan
                            </span>

                            <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl">
                                Kumpulan AI tools harian, terpisah dari Studio.
                            </h1>

                            <p className="mt-5 text-lg leading-relaxed text-[#A1A1AA]">
                                Planner, copywriting, regex, ekstraksi PDF, dan lebih banyak lagi, semua dalam satu tempat.
                                Produk sendiri, harga sendiri, tidak digabung dengan Karanglabs Studio.
                            </p>
                        </div>
                    </section>

                    <section className="mx-auto max-w-6xl px-6 py-20">
                        <h2 className="text-center text-2xl font-bold tracking-tight text-white">
                            Sebagian tools yang tersedia
                        </h2>
                        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {FLAGSHIP_TOOLS.map((tool) => (
                                <div key={tool.title} className="rounded-xl border border-[#222] bg-[#111] p-6">
                                    <h3 className="text-base font-semibold text-white">{tool.title}</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-[#888]">{tool.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section id="harga" className="border-y border-[#141414] bg-[#0D0D0D]">
                        <div className="mx-auto max-w-4xl px-6 py-20">
                            <h2 className="text-center text-2xl font-bold tracking-tight text-white sm:text-3xl">
                                Harga langganan
                            </h2>
                            <p className="mx-auto mt-3 max-w-xl text-center text-[#A1A1AA]">
                                Produk terpisah dari Karanglabs Studio, langganan bulanan, batal kapan saja.
                            </p>

                            <div className="mt-12 grid gap-6 sm:grid-cols-2">
                                {PLANS.map((plan) => (
                                    <div
                                        key={plan.tier}
                                        className={`relative flex flex-col rounded-2xl border p-8 ${
                                            plan.tag
                                                ? 'border-emerald-400/40 bg-emerald-400/[0.04]'
                                                : 'border-[#222] bg-[#111]'
                                        }`}
                                    >
                                        {plan.tag && (
                                            <span className="absolute -top-3 left-8 rounded-full bg-emerald-400 px-3 py-1 text-xs font-semibold text-black">
                                                {plan.tag}
                                            </span>
                                        )}

                                        <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                                        <p className="mt-4">
                                            <span className="text-3xl font-bold tracking-tight text-white">{plan.price}</span>
                                            <span className="text-sm text-[#888]">{plan.period}</span>
                                        </p>

                                        <ul className="mt-6 flex-1 space-y-2.5 text-sm text-[#EDEDED]">
                                            {plan.features.map((f) => (
                                                <li key={f} className="flex items-start gap-2.5">
                                                    <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    {f}
                                                </li>
                                            ))}
                                        </ul>

                                        <button
                                            type="button"
                                            onClick={() => openCheckout(plan.tier)}
                                            className="mt-8 w-full rounded-lg bg-emerald-400 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-emerald-300"
                                        >
                                            Langganan
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="border-t border-[#141414] px-6 py-8 text-center text-sm text-[#666]">
                    <a href={mainSiteUrl} className="hover:text-white">← Kembali ke Karanglabs Studio</a>
                </footer>
            </div>

            {checkoutTier && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
                    <div className="w-full max-w-md rounded-2xl border border-[#222] bg-[#111] p-6 text-[#EDEDED] shadow-2xl">
                        {registered ? (
                            <>
                                <h3 className="text-lg font-semibold text-white">Pendaftaran diterima</h3>
                                <p className="mt-3 text-sm leading-relaxed text-[#A1A1AA]">
                                    Cek email kamu untuk instruksi pembayaran dari Mayar. Akses langganan otomatis
                                    aktif begitu pembayaran pertama selesai.
                                </p>
                                <button
                                    type="button"
                                    onClick={closeCheckout}
                                    className="mt-6 w-full rounded-lg bg-emerald-400 py-2.5 text-sm font-semibold text-black hover:bg-emerald-300"
                                >
                                    Tutup
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-white">
                                        Langganan {PLANS.find((p) => p.tier === checkoutTier)?.name}
                                    </h3>
                                    <button type="button" onClick={closeCheckout} className="text-[#666] hover:text-white">✕</button>
                                </div>

                                <form onSubmit={submitCheckout} className="mt-5 space-y-4">
                                    <div>
                                        <label className="block text-xs text-[#888]">Nama</label>
                                        <input
                                            type="text"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            className="mt-1 w-full rounded-md border border-[#333] bg-[#0A0A0A] px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-[#888]">Email</label>
                                        <input
                                            type="email"
                                            required
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            className="mt-1 w-full rounded-md border border-[#333] bg-[#0A0A0A] px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-[#888]">No. HP</label>
                                        <input
                                            type="tel"
                                            required
                                            value={form.phone}
                                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                            placeholder="08xxxxxxxxxx"
                                            className="mt-1 w-full rounded-md border border-[#333] bg-[#0A0A0A] px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                                        />
                                    </div>

                                    {checkoutError && (
                                        <p className="rounded-md border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-300">
                                            {checkoutError}
                                        </p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full rounded-lg bg-emerald-400 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-emerald-300 disabled:opacity-60"
                                    >
                                        {submitting ? 'Memproses...' : 'Lanjutkan'}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
