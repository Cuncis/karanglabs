// Shared rich-text renderer for step-by-step guide content: parses **bold** (key
// action) and *italic* (side note) markers, plus auto-links a caller-supplied list
// of known terms (AI names, tool domains, etc.) as real hyperlinks.
export function buildLinkifier(linkTerms) {
    const termPattern = linkTerms.map((t) => t.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const urlsByTerm = Object.fromEntries(linkTerms.map((t) => [t.text, t.url]));
    const richTextPattern = new RegExp(`(\\*\\*[^*]+\\*\\*|\\*[^*]+\\*${termPattern ? `|${termPattern}` : ''})`, 'g');

    return function linkifyKnownTerms(text) {
        return text.split(richTextPattern).filter((part) => part !== '').map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return (
                    <strong key={`b-${i}`} className="font-semibold text-emerald-700 dark:text-emerald-400">
                        {part.slice(2, -2)}
                    </strong>
                );
            }

            if (part.startsWith('*') && part.endsWith('*')) {
                return (
                    <em key={`i-${i}`} className="italic text-[#71717A] dark:text-[#888]">
                        {part.slice(1, -1)}
                    </em>
                );
            }

            const url = urlsByTerm[part];
            if (!url) {
                return part;
            }

            return (
                <a
                    key={`l-${i}`}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-emerald-600 underline decoration-dotted underline-offset-2 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300"
                    onClick={(e) => e.stopPropagation()}
                >
                    {part}
                </a>
            );
        });
    };
}
