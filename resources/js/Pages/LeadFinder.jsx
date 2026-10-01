import { useEffect, useRef, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import HelpModal from '@/Components/HelpModal';
import AboutModal from '@/Components/AboutModal';

const POLL_MS = 2000;

const PROFILE_FIELDS = [
    { key: 'one_liner', label: 'One-liner' },
    { key: 'offers', label: 'What they offer', list: true },
    { key: 'target_customers', label: 'Who they serve', list: true },
    { key: 'differentiators', label: 'What makes them different', list: true },
    { key: 'proof_points', label: 'Proof points', list: true },
    { key: 'tone', label: 'Tone of voice' },
];

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
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
                )}
                {state === 'pending' && <span className="h-1.5 w-1.5 rounded-full bg-gray-700" />}
                {state === 'failed' && (
                    <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                )}
            </span>
            <span className={state === 'pending' ? 'text-gray-600' : 'text-gray-300'}>{label}</span>
        </div>
    );
}

function EvidenceField({ label, value, quote, list }) {
    const hasValue = list ? Array.isArray(value) && value.length > 0 : Boolean(value);

    return (
        <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
            {hasValue ? (
                list ? (
                    <ul className="mt-1.5 list-inside list-disc space-y-1 text-sm text-gray-200">
                        {value.map((item, i) => (
                            <li key={i}>{item}</li>
                        ))}
                    </ul>
                ) : (
                    <p className="mt-1.5 text-sm text-gray-200">{value}</p>
                )
            ) : (
                <p className="mt-1.5 text-sm italic text-gray-600">Not found on the site</p>
            )}
            {quote && (
                <p className="mt-2 border-l-2 border-cyan-500/40 pl-3 text-xs italic text-gray-500">
                    &ldquo;{quote}&rdquo;, where this came from
                </p>
            )}
        </div>
    );
}

function TagList({ items }) {
    if (!Array.isArray(items) || items.length === 0) {
        return null;
    }

    return (
        <div className="mt-2 flex flex-wrap gap-1.5">
            {items.map((item, i) => (
                <span key={i} className="rounded-full border border-gray-700 bg-gray-950 px-2.5 py-0.5 text-xs text-gray-400">
                    {item}
                </span>
            ))}
        </div>
    );
}

function SegmentCard({ segment, onToggle, onFindCompanies, isActive }) {
    const filters = segment.search_filters || {};

    return (
        <div className={`rounded-xl border p-5 transition-colors ${segment.is_enabled ? 'border-cyan-500/30 bg-cyan-500/5' : 'border-gray-800 bg-gray-900/40 opacity-60'}`}>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-base font-bold capitalize text-white">{segment.name}</h3>
                    {segment.fit_score !== null && segment.fit_score !== undefined && (
                        <p className="mt-0.5 text-xs text-gray-500">{segment.fit_score}/100 fit{segment.fit_reason ? ` · ${segment.fit_reason}` : ''}</p>
                    )}
                </div>
                <label className="flex flex-shrink-0 cursor-pointer items-center gap-2 text-xs text-gray-400">
                    <input
                        type="checkbox"
                        checked={Boolean(segment.is_enabled)}
                        onChange={() => onToggle(segment)}
                        className="h-4 w-4 rounded border-gray-700 bg-gray-950 text-cyan-400 focus:ring-cyan-400"
                    />
                    Target this
                </label>
            </div>

            <button
                type="button"
                onClick={() => onFindCompanies(segment)}
                className={`mt-3 w-full rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    isActive ? 'border-cyan-400 bg-cyan-400 text-black' : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20'
                }`}
            >
                {isActive ? 'Hide Companies' : `Find Companies${segment.companies_count > 0 ? ` (${segment.companies_count})` : ''}`}
            </button>

            {segment.pain && <p className="mt-3 text-sm text-gray-300"><span className="font-semibold text-gray-400">Pain: </span>{segment.pain}</p>}
            {segment.offer_angle && <p className="mt-1.5 text-sm text-gray-300"><span className="font-semibold text-gray-400">First step: </span>{segment.offer_angle}</p>}

            {Array.isArray(segment.criteria) && segment.criteria.length > 0 && (
                <ul className="mt-3 space-y-1 text-xs text-gray-400">
                    {segment.criteria.map((c, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                            <span className="mt-0.5 text-cyan-500">?</span>
                            {c}
                        </li>
                    ))}
                </ul>
            )}

            <TagList items={segment.example_company_types} />
            <TagList items={filters.industry} />
            <TagList items={filters.keywords} />

            {segment.estimated_size && (
                <p className="mt-3 text-xs text-gray-500">Estimated size: {segment.estimated_size}</p>
            )}
        </div>
    );
}

const COMPANY_TABS = [
    ['map', 'Search a City'],
    ['paste', 'Paste URLs'],
    ['csv', 'Upload CSV'],
];

function CompanyFinderPanel({ project, segment, onClose }) {
    const [companies, setCompanies] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [tab, setTab] = useState('map');
    const [city, setCity] = useState('');
    const [pasteText, setPasteText] = useState('');
    const [csvFile, setCsvFile] = useState(null);
    const [mapStatus, setMapStatus] = useState('idle'); // idle | searching | done | error
    const [mapNote, setMapNote] = useState(null);
    const [mapError, setMapError] = useState(null);
    const [importResult, setImportResult] = useState(null);
    const [importBusy, setImportBusy] = useState(false);
    const pollRef = useRef(null);

    const refresh = async () => {
        const { data } = await axios.get(route('lead-finder.companies.index', [project.id, segment.id]));
        setCompanies(data.companies);
        setLoaded(true);

        return data;
    };

    useEffect(() => {
        refresh();

        return () => clearInterval(pollRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [segment.id]);

    const searchMap = async (e) => {
        e.preventDefault();
        setMapError(null);
        setMapNote(null);
        setMapStatus('searching');

        try {
            await axios.post(route('lead-finder.companies.map', [project.id, segment.id]), { city });
            clearInterval(pollRef.current);
            pollRef.current = setInterval(async () => {
                try {
                    const data = await refresh();
                    const stepStatus = data.step?.status;
                    if (stepStatus === 'completed' || stepStatus === 'failed') {
                        clearInterval(pollRef.current);
                        setMapStatus(stepStatus === 'completed' ? 'done' : 'error');
                        if (stepStatus === 'completed') {
                            setMapNote(data.step.note);
                        } else {
                            setMapError(data.step.failure_reason || 'This could not be completed.');
                        }
                    }
                } catch {
                    clearInterval(pollRef.current);
                    setMapStatus('error');
                    setMapError('Lost connection while checking progress. Please try again.');
                }
            }, POLL_MS);
        } catch (err) {
            setMapStatus('error');
            setMapError(err.response?.data?.error || 'Something went wrong starting this search.');
        }
    };

    const submitPaste = async (e) => {
        e.preventDefault();
        setImportBusy(true);
        setImportResult(null);

        try {
            const { data } = await axios.post(route('lead-finder.companies.paste', [project.id, segment.id]), { text: pasteText });
            setImportResult(data);
            setPasteText('');
            await refresh();
        } catch (err) {
            setImportResult({ imported: 0, duplicates: 0, errors: [{ message: err.response?.data?.error || 'Something went wrong.' }] });
        } finally {
            setImportBusy(false);
        }
    };

    const submitCsv = async (e) => {
        e.preventDefault();
        if (!csvFile) {
            return;
        }
        setImportBusy(true);
        setImportResult(null);

        const formData = new FormData();
        formData.append('file', csvFile);

        try {
            const { data } = await axios.post(route('lead-finder.companies.csv', [project.id, segment.id]), formData);
            setImportResult(data);
            setCsvFile(null);
            await refresh();
        } catch (err) {
            setImportResult({ imported: 0, duplicates: 0, errors: [{ message: err.response?.data?.error || 'Something went wrong.' }] });
        } finally {
            setImportBusy(false);
        }
    };

    const hasEmail = companies.some((c) => c.email);

    return (
        <div className="mt-6 rounded-2xl border border-gray-800 bg-gray-900/40 p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
                <h3 className="text-lg font-bold text-white">
                    Find companies: <span className="capitalize text-cyan-400">{segment.name}</span>
                </h3>
                <button onClick={onClose} className="flex-shrink-0 text-sm text-gray-500 hover:text-gray-300">
                    Close
                </button>
            </div>

            <div className="mb-4 flex w-fit gap-1 rounded-lg border border-gray-800 bg-gray-950 p-1">
                {COMPANY_TABS.map(([key, label]) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => setTab(key)}
                        className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${tab === key ? 'bg-cyan-400 text-black' : 'text-gray-400 hover:text-white'}`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {tab === 'map' && (
                <>
                    <form onSubmit={searchMap} className="flex flex-col gap-2 sm:flex-row">
                        <input
                            type="text"
                            required
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            disabled={mapStatus === 'searching'}
                            placeholder="e.g. Austin, TX"
                            className="flex-1 rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-cyan-400 focus:outline-none disabled:opacity-50"
                        />
                        <button
                            type="submit"
                            disabled={mapStatus === 'searching' || !city}
                            className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {mapStatus === 'searching' ? 'Searching…' : 'Search'}
                        </button>
                    </form>
                    {mapStatus === 'searching' && (
                        <div className="mt-3">
                            <StepRow label="Searching the map (this can take a little while)" state="active" />
                        </div>
                    )}
                    {mapStatus === 'error' && mapError && (
                        <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">{mapError}</p>
                    )}
                    {mapStatus === 'done' && mapNote && (
                        <p className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400">{mapNote}</p>
                    )}
                </>
            )}

            {tab === 'paste' && (
                <form onSubmit={submitPaste}>
                    <textarea
                        rows={4}
                        value={pasteText}
                        onChange={(e) => setPasteText(e.target.value)}
                        placeholder={'https://example.com\nName | https://example.com | email@example.com'}
                        className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-cyan-400 focus:outline-none"
                    />
                    <p className="mt-1 text-xs text-gray-500">One company per line: just a website, or "Name | website | email".</p>
                    <button
                        type="submit"
                        disabled={importBusy || !pasteText.trim()}
                        className="mt-2 rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {importBusy ? 'Adding…' : 'Add Companies'}
                    </button>
                </form>
            )}

            {tab === 'csv' && (
                <form onSubmit={submitCsv}>
                    <input
                        type="file"
                        accept=".csv,text/csv"
                        onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                        className="block w-full text-sm text-gray-400 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-800 file:px-3 file:py-2 file:text-sm file:text-gray-300 hover:file:bg-gray-700"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        Columns: name, site (required), plus optional description, location, country, contact_name,
                        contact_title, contact_email. Max 5MB.
                    </p>
                    <button
                        type="submit"
                        disabled={importBusy || !csvFile}
                        className="mt-2 rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {importBusy ? 'Uploading…' : 'Upload'}
                    </button>
                </form>
            )}

            {importResult && (
                <div className="mt-3 text-xs text-gray-400">
                    <p>
                        Added {importResult.imported}, skipped {importResult.duplicates} already in your list
                        {importResult.errors?.length > 0 ? `, ${importResult.errors.length} row(s) had a problem` : ''}.
                    </p>
                    {importResult.errors?.length > 0 && (
                        <ul className="mt-1 space-y-0.5 text-red-400">
                            {importResult.errors.slice(0, 10).map((err, i) => (
                                <li key={i}>
                                    {err.line ? `Line ${err.line}: ` : err.row ? `Row ${err.row}: ` : ''}
                                    {err.message}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            <div className="mt-6">
                <div className="mb-2 flex items-center justify-between gap-4">
                    <h4 className="text-sm font-semibold text-gray-300">
                        {companies.length} compan{companies.length === 1 ? 'y' : 'ies'} found
                    </h4>
                    {companies.length > 0 && (
                        <a
                            href={route('lead-finder.companies.export', [project.id, segment.id])}
                            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                        >
                            Download CSV
                        </a>
                    )}
                </div>

                {companies.length > 0 ? (
                    <div className="overflow-x-auto rounded-lg border border-gray-800">
                        <table className="min-w-full divide-y divide-gray-800 text-left text-xs">
                            <thead className="bg-gray-950 text-gray-500">
                                <tr>
                                    <th className="px-3 py-2 font-medium">Name</th>
                                    <th className="px-3 py-2 font-medium">Website</th>
                                    <th className="px-3 py-2 font-medium">Location</th>
                                    {hasEmail && <th className="px-3 py-2 font-medium">Email</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800 text-gray-300">
                                {companies.map((c) => (
                                    <tr key={c.id}>
                                        <td className="px-3 py-2">{c.name || '-'}</td>
                                        <td className="px-3 py-2">
                                            <a href={c.website} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">
                                                {c.website}
                                            </a>
                                        </td>
                                        <td className="px-3 py-2">{c.location || '-'}</td>
                                        {hasEmail && <td className="px-3 py-2">{c.email || '-'}</td>}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    loaded && <p className="text-xs italic text-gray-600">No companies yet, try one of the methods above.</p>
                )}
            </div>
        </div>
    );
}

function ProfileResult({ profile }) {
    const evidence = profile.evidence || {};

    return (
        <div className="space-y-4">
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-5">
                <h2 className="text-xl font-bold text-white">{profile.name || 'Company profile'}</h2>
                <p className="mt-1 text-sm text-gray-400">
                    {[profile.country, profile.language].filter(Boolean).join(' · ') || 'Country and language not found on the site'}
                </p>
            </div>

            {PROFILE_FIELDS.map((field) => (
                <EvidenceField
                    key={field.key}
                    label={field.label}
                    value={profile[field.key]}
                    quote={evidence[field.key]}
                    list={field.list}
                />
            ))}

            {Array.isArray(profile.keywords) && profile.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {profile.keywords.map((keyword, i) => (
                        <span key={i} className="rounded-full border border-gray-700 bg-gray-900 px-3 py-1 text-xs text-gray-300">
                            {keyword}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

function segmentsStepStatus(data) {
    return data?.steps?.find((s) => s.step === 'segments')?.status;
}

export default function LeadFinder({ history }) {
    const [url, setUrl] = useState('');
    const [status, setStatus] = useState('idle'); // idle | submitting | processing | done | error
    const [project, setProject] = useState(null);
    const [error, setError] = useState(null);
    const [segmentsStatus, setSegmentsStatus] = useState('idle'); // idle | generating | done | error
    const [segmentsError, setSegmentsError] = useState(null);
    const [activeSegmentId, setActiveSegmentId] = useState(null);
    const [showHelp, setShowHelp] = useState(false);
    const [showAbout, setShowAbout] = useState(false);
    const pollRef = useRef(null);

    useEffect(() => () => clearInterval(pollRef.current), []);

    const pollUntil = (id, isDone, onDone) => {
        clearInterval(pollRef.current);
        pollRef.current = setInterval(async () => {
            try {
                const { data } = await axios.get(route('lead-finder.show', id));
                setProject(data);
                if (isDone(data)) {
                    clearInterval(pollRef.current);
                    onDone(data);
                }
            } catch {
                clearInterval(pollRef.current);
                onDone(null);
            }
        }, POLL_MS);
    };

    const submit = async (e) => {
        e.preventDefault();
        setError(null);
        setStatus('submitting');
        setProject(null);
        setSegmentsStatus('idle');
        setSegmentsError(null);
        setActiveSegmentId(null);

        try {
            const { data } = await axios.post(route('lead-finder.store'), { source_url: url });
            setStatus('processing');
            pollUntil(
                data.id,
                (d) => d.status === 'completed' || d.status === 'failed',
                (d) => {
                    if (!d) {
                        setStatus('error');
                        setError('Lost connection while checking progress. Please try again.');
                        return;
                    }
                    setStatus(d.status === 'completed' ? 'done' : 'error');
                    if (d.status === 'failed') {
                        setError(d.failure_reason || 'This could not be completed.');
                    }
                }
            );
        } catch (err) {
            setStatus('error');
            setError(err.response?.data?.error || 'Something went wrong starting this.');
        }
    };

    const generateSegments = async () => {
        if (!project) {
            return;
        }
        setSegmentsError(null);
        setSegmentsStatus('generating');

        try {
            await axios.post(route('lead-finder.segments.store', project.id));
            pollUntil(
                project.id,
                (d) => {
                    const s = segmentsStepStatus(d);
                    return s === 'completed' || s === 'failed';
                },
                (d) => {
                    if (!d) {
                        setSegmentsStatus('error');
                        setSegmentsError('Lost connection while checking progress. Please try again.');
                        return;
                    }
                    const s = segmentsStepStatus(d);
                    setSegmentsStatus(s === 'completed' ? 'done' : 'error');
                    if (s === 'failed') {
                        const reason = d.steps?.find((step) => step.step === 'segments')?.failure_reason;
                        setSegmentsError(reason || 'This could not be completed.');
                    }
                }
            );
        } catch (err) {
            setSegmentsStatus('error');
            setSegmentsError(err.response?.data?.error || 'Something went wrong starting this.');
        }
    };

    const toggleSegment = async (segment) => {
        const next = !segment.is_enabled;
        setProject((prev) => ({
            ...prev,
            segments: prev.segments.map((s) => (s.id === segment.id ? { ...s, is_enabled: next } : s)),
        }));

        try {
            await axios.patch(route('lead-finder.segments.update', [project.id, segment.id]), { is_enabled: next });
        } catch {
            setProject((prev) => ({
                ...prev,
                segments: prev.segments.map((s) => (s.id === segment.id ? { ...s, is_enabled: !next } : s)),
            }));
        }
    };

    const loadFromHistory = async (item) => {
        clearInterval(pollRef.current);
        setUrl(item.source_url);
        setStatus(item.status === 'completed' ? 'done' : item.status === 'failed' ? 'error' : 'idle');
        setError(item.status === 'failed' ? item.failure_reason : null);
        setSegmentsStatus('idle');
        setSegmentsError(null);
        setActiveSegmentId(null);

        try {
            const { data } = await axios.get(route('lead-finder.show', item.id));
            setProject(data);
            const s = segmentsStepStatus(data);
            if (s) {
                setSegmentsStatus(s === 'completed' ? 'done' : s === 'failed' ? 'error' : 'idle');
                if (s === 'failed') {
                    setSegmentsError(data.steps?.find((step) => step.step === 'segments')?.failure_reason);
                }
            }
        } catch {
            setProject(item);
        }
    };

    const busy = status === 'submitting' || status === 'processing';
    const stepState = project?.steps?.find((s) => s.step === 'fetch_profile')?.status;

    return (
        <div className="min-h-screen bg-[#0B0A0F] text-white selection:bg-cyan-500/30">
            <Head title="Lead Finder" />

            <main className="container mx-auto max-w-3xl px-4 py-12 md:py-16">
                <div className="mb-10">
                    <div className="mb-8 flex items-center justify-between border-b border-gray-800 pb-4">
                        <Link href="/ai-tools" className="inline-flex w-fit items-center gap-2 rounded-lg border border-gray-800 bg-gray-900 px-4 py-2 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-800 hover:text-white">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Collection
                        </Link>

                        <div className="flex items-center gap-3">
                            <button onClick={() => setShowAbout(true)} className="flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-400 transition-colors hover:bg-blue-500/20 hover:text-blue-300" title="What is this?">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                What is this?
                            </button>
                            <button onClick={() => setShowHelp(true)} className="flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-400 transition-colors hover:bg-cyan-500/20 hover:text-cyan-300" title="How to use this tool">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                How to use
                            </button>
                        </div>
                    </div>

                    <div className="mx-auto max-w-2xl text-center">
                        <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
                            Lead{' '}
                            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                                Finder
                            </span>
                        </h1>
                        <p className="mt-4 text-lg text-gray-400">
                            Paste your website URL. We'll read your homepage and About/Services pages and build a
                            company profile, grounded only in real quotes from your own site, never guessed.
                        </p>
                    </div>
                </div>

                <HelpModal
                    show={showHelp}
                    onClose={() => setShowHelp(false)}
                    title="Lead Finder"
                    steps={[
                        { title: 'Paste your website URL', description: 'Enter your own company\'s website address and submit.' },
                        { title: 'We read it politely', description: 'Your homepage plus About/Services pages are fetched, respecting robots.txt, and never anything behind a login.' },
                        { title: 'Get a verified profile', description: 'Every claim comes with the exact quote from your site it was built from. Anything not clearly on your site is left blank instead of guessed.' },
                        { title: 'See who to target', description: 'Click "Suggest Who to Target" for 4 to 6 concrete business types worth prospecting. Switch any segment off if it is not a fit, you decide who to go after.' },
                        { title: 'Find real companies', description: 'Click "Find Companies" on any segment. Search a city on the map, paste a list of websites, or upload a CSV, all three feed the same list with duplicates removed. Download the results as a CSV any time.' },
                    ]}
                />

                <AboutModal
                    show={showAbout}
                    onClose={() => setShowAbout(false)}
                    title="Lead Finder"
                    description="Reads your company's own website and builds a structured profile (what you offer, who you serve, what makes you different) using only your own words. Every field shows the exact quote it came from, and anything the site doesn't clearly say is left blank rather than invented."
                    category="Business & Freelance"
                />

                <form onSubmit={submit} className="rounded-2xl border border-gray-800 bg-gray-900/40 p-6">
                    <label htmlFor="source_url" className="text-sm font-medium text-gray-300">
                        Your website URL
                    </label>
                    <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                        <input
                            id="source_url"
                            type="url"
                            required
                            disabled={busy}
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com"
                            className="w-full flex-1 rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 disabled:opacity-50"
                        />
                        <button
                            type="submit"
                            disabled={busy || !url}
                            className="flex items-center justify-center gap-2 rounded-lg bg-cyan-400 px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {busy ? 'Reading…' : 'Read My Website'}
                        </button>
                    </div>
                </form>

                {busy && (
                    <div className="mt-6 space-y-2.5 rounded-xl border border-gray-800 bg-gray-900/40 p-5">
                        <StepRow label="Starting up" state="done" />
                        <StepRow
                            label="Reading your website and asking AI to build your profile (this can take up to a minute)"
                            state={stepState === 'failed' ? 'failed' : status === 'done' ? 'done' : 'active'}
                        />
                    </div>
                )}

                {error && status === 'error' && (
                    <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                        {error}
                    </p>
                )}

                {status === 'done' && project?.profile && (
                    <div className="mt-6">
                        <ProfileResult profile={project.profile} />
                    </div>
                )}

                {status === 'done' && project?.profile && (
                    <div className="mt-10 border-t border-gray-800 pt-8">
                        <div className="mb-4 flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-white">Who to target</h2>
                                <p className="mt-1 text-sm text-gray-400">
                                    4 to 6 concrete, searchable business types worth prospecting, each with a pain point
                                    and a low-friction first offer.
                                </p>
                            </div>
                            {segmentsStatus !== 'generating' && (
                                <button
                                    onClick={generateSegments}
                                    className="flex-shrink-0 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-400 transition-colors hover:bg-cyan-500/20"
                                >
                                    {project.segments?.length > 0 ? 'Regenerate' : 'Suggest Who to Target'}
                                </button>
                            )}
                        </div>

                        {segmentsStatus === 'generating' && (
                            <div className="space-y-2.5 rounded-xl border border-gray-800 bg-gray-900/40 p-5">
                                <StepRow label="Thinking about who would want this (this can take up to a minute)" state="active" />
                            </div>
                        )}

                        {segmentsStatus === 'error' && segmentsError && (
                            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                                {segmentsError}
                            </p>
                        )}

                        {project.segments?.length > 0 && (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {project.segments.map((segment) => (
                                    <SegmentCard
                                        key={segment.id}
                                        segment={segment}
                                        onToggle={toggleSegment}
                                        onFindCompanies={(s) => setActiveSegmentId(activeSegmentId === s.id ? null : s.id)}
                                        isActive={activeSegmentId === segment.id}
                                    />
                                ))}
                            </div>
                        )}

                        {activeSegmentId && project.segments?.find((s) => s.id === activeSegmentId) && (
                            <CompanyFinderPanel
                                project={project}
                                segment={project.segments.find((s) => s.id === activeSegmentId)}
                                onClose={() => setActiveSegmentId(null)}
                            />
                        )}
                    </div>
                )}

                {history && history.length > 0 && (
                    <div className="mt-10 border-t border-gray-800 pt-6">
                        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Recent websites</h3>
                        <div className="space-y-2">
                            {history.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => loadFromHistory(item)}
                                    className="flex w-full items-center justify-between rounded-lg border border-gray-800 bg-gray-900/40 px-4 py-3 text-left text-sm hover:border-gray-700"
                                >
                                    <span className="truncate text-gray-300">{item.source_url}</span>
                                    <span
                                        className={`ml-3 flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                                            item.status === 'completed'
                                                ? 'bg-emerald-500/15 text-emerald-400'
                                                : item.status === 'failed'
                                                  ? 'bg-red-500/15 text-red-400'
                                                  : 'bg-gray-700/40 text-gray-400'
                                        }`}
                                    >
                                        {item.status}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
