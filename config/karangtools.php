<?php

return [
    // 🧑‍💻 Code & Data Lifesavers
    'json-to-types' => [
        'title' => 'JSON to Types',
        'category' => 'Code & Data Lifesavers',
        'description' => 'Paste JSON and get perfect TypeScript Interfaces, PHP DTOs, or Python DataClasses.',
        'color' => 'blue',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>',
        'inputs' => [
            ['name' => 'json', 'label' => 'JSON Payload', 'type' => 'textarea', 'placeholder' => '{"id": 1, "name": "John"}'],
            ['name' => 'language', 'label' => 'Target Language', 'type' => 'select', 'options' => ['TypeScript', 'PHP', 'Python', 'Go', 'Rust']]
        ],
        'system_prompt' => "You are an expert developer. Convert the user's JSON into the requested language's type definitions (Interfaces, Classes, Structs). Return a JSON object with 'code' (the raw code snippet) and 'explanation' (markdown).",
        'outputs' => [
            ['key' => 'code', 'label' => 'Generated Types', 'type' => 'code'],
            ['key' => 'explanation', 'label' => 'Explanation', 'type' => 'markdown']
        ]
    ],
    'sql-to-eloquent' => [
        'title' => 'SQL ↔ Eloquent',
        'category' => 'Code & Data Lifesavers',
        'description' => 'Translate raw SQL queries into Laravel Eloquent ORM syntax.',
        'color' => 'red',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>',
        'inputs' => [
            ['name' => 'query', 'label' => 'SQL Query or Eloquent Code', 'type' => 'textarea', 'placeholder' => 'SELECT * FROM users WHERE active = 1']
        ],
        'system_prompt' => "You are a Laravel expert. If the user provides SQL, convert it to Eloquent. If they provide Eloquent, convert to SQL. Return a JSON object with 'code' (the snippet) and 'explanation' (markdown).",
        'outputs' => [
            ['key' => 'code', 'label' => 'Translated Query', 'type' => 'code'],
            ['key' => 'explanation', 'label' => 'Explanation', 'type' => 'markdown']
        ]
    ],
    'cron-translator' => [
        'title' => 'Cron Translator',
        'category' => 'Code & Data Lifesavers',
        'description' => 'Translate Cron expressions to English, or English to Cron.',
        'color' => 'emerald',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
        'inputs' => [
            ['name' => 'input', 'label' => 'Cron String or English Description', 'type' => 'text', 'placeholder' => '0 0 * * * OR Every day at midnight']
        ],
        'system_prompt' => "You are a DevOps engineer. If given a cron string, explain it in plain English. If given English, provide the exact cron string. Return JSON with 'result' (the answer) and 'details' (next 3 execution times or breakdown).",
        'outputs' => [
            ['key' => 'result', 'label' => 'Translation', 'type' => 'text'],
            ['key' => 'details', 'label' => 'Details', 'type' => 'markdown']
        ]
    ],
    'env-generator' => [
        'title' => 'Env Generator',
        'category' => 'Code & Data Lifesavers',
        'description' => 'Extracts all env() or process.env calls to build an .env.example file.',
        'color' => 'amber',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>',
        'inputs' => [
            ['name' => 'code', 'label' => 'Source Code', 'type' => 'textarea', 'placeholder' => 'const apiKey = process.env.API_KEY;']
        ],
        'system_prompt' => "You are a backend expert. Scan the code and extract all environment variables (e.g., from process.env, env(), \$_ENV). Return a JSON object with 'code' (the .env.example output) and 'explanation' (list of variables found).",
        'outputs' => [
            ['key' => 'code', 'label' => '.env.example', 'type' => 'code'],
            ['key' => 'explanation', 'label' => 'Variables Found', 'type' => 'markdown']
        ]
    ],
    'stack-trace-decoder' => [
        'title' => 'Error Decoder',
        'category' => 'Code & Data Lifesavers',
        'description' => 'Paste a massive error log and get exactly what broke and how to fix it.',
        'color' => 'rose',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>',
        'inputs' => [
            ['name' => 'log', 'label' => 'Stack Trace / Error Log', 'type' => 'textarea', 'placeholder' => 'Exception: ...']
        ],
        'system_prompt' => "You are a senior debugger. Read the stack trace, ignore the noise, and identify the root cause. Return JSON with 'summary' (1 sentence root cause), 'file' (the likely file causing it), and 'fix' (markdown steps/code to fix it).",
        'outputs' => [
            ['key' => 'summary', 'label' => 'Root Cause', 'type' => 'text'],
            ['key' => 'file', 'label' => 'Culprit File', 'type' => 'text'],
            ['key' => 'fix', 'label' => 'How to Fix', 'type' => 'markdown']
        ]
    ],

    // 🚀 DevOps & Architecture
    'docker-wizard' => [
        'title' => 'Docker Wizard',
        'category' => 'DevOps & Architecture',
        'description' => 'Generate docker-compose.yml files based on your tech stack.',
        'color' => 'sky',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>',
        'inputs' => [
            ['name' => 'stack', 'label' => 'Describe your stack', 'type' => 'textarea', 'placeholder' => 'Laravel, MySQL 8, Redis, and Meilisearch']
        ],
        'system_prompt' => "You are a Docker expert. Generate a docker-compose.yml file based on the stack. Return JSON with 'code' (the yaml file content) and 'instructions' (how to run it and env vars needed).",
        'outputs' => [
            ['key' => 'code', 'label' => 'docker-compose.yml', 'type' => 'code'],
            ['key' => 'instructions', 'label' => 'Setup Instructions', 'type' => 'markdown']
        ]
    ],
    'nginx-builder' => [
        'title' => 'Nginx Config Builder',
        'category' => 'DevOps & Architecture',
        'description' => 'Generate secure server blocks with SSL and proxy configs.',
        'color' => 'teal',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>',
        'inputs' => [
            ['name' => 'domain', 'label' => 'Domain Name', 'type' => 'text', 'placeholder' => 'example.com'],
            ['name' => 'requirements', 'label' => 'Requirements', 'type' => 'textarea', 'placeholder' => 'Node.js app running on port 3000, enforce HTTPS, Let\'s Encrypt SSL']
        ],
        'system_prompt' => "You are a SysAdmin. Generate a secure Nginx configuration block based on the requirements. Return JSON with 'code' (the raw config) and 'instructions' (markdown setup steps).",
        'outputs' => [
            ['key' => 'code', 'label' => 'nginx.conf', 'type' => 'code'],
            ['key' => 'instructions', 'label' => 'Setup Instructions', 'type' => 'markdown']
        ]
    ],
    'github-actions' => [
        'title' => 'GH Actions Builder',
        'category' => 'DevOps & Architecture',
        'description' => 'Scaffold workflows for CI/CD pipelines effortlessly.',
        'color' => 'gray',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>',
        'inputs' => [
            ['name' => 'pipeline', 'label' => 'What should the pipeline do?', 'type' => 'textarea', 'placeholder' => 'Run Pest tests on push to main, then deploy via SSH to my VPS']
        ],
        'system_prompt' => "You are a DevOps engineer. Generate a GitHub Actions YAML file based on the requirements. Return JSON with 'code' (yaml config) and 'instructions' (github secrets needed).",
        'outputs' => [
            ['key' => 'code', 'label' => 'main.yml', 'type' => 'code'],
            ['key' => 'instructions', 'label' => 'Required Secrets', 'type' => 'markdown']
        ]
    ],
    'gitignore-merger' => [
        'title' => 'Git Ignore Merger',
        'category' => 'DevOps & Architecture',
        'description' => 'Combine ignore templates for multiple tech stacks.',
        'color' => 'slate',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>',
        'inputs' => [
            ['name' => 'stacks', 'label' => 'List your tech stacks', 'type' => 'text', 'placeholder' => 'Laravel, React, MacOS, VSCode']
        ],
        'system_prompt' => "You are a Git expert. Combine the best-practice .gitignore templates for the requested stacks into one comprehensive file. Return JSON with 'code' (the .gitignore file) and 'explanation' (brief note on what was included).",
        'outputs' => [
            ['key' => 'code', 'label' => '.gitignore', 'type' => 'code'],
            ['key' => 'explanation', 'label' => 'Included Modules', 'type' => 'markdown']
        ]
    ],

    // 🎨 Frontend & UI/UX
    'svg-to-react' => [
        'title' => 'SVG to React',
        'category' => 'Frontend & UI/UX',
        'description' => 'Convert raw SVG into a clean React component.',
        'color' => 'fuchsia',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>',
        'inputs' => [
            ['name' => 'svg', 'label' => 'Raw SVG Code', 'type' => 'textarea', 'placeholder' => '<svg>...</svg>']
        ],
        'system_prompt' => "You are a frontend expert. Convert the SVG to a functional React (JSX) component. Strip unnecessary tags, use camelCase for attributes, and accept props like className. Return JSON with 'code'.",
        'outputs' => [
            ['key' => 'code', 'label' => 'React Component', 'type' => 'code']
        ]
    ],
    'tailwind-palette' => [
        'title' => 'Tailwind Palette',
        'category' => 'Frontend & UI/UX',
        'description' => 'Generate a full 10-shade color scale from a single HEX code.',
        'color' => 'pink',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>',
        'inputs' => [
            ['name' => 'hex', 'label' => 'Brand HEX Color', 'type' => 'text', 'placeholder' => '#FF5733'],
            ['name' => 'name', 'label' => 'Color Name (Optional)', 'type' => 'text', 'placeholder' => 'brand']
        ],
        'system_prompt' => "You are a UI/UX designer. Generate a 10-shade color scale (50, 100-900, 950) that perfectly balances around the provided base HEX. Return JSON with 'code' (the tailwind.config.js snippet) and 'explanation' (how to use it).",
        'outputs' => [
            ['key' => 'code', 'label' => 'tailwind.config.js', 'type' => 'code'],
            ['key' => 'explanation', 'label' => 'Usage Notes', 'type' => 'markdown']
        ]
    ],
    'tailwind-sorter' => [
        'title' => 'Tailwind Optimizer',
        'category' => 'Frontend & UI/UX',
        'description' => 'Sort, clean, and optimize Tailwind classes in your HTML/JSX.',
        'color' => 'cyan',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>',
        'inputs' => [
            ['name' => 'html', 'label' => 'HTML / JSX Code', 'type' => 'textarea', 'placeholder' => '<div class="p-4 bg-red-500 m-2 flex">...</div>']
        ],
        'system_prompt' => "You are a Tailwind CSS expert. Analyze the HTML/JSX, sort the tailwind classes according to the official prettier-plugin-tailwindcss order (layout, flex, spacing, sizing, typography, colors, effects). Remove duplicates/conflicts. Return JSON with 'code' (optimized HTML) and 'changes' (what you fixed).",
        'outputs' => [
            ['key' => 'code', 'label' => 'Optimized Code', 'type' => 'code'],
            ['key' => 'changes', 'label' => 'Changes Made', 'type' => 'markdown']
        ]
    ],
    'grid-calculator' => [
        'title' => 'Grid Calculator',
        'category' => 'Frontend & UI/UX',
        'description' => 'Get the exact Tailwind classes for complex responsive grids.',
        'color' => 'indigo',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>',
        'inputs' => [
            ['name' => 'requirements', 'label' => 'Grid Requirements', 'type' => 'textarea', 'placeholder' => '1 col on mobile, 2 cols on tablet, 4 cols on desktop. Make the first item span 2 cols on desktop.']
        ],
        'system_prompt' => "You are a Tailwind expert. Translate the responsive grid requirements into the exact HTML/Tailwind classes snippet. Return JSON with 'code' (the HTML wrapper and items) and 'explanation' (how it works).",
        'outputs' => [
            ['key' => 'code', 'label' => 'HTML Snippet', 'type' => 'code'],
            ['key' => 'explanation', 'label' => 'How it Works', 'type' => 'markdown']
        ]
    ],

    // 📈 Marketing & SEO
    'seo-tags' => [
        'title' => 'SEO Meta Tags',
        'category' => 'Marketing & SEO',
        'description' => 'Generate perfect meta, OpenGraph, and Twitter tags.',
        'color' => 'violet',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>',
        'inputs' => [
            ['name' => 'topic', 'label' => 'Page Topic / URL Description', 'type' => 'textarea', 'placeholder' => 'A landing page for a SaaS that helps dog owners track vet appointments.']
        ],
        'system_prompt' => "You are an SEO expert. Generate perfect HTML head meta tags for the described page. Include Title (max 60 chars), Description (max 160 chars), OpenGraph, and Twitter Card tags. Return JSON with 'code' (the HTML tags) and 'analysis' (why these are good).",
        'outputs' => [
            ['key' => 'code', 'label' => 'HTML Tags', 'type' => 'code'],
            ['key' => 'analysis', 'label' => 'SEO Analysis', 'type' => 'markdown']
        ]
    ],
    'readme-builder' => [
        'title' => 'Readme Builder',
        'category' => 'Marketing & SEO',
        'description' => 'Generate a professional README.md for your repo.',
        'color' => 'orange',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>',
        'inputs' => [
            ['name' => 'info', 'label' => 'Project Name & Description', 'type' => 'textarea', 'placeholder' => 'KarangLabs Tool Engine. Built with Laravel and React. Requires PHP 8.4.']
        ],
        'system_prompt' => "You are an open source maintainer. Generate a beautiful, comprehensive README.md. Include Badges, Features, Installation, Usage, and License sections. Return JSON with 'markdown' (the readme content).",
        'outputs' => [
            ['key' => 'markdown', 'label' => 'README.md', 'type' => 'markdown']
        ]
    ],
    'app-store-notes' => [
        'title' => 'App Release Notes',
        'category' => 'Marketing & SEO',
        'description' => 'Write formatted App Store and Google Play release notes.',
        'color' => 'blue',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>',
        'inputs' => [
            ['name' => 'features', 'label' => 'New Features/Fixes', 'type' => 'textarea', 'placeholder' => 'Added dark mode, fixed crash on login, improved speed']
        ],
        'system_prompt' => "You are a mobile app marketer. Write release notes for the iOS App Store and Google Play based on the changes. Keep it engaging, concise, and compliant with character limits. Return JSON with 'ios' (iOS notes) and 'android' (Play Store notes).",
        'outputs' => [
            ['key' => 'ios', 'label' => 'iOS App Store', 'type' => 'markdown'],
            ['key' => 'android', 'label' => 'Google Play Store', 'type' => 'markdown']
        ]
    ],

    // 💼 Business & Freelance
    'quote-builder' => [
        'title' => 'Quote Builder',
        'category' => 'Business & Freelance',
        'description' => 'Generate professional project scopes and pricing quotes.',
        'color' => 'green',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
        'inputs' => [
            ['name' => 'client', 'label' => 'Client Requirements', 'type' => 'textarea', 'placeholder' => 'They need a 5 page brochure site with a contact form. Built in React.'],
            ['name' => 'rate', 'label' => 'Your Rate ($/hr or Fixed)', 'type' => 'text', 'placeholder' => '$75/hr']
        ],
        'system_prompt' => "You are a freelance consultant. Generate a professional project proposal including Scope of Work, Timeline, and a Pricing breakdown based on the client requirements and your rate. Return JSON with 'markdown' (the proposal text).",
        'outputs' => [
            ['key' => 'markdown', 'label' => 'Project Proposal', 'type' => 'markdown']
        ]
    ],
    'cold-email' => [
        'title' => 'Cold Pitch Writer',
        'category' => 'Business & Freelance',
        'description' => 'Craft high-converting cold outreach emails.',
        'color' => 'lime',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>',
        'inputs' => [
            ['name' => 'product', 'label' => 'Your Product/Service', 'type' => 'text', 'placeholder' => 'Freelance Web Design'],
            ['name' => 'target', 'label' => 'Target Audience', 'type' => 'text', 'placeholder' => 'Local dentists in Chicago']
        ],
        'system_prompt' => "You are a master copywriter. Write a short, punchy, high-converting cold email for the product and target. Keep it under 150 words. Focus on their pain points. Return JSON with 'subject' (3 options) and 'body' (the email text).",
        'outputs' => [
            ['key' => 'subject', 'label' => 'Subject Line Options', 'type' => 'markdown'],
            ['key' => 'body', 'label' => 'Email Body', 'type' => 'text']
        ]
    ],
    'legal-scaffolder' => [
        'title' => 'TOS & Privacy',
        'category' => 'Business & Freelance',
        'description' => 'Scaffold boilerplate Terms of Service and Privacy Policies.',
        'color' => 'gray',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>',
        'inputs' => [
            ['name' => 'app', 'label' => 'App Name & URL', 'type' => 'text', 'placeholder' => 'KarangLabs (karanglabs.com)'],
            ['name' => 'data', 'label' => 'Data Collected', 'type' => 'text', 'placeholder' => 'Email addresses, Stripe payment info']
        ],
        'system_prompt' => "You are a legal assistant. Generate a standard boilerplate Terms of Service and Privacy Policy for the described app. Disclaimer: State this is not professional legal advice. Return JSON with 'privacy' and 'tos'.",
        'outputs' => [
            ['key' => 'privacy', 'label' => 'Privacy Policy', 'type' => 'markdown'],
            ['key' => 'tos', 'label' => 'Terms of Service', 'type' => 'markdown']
        ]
    ],
    'persona-generator' => [
        'title' => 'Persona Generator',
        'category' => 'Business & Freelance',
        'description' => 'Generate highly detailed user personas to guide product development.',
        'color' => 'purple',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>',
        'inputs' => [
            ['name' => 'idea', 'label' => 'App Idea / Product', 'type' => 'textarea', 'placeholder' => 'A productivity app for freelance writers that includes invoicing and time tracking.']
        ],
        'system_prompt' => "You are a UX Researcher. Generate 3 distinct user personas based on the product idea. Include demographics, pain points, motivations, and goals for each. Return JSON with 'personas' (markdown formatted).",
        'outputs' => [
            ['key' => 'personas', 'label' => 'User Personas', 'type' => 'markdown']
        ]
    ],
    
    // NEW TOOLS ADDED
    'data-anonymizer' => [
        'title' => 'Data Anonymizer',
        'category' => 'Code & Data Lifesavers',
        'description' => 'Replace sensitive data in JSON datasets with fake equivalents for safe testing.',
        'color' => 'blue',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>',
        'inputs' => [
            ['name' => 'json_data', 'label' => 'JSON Dataset', 'type' => 'textarea', 'placeholder' => '[{"name": "John Doe", "email": "john@example.com"}]']
        ],
        'system_prompt' => "You are a data privacy expert. Analyze the provided JSON array or object. Replace all personally identifiable information (PII) such as real names, emails, phone numbers, addresses, and IP addresses with realistic but fake synthetic data (e.g., John Doe -> Alex Smith). Keep the JSON structure and non-sensitive data completely identical. Output ONLY valid JSON, do not wrap in markdown blocks. Return a JSON object with a single key 'anonymized_json' containing the formatted JSON string.",
        'outputs' => [
            ['key' => 'anonymized_json', 'label' => 'Anonymized JSON', 'type' => 'code']
        ]
    ],
    'corporate-translator' => [
        'title' => 'Corporate Translator',
        'category' => 'Daily Productivity',
        'description' => 'Translate frustrated thoughts into highly professional corporate-speak.',
        'color' => 'indigo',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>',
        'inputs' => [
            ['name' => 'raw_thought', 'label' => 'Your Frustrated Thought', 'type' => 'textarea', 'placeholder' => 'This idea is terrible and won\'t work...']
        ],
        'system_prompt' => "You are an expert in professional corporate communication and diplomacy. The user will provide a blunt, angry, or frustrated thought. Translate this thought into a highly polite, diplomatic, and professional message suitable for a boss, client, or stakeholder. Return your response as a JSON object with a 'translation' key containing the professional message.",
        'outputs' => [
            ['key' => 'translation', 'label' => 'Professional Translation', 'type' => 'text']
        ]
    ],
    'jargon-buster' => [
        'title' => 'Jargon Buster',
        'category' => 'Business & Freelance',
        'description' => 'Explain dense legal documents or API docs like you\'re 5 years old.',
        'color' => 'green',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>',
        'inputs' => [
            ['name' => 'document_text', 'label' => 'Dense Text / Jargon', 'type' => 'textarea', 'placeholder' => 'Paste the legal clause or technical documentation here...']
        ],
        'system_prompt' => "You are an expert communicator who excels at simplifying complex topics. The user will provide dense legal, corporate, or technical jargon. Explain exactly what the text means in extremely simple, plain English, as if you are explaining it to a 5-year-old or a complete beginner. Remove all jargon. Return your response as a JSON object with a 'simple_explanation' key containing your explanation.",
        'outputs' => [
            ['key' => 'simple_explanation', 'label' => 'Simple Explanation', 'type' => 'text']
        ]
    ],
    'secret-generator' => [
        'title' => 'Secret Generator',
        'category' => 'DevOps & Architecture',
        'description' => 'Instantly generate highly secure secrets, App Keys, and database passwords.',
        'color' => 'red',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>',
        'inputs' => [
            ['name' => 'context', 'label' => 'What do you need secrets for?', 'type' => 'text', 'placeholder' => 'e.g., JWT secret, Database password, API Keys (optional)']
        ],
        'system_prompt' => "You are a security expert. Generate 5 highly secure, random strings based on the user's request. If no specific context is given, generate a mix of 256-bit hex strings (for JWT), Base64 encoded keys, and complex 32-character alphanumeric passwords. Return a JSON object with a 'secrets' key containing a newline-separated list of the generated secrets. Ensure they look completely random and are extremely strong.",
        'outputs' => [
            ['key' => 'secrets', 'label' => 'Generated Secrets', 'type' => 'code']
        ]
    ],
    'youtube-chapters' => [
        'title' => 'YouTube Chapters',
        'category' => 'Marketing & SEO',
        'description' => 'Generate perfectly formatted YouTube timestamp chapters optimized for SEO.',
        'color' => 'rose',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>',
        'inputs' => [
            ['name' => 'transcript', 'label' => 'Video Transcript or Notes', 'type' => 'textarea', 'placeholder' => 'Paste your rough timeline, notes, or transcript here...']
        ],
        'system_prompt' => "You are an expert YouTube strategist and SEO specialist. The user will provide a video transcript or rough notes with timestamps. Create perfectly formatted YouTube chapters starting exactly at '00:00'. Make the chapter titles highly engaging, click-worthy, and optimized for SEO. Return your response as a JSON object with a 'chapters' key containing the formatted timestamp list as plain text block.",
        'outputs' => [
            ['key' => 'chapters', 'label' => 'YouTube Chapters', 'type' => 'code']
        ]
    ]
];
