import Modal from '@/Components/Modal';

export default function AboutModal({ show, onClose, title, description, category }) {
    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="p-8 bg-gray-900 text-white rounded-2xl border border-gray-800 shadow-xl overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <span className="text-2xl">💡</span> What is this?
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="space-y-6">
                    <div>
                        <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2">
                            {title}
                        </h3>
                        <span className="inline-block px-3 py-1 bg-gray-800 text-gray-300 text-xs font-semibold rounded-full uppercase tracking-wider">
                            {category || 'Workflow Tool'}
                        </span>
                    </div>

                    <div className="p-5 bg-gray-950 rounded-xl border border-gray-800 text-gray-300 leading-relaxed text-sm">
                        {description}
                    </div>
                    
                    <div className="pt-2">
                        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Why use this tool?</h4>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <div className="mt-0.5 bg-green-500/20 p-1 rounded-full shrink-0">
                                    <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-sm text-gray-300">Save hours of manual work and frustrating brainstorming.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="mt-0.5 bg-green-500/20 p-1 rounded-full shrink-0">
                                    <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-sm text-gray-300">Generate high-quality, professional results instantly.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="mt-0.5 bg-green-500/20 p-1 rounded-full shrink-0">
                                    <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-sm text-gray-300">Eliminate boilerplate and focus strictly on what matters.</span>
                            </li>
                        </ul>
                    </div>
                </div>
                
                <button onClick={onClose} className="w-full mt-8 py-3 bg-white hover:bg-gray-200 text-black rounded-xl font-bold transition-colors">
                    Awesome, I get it!
                </button>
            </div>
        </Modal>
    );
}
