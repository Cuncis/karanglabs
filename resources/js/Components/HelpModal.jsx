import Modal from '@/Components/Modal';

export default function HelpModal({ show, onClose, title, steps }) {
    const defaultSteps = [
        {
            title: "Tell the AI what you need",
            description: "Fill out the boxes on the left side. The more detail you give, the better the AI can help you!"
        },
        {
            title: "Click Generate",
            description: "Hit the big colored button at the bottom of the form and wait a few seconds for the magic to happen."
        },
        {
            title: "Copy your results",
            description: "Your finished result will appear on the right side. Just click the 'Copy' button and you're good to go!"
        }
    ];

    const displaySteps = steps || defaultSteps;

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="p-6 bg-gray-900 text-white rounded-2xl border border-gray-800 shadow-xl overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <span className="text-2xl">🤔</span> How to use {title}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
                    {displaySteps.map((step, idx) => (
                        <div key={idx} className="flex gap-4 items-start">
                            <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center shrink-0 font-bold text-gray-400">
                                {idx + 1}
                            </div>
                            <div>
                                <h3 className="font-semibold text-white mb-1">{step.title}</h3>
                                <p>{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
                
                <button onClick={onClose} className="w-full mt-8 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white rounded-xl font-medium transition-colors">
                    Got it, let's go!
                </button>
            </div>
        </Modal>
    );
}
