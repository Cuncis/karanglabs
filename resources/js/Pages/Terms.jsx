import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

const LOGO = 'https://cdn.libradigital.id/logo-01%20(1)%20(1).png';
const LAST_UPDATED = '27 Juli 2026';

function Section({ id, title, children }) {
    return (
        <section id={id} className="scroll-mt-24">
            <h2 className="text-lg font-bold text-white sm:text-xl">{title}</h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-[#A1A1AA]">{children}</div>
        </section>
    );
}

export default function Terms() {
    return (
        <div className="min-h-screen bg-[#0A0A0A] font-sans text-[#EDEDED] antialiased selection:bg-emerald-400 selection:text-black">
            <Head title="Syarat Layanan & Kebijakan Pengembalian Dana — Karanglabs" />

            <div className="mx-auto max-w-3xl px-6 py-14 sm:py-20">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-lg font-bold text-white">
                        <img src={LOGO} alt="Karanglabs" className="h-8 w-8 rounded-md object-contain" />
                        Karanglabs
                    </div>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-sm text-[#888] transition-colors hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" /> Beranda
                    </Link>
                </div>

                <div className="mt-10">
                    <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                        Syarat Layanan &amp; Kebijakan Pengembalian Dana
                    </h1>
                    <p className="mt-3 text-sm text-[#666]">Terakhir diperbarui: {LAST_UPDATED}</p>
                </div>

                <div className="mt-10 space-y-10">
                    <Section id="tentang" title="1. Tentang Layanan">
                        <p>
                            Karanglabs (&ldquo;kami&rdquo;) adalah layanan perangkat lunak berbasis web
                            (SaaS) yang menyediakan <strong className="text-white">Karanglabs Studio</strong> —
                            alat berbantuan AI untuk membuat brief dan menghasilkan website seperti landing
                            page, toko online, company profile, portofolio, dan undangan digital. Produk yang
                            kami jual sepenuhnya bersifat <strong className="text-white">digital</strong>;
                            tidak ada pengiriman barang fisik.
                        </p>
                        <p>
                            Dengan melakukan pembelian dan menggunakan layanan kami, kamu dianggap telah
                            membaca, memahami, dan menyetujui seluruh syarat yang tercantum di halaman ini.
                        </p>
                    </Section>

                    <Section id="pembelian" title="2. Pembelian & Aktivasi Akun">
                        <p>
                            Pembayaran diproses melalui payment gateway resmi (Mayar). Setelah pembayaran
                            berhasil, akses Karanglabs Studio akan diaktifkan secara otomatis dan kredensial
                            login (email &amp; kata sandi) dikirim ke alamat email yang kamu daftarkan saat
                            checkout. Pastikan alamat email yang kamu masukkan benar dan aktif.
                        </p>
                        <ul className="ml-5 list-disc space-y-1.5">
                            <li>Early Access — Rp 149.000</li>
                            <li>Lisensi Reseller — Rp 490.000</li>
                        </ul>
                        <p>
                            Harga dapat berubah sewaktu-waktu. Harga yang berlaku adalah harga yang tercantum
                            pada saat kamu menyelesaikan pembayaran.
                        </p>
                    </Section>

                    <Section id="penggunaan" title="3. Penggunaan yang Diizinkan">
                        <p>Kamu setuju untuk tidak menggunakan layanan ini untuk:</p>
                        <ul className="ml-5 list-disc space-y-1.5">
                            <li>Membuat konten yang melanggar hukum yang berlaku di Indonesia.</li>
                            <li>Membagikan, menjual kembali, atau mengalihkan kredensial akun tanpa lisensi yang sesuai.</li>
                            <li>Mengganggu, menyalahgunakan, atau mencoba merusak sistem dan keamanan layanan.</li>
                        </ul>
                        <p>
                            Kami berhak menonaktifkan akun yang terbukti melanggar ketentuan ini tanpa
                            pengembalian dana.
                        </p>
                    </Section>

                    <Section id="pengembalian" title="4. Kebijakan Pengembalian Dana (Refund)">
                        <p>
                            Karena produk kami berupa akses digital yang dikirim dan diaktifkan secara instan,
                            berlaku ketentuan pengembalian dana berikut:
                        </p>
                        <ul className="ml-5 list-disc space-y-1.5">
                            <li>
                                <strong className="text-white">Berhak refund penuh</strong> apabila terjadi
                                kesalahan pembayaran ganda (double charge), atau apabila akses Studio tidak
                                dapat diaktifkan karena kendala teknis dari pihak kami dan tidak dapat kami
                                perbaiki dalam <strong className="text-white">7 (tujuh) hari</strong> kerja
                                sejak pembayaran.
                            </li>
                            <li>
                                <strong className="text-white">Tidak berhak refund</strong> apabila akun sudah
                                aktif dan sudah pernah digunakan (login berhasil dan/atau fitur telah dipakai),
                                karena akses digital dianggap sudah terkirim sepenuhnya.
                            </li>
                            <li>
                                Permintaan refund yang valid diproses dalam <strong className="text-white">7–14
                                hari kerja</strong> ke metode pembayaran asal. Waktu pengembalian dana ke
                                rekening/e-wallet kamu mengikuti kebijakan bank atau penyedia pembayaran.
                            </li>
                        </ul>
                        <p>
                            Untuk mengajukan refund, hubungi kami melalui email di bawah dengan menyertakan
                            <strong className="text-white"> Order ID</strong> dan email pembelian kamu.
                        </p>
                    </Section>

                    <Section id="tanggung-jawab" title="5. Batasan Tanggung Jawab">
                        <p>
                            Layanan disediakan &ldquo;sebagaimana adanya&rdquo;. Karanglabs Studio adalah alat
                            bantu; hasil akhir website sepenuhnya bergantung pada input dan kebutuhan kamu. Kami
                            tidak bertanggung jawab atas kerugian tidak langsung yang timbul dari penggunaan
                            layanan di luar kendali wajar kami.
                        </p>
                    </Section>

                    <Section id="perubahan" title="6. Perubahan Ketentuan">
                        <p>
                            Kami dapat memperbarui syarat dan kebijakan ini sewaktu-waktu. Perubahan berlaku
                            sejak dipublikasikan di halaman ini. Tanggal &ldquo;Terakhir diperbarui&rdquo; di
                            atas menunjukkan versi terkini.
                        </p>
                    </Section>

                    <Section id="kontak" title="7. Kontak">
                        <p>Untuk pertanyaan, bantuan, atau permintaan refund, hubungi kami:</p>
                        <ul className="ml-5 list-disc space-y-1.5">
                            <li>Email: <a href="mailto:hello@karanglabs.cloud" className="text-emerald-400 hover:text-emerald-300">hello@karanglabs.cloud</a></li>
                            <li>Website: <a href="https://karanglabs.cloud" className="text-emerald-400 hover:text-emerald-300">karanglabs.cloud</a></li>
                        </ul>
                    </Section>
                </div>

                <div className="mt-16 border-t border-[#222] pt-6 text-xs text-[#555]">
                    © 2026 Karanglabs · karanglabs.cloud
                </div>
            </div>
        </div>
    );
}
