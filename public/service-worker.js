const CACHE_NAME = 'bdp-v1';
const OFFLINE_URLS = [
    '/',
    '/missions/create',
];

// Install — cache critical assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS))
    );
    self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Fetch — network first, fallback to cache
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                const clone = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});

// Background Sync — retry offline mission submissions
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-missions') {
        event.waitUntil(syncMissions());
    }
});

async function syncMissions() {
    const db = await openDB();
    const drafts = await getAllDrafts(db);

    for (const draft of drafts) {
        try {
            const fd = new FormData();
            Object.entries(draft).forEach(([k, v]) => {
                if (!k.startsWith('_') && v !== null && v !== undefined && v !== '') {
                    fd.append(k, v);
                }
            });

            const response = await fetch('/missions', {
                method: 'POST',
                body: fd,
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            });

            if (response.ok) {
                await deleteDraft(db, draft.sync_uuid);
            }
        } catch (e) {
            // Will retry on next sync event
        }
    }
}

function openDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open('bdp_offline', 1);
        req.onupgradeneeded = (e) => e.target.result.createObjectStore('missions_draft', { keyPath: 'sync_uuid' });
        req.onsuccess = (e) => resolve(e.target.result);
        req.onerror = reject;
    });
}

function getAllDrafts(db) {
    return new Promise((resolve, reject) => {
        const req = db.transaction('missions_draft', 'readonly').objectStore('missions_draft').getAll();
        req.onsuccess = (e) => resolve(e.target.result);
        req.onerror = reject;
    });
}

function deleteDraft(db, uuid) {
    return new Promise((resolve, reject) => {
        const req = db.transaction('missions_draft', 'readwrite').objectStore('missions_draft').delete(uuid);
        req.onsuccess = resolve;
        req.onerror = reject;
    });
}
