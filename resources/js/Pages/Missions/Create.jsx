import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, MapPin, Save, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

const DB_NAME = 'bdp_offline';
const STORE_NAME = 'missions_draft';

function openDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = (e) => {
            e.target.result.createObjectStore(STORE_NAME, { keyPath: 'sync_uuid' });
        };
        req.onsuccess = (e) => resolve(e.target.result);
        req.onerror = reject;
    });
}

async function saveDraft(draft) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(draft);
        tx.oncomplete = resolve;
        tx.onerror = reject;
    });
}

export default function MissionCreate({ projets }) {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [geoLoading, setGeoLoading] = useState(false);
    const [photos, setPhotos] = useState([]);
    const [lastSaved, setLastSaved] = useState(null);
    const syncUuid = useRef(uuidv4());
    const autoSaveTimer = useRef(null);
    const fileRef = useRef(null);

    const { data, setData, post, processing, errors } = useForm({
        projet_id: '',
        date_visite: new Date().toISOString().split('T')[0],
        observations: '',
        points_positifs: '',
        points_negatifs: '',
        recommandations: '',
        latitude: '',
        longitude: '',
        sync_uuid: syncUuid.current,
    });

    // Online/offline detection
    useEffect(() => {
        const onOnline = () => setIsOnline(true);
        const onOffline = () => setIsOnline(false);
        window.addEventListener('online', onOnline);
        window.addEventListener('offline', onOffline);
        return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
    }, []);

    // Auto-save every 30 seconds to IndexedDB
    useEffect(() => {
        clearTimeout(autoSaveTimer.current);
        autoSaveTimer.current = setTimeout(() => {
            saveDraft({ ...data, sync_uuid: syncUuid.current, _savedAt: Date.now() })
                .then(() => setLastSaved(new Date()))
                .catch(() => {});
        }, 30000);
        return () => clearTimeout(autoSaveTimer.current);
    }, [data]);

    const getGeolocation = () => {
        setGeoLoading(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setData((prev) => ({ ...prev, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
                setGeoLoading(false);
            },
            () => setGeoLoading(false),
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handlePhoto = async (e) => {
        const files = Array.from(e.target.files ?? []);
        const compressed = await Promise.all(
            files.map((f) => compressImage(f, 1024 * 1024))
        );
        setPhotos((prev) => [...prev, ...compressed]);
    };

    const compressImage = (file, maxBytes) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let { width, height } = img;
                    const scale = Math.min(1, Math.sqrt(maxBytes / file.size));
                    canvas.width = Math.round(width * scale);
                    canvas.height = Math.round(height * scale);
                    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                    canvas.toBlob((blob) => resolve(new File([blob], file.name, { type: 'image/jpeg' })), 'image/jpeg', 0.85);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isOnline) {
            // Save to IndexedDB for later sync
            await saveDraft({ ...data, sync_uuid: syncUuid.current, _photos: photos.map((p) => p.name), _savedAt: Date.now() });

            if ('serviceWorker' in navigator && 'SyncManager' in window) {
                const reg = await navigator.serviceWorker.ready;
                await reg.sync.register('sync-missions');
            }

            // Show confirmation screen
            window.location.href = `/missions/confirmation?offline=1`;
            return;
        }

        const fd = new FormData();
        Object.entries(data).forEach(([k, v]) => { if (v !== null && v !== '') fd.append(k, v); });
        photos.forEach((p) => fd.append('photos[]', p));

        post('/missions', { data: fd });
    };

    return (
        <>
            <Head title="Nouvelle visite terrain" />
            <div className="min-h-screen bg-background pb-24">
                {/* Mobile header */}
                <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-card px-4">
                    <h1 className="text-base font-semibold">Nouvelle visite</h1>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {isOnline ? (
                            <><Wifi className="h-3 w-3 text-green-500" /> En ligne</>
                        ) : (
                            <><WifiOff className="h-3 w-3 text-amber-500" /> Hors ligne</>
                        )}
                    </div>
                </header>

                {!isOnline && (
                    <Alert className="m-4 border-amber-200 bg-amber-50">
                        <AlertDescription className="text-amber-800 text-sm">
                            Mode hors ligne — votre saisie sera sauvegardée et synchronisée automatiquement à la reconnexion.
                        </AlertDescription>
                    </Alert>
                )}

                {lastSaved && (
                    <p className="text-xs text-muted-foreground px-4 pt-2">
                        Sauvegardé à {lastSaved.toLocaleTimeString('fr-FR')}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {/* Projet */}
                    <div className="space-y-2">
                        <Label>Projet</Label>
                        <Select value={String(data.projet_id)} onValueChange={(v) => setData('projet_id', v)}>
                            <SelectTrigger className="min-h-[56px]">
                                <SelectValue placeholder="Sélectionner un projet" />
                            </SelectTrigger>
                            <SelectContent>
                                {projets.map((p) => (
                                    <SelectItem key={p.id} value={String(p.id)}>
                                        {p.code} — {p.titre}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.projet_id && <p className="text-xs text-destructive">{errors.projet_id}</p>}
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                        <Label htmlFor="date_visite">Date de la visite</Label>
                        <Input
                            id="date_visite"
                            type="date"
                            value={data.date_visite}
                            onChange={(e) => setData('date_visite', e.target.value)}
                            className="min-h-[56px]"
                        />
                    </div>

                    {/* Géolocalisation */}
                    <div className="space-y-2">
                        <Label>Localisation GPS</Label>
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={getGeolocation} disabled={geoLoading} className="min-h-[56px] flex-1">
                                {geoLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                                {data.latitude ? `${Number(data.latitude).toFixed(4)}, ${Number(data.longitude).toFixed(4)}` : 'Localiser'}
                            </Button>
                        </div>
                    </div>

                    {/* Observations */}
                    {[
                        { key: 'observations', label: 'Observations générales' },
                        { key: 'points_positifs', label: 'Points positifs' },
                        { key: 'points_negatifs', label: 'Points négatifs' },
                        { key: 'recommandations', label: 'Recommandations' },
                    ].map(({ key, label }) => (
                        <div key={key} className="space-y-2">
                            <Label htmlFor={key}>{label}</Label>
                            <textarea
                                id={key}
                                value={data[key]}
                                onChange={(e) => setData(key, e.target.value)}
                                rows={3}
                                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                placeholder="Saisissez vos observations…"
                            />
                        </div>
                    ))}

                    {/* Photos */}
                    <div className="space-y-2">
                        <Label>Photos ({photos.length})</Label>
                        <Button type="button" variant="outline" className="min-h-[56px] w-full" onClick={() => fileRef.current?.click()}>
                            <Camera className="mr-2 h-4 w-4" />
                            {photos.length > 0 ? `${photos.length} photo(s) — Ajouter` : 'Prendre une photo'}
                        </Button>
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            multiple
                            className="hidden"
                            onChange={handlePhoto}
                        />
                        {photos.length > 0 && (
                            <div className="flex gap-2 flex-wrap">
                                {photos.map((p, i) => (
                                    <img
                                        key={i}
                                        src={URL.createObjectURL(p)}
                                        alt={`Photo ${i + 1}`}
                                        className="h-16 w-16 object-cover rounded-md"
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </form>

                {/* Sticky submit button */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
                    <Button
                        className="w-full min-h-[56px] text-base"
                        disabled={processing || !data.projet_id}
                        onClick={handleSubmit}
                    >
                        {processing ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                            <Save className="mr-2 h-5 w-5" />
                        )}
                        {isOnline ? 'Enregistrer' : 'Sauvegarder hors ligne'}
                    </Button>
                </div>
            </div>
        </>
    );
}
