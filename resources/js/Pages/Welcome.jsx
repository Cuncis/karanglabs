import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import Dropdown from '@/Components/Dropdown';

export default function Welcome({ auth, laravelVersion, phpVersion, dynamicTools }) {
    const [showLoginModal, setShowLoginModal] = useState(false);

    const flagshipTools = [
        {
            title: 'Planner',
            description: 'Organize your day, track your goals, and manage your tasks efficiently with our intelligent planner tool.',
            color: 'indigo',
            category: 'Daily Productivity',
            href: route('planner'),
            icon: `<svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>`
        },
        {
            title: 'Context Bundler',
            description: 'Select or paste code files to instantly generate perfectly formatted context prompts for AI.',
            color: 'pink',
            category: 'Daily Productivity',
            href: route('bundler'),
            icon: `<svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>`
        },
        {
            title: 'Micro-Copy Master',
            description: 'Generate perfect, high-converting UX copy for any component in professional, playful, and direct tones.',
            color: 'cyan',
            category: 'Daily Productivity',
            href: route('micro-copy'),
            icon: `<svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>`
        },
        {
            title: 'Regex & Schema',
            description: 'Describe what you need in plain English and instantly get the exact regex, SQL, or Eloquent query you need.',
            color: 'emerald',
            category: 'Daily Productivity',
            href: route('whisperer'),
            icon: `<svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>`
        },
        {
            title: 'Changelog & Tweet',
            description: 'Turn messy commit messages and quick notes into polished, engaging changelogs and social media posts instantly.',
            color: 'orange',
            category: 'Daily Productivity',
            href: route('changelog'),
            icon: `<svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>`
        },
        {
            title: 'Terminal Converter',
            description: 'Convert plain text and terminal outputs into clean, readable HTML markdown that you can save and share.',
            color: 'slate',
            category: 'Code & Data Lifesavers',
            href: route('terminal-converter.index'),
            icon: `<svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>`
        },
        {
            title: 'Social Media Repurposer',
            description: 'Write one paragraph and instantly get perfectly optimized, human-sounding posts for 6 major social platforms.',
            color: 'rose',
            category: 'Marketing & SEO',
            href: route('socializer'),
            icon: `<svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>`
        },
        {
            title: 'Dork Hunter',
            description: 'Save Google-style search dorks and let them run automatically every 2 hours, pushing brand-new matches straight to your Telegram.',
            color: 'red',
            category: 'Code & Data Lifesavers',
            href: route('dork-hunter.index'),
            icon: `<svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>`
        },
        {
            title: 'Job Finder Pro',
            description: 'Turn your messy background details into a perfect, human-sounding resume and a compelling email for HR to help you land your dream job.',
            color: 'blue',
            category: 'Career & Professional',
            href: route('jobseeker'),
            icon: `<svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>`
        }
    ];

    // Combine static and dynamic tools
    const allTools = [...flagshipTools];
    if (dynamicTools) {
        Object.entries(dynamicTools).forEach(([slug, tool]) => {
            allTools.push({
                ...tool,
                icon: tool.icon.replace('w-6 h-6', 'w-4 h-4'), // Shrink SVGs slightly for minimalist look
                href: route('dynamic-tool', { slug })
            });
        });
    }

    // Group tools by category
    const groupedTools = allTools.reduce((acc, tool) => {
        const cat = tool.category || 'Other Tools';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(tool);
        return acc;
    }, {});

    const categoryOrder = [
        'Daily Productivity',
        'Code & Data Lifesavers',
        'DevOps & Architecture',
        'Frontend & UI/UX',
        'Marketing & SEO',
        'Business & Freelance',
        'Career & Professional',
        'Other Tools'
    ];

    const categoryIcons = {
        'Daily Productivity': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
        'Code & Data Lifesavers': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
        'DevOps & Architecture': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
        'Frontend & UI/UX': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
        'Marketing & SEO': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
        'Business & Freelance': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
        'Career & Professional': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
        'Other Tools': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
    };

    const sortedCategories = Object.keys(groupedTools).sort((a, b) => {
        let idxA = categoryOrder.indexOf(a);
        let idxB = categoryOrder.indexOf(b);
        if (idxA === -1) idxA = 999;
        if (idxB === -1) idxB = 999;
        return idxA - idxB;
    });

    return (
        <>
            <Head title="KarangLabs Directory" />
            <div className="min-h-screen bg-[#0A0A0A] text-[#EDEDED] font-sans selection:bg-white selection:text-black">
                
                <div className="max-w-6xl mx-auto px-6 py-12 lg:py-16 flex flex-col">
                    
                    {/* Header Nav */}
                    <header className="w-full flex justify-between items-center mb-16 border-b border-[#222] pb-6">
                        <div className="text-xl font-bold tracking-tight text-white flex items-center gap-3">
                            <img src="https://cdn.libradigital.id/logo-01%20(1)%20(1).png" alt="KarangLabs Logo" className="w-8 h-8 object-contain rounded-md" />
                            KarangLabs Directory
                        </div>
                        <nav className="flex items-center gap-4">
                            {auth.user ? (
                                <div className="relative">
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium text-[#A1A1AA] hover:text-white transition-colors focus:outline-none"
                                            >
                                                {auth.user.name}
                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </Dropdown.Trigger>

                                        <Dropdown.Content align="right">
                                            <Dropdown.Link
                                                href={route('logout')}
                                                method="post"
                                                as="button"
                                            >
                                                Log Out
                                            </Dropdown.Link>
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="px-4 py-1.5 rounded-md text-sm font-medium text-[#A1A1AA] hover:text-white transition-colors"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="px-4 py-1.5 rounded-md text-sm font-medium bg-white text-black hover:bg-gray-200 transition-colors"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </nav>
                    </header>

                    {/* Hero Section */}
                    <main className="w-full flex flex-col mb-16 max-w-2xl">
                        <h1 className="text-4xl font-semibold tracking-tight mb-4">
                            Workflow Automations
                        </h1>
                        <p className="text-[#A1A1AA] text-lg leading-relaxed">
                            A curated suite of specialized, single-purpose AI tools designed to eliminate boilerplate and automate development workflows.
                        </p>
                    </main>

                    {/* Tools Categorized Render */}
                    <div className="w-full space-y-16">
                        {sortedCategories.map((category) => (
                            <div key={category} className="w-full">
                                <h2 className="text-lg font-medium mb-6 text-[#A1A1AA] flex items-center gap-2">
                                    {categoryIcons[category]}
                                    {category}
                                </h2>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {groupedTools[category].map((tool, idx) => {
                                        
                                        const colorMap = {
                                            indigo: 'text-indigo-400 bg-indigo-500/10 group-hover:bg-indigo-500/20',
                                            pink: 'text-pink-400 bg-pink-500/10 group-hover:bg-pink-500/20',
                                            cyan: 'text-cyan-400 bg-cyan-500/10 group-hover:bg-cyan-500/20',
                                            emerald: 'text-emerald-400 bg-emerald-500/10 group-hover:bg-emerald-500/20',
                                            orange: 'text-orange-400 bg-orange-500/10 group-hover:bg-orange-500/20',
                                            blue: 'text-blue-400 bg-blue-500/10 group-hover:bg-blue-500/20',
                                            red: 'text-red-400 bg-red-500/10 group-hover:bg-red-500/20',
                                            amber: 'text-amber-400 bg-amber-500/10 group-hover:bg-amber-500/20',
                                            rose: 'text-rose-400 bg-rose-500/10 group-hover:bg-rose-500/20',
                                            sky: 'text-sky-400 bg-sky-500/10 group-hover:bg-sky-500/20',
                                            teal: 'text-teal-400 bg-teal-500/10 group-hover:bg-teal-500/20',
                                            gray: 'text-gray-400 bg-gray-500/10 group-hover:bg-gray-500/20',
                                            slate: 'text-slate-400 bg-slate-500/10 group-hover:bg-slate-500/20',
                                            fuchsia: 'text-fuchsia-400 bg-fuchsia-500/10 group-hover:bg-fuchsia-500/20',
                                            violet: 'text-violet-400 bg-violet-500/10 group-hover:bg-violet-500/20',
                                            green: 'text-green-400 bg-green-500/10 group-hover:bg-green-500/20',
                                            lime: 'text-lime-400 bg-lime-500/10 group-hover:bg-lime-500/20',
                                            purple: 'text-purple-400 bg-purple-500/10 group-hover:bg-purple-500/20',
                                        };
                                        const iconStyle = colorMap[tool.color] || 'text-[#EDEDED] bg-[#222] group-hover:bg-white group-hover:text-black';

                                        return (
                                        <Link 
                                            key={idx}
                                            href={tool.href} 
                                            onClick={(e) => {
                                                if (!auth.user) {
                                                    e.preventDefault();
                                                    setShowLoginModal(true);
                                                }
                                            }}
                                            className="group flex flex-col p-5 rounded-xl border border-[#222] bg-[#111] hover:bg-[#1A1A1A] hover:border-[#444] transition-all duration-200"
                                        >
                                            <div className="flex items-center gap-3 mb-3">
                                                <div 
                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${iconStyle}`}
                                                    dangerouslySetInnerHTML={{ __html: tool.icon.replace('text-white', 'currentColor') }}
                                                />
                                                <h3 className="text-sm font-semibold text-[#EDEDED] group-hover:text-white transition-colors">
                                                    {tool.title}
                                                </h3>
                                            </div>
                                            <p className="text-[#888] text-sm leading-relaxed line-clamp-3">
                                                {tool.description}
                                            </p>
                                        </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Footer */}
                    <footer className="mt-24 text-sm text-[#666] border-t border-[#222] pt-8 w-full flex justify-between">
                        <span>KarangLabs &copy; {new Date().getFullYear()}</span>
                        <span>Laravel v{laravelVersion} &middot; PHP v{phpVersion}</span>
                    </footer>
                </div>

                <Modal show={showLoginModal} onClose={() => setShowLoginModal(false)} maxWidth="md">
                    <div className="p-8 bg-[#111] border border-[#222] rounded-2xl shadow-xl overflow-hidden text-[#EDEDED] flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-[#222] rounded-full flex items-center justify-center mb-6">
                            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
                        <p className="text-[#A1A1AA] mb-8">
                            You must be logged in to access this tool and use the AI generation features.
                        </p>
                        
                        <div className="flex flex-col w-full gap-3">
                            <Link
                                href={route('login')}
                                className="w-full py-2.5 rounded-lg text-sm font-medium bg-white text-black hover:bg-gray-200 transition-colors"
                            >
                                Log in to your account
                            </Link>
                            <Link
                                href={route('register')}
                                className="w-full py-2.5 rounded-lg text-sm font-medium border border-[#333] hover:bg-[#222] transition-colors"
                            >
                                Create a new account
                            </Link>
                        </div>
                    </div>
                </Modal>
            </div>
        </>
    );
}
