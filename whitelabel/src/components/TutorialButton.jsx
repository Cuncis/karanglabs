import { useState } from 'react';
import { Video, PlayCircle, X } from 'lucide-react';
import Modal from '@/components/Modal';
import { CONFIG } from '@/config';

/**
 * A self-contained "watch tutorial" button + popup. Videos come from
 * CONFIG.tutorialVideos in config.js — add your own recorded walkthroughs there.
 */
export default function TutorialButton() {
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(0);
    const videos = CONFIG.tutorialVideos.length ? CONFIG.tutorialVideos : [{ title: 'Video Tutorial', videoUrl: '' }];
    const current = videos[active];

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                title="Tonton video tutorial cara pakai"
                className="inline-flex items-center gap-1.5 rounded-md border border-[#D4D4D8] dark:border-[#333] px-3 py-1.5 text-xs font-medium text-[#27272A] dark:text-[#EDEDED] transition-colors hover:border-[#A1A1AA] dark:hover:border-[#555] hover:bg-[#EFEFF1] dark:hover:bg-[#161616]"
            >
                <Video className="h-3.5 w-3.5" /> Tutorial
            </button>

            <Modal show={open} onClose={() => setOpen(false)} maxWidth="2xl">
                <div className="relative overflow-hidden rounded-2xl border border-[#E4E4E7] dark:border-[#222] bg-white dark:bg-[#111] text-[#27272A] dark:text-[#EDEDED]">
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="absolute right-4 top-4 z-10 rounded-full bg-black/40 p-1.5 text-[#A1A1AA] transition-colors hover:bg-black/60 hover:text-white"
                        aria-label="Tutup"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    <div className="p-6 sm:p-8">
                        {videos.length > 1 && (
                            <div className="flex flex-wrap gap-2">
                                {videos.map((v, i) => (
                                    <button
                                        key={v.title}
                                        type="button"
                                        onClick={() => setActive(i)}
                                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                                            i === active
                                                ? 'bg-brand-400 text-black'
                                                : 'border border-[#D4D4D8] dark:border-[#333] text-[#52525B] dark:text-[#A1A1AA] hover:bg-[#EFEFF1] dark:hover:bg-[#161616]'
                                        }`}
                                    >
                                        {v.title}
                                    </button>
                                ))}
                            </div>
                        )}

                        <h2 className="mt-4 text-lg font-bold text-[#18181B] dark:text-white">{current.title}</h2>

                        {current.videoUrl ? (
                            <div className="mt-4 aspect-video w-full overflow-hidden rounded-xl border border-[#E4E4E7] dark:border-[#222] bg-black">
                                <iframe
                                    key={current.videoUrl}
                                    src={current.videoUrl}
                                    title={current.title}
                                    className="h-full w-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        ) : (
                            <div className="mt-4 flex aspect-video w-full flex-col items-center justify-center rounded-xl border border-dashed border-[#D4D4D8] dark:border-[#333] bg-[#FAFAFA] dark:bg-[#0D0D0D] text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-400/10">
                                    <PlayCircle className="h-6 w-6 text-brand-600 dark:text-brand-400" />
                                </div>
                                <p className="mt-4 text-sm font-medium text-[#52525B] dark:text-[#A1A1AA]">Video tutorial akan tampil di sini</p>
                                <p className="mt-1 text-xs text-[#9CA3AF] dark:text-[#555]">Isi videoUrl di config.js untuk video ini</p>
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        </>
    );
}
