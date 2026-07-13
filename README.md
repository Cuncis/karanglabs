# KarangLabs: AI Workflow Automations

<p align="center">
  <img src="https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel"/>
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind"/>
  <img src="https://img.shields.io/badge/Anthropic_AI-000000?style=for-the-badge&logo=anthropic&logoColor=white" alt="Anthropic"/>
</p>

A curated suite of **25 specialized, single-purpose AI tools** designed to eliminate boilerplate and automate development workflows. 

Built with a sleek, minimalist **Bento Grid UI** and powered by a **Dynamic AI Engine**, this application allows you to spin up new AI-powered tools instantly just by modifying a single PHP configuration file—no extra React components or Laravel controllers required.

---

## ✨ Features

- **Dynamic Tool Engine:** Add new tools by simply defining their inputs, prompts, and outputs in `config/karangtools.php`. The system dynamically generates the UI form, handles the API request, parses the AI response, and formats the output perfectly.
- **Minimalist UI/UX:** A gorgeous black-and-white aesthetic with subtle color highlights, designed for maximum focus and zero distractions.
- **Anthropic Claude 3.5 Integration:** Highly accurate, fast, and strict JSON-structured responses.
- **25 Pre-built Tools** spread across 6 categories:
  - ⚡ **Daily Productivity:** Context Bundlers, Regex Whisperers, and Changelog Generators.
  - 🧑‍💻 **Code & Data Lifesavers:** SQL translators, Stack Trace Decoders, and JSON-to-Type converters.
  - 🚀 **DevOps & Architecture:** Docker Compose Wizards, Nginx Builders, and GitHub Actions Scaffolders.
  - 🎨 **Frontend & UI/UX:** SVG to React converters, Tailwind Palette generators, and Grid calculators.
  - 📈 **Marketing & SEO:** SEO tag architects and Readme.md builders.
  - 💼 **Business & Freelance:** Project Quote builders, Cold Pitch writers, and Persona generators.

---

## 🚀 Installation

1. **Clone the repository and install dependencies:**
   ```bash
   git clone <your-repo-url> karanglabs
   cd karanglabs
   composer install
   npm install
   ```

2. **Setup the Environment file:**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

3. **Configure the Database (SQLite default):**
   ```bash
   touch database/database.sqlite
   php artisan migrate
   ```

4. **Add your AI API Key:**
   Open `.env` and add your Anthropic API Key:
   ```env
   ANTHROPIC_API_KEY="sk-ant-api03-..."
   ```

5. **Build assets and run the development server:**
   ```bash
   npm run dev
   ```
   Open a new terminal and run:
   ```bash
   php artisan serve
   ```

---

## 🛠 How to Add a New Tool

You don't need to write any React code or create new routes to add a tool! Just open `config/karangtools.php` and add a new array entry.

**Example:**
```php
'css-minifier' => [
    'title' => 'CSS Minifier',
    'category' => 'Frontend & UI/UX',
    'description' => 'Paste raw CSS and instantly get the minified version.',
    'color' => 'pink', // Adds a subtle pink hover glow to the icon
    'icon' => '<svg>...</svg>', // Your raw SVG icon
    'inputs' => [
        ['name' => 'css', 'label' => 'Raw CSS', 'type' => 'textarea', 'placeholder' => 'body { ... }']
    ],
    'system_prompt' => "You are an expert developer. Minify the provided CSS perfectly. Return a JSON object with a 'code' key.",
    'outputs' => [
        ['key' => 'code', 'label' => 'Minified CSS', 'type' => 'code']
    ]
]
```
The **Dynamic AI Engine** will automatically:
1. Put it on the homepage under the correct category.
2. Generate a custom `/t/css-minifier` landing page with the textarea.
3. Wire it up to the API endpoint.
4. Render the output securely as a code block with a "Copy" button.

---

## 💻 Tech Stack

- **Backend:** Laravel 11, PHP 8.4
- **Frontend:** React 18, Inertia.js v2
- **Styling:** Tailwind CSS v3
- **AI Integration:** Laravel HTTP Client -> Anthropic API (Claude 3.5 Sonnet)

## 📄 License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT). This project's proprietary code belongs to KarangLabs.
