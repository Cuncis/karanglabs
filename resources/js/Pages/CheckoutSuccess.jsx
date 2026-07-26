import { Head, usePage } from '@inertiajs/react';
import { CheckCircle2, Mail, ArrowRight } from 'lucide-react';

const LOGO = 'https://cdn.libradigital.id/logo-01%20(1)%20(1).png';

export default function CheckoutSuccess() {
    const { email, planTitle } = usePage().props;

    // Clean redirect to the homepage — no #harga / #cara-kerja hash fragments.
    const goHome = () => {
        window.location.assign('/');
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#0A0A0A] px-5 font-sans text-[#EDEDED] antialiased selection:bg-emerald-400 selection:text-black">
            <Head title="Pembayaran Berhasil — Karanglabs" />

            <div className="w-full max-w-md rounded-2xl border border-[#222] bg-[#111] p-8 text-center sm:p-10">
                <img src={LOGO} alt="Karanglabs" className="mx-auto mb-6 h-10 w-10 rounded-md object-contain" />

                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/10">
                    <CheckCircle2 className="h-9 w-9 text-emerald-400" />
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-white">Pembayaran berhasil!</h1>
                {planTitle && (
                    <p className="mt-2 text-sm font-medium text-emerald-300">{planTitle}</p>
                )}

                <p className="mt-4 text-sm leading-relaxed text-[#A1A1AA]">
                    Terima kasih! Pembayaran kamu sudah kami terima dan akses Karanglabs Studio sedang diaktifkan.
                </p>

                <div className="mt-6 flex items-start gap-3 rounded-xl border border-[#222] bg-[#0D0D0D] p-4 text-left">
                    <Mail className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-400" />
                    <p className="text-sm leading-relaxed text-[#A1A1AA]">
                        Email berisi <span className="text-white">email &amp; password login</span>
                        {email ? (
                            <> otomatis dikirim ke <span className="text-white">{email}</span>.</>
                        ) : (
                            <> otomatis dikirim ke email yang kamu daftarkan.</>
                        )}
                        {' '}Cek inbox (dan folder spam) kamu ya.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={goHome}
                    className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-400 py-3 text-sm font-semibold text-black transition-colors hover:bg-emerald-300"
                >
                    Kembali ke Beranda <ArrowRight className="h-4 w-4" />
                </button>
            </div>

            <p className="mt-6 text-xs text-[#555]">Sudah punya akun? <a href="/login" className="text-emerald-400 hover:text-emerald-300">Login ke Studio</a></p>
        </div>
    );
}
