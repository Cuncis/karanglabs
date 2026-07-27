import { useState } from 'react';
import { Video, PlayCircle, X } from 'lucide-react';
import Modal from '@/Components/Modal';

/**
 * A self-contained "watch tutorial" button + popup, dropped into any Studio
 * page. Pass `videoUrl` (a YouTube/Vimeo/MP4 embed URL) once a real tutorial
 * exists for that section; until then it shows a placeholder.
 */
export default function VideoTutorialButton({ title = 'Video Tutorial', videoUrl = null }) {
    const [open, setOpen] = useState(false);

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
                        <h2 className="text-lg font-bold text-[#18181B] dark:text-white">{title}</h2>

                        {videoUrl ? (
                            <div className="mt-4 aspect-video w-full overflow-hidden rounded-xl border border-[#E4E4E7] dark:border-[#222] bg-black">
                                <iframe
                                    src={videoUrl}
                                    title={title}
                                    className="h-full w-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        ) : (
                            <div className="mt-4 flex aspect-video w-full flex-col items-center justify-center rounded-xl border border-dashed border-[#D4D4D8] dark:border-[#333] bg-[#FAFAFA] dark:bg-[#0D0D0D] text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/10">
                                    <PlayCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <p className="mt-4 text-sm font-medium text-[#52525B] dark:text-[#A1A1AA]">Video tutorial akan tampil di sini</p>
                                <p className="mt-1 text-xs text-[#9CA3AF] dark:text-[#555]">Ganti placeholder ini dengan video kamu</p>
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        </>
    );
}
