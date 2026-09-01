import { useState } from 'react';
import { KeyRound, Copy, Check, X } from 'lucide-react';

/**
 * One-time display of a freshly set/generated password so the admin can copy it
 * and hand it to the buyer directly. Nothing is persisted; it lives only in this
 * modal until closed.
 */
export default function CredentialModal({ credential, onClose }) {
    const [copied, setCopied] = useState(null);

    if (!credential) return null;

    const copy = (text, which) => {
        navigator.clipboard?.writeText(text).then(() => {
            setCopied(which);
            setTimeout(() => setCopied(null), 2000);
        });
    };

    const copyBoth = () => copy(`Email: ${credential.email}\nPassword: ${credential.password}`, 'both');

    const Field = ({ label, value, which }) => (
        <div>
            <label className="mb-1.5 block text-xs font-medium text-[#52525B] dark:text-[#A1A1AA]">{label}</label>
            <div className="flex items-center gap-2">
                <code className="block flex-1 select-all overflow-x-auto rounded-lg border border-[#D4D4D8] dark:border-[#333] bg-[#F7F7F8] dark:bg-[#0D0D0D] px-3 py-2 font-mono text-sm text-[#18181B] dark:text-white">
                    {value}
                </code>
                <button
                    type="button"
                    onClick={() => copy(value, which)}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#D4D4D8] dark:border-[#333] px-2.5 py-2 text-xs font-medium text-[#27272A] dark:text-[#EDEDED] transition-colors hover:bg-[#EFEFF1] dark:hover:bg-[#1A1A1A]"
                    title={`Copy ${label.toLowerCase()}`}
                >
                    {copied === which ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </button>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md rounded-2xl border border-[#E4E4E7] dark:border-[#222] bg-white dark:bg-[#111] p-6 shadow-xl">
                <button type="button" onClick={onClose} className="absolute right-4 top-4 text-[#9CA3AF] transition-colors hover:text-[#18181B] dark:hover:text-white">
                    <X className="h-5 w-5" />
                </button>
                <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/15">
                        <KeyRound className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-lg font-semibold text-[#18181B] dark:text-white">Login baru siap</h3>
                        <p className="mt-1 text-sm text-[#52525B] dark:text-[#A1A1AA]">
                            Simpan / kirim ke pembeli sekarang. Password ini cuma tampil sekali dan tidak disimpan.
                        </p>
                    </div>
                </div>

                <div className="mt-5 space-y-4">
                    <Field label="Email" value={credential.email} which="email" />
                    <Field label="Password" value={credential.password} which="password" />
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={copyBoth}
                        className="inline-flex items-center gap-2 rounded-lg border border-[#D4D4D8] dark:border-[#333] px-4 py-2 text-sm font-medium text-[#27272A] dark:text-[#EDEDED] transition-colors hover:bg-[#EFEFF1] dark:hover:bg-[#1A1A1A]"
                    >
                        {copied === 'both' ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                        Copy semua
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-emerald-300"
                    >
                        Selesai
                    </button>
                </div>
            </div>
        </div>
    );
}
