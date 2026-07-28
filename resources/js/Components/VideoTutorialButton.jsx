import { useState } from 'react';
import { Video, X } from 'lucide-react';
import Modal from '@/Components/Modal';

const VIDEOS = [
    { title: 'Tutorial Penggunaan Engine Karanglabs', videoUrl: 'https://www.youtube.com/embed/52TFeYN_L-s' },
    { title: 'Tutorial Publish Website Karanglabs', videoUrl: 'https://www.youtube.com/embed/0RWdR4Inkt4' },
];

/**
 * A self-contained "watch tutorial" button + popup, dropped into any Studio
 * page. Lists both Karanglabs tutorial videos with a tab switcher.
 */
export default function VideoTutorialButton() {
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(0);
    const current = VIDEOS[active];

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
                        <div className="flex flex-wrap gap-2">
                            {VIDEOS.map((v, i) => (
                                <button
                                    key={v.title}
                                    type="button"
                                    onClick={() => setActive(i)}
                                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                                        i === active
                                            ? 'bg-emerald-400 text-black'
                                            : 'border border-[#D4D4D8] dark:border-[#333] text-[#52525B] dark:text-[#A1A1AA] hover:bg-[#EFEFF1] dark:hover:bg-[#161616]'
                                    }`}
                                >
                                    {v.title}
                                </button>
                            ))}
                        </div>

                        <h2 className="mt-4 text-lg font-bold text-[#18181B] dark:text-white">{current.title}</h2>

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
                    </div>
                </div>
            </Modal>
        </>
    );
}
