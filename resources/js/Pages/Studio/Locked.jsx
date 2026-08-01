import { Head, Link, usePage } from '@inertiajs/react';
import { Lock, ArrowRight, LayoutGrid } from 'lucide-react';

const LOGO = 'https://cdn.libradigital.id/logo-01%20(1)%20(1).png';

export default function Locked() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Studio Terkunci" />
            <div className="flex min-h-screen items-center justify-center bg-[#F4F4F5] dark:bg-[#0A0A0A] px-6 font-sans text-[#27272A] dark:text-[#EDEDED] antialiased">
                <div className="w-full max-w-md text-center">
                    <div className="mb-6 flex items-center justify-center gap-2.5">
                        <img src={LOGO} alt="Karanglabs" className="h-9 w-9 rounded-md object-contain" />
                        <span className="text-lg font-bold text-[#18181B] dark:text-white">Karanglabs <span className="text-emerald-600 dark:text-emerald-400">Studio</span></span>
                    </div>

                    <div className="rounded-2xl border border-[#E4E4E7] dark:border-[#222] bg-white dark:bg-[#111] p-8">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#E8E8EB] dark:bg-[#1A1A1A]">
                            <Lock className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h1 className="mt-6 text-2xl font-bold text-[#18181B] dark:text-white">Studio masih terkunci</h1>
                        <p className="mt-3 text-sm leading-relaxed text-[#52525B] dark:text-[#A1A1AA]">
                            Akun <span className="font-medium text-[#18181B] dark:text-white">{auth?.user?.email}</span> belum punya akses Studio.
                            Ambil early access untuk membuka 8 engine generator website, panduan lengkap, dan update selamanya.
                        </p>

                        <a
                            href="/#harga"
                            className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-400 px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-emerald-300"
                        >
                            Ambil Early Access, Rp 149.000 <ArrowRight className="h-4 w-4" />
                        </a>

                        <p className="mt-4 text-xs text-[#8A8A93] dark:text-[#666]">
                            Sudah bayar tapi belum bisa masuk? Akses diaktifkan manual oleh tim kami setelah pembayaran terverifikasi, hubungi kami dengan email di atas.
                        </p>
                    </div>

                    <div className="mt-6 flex items-center justify-center gap-4 text-sm">
                        {auth?.isAdmin && (
                            <>
                                <Link href={route('home')} className="inline-flex items-center gap-1.5 text-[#52525B] dark:text-[#A1A1AA] transition-colors hover:text-[#18181B] dark:hover:text-white">
                                    <LayoutGrid className="h-4 w-4" /> AI Tools Directory
                                </Link>
                                <span className="text-[#C4C4C8] dark:text-[#333]">·</span>
                            </>
                        )}
                        <Link href={route('logout')} method="post" as="button" className="text-[#52525B] dark:text-[#A1A1AA] transition-colors hover:text-[#18181B] dark:hover:text-white">
                            Log out
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
