import { browser } from '$app/environment';

export type EntryType = 'task' | 'note' | 'event' | 'result';

export interface Entry {
	id: string;
	text: string;
	type: EntryType;
	completed: boolean;
	timestamp: number;
}

const STORAGE_KEY = 'journal-entries';

function generateId(): string {
	// Fallback for browsers that don't support crypto.randomUUID()
	if (typeof crypto !== 'undefined' && crypto.randomUUID) {
		return crypto.randomUUID();
	}
	// Simple fallback UUID v4 generator
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		const r = (Math.random() * 16) | 0;
		const v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

function loadEntries(): Entry[] {
	if (!browser) return [];
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (!stored) return [];
		return JSON.parse(stored);
	} catch (error) {
		console.error('Failed to load entries from localStorage:', error);
		return [];
	}
}

function saveEntries(entries: Entry[]) {
	if (!browser) return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
	} catch (error) {
		console.error('Failed to save entries to localStorage:', error);
	}
}

class JournalStore {
	entries = $state<Entry[]>(loadEntries());

	addEntry(text: string, type: EntryType) {
		const newEntry: Entry = {
			id: generateId(),
			text,
			type,
			completed: false,
			timestamp: Date.now()
		};
		this.entries = [...this.entries, newEntry];
		saveEntries(this.entries);
	}

	toggleEntry(id: string) {
		this.entries = this.entries.map((entry) =>
			entry.id === id ? { ...entry, completed: !entry.completed } : entry
		);
		saveEntries(this.entries);
	}

	deleteEntry(id: string) {
		this.entries = this.entries.filter((entry) => entry.id !== id);
		saveEntries(this.entries);
	}
}

export const journalStore = new JournalStore();
