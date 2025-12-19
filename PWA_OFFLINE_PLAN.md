# PWA Offline Support Implementation Plan

## Overview

Add full offline functionality to the todo PWA, enabling users to access and modify their todos without an internet connection.

## Implementation Steps

### 1. Service Worker Setup

**Goal:** Create and register a service worker to handle offline requests

- Create `src/service-worker.ts` or `static/sw.js`
- Implement service worker registration in `src/routes/+layout.svelte`
- Add service worker lifecycle management (install, activate, fetch events)
- Configure SvelteKit to build the service worker (may need vite-plugin-pwa or manual config)

**Considerations:**

- Use `@sveltejs/kit` service worker support or vite-plugin-pwa
- Ensure service worker updates properly when app is updated

### 2. Caching Strategy

**Goal:** Cache application shell and assets for offline access

**App Shell Caching (Cache-First):**

- HTML files (routes)
- JavaScript bundles
- CSS files
- Fonts
- Icons and images

**Runtime Caching:**

- Dynamic content (fallback strategies)
- API responses (if any future API integration)

**Cache Versions:**

- Implement versioned caches
- Clean up old caches on service worker activation

### 3. Offline Data Persistence

**Goal:** Store todo data locally for offline access

**Current State:**

- The app uses `src/lib/stores/todos.svelte.ts` for state management
- Need to verify if todos persist beyond page reload

**Implementation:**

- Add localStorage or IndexedDB persistence
- Sync local storage with Svelte store
- Implement data migration strategy if schema changes

**Options:**

- **localStorage**: Simple, synchronous, 5-10MB limit (sufficient for todos)
- **IndexedDB**: More complex, asynchronous, larger storage, better for complex queries

**Recommendation:** Start with localStorage since todos are simple objects

### 4. Offline UI/UX Improvements

**Goal:** Provide clear feedback about online/offline status

**Features:**

- Online/offline status indicator
- Visual feedback when saving/loading data offline
- Queue actions that require network (if future sync needed)
- Offline banner or toast notification
- Disable network-dependent features when offline

**Implementation:**

- Create `OnlineStatus.svelte` component
- Use `navigator.onLine` API
- Listen to `online` and `offline` events
- Add visual indicator to header/footer

### 5. PWA Manifest Enhancements

**Goal:** Improve PWA installation and appearance

**Updates to `static/manifest.json`:**

- Add more icon sizes (512x512 for splash screens)
- Add screenshots for install prompt
- Add categories and description
- Configure orientation and display preferences
- Add shortcuts for common actions

### 6. Install Prompt

**Goal:** Encourage users to install the PWA

**Implementation:**

- Listen for `beforeinstallprompt` event
- Show custom install button/banner
- Track installation analytics (optional)
- Handle iOS-specific install instructions

### 7. Background Sync (Optional Enhancement)

**Goal:** Sync data when connection is restored

**Use Cases:**

- Queue todo updates made offline
- Sync with backend when implemented
- Handle conflict resolution

**Implementation:**

- Use Background Sync API
- Register sync events in service worker
- Implement retry logic for failed syncs

### 8. Testing Strategy

**Goal:** Ensure offline functionality works correctly

**Test Cases:**

- App loads offline after first visit
- Todos can be created/edited/deleted offline
- Data persists across page reloads
- Service worker updates correctly
- Cache invalidation works
- Online/offline transitions are smooth
- PWA can be installed on mobile devices

**Tools:**

- Chrome DevTools (Application tab, offline mode)
- Lighthouse PWA audit
- Testing on actual mobile devices
- Service worker testing in different browsers

## Technical Decisions to Make

1. **Service Worker Library:**
   - Option A: Use `vite-plugin-pwa` (Workbox under the hood, easier setup)
   - Option B: Manual service worker (more control, less dependencies)
   - Option C: SvelteKit's built-in service worker support

2. **Storage Solution:**
   - Option A: localStorage (simpler, sufficient for basic todos)
   - Option B: IndexedDB (more scalable, better for complex queries)

3. **Offline Strategy:**
   - Cache-First (faster, may show stale content)
   - Network-First with Cache Fallback (fresher content, slower)
   - Stale-While-Revalidate (best of both)

## Dependencies to Add

Potential packages (depending on chosen approach):

```json
{
	"vite-plugin-pwa": "^0.x.x", // If using automated approach
	"workbox-window": "^7.x.x", // For service worker registration
	"idb": "^8.x.x" // If using IndexedDB
}
```

## Files to Create/Modify

### New Files:

- `src/service-worker.ts` - Service worker implementation
- `src/lib/components/OnlineStatus.svelte` - Online/offline indicator
- `src/lib/utils/offline.ts` - Offline detection utilities
- `src/lib/utils/storage.ts` - LocalStorage/IndexedDB wrapper

### Modified Files:

- `src/routes/+layout.svelte` - Register service worker, add online status
- `src/lib/stores/todos.svelte.ts` - Add persistence layer
- `static/manifest.json` - Enhanced PWA manifest
- `vite.config.ts` or `svelte.config.js` - Service worker build config
- `package.json` - Add new dependencies

## Estimated Complexity

- **Basic Offline Support:** Medium (service worker + caching)
- **Data Persistence:** Low (localStorage integration)
- **UI/UX Polish:** Low-Medium (status indicators, install prompt)
- **Advanced Features:** Medium-High (background sync, conflict resolution)

## Success Criteria

- [ ] App loads and functions completely offline after first visit
- [ ] Todos persist across sessions and page reloads
- [ ] Users can add, edit, and delete todos offline
- [ ] Clear visual feedback for online/offline status
- [ ] Lighthouse PWA score > 90
- [ ] App can be installed on mobile devices
- [ ] Service worker updates without breaking the app
