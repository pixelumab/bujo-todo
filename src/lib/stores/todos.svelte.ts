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
const LAST_CLEAR_KEY = 'journal-last-clear';

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

function getLastClearDate(): string | null {
	if (!browser) return null;
	try {
		return localStorage.getItem(LAST_CLEAR_KEY);
	} catch (error) {
		console.error('Failed to load last clear date:', error);
		return null;
	}
}

function setLastClearDate(date: string) {
	if (!browser) return;
	try {
		localStorage.setItem(LAST_CLEAR_KEY, date);
	} catch (error) {
		console.error('Failed to save last clear date:', error);
	}
}

function getTodayDateString(): string {
	const today = new Date();
	// Use local date instead of UTC to clear at local midnight
	const year = today.getFullYear();
	const month = String(today.getMonth() + 1).padStart(2, '0');
	const day = String(today.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`; // Returns YYYY-MM-DD in local timezone
}

function shouldClearEntries(): boolean {
	const lastClear = getLastClearDate();
	const today = getTodayDateString();
	return lastClear !== today;
}

class JournalStore {
	entries = $state<Entry[]>(loadEntries());

	constructor() {
		// Check if we need to clear entries on initialization
		if (browser && shouldClearEntries()) {
			this.clearAllEntries();
		}

		// Set up interval to check for date change every minute
		if (browser) {
			setInterval(() => {
				if (shouldClearEntries()) {
					this.clearAllEntries();
				}
			}, 60000); // Check every minute
		}
	}

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
			entry.id === id && !entry.completed ? { ...entry, completed: true } : entry
		);
		saveEntries(this.entries);
	}

	deleteEntry(id: string) {
		this.entries = this.entries.filter((entry) => entry.id !== id);
		saveEntries(this.entries);
	}

	clearAllEntries() {
		this.entries = [];
		saveEntries(this.entries);
		setLastClearDate(getTodayDateString());
		console.log('Entries cleared for new day');
	}
}

export const journalStore = new JournalStore();
