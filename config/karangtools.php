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
            ['name' => 'language', 'label' => 'Target Language', 'type' => 'select', 'options' => ['TypeScript', 'PHP', 'Python', 'Go', 'Rust']],
        ],
        'system_prompt' => "You are an expert developer. Convert the user's JSON into the requested language's type definitions (Interfaces, Classes, Structs). Return a JSON object with 'code' (the raw code snippet) and 'explanation' (markdown).",
        'outputs' => [
            ['key' => 'code', 'label' => 'Generated Types', 'type' => 'code'],
            ['key' => 'explanation', 'label' => 'Explanation', 'type' => 'markdown'],
        ],
    ],
    'sql-to-eloquent' => [
        'title' => 'SQL ↔ Eloquent',
        'category' => 'Code & Data Lifesavers',
        'description' => 'Translate raw SQL queries into Laravel Eloquent ORM syntax.',
        'color' => 'red',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>',
        'inputs' => [
            ['name' => 'query', 'label' => 'SQL Query or Eloquent Code', 'type' => 'textarea', 'placeholder' => 'SELECT * FROM users WHERE active = 1'],
        ],
        'system_prompt' => "You are a Laravel expert. If the user provides SQL, convert it to Eloquent. If they provide Eloquent, convert to SQL. Return a JSON object with 'code' (the snippet) and 'explanation' (markdown).",
        'outputs' => [
            ['key' => 'code', 'label' => 'Translated Query', 'type' => 'code'],
            ['key' => 'explanation', 'label' => 'Explanation', 'type' => 'markdown'],
        ],
    ],
    'cron-translator' => [
        'title' => 'Cron Translator',
        'category' => 'Code & Data Lifesavers',
        'description' => 'Translate Cron expressions to English, or English to Cron.',
        'color' => 'emerald',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
        'inputs' => [
            ['name' => 'input', 'label' => 'Cron String or English Description', 'type' => 'text', 'placeholder' => '0 0 * * * OR Every day at midnight'],
        ],
        'system_prompt' => "You are a DevOps engineer. If given a cron string, explain it in plain English. If given English, provide the exact cron string. Return JSON with 'result' (the answer) and 'details' (next 3 execution times or breakdown).",
        'outputs' => [
            ['key' => 'result', 'label' => 'Translation', 'type' => 'text'],
            ['key' => 'details', 'label' => 'Details', 'type' => 'markdown'],
        ],
    ],
    'env-generator' => [
        'title' => 'Env Generator',
        'category' => 'Code & Data Lifesavers',
        'description' => 'Extracts all env() or process.env calls to build an .env.example file.',
        'color' => 'amber',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>',
        'inputs' => [
            ['name' => 'code', 'label' => 'Source Code', 'type' => 'textarea', 'placeholder' => 'const apiKey = process.env.API_KEY;'],
        ],
        'system_prompt' => "You are a backend expert. Scan the code and extract all environment variables (e.g., from process.env, env(), \$_ENV). Return a JSON object with 'code' (the .env.example output) and 'explanation' (list of variables found).",
        'outputs' => [
            ['key' => 'code', 'label' => '.env.example', 'type' => 'code'],
            ['key' => 'explanation', 'label' => 'Variables Found', 'type' => 'markdown'],
        ],
    ],
    'stack-trace-decoder' => [
        'title' => 'Error Decoder',
        'category' => 'Code & Data Lifesavers',
        'description' => 'Paste a massive error log and get exactly what broke and how to fix it.',
        'color' => 'rose',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>',
        'inputs' => [
            ['name' => 'log', 'label' => 'Stack Trace / Error Log', 'type' => 'textarea', 'placeholder' => 'Exception: ...'],
        ],
        'system_prompt' => "You are a senior debugger. Read the stack trace, ignore the noise, and identify the root cause. Return JSON with 'summary' (1 sentence root cause), 'file' (the likely file causing it), and 'fix' (markdown steps/code to fix it).",
        'outputs' => [
            ['key' => 'summary', 'label' => 'Root Cause', 'type' => 'text'],
            ['key' => 'file', 'label' => 'Culprit File', 'type' => 'text'],
            ['key' => 'fix', 'label' => 'How to Fix', 'type' => 'markdown'],
        ],
    ],

    // 🚀 DevOps & Architecture
    'docker-wizard' => [
        'title' => 'Docker Wizard',
        'category' => 'DevOps & Architecture',
        'description' => 'Generate docker-compose.yml files based on your tech stack.',
        'color' => 'sky',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>',
        'inputs' => [
            ['name' => 'stack', 'label' => 'Describe your stack', 'type' => 'textarea', 'placeholder' => 'Laravel, MySQL 8, Redis, and Meilisearch'],
        ],
        'system_prompt' => "You are a Docker expert. Generate a docker-compose.yml file based on the stack. Return JSON with 'code' (the yaml file content) and 'instructions' (how to run it and env vars needed).",
        'outputs' => [
            ['key' => 'code', 'label' => 'docker-compose.yml', 'type' => 'code'],
            ['key' => 'instructions', 'label' => 'Setup Instructions', 'type' => 'markdown'],
        ],
    ],
    'nginx-builder' => [
        'title' => 'Nginx Config Builder',
        'category' => 'DevOps & Architecture',
        'description' => 'Generate secure server blocks with SSL and proxy configs.',
        'color' => 'teal',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>',
        'inputs' => [
            ['name' => 'domain', 'label' => 'Domain Name', 'type' => 'text', 'placeholder' => 'example.com'],
            ['name' => 'requirements', 'label' => 'Requirements', 'type' => 'textarea', 'placeholder' => 'Node.js app running on port 3000, enforce HTTPS, Let\'s Encrypt SSL'],
        ],
        'system_prompt' => "You are a SysAdmin. Generate a secure Nginx configuration block based on the requirements. Return JSON with 'code' (the raw config) and 'instructions' (markdown setup steps).",
        'outputs' => [
            ['key' => 'code', 'label' => 'nginx.conf', 'type' => 'code'],
            ['key' => 'instructions', 'label' => 'Setup Instructions', 'type' => 'markdown'],
        ],
    ],
    'github-actions' => [
        'title' => 'GH Actions Builder',
        'category' => 'DevOps & Architecture',
        'description' => 'Scaffold workflows for CI/CD pipelines effortlessly.',
        'color' => 'gray',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>',
        'inputs' => [
            ['name' => 'pipeline', 'label' => 'What should the pipeline do?', 'type' => 'textarea', 'placeholder' => 'Run Pest tests on push to main, then deploy via SSH to my VPS'],
        ],
        'system_prompt' => "You are a DevOps engineer. Generate a GitHub Actions YAML file based on the requirements. Return JSON with 'code' (yaml config) and 'instructions' (github secrets needed).",
        'outputs' => [
            ['key' => 'code', 'label' => 'main.yml', 'type' => 'code'],
            ['key' => 'instructions', 'label' => 'Required Secrets', 'type' => 'markdown'],
        ],
    ],
    'gitignore-merger' => [
        'title' => 'Git Ignore Merger',
        'category' => 'DevOps & Architecture',
        'description' => 'Combine ignore templates for multiple tech stacks.',
        'color' => 'slate',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>',
        'inputs' => [
            ['name' => 'stacks', 'label' => 'List your tech stacks', 'type' => 'text', 'placeholder' => 'Laravel, React, MacOS, VSCode'],
        ],
        'system_prompt' => "You are a Git expert. Combine the best-practice .gitignore templates for the requested stacks into one comprehensive file. Return JSON with 'code' (the .gitignore file) and 'explanation' (brief note on what was included).",
        'outputs' => [
            ['key' => 'code', 'label' => '.gitignore', 'type' => 'code'],
            ['key' => 'explanation', 'label' => 'Included Modules', 'type' => 'markdown'],
        ],
    ],

    // 🎨 Frontend & UI/UX
    'svg-to-react' => [
        'title' => 'SVG to React',
        'category' => 'Frontend & UI/UX',
        'description' => 'Convert raw SVG into a clean React component.',
        'color' => 'fuchsia',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>',
        'inputs' => [
            ['name' => 'svg', 'label' => 'Raw SVG Code', 'type' => 'textarea', 'placeholder' => '<svg>...</svg>'],
        ],
        'system_prompt' => "You are a frontend expert. Convert the SVG to a functional React (JSX) component. Strip unnecessary tags, use camelCase for attributes, and accept props like className. Return JSON with 'code'.",
        'outputs' => [
            ['key' => 'code', 'label' => 'React Component', 'type' => 'code'],
        ],
    ],
    'tailwind-palette' => [
        'title' => 'Tailwind Palette',
        'category' => 'Frontend & UI/UX',
        'description' => 'Generate a full 10-shade color scale from a single HEX code.',
        'color' => 'pink',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>',
        'inputs' => [
            ['name' => 'hex', 'label' => 'Brand HEX Color', 'type' => 'text', 'placeholder' => '#FF5733'],
            ['name' => 'name', 'label' => 'Color Name (Optional)', 'type' => 'text', 'placeholder' => 'brand'],
        ],
        'system_prompt' => "You are a UI/UX designer. Generate a 10-shade color scale (50, 100-900, 950) that perfectly balances around the provided base HEX. Return JSON with 'code' (the tailwind.config.js snippet) and 'explanation' (how to use it).",
        'outputs' => [
            ['key' => 'code', 'label' => 'tailwind.config.js', 'type' => 'code'],
            ['key' => 'explanation', 'label' => 'Usage Notes', 'type' => 'markdown'],
        ],
    ],
    'tailwind-sorter' => [
        'title' => 'Tailwind Optimizer',
        'category' => 'Frontend & UI/UX',
        'description' => 'Sort, clean, and optimize Tailwind classes in your HTML/JSX.',
        'color' => 'cyan',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>',
        'inputs' => [
            ['name' => 'html', 'label' => 'HTML / JSX Code', 'type' => 'textarea', 'placeholder' => '<div class="p-4 bg-red-500 m-2 flex">...</div>'],
        ],
        'system_prompt' => "You are a Tailwind CSS expert. Analyze the HTML/JSX, sort the tailwind classes according to the official prettier-plugin-tailwindcss order (layout, flex, spacing, sizing, typography, colors, effects). Remove duplicates/conflicts. Return JSON with 'code' (optimized HTML) and 'changes' (what you fixed).",
        'outputs' => [
            ['key' => 'code', 'label' => 'Optimized Code', 'type' => 'code'],
            ['key' => 'changes', 'label' => 'Changes Made', 'type' => 'markdown'],
        ],
    ],
    'grid-calculator' => [
        'title' => 'Grid Calculator',
        'category' => 'Frontend & UI/UX',
        'description' => 'Get the exact Tailwind classes for complex responsive grids.',
        'color' => 'indigo',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>',
        'inputs' => [
            ['name' => 'requirements', 'label' => 'Grid Requirements', 'type' => 'textarea', 'placeholder' => '1 col on mobile, 2 cols on tablet, 4 cols on desktop. Make the first item span 2 cols on desktop.'],
        ],
        'system_prompt' => "You are a Tailwind expert. Translate the responsive grid requirements into the exact HTML/Tailwind classes snippet. Return JSON with 'code' (the HTML wrapper and items) and 'explanation' (how it works).",
        'outputs' => [
            ['key' => 'code', 'label' => 'HTML Snippet', 'type' => 'code'],
            ['key' => 'explanation', 'label' => 'How it Works', 'type' => 'markdown'],
        ],
    ],

    // 📈 Marketing & SEO
    'seo-tags' => [
        'title' => 'SEO Meta Tags',
        'category' => 'Marketing & SEO',
        'description' => 'Generate perfect meta, OpenGraph, and Twitter tags.',
        'color' => 'violet',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>',
        'inputs' => [
            ['name' => 'topic', 'label' => 'Page Topic / URL Description', 'type' => 'textarea', 'placeholder' => 'A landing page for a SaaS that helps dog owners track vet appointments.'],
        ],
        'system_prompt' => "You are an SEO expert. Generate perfect HTML head meta tags for the described page. Include Title (max 60 chars), Description (max 160 chars), OpenGraph, and Twitter Card tags. Return JSON with 'code' (the HTML tags) and 'analysis' (why these are good).",
        'outputs' => [
            ['key' => 'code', 'label' => 'HTML Tags', 'type' => 'code'],
            ['key' => 'analysis', 'label' => 'SEO Analysis', 'type' => 'markdown'],
        ],
    ],
    'readme-builder' => [
        'title' => 'Readme Builder',
        'category' => 'Marketing & SEO',
        'description' => 'Generate a professional README.md for your repo.',
        'color' => 'orange',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>',
        'inputs' => [
            ['name' => 'info', 'label' => 'Project Name & Description', 'type' => 'textarea', 'placeholder' => 'KarangLabs Tool Engine. Built with Laravel and React. Requires PHP 8.4.'],
        ],
        'system_prompt' => "You are an open source maintainer. Generate a beautiful, comprehensive README.md. Include Badges, Features, Installation, Usage, and License sections. Return JSON with 'markdown' (the readme content).",
        'outputs' => [
            ['key' => 'markdown', 'label' => 'README.md', 'type' => 'markdown'],
        ],
    ],
    'app-store-notes' => [
        'title' => 'App Release Notes',
        'category' => 'Marketing & SEO',
        'description' => 'Write formatted App Store and Google Play release notes.',
        'color' => 'blue',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>',
        'inputs' => [
            ['name' => 'features', 'label' => 'New Features/Fixes', 'type' => 'textarea', 'placeholder' => 'Added dark mode, fixed crash on login, improved speed'],
        ],
        'system_prompt' => "You are a mobile app marketer. Write release notes for the iOS App Store and Google Play based on the changes. Keep it engaging, concise, and compliant with character limits. Return JSON with 'ios' (iOS notes) and 'android' (Play Store notes).",
        'outputs' => [
            ['key' => 'ios', 'label' => 'iOS App Store', 'type' => 'markdown'],
            ['key' => 'android', 'label' => 'Google Play Store', 'type' => 'markdown'],
        ],
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
            ['name' => 'rate', 'label' => 'Your Rate ($/hr or Fixed)', 'type' => 'text', 'placeholder' => '$75/hr'],
        ],
        'system_prompt' => "You are a freelance consultant. Generate a professional project proposal including Scope of Work, Timeline, and a Pricing breakdown based on the client requirements and your rate. Return JSON with 'markdown' (the proposal text).",
        'outputs' => [
            ['key' => 'markdown', 'label' => 'Project Proposal', 'type' => 'markdown'],
        ],
    ],
    'cold-email' => [
        'title' => 'Cold Pitch Writer',
        'category' => 'Business & Freelance',
        'description' => 'Craft high-converting cold outreach emails.',
        'color' => 'lime',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>',
        'inputs' => [
            ['name' => 'product', 'label' => 'Your Product/Service', 'type' => 'text', 'placeholder' => 'Freelance Web Design'],
            ['name' => 'target', 'label' => 'Target Audience', 'type' => 'text', 'placeholder' => 'Local dentists in Chicago'],
        ],
        'system_prompt' => "You are a master copywriter. Write a short, punchy, high-converting cold email for the product and target. Keep it under 150 words. Focus on their pain points. Return JSON with 'subject' (3 options) and 'body' (the email text).",
        'outputs' => [
            ['key' => 'subject', 'label' => 'Subject Line Options', 'type' => 'markdown'],
            ['key' => 'body', 'label' => 'Email Body', 'type' => 'text'],
        ],
    ],
    'legal-scaffolder' => [
        'title' => 'TOS & Privacy',
        'category' => 'Business & Freelance',
        'description' => 'Scaffold boilerplate Terms of Service and Privacy Policies.',
        'color' => 'gray',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>',
        'inputs' => [
            ['name' => 'app', 'label' => 'App Name & URL', 'type' => 'text', 'placeholder' => 'KarangLabs (karanglabs.com)'],
            ['name' => 'data', 'label' => 'Data Collected', 'type' => 'text', 'placeholder' => 'Email addresses, Stripe payment info'],
        ],
        'system_prompt' => "You are a legal assistant. Generate a standard boilerplate Terms of Service and Privacy Policy for the described app. Disclaimer: State this is not professional legal advice. Return JSON with 'privacy' and 'tos'.",
        'outputs' => [
            ['key' => 'privacy', 'label' => 'Privacy Policy', 'type' => 'markdown'],
            ['key' => 'tos', 'label' => 'Terms of Service', 'type' => 'markdown'],
        ],
    ],
    'persona-generator' => [
        'title' => 'Persona Generator',
        'category' => 'Business & Freelance',
        'description' => 'Generate highly detailed user personas to guide product development.',
        'color' => 'purple',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>',
        'inputs' => [
            ['name' => 'idea', 'label' => 'App Idea / Product', 'type' => 'textarea', 'placeholder' => 'A productivity app for freelance writers that includes invoicing and time tracking.'],
        ],
        'system_prompt' => "You are a UX Researcher. Generate 3 distinct user personas based on the product idea. Include demographics, pain points, motivations, and goals for each. Return JSON with 'personas' (markdown formatted).",
        'outputs' => [
            ['key' => 'personas', 'label' => 'User Personas', 'type' => 'markdown'],
        ],
    ],

    // NEW TOOLS ADDED
    'data-anonymizer' => [
        'title' => 'Data Anonymizer',
        'category' => 'Code & Data Lifesavers',
        'description' => 'Replace sensitive data in JSON datasets with fake equivalents for safe testing.',
        'color' => 'blue',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>',
        'inputs' => [
            ['name' => 'json_data', 'label' => 'JSON Dataset', 'type' => 'textarea', 'placeholder' => '[{"name": "John Doe", "email": "john@example.com"}]'],
        ],
        'system_prompt' => "You are a data privacy expert. Analyze the provided JSON array or object. Replace all personally identifiable information (PII) such as real names, emails, phone numbers, addresses, and IP addresses with realistic but fake synthetic data (e.g., John Doe -> Alex Smith). Keep the JSON structure and non-sensitive data completely identical. Output ONLY valid JSON, do not wrap in markdown blocks. Return a JSON object with a single key 'anonymized_json' containing the formatted JSON string.",
        'outputs' => [
            ['key' => 'anonymized_json', 'label' => 'Anonymized JSON', 'type' => 'code'],
        ],
    ],
    'corporate-translator' => [
        'title' => 'Corporate Translator',
        'category' => 'Daily Productivity',
        'description' => 'Translate frustrated thoughts into highly professional corporate-speak.',
        'color' => 'indigo',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>',
        'inputs' => [
            ['name' => 'raw_thought', 'label' => 'Your Frustrated Thought', 'type' => 'textarea', 'placeholder' => 'This idea is terrible and won\'t work...'],
        ],
        'system_prompt' => "You are an expert in professional corporate communication and diplomacy. The user will provide a blunt, angry, or frustrated thought. Translate this thought into a highly polite, diplomatic, and professional message suitable for a boss, client, or stakeholder. Return your response as a JSON object with a 'translation' key containing the professional message.",
        'outputs' => [
            ['key' => 'translation', 'label' => 'Professional Translation', 'type' => 'text'],
        ],
    ],
    'jargon-buster' => [
        'title' => 'Jargon Buster',
        'category' => 'Business & Freelance',
        'description' => 'Explain dense legal documents or API docs like you\'re 5 years old.',
        'color' => 'green',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>',
        'inputs' => [
            ['name' => 'document_text', 'label' => 'Dense Text / Jargon', 'type' => 'textarea', 'placeholder' => 'Paste the legal clause or technical documentation here...'],
        ],
        'system_prompt' => "You are an expert communicator who excels at simplifying complex topics. The user will provide dense legal, corporate, or technical jargon. Explain exactly what the text means in extremely simple, plain English, as if you are explaining it to a 5-year-old or a complete beginner. Remove all jargon. Return your response as a JSON object with a 'simple_explanation' key containing your explanation.",
        'outputs' => [
            ['key' => 'simple_explanation', 'label' => 'Simple Explanation', 'type' => 'text'],
        ],
    ],
    'secret-generator' => [
        'title' => 'Secret Generator',
        'category' => 'DevOps & Architecture',
        'description' => 'Instantly generate highly secure secrets, App Keys, and database passwords.',
        'color' => 'red',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>',
        'inputs' => [
            ['name' => 'context', 'label' => 'What do you need secrets for?', 'type' => 'text', 'placeholder' => 'e.g., JWT secret, Database password, API Keys (optional)'],
        ],
        'system_prompt' => "You are a security expert. Generate 5 highly secure, random strings based on the user's request. If no specific context is given, generate a mix of 256-bit hex strings (for JWT), Base64 encoded keys, and complex 32-character alphanumeric passwords. Return a JSON object with a 'secrets' key containing a newline-separated list of the generated secrets. Ensure they look completely random and are extremely strong.",
        'outputs' => [
            ['key' => 'secrets', 'label' => 'Generated Secrets', 'type' => 'code'],
        ],
    ],
    'youtube-chapters' => [
        'title' => 'YouTube Chapters',
        'category' => 'Marketing & SEO',
        'description' => 'Generate perfectly formatted YouTube timestamp chapters optimized for SEO.',
        'color' => 'rose',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>',
        'inputs' => [
            ['name' => 'transcript', 'label' => 'Video Transcript or Notes', 'type' => 'textarea', 'placeholder' => 'Paste your rough timeline, notes, or transcript here...'],
        ],
        'system_prompt' => "You are an expert YouTube strategist and SEO specialist. The user will provide a video transcript or rough notes with timestamps. Create perfectly formatted YouTube chapters starting exactly at '00:00'. Make the chapter titles highly engaging, click-worthy, and optimized for SEO. Return your response as a JSON object with a 'chapters' key containing the formatted timestamp list as plain text block.",
        'outputs' => [
            ['key' => 'chapters', 'label' => 'YouTube Chapters', 'type' => 'code'],
        ],
    ],
    'gbp-optimizer' => [
        'title' => 'GBP Optimizer',
        'category' => 'Marketing & SEO',
        'description' => 'Generate a Google Business Profile optimization brief: categories, attributes, services, and post ideas.',
        'color' => 'emerald',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>',
        'inputs' => [
            ['name' => 'business_type', 'label' => 'Business Type & Primary City', 'type' => 'text', 'placeholder' => 'Residential HVAC repair company based in Austin, TX'],
            ['name' => 'service_area', 'label' => 'Cities / Areas You Serve (comma separated)', 'type' => 'text', 'placeholder' => 'Austin, Round Rock, Cedar Park, Georgetown', 'optional' => true],
            ['name' => 'current_categories', 'label' => 'Current GBP Categories (if known)', 'type' => 'text', 'placeholder' => 'HVAC contractor, Air conditioning repair service', 'optional' => true],
        ],
        'system_prompt' => "You are a local SEO specialist who optimizes Google Business Profiles for home-services businesses competing in the map pack. Based on the business type, city, and service area, produce: a recommended primary category plus 3-5 secondary categories, a list of relevant GBP attributes to enable, a suggested 'Services' list with short descriptions, and 3 keyword-rich but natural GBP post ideas that support local ranking. Return JSON with 'profile_brief' (markdown: categories, attributes, services) and 'post_ideas' (markdown: 3 short GBP post drafts).",
        'outputs' => [
            ['key' => 'profile_brief', 'label' => 'Profile Optimization Brief', 'type' => 'markdown'],
            ['key' => 'post_ideas', 'label' => 'GBP Post Ideas', 'type' => 'markdown'],
        ],
    ],
    'city-keyword-expander' => [
        'title' => 'City Keyword Expander',
        'category' => 'Marketing & SEO',
        'description' => 'Turn one service into local-intent keyword clusters and location page titles for every city you serve.',
        'color' => 'cyan',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>',
        'inputs' => [
            ['name' => 'service', 'label' => 'Service / Business Type', 'type' => 'text', 'placeholder' => 'Residential roof replacement'],
            ['name' => 'cities', 'label' => 'Cities / Service Areas (comma or line separated)', 'type' => 'textarea', 'placeholder' => 'Austin, Round Rock, Cedar Park, Georgetown'],
            ['name' => 'primary_keyword', 'label' => 'Core Keyword (optional)', 'type' => 'text', 'placeholder' => 'roof replacement', 'optional' => true],
        ],
        'system_prompt' => "You are a local SEO strategist planning a multi-location site expansion. For each city provided, generate a small cluster of 3-5 realistic local-intent keywords (mixing 'service + city', 'service near me' style, and service-area phrasing), avoiding keyword stuffing or duplicate content risk between nearby cities. Also propose a unique, non-duplicative Title tag (max 60 chars) and H1 for a dedicated location page for each city, differentiated enough to avoid thin/duplicate content penalties. Return JSON with 'keyword_clusters' (markdown, grouped by city heading) and 'page_titles' (markdown table or list: city, title tag, H1).",
        'outputs' => [
            ['key' => 'keyword_clusters', 'label' => 'Keyword Clusters by City', 'type' => 'markdown'],
            ['key' => 'page_titles', 'label' => 'Location Page Titles & H1s', 'type' => 'markdown'],
        ],
    ],
    'seo-content-brief' => [
        'title' => 'SEO Content Brief',
        'category' => 'Marketing & SEO',
        'description' => 'Generate a full SEO brief: search intent, semantic keywords, heading outline, meta tags, and internal linking.',
        'color' => 'sky',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>',
        'inputs' => [
            ['name' => 'page_type', 'label' => 'Page Type', 'type' => 'select', 'options' => ['Service Page', 'Location Page', 'Blog Post', 'Pillar / Topic Cluster Page']],
            ['name' => 'topic', 'label' => 'Topic / Target Keyword & Page Goal', 'type' => 'textarea', 'placeholder' => "Emergency plumbing repair service page targeting 'emergency plumber austin tx', goal: generate phone calls"],
            ['name' => 'audience', 'label' => 'Target Audience / Persona (optional)', 'type' => 'text', 'placeholder' => 'Homeowners with urgent plumbing issues, price-sensitive', 'optional' => true],
        ],
        'system_prompt' => "You are an SEO content strategist writing briefs for writers, grounded in search intent and semantic SEO. Based on the page type, topic/target keyword, goal, and audience, produce a complete content brief: the primary search intent, a target keyword plus 8-12 semantic/LSI/related terms to naturally include, a full H1-H3 heading outline matching that intent, a recommended word count range, and a draft meta title (max 60 chars) and meta description (max 160 chars). Also suggest 3-5 internal linking opportunities (what kind of existing pages this should link to/from, and suggested anchor text) to support topical authority. Return JSON with 'outline' (markdown: intent, keywords, heading outline, word count, meta title/description) and 'internal_linking' (markdown: linking suggestions).",
        'outputs' => [
            ['key' => 'outline', 'label' => 'Content Brief & Outline', 'type' => 'markdown'],
            ['key' => 'internal_linking', 'label' => 'Internal Linking Suggestions', 'type' => 'markdown'],
        ],
    ],
    'technical-seo-audit' => [
        'title' => 'Technical SEO Audit Checklist',
        'category' => 'Marketing & SEO',
        'description' => 'Generate a prioritized technical SEO audit checklist: crawlability, indexation, architecture, duplication, schema, and Core Web Vitals.',
        'color' => 'red',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>',
        'inputs' => [
            ['name' => 'site_description', 'label' => 'Site Description, Platform & Size', 'type' => 'textarea', 'placeholder' => 'WordPress multi-location home services site, ~40 pages across 6 city location pages, hosted on shared hosting'],
            ['name' => 'known_issues', 'label' => 'Known Issues or Symptoms (optional)', 'type' => 'textarea', 'placeholder' => 'Organic traffic dropped 20% last month, some location pages not showing up in Search Console', 'optional' => true],
            ['name' => 'priority_focus', 'label' => 'Focus Area', 'type' => 'select', 'options' => ['Full Audit', 'Indexation & Crawlability', 'Site Architecture & Internal Linking', 'Duplicate Content', 'Core Web Vitals & Performance', 'Schema / Structured Data']],
        ],
        'system_prompt' => "You are a technical SEO auditor. Based on the site description, platform, size, known issues, and chosen focus area, produce a prioritized technical SEO audit checklist covering crawlability, indexation, site architecture, internal linking, duplicate content, basic schema validation, and Core Web Vitals as relevant to the focus area. Group items by priority: Critical, High, Medium, Low, each with a one-line reason why it matters and what tool/method to check it with (e.g. Screaming Frog, Search Console, PageSpeed Insights). Return JSON with 'checklist' (markdown, grouped by priority) and 'quick_wins' (markdown: the top 5 fastest, highest-impact fixes to start with).",
        'outputs' => [
            ['key' => 'checklist', 'label' => 'Prioritized Audit Checklist', 'type' => 'markdown'],
            ['key' => 'quick_wins', 'label' => 'Top 5 Quick Wins', 'type' => 'markdown'],
        ],
    ],
    'backlink-outreach-playbook' => [
        'title' => 'Backlink Outreach Playbook',
        'category' => 'Marketing & SEO',
        'description' => 'Generate a link-building playbook: target site types, pitch angles, and ready-to-send outreach email templates.',
        'color' => 'fuchsia',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>',
        'inputs' => [
            ['name' => 'niche', 'label' => 'Niche / Industry & Location', 'type' => 'text', 'placeholder' => 'Residential HVAC repair, Austin TX metro'],
            ['name' => 'link_goal', 'label' => 'Link Building Goal', 'type' => 'select', 'options' => ['Local Citations & Directories', 'Guest Posts', 'Resource Page Links', 'Partnerships & Sponsorships', 'General Mixed Strategy']],
            ['name' => 'competitors', 'label' => 'Competitor Domains (optional)', 'type' => 'text', 'placeholder' => 'competitor1.com, competitor2.com', 'optional' => true],
        ],
        'system_prompt' => "You are a link building strategist for local/home-services SEO. Based on the niche, location, chosen link goal, and any competitor domains given, produce an outreach playbook: a list of specific target site/publisher types to pursue (e.g. local chambers of commerce, industry associations, home improvement blogs, local news sites) with why each is a good fit, and a distinct pitch angle for each type. Then write two outreach email templates: an initial cold outreach email and a polite follow-up, both short, personalized-feeling with placeholder brackets like [Site Name] and [Your Name], and free of spammy language. Return JSON with 'playbook' (markdown: target site types + pitch angles) and 'email_templates' (markdown: initial email + follow-up email).",
        'outputs' => [
            ['key' => 'playbook', 'label' => 'Target Sites & Pitch Angles', 'type' => 'markdown'],
            ['key' => 'email_templates', 'label' => 'Outreach Email Templates', 'type' => 'markdown'],
        ],
    ],
    'schema-markup-generator' => [
        'title' => 'Schema Markup Generator',
        'category' => 'Marketing & SEO',
        'description' => 'Generate valid JSON-LD structured data (LocalBusiness, Service, FAQ, and more) ready to paste into your site.',
        'color' => 'lime',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>',
        'inputs' => [
            ['name' => 'schema_type', 'label' => 'Schema Type', 'type' => 'select', 'options' => ['LocalBusiness', 'Service', 'FAQPage', 'Product', 'BreadcrumbList', 'Article / BlogPosting']],
            ['name' => 'business_info', 'label' => 'Business / Page Details', 'type' => 'textarea', 'placeholder' => 'HVAC company, 123 Main St Austin TX 78701, phone (512) 555-0100, hours Mon-Fri 8am-6pm, services: AC repair, furnace installation'],
            ['name' => 'extra_notes', 'label' => 'Extra Details (FAQ questions, product specs, etc.)', 'type' => 'textarea', 'placeholder' => 'For FAQPage: paste the questions and answers to include', 'optional' => true],
        ],
        'system_prompt' => "You are a structured data specialist. Generate valid JSON-LD schema.org markup for the requested schema type, using the business/page details and any extra notes provided. Include all required properties for that type per Google's structured data guidelines, plus commonly recommended optional properties when the provided info supports them (do not invent facts that were not given). Wrap the output in a <script type=\"application/ld+json\"> tag. Return JSON with 'jsonld' (the full script tag with the JSON-LD inside) and 'validation_notes' (markdown: which properties were included, which recommended properties are still missing because no data was given, and a reminder to test it in Google's Rich Results Test before publishing).",
        'outputs' => [
            ['key' => 'jsonld', 'label' => 'JSON-LD Script Tag', 'type' => 'code'],
            ['key' => 'validation_notes', 'label' => 'Validation Notes', 'type' => 'markdown'],
        ],
    ],

    // 💼 Career & Professional
    'job-application-tailor' => [
        'title' => 'Job Application Tailor',
        'category' => 'Career & Professional',
        'description' => 'Paste any job posting plus your background and get a fit analysis, tailored resume bullets, a cover letter, and interview prep, all aligned to that exact role.',
        'color' => 'violet',
        'icon' => '<svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>',
        'inputs' => [
            ['name' => 'background', 'label' => 'Your Background & Experience', 'type' => 'textarea', 'placeholder' => 'Paste your CV, work history, skills, notable projects and achievements. The more detail, the better the tailoring.'],
            ['name' => 'job_context', 'label' => 'Target Job Posting', 'type' => 'textarea', 'placeholder' => 'Paste the full job posting straight from the job board: company about, role overview, key responsibilities, requirements, etc.'],
        ],
        'system_prompt' => "You are an elite career coach, technical recruiter, and professional resume writer. The user gives you two things: (1) their own background and experience, and (2) a raw job posting they pasted from a job board, which may include the company description, role overview, key responsibilities, and requirements. Your job is to assess how well the user fits THIS specific role and produce application materials tailored to it.\n\nGrounding rules: Base every claim strictly on the user's actual background. Never invent experience, employers, titles, certifications, or metrics the user did not provide. Where the user genuinely matches, mirror the exact keywords, tools, and phrasing from the job posting. Be honest and realistic, not flattering. If the posting is vague or missing sections, work with what is given and briefly note any reasonable assumptions.\n\nProduce these four sections:\n\n1. fit_analysis (markdown): Start with an overall fit score out of 100 and a one-line verdict on whether it is worth applying. Then a 'Strong matches' list of requirements the user clearly meets, each citing the relevant part of their background. Then a 'Gaps' list of requirements they lack or only partially meet, and for each gap a concrete way to address, reframe, upskill, or compensate for it.\n\n2. resume_bullets (markdown): A tailored 2 to 3 sentence professional summary aimed at this role, followed by 5 to 8 achievement-focused resume bullet points rewritten from the user's real experience to align with this job's responsibilities and keywords. Use strong action verbs and quantify impact wherever the user's background supports it.\n\n3. cover_letter (markdown): A concise, human-sounding cover letter of roughly 200 to 300 words addressed to the hiring team, connecting the user's specific experience to this company and role. Confident and natural, never generic or robotic.\n\n4. interview_prep (markdown): 6 to 8 interview questions this specific role is likely to ask, mixing role-specific/technical and behavioral questions. Put each question in bold, and beneath it give a short suggested talking point drawn from the user's background.",
        'outputs' => [
            ['key' => 'fit_analysis', 'label' => 'Fit Analysis & Gap Map', 'type' => 'markdown'],
            ['key' => 'resume_bullets', 'label' => 'Tailored Resume Bullets', 'type' => 'markdown'],
            ['key' => 'cover_letter', 'label' => 'Cover Letter', 'type' => 'markdown'],
            ['key' => 'interview_prep', 'label' => 'Interview Prep', 'type' => 'markdown'],
        ],
    ],
];
