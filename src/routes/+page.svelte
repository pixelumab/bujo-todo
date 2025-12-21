<script lang="ts">
	import { journalStore, type EntryType, type Entry } from '$lib/stores/todos.svelte';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';

	let newEntryText = $state('');
	let selectedType = $state<EntryType>('task');
	let popoverOpen = $state(false);

	const entryTypes: { type: EntryType; symbol: string; label: string }[] = [
		{ type: 'task', symbol: '•', label: 'Task' },
		{ type: 'note', symbol: '−', label: 'Note' },
		{ type: 'event', symbol: '○', label: 'Event' },
		{ type: 'result', symbol: '=', label: 'Result' }
	];

	function getSymbol(type: EntryType, completed: boolean): string {
		if (type === 'task' && completed) return '×';
		return entryTypes.find((t) => t.type === type)?.symbol || '•';
	}

	function getSelectedTypeInfo() {
		return entryTypes.find((t) => t.type === selectedType) || entryTypes[0];
	}

	function selectType(type: EntryType) {
		selectedType = type;
		popoverOpen = false;
	}

	function roundToQuarter(timestamp: number): number {
		const date = new Date(timestamp);
		const minutes = date.getMinutes();
		const roundedMinutes = Math.floor(minutes / 15) * 15;
		date.setMinutes(roundedMinutes, 0, 0);
		return date.getTime();
	}

	function formatTime(timestamp: number): string {
		const date = new Date(timestamp);
		const hours = date.getHours().toString().padStart(2, '0');
		const minutes = date.getMinutes().toString().padStart(2, '0');
		return `${hours}:${minutes}`;
	}

	const groupedEntries = $derived.by(() => {
		const groups = new Map<number, Entry[]>();

		journalStore.entries.forEach((entry) => {
			const quarterTimestamp = roundToQuarter(entry.timestamp || Date.now());
			if (!groups.has(quarterTimestamp)) {
				groups.set(quarterTimestamp, []);
			}
			groups.get(quarterTimestamp)!.push(entry);
		});

		return Array.from(groups.entries())
			.sort(([a], [b]) => a - b)
			.map(([timestamp, entries]) => ({ timestamp, entries }));
	});

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (newEntryText.trim()) {
			journalStore.addEntry(newEntryText.trim(), selectedType);
			newEntryText = '';
		}
	}
</script>

<div class="flex h-full max-h-full flex-col overflow-hidden">
	<div class="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-0">
		<div class="mx-auto max-w-3xl px-2 sm:px-4">
			<h1 class="mb-4 text-center text-2xl font-bold sm:mb-6 sm:text-3xl">Today's Journal</h1>

			<div class="space-y-4 pb-4 sm:space-y-6">
				{#each groupedEntries as group (group.timestamp)}
					<div>
						<div class="mb-2 font-mono text-xs text-muted-foreground sm:text-sm">
							{formatTime(group.timestamp)}
						</div>
						<ul class="space-y-0">
							{#each group.entries as entry (entry.id)}
								<li class="flex items-start gap-2 py-0.5 sm:gap-3 sm:py-1">
									<button
										onclick={() =>
											entry.type === 'task' &&
											!entry.completed &&
											journalStore.toggleEntry(entry.id)}
										class="flex flex-1 items-center gap-2 text-left transition-opacity sm:gap-3"
										class:cursor-pointer={entry.type === 'task' && !entry.completed}
										class:cursor-default={entry.type !== 'task' || entry.completed}
										class:hover:opacity-80={entry.type === 'task' && !entry.completed}
										disabled={entry.type !== 'task' || entry.completed}
										aria-label={entry.type === 'task'
											? entry.completed
												? `Task completed: "${entry.text}"`
												: `Mark task "${entry.text}" as complete`
											: `${entry.type} entry: ${entry.text}`}
									>
										<span
											class="min-w-5 flex-shrink-0 font-mono text-lg leading-none select-none sm:min-w-6 sm:text-xl"
											aria-hidden="true"
										>
											{getSymbol(entry.type, entry.completed)}
										</span>
										<span class="flex-1 text-base leading-relaxed break-words sm:text-lg">
											{entry.text}
										</span>
									</button>
								</li>
							{/each}
						</ul>
					</div>
				{/each}
			</div>

			{#if journalStore.entries.length === 0}
				<p
					class="py-8 text-center text-sm text-muted-foreground sm:text-base"
					role="status"
					aria-live="polite"
				>
					No entries yet. Add one below!
				</p>
			{/if}
		</div>
	</div>

	<form
		onsubmit={handleSubmit}
		class="flex-shrink-0 p-4 sm:p-4"
		style="padding-bottom: max(1.5rem, var(--safe-area-inset-bottom));"
	>
		<div class="mx-auto max-w-3xl px-2 sm:px-4">
			<!-- Input container -->
			<div
				class="relative flex items-center gap-2 rounded-full border-2 border-input bg-background px-3 py-2.5 shadow-lg transition-all focus-within:border-ring focus-within:shadow-xl sm:gap-2.5 sm:px-4 md:px-3 md:py-2"
			>
				<!-- Type selector button -->
				<Popover.Root bind:open={popoverOpen}>
					<Popover.Trigger
						type="button"
						class={buttonVariants({ variant: 'outline', size: 'icon' }) +
							' h-9 w-9 flex-shrink-0 rounded-full border-2 font-mono text-lg shadow-sm hover:bg-accent active:scale-95 sm:h-10 sm:w-10 sm:text-xl md:h-9 md:w-9 md:text-lg'}
						aria-label="Select entry type"
					>
						{getSelectedTypeInfo().symbol}
					</Popover.Trigger>
					<Popover.Content side="top" align="start" class="w-40 p-0">
						<div class="flex flex-col">
							{#each entryTypes as { type, symbol, label } (type)}
								<button
									type="button"
									onclick={() => selectType(type)}
									class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-muted {selectedType ===
									type
										? 'bg-muted/50'
										: ''}"
									aria-label={`Select ${label} type`}
								>
									<span class="font-mono text-base">{symbol}</span>
									<span>{label}</span>
								</button>
							{/each}
						</div>
					</Popover.Content>
				</Popover.Root>

				<!-- Input field -->
				<Input
					type="text"
					bind:value={newEntryText}
					placeholder="What's on your mind?"
					class="flex-1 border-0 bg-transparent px-1 py-0 text-base shadow-none focus-visible:ring-0 sm:px-2 sm:text-lg md:text-base"
					aria-label="New entry text"
					autocomplete="off"
				/>

				<!-- Send button -->
				{#if newEntryText.trim()}
					<button
						type="submit"
						class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg active:scale-95 sm:h-10 sm:w-10 md:h-9 md:w-9"
						aria-label="Add entry"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="h-5 w-5 sm:h-5.5 sm:w-5.5 md:h-4.5 md:w-4.5"
						>
							<path d="M12 19V5" />
							<path d="m5 12 7-7 7 7" />
						</svg>
					</button>
				{:else}
					<div
						class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground sm:h-10 sm:w-10 md:h-9 md:w-9"
						aria-hidden="true"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="h-5 w-5 sm:h-5.5 sm:w-5.5 md:h-4.5 md:w-4.5"
						>
							<path d="M12 19V5" />
							<path d="m5 12 7-7 7 7" />
						</svg>
					</div>
				{/if}
			</div>
		</div>
	</form>
</div>
