const STORAGE_KEY = 'vc1.groupPlanning.groups';

const safeParseGroups = (raw) => {
    if (!raw)
        return {};
    try {
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object')
            return {};
        return parsed;
    }
    catch {
        return {};
    }
};

export function normalizeAccessCode(value) {
    return String(value ?? '')
        .replace(/\s+/g, '')
        .trim()
        .toUpperCase();
}

export function createId() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function loadGroupsFromStorage() {
    if (typeof window === 'undefined' || !window.localStorage)
        return {};
    return safeParseGroups(window.localStorage.getItem(STORAGE_KEY));
}

const saveGroupsToStorage = (groups) => {
    if (typeof window === 'undefined' || !window.localStorage)
        return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
};

export function upsertGroupInStorage(group) {
    const groups = loadGroupsFromStorage();
    groups[group.id] = group;
    saveGroupsToStorage(groups);
}

export function findGroupByCode(code) {
    const normalized = normalizeAccessCode(code);
    if (!normalized)
        return null;
    const groups = loadGroupsFromStorage();
    for (const group of Object.values(groups)) {
        if (!group)
            continue;
        const groupCode = normalizeAccessCode(group.accessCode ?? group.id);
        const groupId = normalizeAccessCode(group.id);
        if (normalized === groupCode || normalized === groupId)
            return group;
    }
    return null;
}
