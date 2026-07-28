// Client-only replacement for the server-backed "Simpan project" feature in
// the full Studio app — no server here, so saved prompts live in this browser's
// localStorage only (per device, not synced across devices).

const STORAGE_KEY = 'wl_projects';
const MAX_PER_ENGINE = 20;

function readAll() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);

        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function writeAll(projects) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function listProjects(engine = null) {
    const all = readAll().sort((a, b) => b.created_at.localeCompare(a.created_at));

    return engine ? all.filter((p) => p.engine === engine) : all;
}

export function saveProject({ engine, title, brief, prompt }) {
    const entry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        engine,
        title,
        brief,
        prompt,
        created_at: new Date().toISOString(),
    };

    const withNew = [entry, ...readAll()];
    const perEngineCount = {};
    const capped = withNew.filter((p) => {
        perEngineCount[p.engine] = (perEngineCount[p.engine] || 0) + 1;

        return perEngineCount[p.engine] <= MAX_PER_ENGINE;
    });

    writeAll(capped);

    return capped;
}

export function deleteProject(id) {
    writeAll(readAll().filter((p) => p.id !== id));
}
