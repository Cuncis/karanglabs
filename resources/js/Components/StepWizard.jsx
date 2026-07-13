import { useState } from 'react';
import axios from 'axios';

const TECH_OPTIONS = {
    frontend: ['React', 'Vue', 'Svelte', 'Angular', 'Blade / HTML'],
    backend: ['Laravel (PHP)', 'Node.js', 'Python (Django/FastAPI)', 'Go', 'Ruby on Rails'],
    database: ['PostgreSQL', 'MySQL', 'SQLite', 'MongoDB'],
    deployment: ['Laravel Forge / Cloud', 'Vercel', 'AWS', 'DigitalOcean', 'Custom VPS (Hostinger, etc.)', 'Heroku'],
};

export default function StepWizard({ onSubmit, isGenerating }) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        idea: '',
        techPreference: 'auto',
        techStack: {
            custom: '',
            frontend: 'React',
            backend: 'Laravel (PHP)',
            database: 'PostgreSQL',
            deployment: 'Laravel Forge / Cloud',
        },
    });

    // Dynamic questions state
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [otherTexts, setOtherTexts] = useState({});
    const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
    const [questionsError, setQuestionsError] = useState(null);

    const updateForm = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const updateTechStack = (key, value) => {
        setFormData(prev => ({
            ...prev,
            techStack: { ...prev.techStack, [key]: value }
        }));
    };

    const handleSingleAnswer = (questionId, value) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleMultiAnswer = (questionId, value) => {
        setAnswers(prev => {
            const current = prev[questionId] || [];
            const updated = current.includes(value)
                ? current.filter(item => item !== value)
                : [...current, value];
            return { ...prev, [questionId]: updated };
        });
    };

    const handleTextAnswer = (questionId, value) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleOtherText = (questionId, value) => {
        setOtherTexts(prev => ({ ...prev, [questionId]: value }));
    };

    const fetchQuestions = async () => {
        setIsLoadingQuestions(true);
        setQuestionsError(null);
        try {
            const response = await axios.post('/api/generate-questions', {
                idea: formData.idea,
            });
            setQuestions(response.data.questions);
            // Initialize answers for each question
            const initialAnswers = {};
            response.data.questions.forEach(q => {
                initialAnswers[q.id] = q.type === 'multi' ? [] : '';
            });
            setAnswers(initialAnswers);
            setOtherTexts({});
        } catch (err) {
            setQuestionsError('Failed to generate questions. You can skip this step or try again.');
        } finally {
            setIsLoadingQuestions(false);
        }
    };

    const handleNext = () => {
        if (step === 2) {
            // When moving from step 2 to step 3, fetch dynamic questions
            fetchQuestions();
        }
        setStep(s => Math.min(3, s + 1));
    };

    const handlePrev = () => setStep(s => Math.max(1, s - 1));

    const handleSubmit = () => {
        let tech_stack = '';
        if (formData.techPreference === 'custom') {
            tech_stack = formData.techStack.custom;
        } else if (formData.techPreference === 'layer') {
            tech_stack = `Frontend: ${formData.techStack.frontend}, Backend: ${formData.techStack.backend}, Database: ${formData.techStack.database}, Deployment: ${formData.techStack.deployment}`;
        }

        // Compile answers with question text for context
        const answersArray = questions.map(q => {
            const answer = answers[q.id];
            const otherText = otherTexts[q.id] || '';

            let answerStr = '';
            if (q.type === 'multi') {
                const selected = (answer || []).map(a => a === 'Other' ? otherText : a).filter(Boolean);
                answerStr = selected.join(', ');
            } else if (q.type === 'text') {
                answerStr = answer || '';
            } else {
                answerStr = answer === 'Other' ? otherText : (answer || '');
            }

            return `${q.question} → ${answerStr || '(skipped)'}`;
        });

        onSubmit({
            idea: formData.idea,
            tech_preference: formData.techPreference,
            tech_stack: tech_stack,
            answers: answersArray,
        });
    };

    const isOptionSelected = (questionId, option, type) => {
        if (type === 'multi') {
            return (answers[questionId] || []).includes(option);
        }
        return answers[questionId] === option;
    };

    return (
        <div className="w-full max-w-2xl mx-auto mt-8 bg-gray-900 rounded-xl shadow-xl border border-gray-800 p-6 md:p-8">
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Project Setup</h2>
                    <span className="text-sm text-[#7C3AED] font-medium">Step {step} of 3</span>
                </div>
                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div
                        className="bg-[#7C3AED] h-full transition-all duration-300"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>
            </div>

            {/* Step 1: Idea Input */}
            {step === 1 && (
                <div className="space-y-6 animate-fade-in">
                    <div>
                        <label className="block text-lg font-medium text-white mb-3">
                            What do you want to build?
                        </label>
                        <p className="text-sm text-gray-400 mb-4">Describe your project idea in free-form text.</p>
                        <textarea
                            value={formData.idea}
                            onChange={(e) => updateForm('idea', e.target.value)}
                            placeholder="e.g. I want to build a futsal court booking app..."
                            className="w-full h-40 bg-gray-950 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] resize-none"
                        />
                    </div>
                </div>
            )}

            {/* Step 2: Tech Preferences */}
            {step === 2 && (
                <div className="space-y-8 animate-fade-in">
                    <div>
                        <label className="block text-lg font-medium text-white mb-4">
                            How should we choose the tech stack?
                        </label>
                        <div className="space-y-3">
                            {[
                                { id: 'auto', label: 'Let AI decide (Recommended)' },
                                { id: 'layer', label: 'Choose per layer' },
                                { id: 'custom', label: 'I\'ll specify myself' },
                            ].map((option) => (
                                <label
                                    key={option.id}
                                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                                        formData.techPreference === option.id
                                            ? 'bg-[#7C3AED]/10 border-[#7C3AED]'
                                            : 'bg-gray-950 border-gray-700 hover:border-gray-500'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="techPreference"
                                        value={option.id}
                                        checked={formData.techPreference === option.id}
                                        onChange={(e) => updateForm('techPreference', e.target.value)}
                                        className="text-[#7C3AED] focus:ring-[#7C3AED] bg-gray-900 border-gray-700"
                                    />
                                    <span className="ml-3 text-white font-medium">{option.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {formData.techPreference === 'layer' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-gray-950 rounded-lg border border-gray-800">
                            {['frontend', 'backend', 'database', 'deployment'].map((layer) => (
                                <div key={layer}>
                                    <label className="block text-sm font-medium text-gray-400 capitalize mb-2">
                                        {layer}
                                    </label>
                                    <select
                                        value={formData.techStack[layer]}
                                        onChange={(e) => updateTechStack(layer, e.target.value)}
                                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-md p-2.5 focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                                    >
                                        {TECH_OPTIONS[layer].map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>
                    )}

                    {formData.techPreference === 'custom' && (
                        <div className="p-5 bg-gray-950 rounded-lg border border-gray-800">
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Enter your preferred stack
                            </label>
                            <input
                                type="text"
                                value={formData.techStack.custom}
                                onChange={(e) => updateTechStack('custom', e.target.value)}
                                placeholder="e.g. Next.js, Supabase, Tailwind, Vercel"
                                className="w-full bg-gray-900 border border-gray-700 text-white rounded-md p-3 focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Step 3: Dynamic Clarifying Questions */}
            {step === 3 && (
                <div className="space-y-8 animate-fade-in">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-white">Clarifying Questions</h3>
                        <span className="text-xs text-gray-500">All questions are optional</span>
                    </div>

                    {isLoadingQuestions && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 text-gray-400 justify-center py-6">
                                <span className="animate-spin h-5 w-5 border-2 border-[#7C3AED] border-t-transparent rounded-full" />
                                <span>Generating questions based on your idea...</span>
                            </div>
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="space-y-3 animate-pulse">
                                    <div className="h-4 bg-gray-800 rounded w-3/4" />
                                    <div className="flex gap-2">
                                        <div className="h-8 bg-gray-800 rounded-full w-24" />
                                        <div className="h-8 bg-gray-800 rounded-full w-28" />
                                        <div className="h-8 bg-gray-800 rounded-full w-20" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {questionsError && !isLoadingQuestions && (
                        <div className="text-center py-8 space-y-4">
                            <p className="text-red-400 text-sm">{questionsError}</p>
                            <button
                                onClick={fetchQuestions}
                                className="text-sm px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {!isLoadingQuestions && !questionsError && questions.length > 0 && (
                        <div className="space-y-8">
                            {questions.map((q, index) => (
                                <div key={q.id} className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-300">
                                        {index + 1}. {q.question}
                                    </label>

                                    {q.type === 'text' ? (
                                        <textarea
                                            value={answers[q.id] || ''}
                                            onChange={(e) => handleTextAnswer(q.id, e.target.value)}
                                            className="w-full h-24 bg-gray-950 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#7C3AED] resize-none"
                                            placeholder="Type your answer..."
                                        />
                                    ) : (
                                        <>
                                            <div className="flex flex-wrap gap-2">
                                                {q.options.map(opt => (
                                                    <button
                                                        key={opt}
                                                        type="button"
                                                        onClick={() =>
                                                            q.type === 'multi'
                                                                ? handleMultiAnswer(q.id, opt)
                                                                : handleSingleAnswer(q.id, opt)
                                                        }
                                                        className={`px-4 py-2 rounded-full border text-sm transition-colors ${
                                                            isOptionSelected(q.id, opt, q.type)
                                                                ? 'bg-[#7C3AED] border-[#7C3AED] text-white'
                                                                : 'bg-gray-950 border-gray-700 text-gray-400 hover:border-gray-500'
                                                        }`}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                            {/* Show "Other" text input when Other is selected */}
                                            {(q.type === 'multi'
                                                ? (answers[q.id] || []).includes('Other')
                                                : answers[q.id] === 'Other'
                                            ) && (
                                                <input
                                                    type="text"
                                                    value={otherTexts[q.id] || ''}
                                                    onChange={(e) => handleOtherText(q.id, e.target.value)}
                                                    placeholder="Please specify..."
                                                    className="mt-2 w-full bg-gray-950 border border-gray-700 rounded-md p-2 text-white text-sm focus:border-[#7C3AED] focus:outline-none"
                                                />
                                            )}
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="mt-8 flex justify-between border-t border-gray-800 pt-6">
                <button
                    onClick={handlePrev}
                    disabled={step === 1 || isGenerating}
                    className="px-6 py-2.5 text-sm font-medium text-gray-400 hover:text-white disabled:opacity-50 transition-colors"
                >
                    Back
                </button>
                
                {step < 3 ? (
                    <button
                        onClick={handleNext}
                        disabled={step === 1 && !formData.idea.trim()}
                        className="px-6 py-2.5 bg-white text-black font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
                    >
                        Next Step
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={isGenerating || isLoadingQuestions}
                        className="px-6 py-2.5 bg-[#7C3AED] hover:bg-violet-500 text-white font-medium rounded-lg disabled:opacity-70 transition-colors flex items-center gap-2"
                    >
                        {isGenerating ? (
                            <>
                                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                Building your plan...
                            </>
                        ) : (
                            'Generate Plan'
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}
