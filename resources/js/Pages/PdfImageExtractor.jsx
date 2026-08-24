import { useCallback, useRef, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import HelpModal from '@/Components/HelpModal';
import AboutModal from '@/Components/AboutModal';

const MAX_SIZE_MB = 30;

function formatBytes(bytes) {
    if (!bytes) {
        return '0 B';
    }
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

async function readErrorMessage(error) {
    const fallback = 'Something went wrong while processing this PDF.';

    // No `response` at all means the connection failed before the server sent
    // anything back — most commonly the server rejecting/resetting an upload
    // that's bigger than its configured post size limit.
    if (!error.response) {
        return 'Upload failed before reaching the server — the file may be too large for the server to accept right now.';
    }

    const data = error.response.data;

    if (data instanceof Blob) {
        try {
            const parsed = JSON.parse(await data.text());
            return parsed.message || fallback;
        } catch {
            return fallback;
        }
    }

    return data?.message || fallback;
}

export default function PdfImageExtractor() {
    const [file, setFile] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [status, setStatus] = useState('idle'); // idle | uploading | processing | done | error
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const [showHelp, setShowHelp] = useState(false);
    const [showAbout, setShowAbout] = useState(false);
    const inputRef = useRef(null);

    const pickFile = (candidate) => {
        setError(null);
        setStatus('idle');
        if (!candidate) {
            return;
        }
        const looksLikePdf = candidate.type === 'application/pdf' || candidate.name.toLowerCase().endsWith('.pdf');
        if (!looksLikePdf) {
            setError('Please choose a PDF file.');
            return;
        }
        if (candidate.size > MAX_SIZE_MB * 1024 * 1024) {
            setError(`That PDF is too large — max ${MAX_SIZE_MB}MB.`);
            return;
        }
        setFile(candidate);
    };

    const onDrop = useCallback((e) => {
        e.preventDefault();
        setDragging(false);
        pickFile(e.dataTransfer.files?.[0]);
    }, []);

    const clearFile = () => {
        setFile(null);
        setStatus('idle');
        setProgress(0);
        setError(null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const extract = async () => {
        if (!file) {
            return;
        }
        setStatus('uploading');
        setProgress(0);
        setError(null);

        const formData = new FormData();
        formData.append('pdf', file);

        try {
            const response = await axios.post(route('pdf-image-extractor.store'), formData, {
                responseType: 'blob',
                onUploadProgress: (evt) => {
                    if (!evt.total) {
                        return;
                    }
                    const pct = Math.round((evt.loaded / evt.total) * 100);
                    setProgress(pct);
                    if (pct >= 100) {
                        setStatus('processing');
                    }
                },
            });

            const contentType = response.headers?.['content-type'] || '';
            if (!contentType.includes('zip') || !(response.data instanceof Blob) || response.data.size === 0) {
                // A 200 response that isn't actually a zip (unexpected body shape,
                // an empty stream, etc.) — surface it as an error instead of
                // silently downloading it as a corrupt "zip" file.
                throw { response: { status: response.status, data: response.data } };
            }

            const blob = new Blob([response.data], { type: 'application/zip' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'extracted-images.zip';
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);

            setStatus('done');
        } catch (err) {
            setError(await readErrorMessage(err));
            setStatus('error');
        }
    };

    const busy = status === 'uploading' || status === 'processing';

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-amber-500/30">
            <Head title="PDF Image Extractor" />

            <main className="container mx-auto max-w-3xl px-4 py-12 md:py-16">
                {/* Header */}
                <div className="mb-10">
                    <div className="mb-8 flex items-center justify-between border-b border-gray-800 pb-4">
                        <Link href="/ai-tools" className="inline-flex w-fit items-center gap-2 rounded-lg border border-gray-800 bg-gray-900 px-4 py-2 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-800 hover:text-white">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Collection
                        </Link>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowAbout(true)}
                                className="flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-400 transition-colors hover:bg-blue-500/20 hover:text-blue-300"
                                title="What is this?"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                What is this?
                            </button>
                            <button
                                onClick={() => setShowHelp(true)}
                                className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-400 transition-colors hover:bg-amber-500/20 hover:text-amber-300"
                                title="How to use this tool"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                How to use
                            </button>
                        </div>
                    </div>

                    <div className="mx-auto max-w-2xl text-center">
                        <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
                            PDF Image{' '}
                            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                                Extractor
                            </span>
                        </h1>
                        <p className="mt-4 text-lg text-gray-400">
                            Drop a PDF, get back a ZIP of every embedded JPG/PNG image, compressed without a visible quality loss. Nothing is saved — the file is deleted the moment it's processed.
                        </p>
                    </div>
                </div>

                <HelpModal
                    show={showHelp}
                    onClose={() => setShowHelp(false)}
                    title="PDF Image Extractor"
                    steps={[
                        { title: 'Drop your PDF', description: `Drag a PDF onto the box below, or click to browse. Max ${MAX_SIZE_MB}MB.` },
                        { title: 'Extract & Compress', description: 'The original embedded JPG/PNG images are pulled out of the PDF as-is (never a screenshot of the page) and re-compressed to a smaller file size with no visible quality loss.' },
                        { title: 'Download the ZIP', description: 'A ZIP of every extracted image downloads automatically. The PDF and images are deleted from the server right after — nothing is kept.' },
                    ]}
                />

                <AboutModal
                    show={showAbout}
                    onClose={() => setShowAbout(false)}
                    title="PDF Image Extractor"
                    description="Pulls the original embedded JPG/PNG images out of a PDF — not a screenshot of each page — and compresses them to a smaller file size without a visible quality loss. Everything happens in a single request: the PDF, extracted images, and the ZIP are all temporary and deleted immediately after your download starts. Nothing is stored in a database or kept on the server."
                    category="Code & Data Lifesavers"
                />

                {/* Drop zone */}
                {!file ? (
                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={onDrop}
                        onClick={() => inputRef.current?.click()}
                        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-20 text-center transition-colors ${
                            dragging ? 'border-amber-400 bg-amber-400/5' : 'border-gray-800 bg-gray-900/40 hover:border-gray-700'
                        }`}
                    >
                        <svg className="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-6 4h6m2 4H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-base font-semibold text-white">Drop your PDF here</p>
                        <p className="text-sm text-gray-500">or click to browse · max {MAX_SIZE_MB}MB</p>
                        <input
                            ref={inputRef}
                            type="file"
                            accept="application/pdf,.pdf"
                            className="hidden"
                            onChange={(e) => pickFile(e.target.files?.[0])}
                        />
                    </div>
                ) : (
                    <div className="rounded-2xl border border-gray-800 bg-gray-900/40 p-6">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-6 4h6m2 4H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-white">{file.name}</p>
                                    <p className="text-xs text-gray-500">{formatBytes(file.size)}</p>
                                </div>
                            </div>
                            {!busy && (
                                <button onClick={clearFile} className="flex-shrink-0 text-xs font-medium text-gray-500 hover:text-gray-300">
                                    Change file
                                </button>
                            )}
                        </div>

                        {/* Progress / steps */}
                        {(busy || status === 'done') && (
                            <div className="mt-5 space-y-2.5">
                                <StepRow
                                    label={status === 'uploading' ? `Uploading… ${progress}%` : 'Uploaded'}
                                    state={status === 'uploading' ? 'active' : 'done'}
                                />
                                <StepRow
                                    label="Extracting & compressing images"
                                    state={status === 'processing' ? 'active' : status === 'done' ? 'done' : 'pending'}
                                />
                                <StepRow
                                    label="Download ready"
                                    state={status === 'done' ? 'done' : 'pending'}
                                />
                            </div>
                        )}

                        {status === 'done' && (
                            <p className="mt-4 text-sm text-emerald-400">
                                Done — your download should have started. Didn't get it?{' '}
                                <button onClick={extract} className="font-semibold underline decoration-dotted underline-offset-2">
                                    Try again
                                </button>
                            </p>
                        )}

                        {!busy && status !== 'done' && (
                            <button
                                onClick={extract}
                                className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-amber-400 px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-amber-300"
                            >
                                Extract & Compress Images
                            </button>
                        )}
                    </div>
                )}

                {error && (
                    <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                        {error}
                    </p>
                )}
            </main>
        </div>
    );
}

function StepRow({ label, state }) {
    return (
        <div className="flex items-center gap-3 text-sm">
            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full">
                {state === 'done' && (
                    <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                )}
                {state === 'active' && (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
                )}
                {state === 'pending' && <span className="h-1.5 w-1.5 rounded-full bg-gray-700" />}
            </span>
            <span className={state === 'pending' ? 'text-gray-600' : 'text-gray-300'}>{label}</span>
        </div>
    );
}
