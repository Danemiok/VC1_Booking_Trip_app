import type { StoredGroup } from './types';

const GROUP_STORE_KEY = 'group_planning_groups_v1';

export const normalizeAccessCode = (code: string): string => code.replace(/\s+/g, '').trim().toUpperCase();

export const loadGroupsFromStorage = (): Record<string, StoredGroup> => {
  try {
    const raw = localStorage.getItem(GROUP_STORE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

export const saveGroupsToStorage = (groups: Record<string, StoredGroup>) => {
  localStorage.setItem(GROUP_STORE_KEY, JSON.stringify(groups));
};

export const upsertGroupInStorage = (group: StoredGroup) => {
  const groups = loadGroupsFromStorage();
  groups[group.id] = group;
  saveGroupsToStorage(groups);
};

export const findGroupByCode = (code: string): StoredGroup | null => {
  const groups = loadGroupsFromStorage();
  const normalized = normalizeAccessCode(code);
  const match = Object.values(groups).find((group) => group.accessCode.toUpperCase() === normalized);
  return match ?? null;
};

export const createId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
