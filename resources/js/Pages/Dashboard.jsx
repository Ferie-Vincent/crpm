import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FolderOpen, CheckCircle2, XCircle, MapPin, Users, Wallet, TrendingUp, ClipboardCheck, Plus, Save, Search } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { MoneyInput } from '@/components/ui/money-input';
import { fmt, separerMilliers } from '@/lib/currency';

// ── Commune → GPS (Casamance) ────────────────────────────────────────────────
const COMMUNE_COORDS = {
    // ── Sénégal — Casamance ───────────────────────────────────────────────────
    'Affiniam':        [12.5833, -15.8667],
    'Tenghory':        [12.7167, -16.3833],
    'Bignona':         [12.8500, -16.2167],
    'Coubalan':        [12.5400, -16.4200],
    'Ziguinchor':      [12.5573, -16.2719],
    'Basse Casamance': [12.3833, -16.7167],
    'Kafountine':      [12.3500, -16.7000],
    'Oussouye':        [12.4833, -16.5500],
    'Sédhiou':         [12.7073, -15.5572],
    'Kolda':           [12.8942, -14.9418],

    // ── Côte d'Ivoire ─────────────────────────────────────────────────────────
    'Abidjan':         [5.3600,  -4.0083],
    'Bouaké':          [7.6833,  -5.0333],
    'Yamoussoukro':    [6.8276,  -5.2893],
    'Korhogo':         [9.4500,  -5.6333],
    'Man':             [7.4128,  -7.5536],
    'San-Pédro':       [4.7485,  -6.6363],

    // ── Guinée ────────────────────────────────────────────────────────────────
    'Conakry':         [9.5370,  -13.6773],
    'Kindia':          [10.0600, -12.8600],
    'Labé':            [11.3167, -12.3000],
    'Kankan':          [10.3833, -9.3000],
    'Boké':            [10.9333, -14.2833],

    // ── Cameroun ─────────────────────────────────────────────────────────────
    'Yaoundé':         [3.8667,  11.5167],
    'Douala':          [4.0500,  9.7000],
    'Bafoussam':       [5.4667,  10.4167],
    'Garoua':          [9.3000,  13.4000],
    'Maroua':          [10.5833, 14.3167],

    // ── Madagascar ────────────────────────────────────────────────────────────
    'Antananarivo':    [-18.9167, 47.5167],
    'Toamasina':       [-18.1492, 49.4022],
    'Mahajanga':       [-15.7167, 46.3167],
    'Fianarantsoa':    [-21.4526, 47.0858],
    'Toliara':         [-23.3537, 43.6699],
    'Antsirabe':       [-19.8667, 47.0333],

    // ── Comores ───────────────────────────────────────────────────────────────
    'Moroni':          [-11.7017, 43.2551],
    'Mutsamudu':       [-12.1696, 44.3935],
    'Fomboni':         [-12.2780, 43.7408],
};
const DEFAULT_COORDS = [12.5573, -16.2719]; // Ziguinchor

function getCoords(projet) {
    return COMMUNE_COORDS[projet.commune] ?? COMMUNE_COORDS[projet.region] ?? DEFAULT_COORDS;
}

// ── Statut config ────────────────────────────────────────────────────────────
const STATUT = {
    en_preparation: { label: 'En préparation', cls: 'bg-slate-100 text-slate-600' },
    en_cours:       { label: 'En cours',        cls: 'bg-blue-100 text-blue-700' },
    suspendu:       { label: 'Suspendu',         cls: 'bg-amber-100 text-amber-700' },
    termine:        { label: 'Terminé',          cls: 'bg-green-100 text-green-700' },
    annule:         { label: 'Annulé',           cls: 'bg-red-100 text-red-700' },
};

// ── KPI card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, subtitle, icon: Icon, accent }) {
    const accents = {
        orange:  { bar: 'bg-orange-400',  icon: 'bg-orange-50 text-orange-500',  ring: 'border-orange-100' },
        teal:    { bar: 'bg-teal-500',    icon: 'bg-teal-50 text-teal-600',      ring: 'border-teal-100' },
        blue:    { bar: 'bg-blue-500',    icon: 'bg-blue-50 text-blue-600',      ring: 'border-blue-100' },
        violet:  { bar: 'bg-violet-500',  icon: 'bg-violet-50 text-violet-600',  ring: 'border-violet-100' },
    };
    const a = accents[accent] ?? accents.teal;
    return (
        <Card className={`shadow-sm border ${a.ring} overflow-hidden`}>
            <div className={`h-1 w-full ${a.bar}`} />
            <CardContent className="pt-4 pb-5 px-5">
                <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-muted-foreground leading-snug">{label}</p>
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${a.icon}`}>
                        <Icon style={{ width: 18, height: 18 }} />
                    </div>
                </div>
                <p className="mt-3 text-3xl font-bold tracking-tight text-foreground leading-none">{value}</p>
                {subtitle && <p className="mt-1.5 text-xs text-muted-foreground">{subtitle}</p>}
            </CardContent>
        </Card>
    );
}

// ── Leaflet map ──────────────────────────────────────────────────────────────
function refreshMarkers(L, projets, layer, map) {
    layer.clearLayers();
    projets.forEach((p) => {
        const [lat, lng] = getCoords(p);
        const statut = p.statut ? p.statut.replace('_', ' ') : '—';
        const flagHtml = p.pays_cca2
            ? `<img src="https://flagcdn.com/w20/${p.pays_cca2}.png" width="16" height="11" style="border-radius:2px;vertical-align:middle;margin-right:4px;box-shadow:0 1px 2px rgba(0,0,0,.2)" />`
            : '';
        const popup = L.popup({ maxWidth: 260 }).setContent(`
            <div style="font-family:sans-serif;padding:2px 0">
                <div style="display:flex;align-items:center;gap:4px;margin-bottom:4px">
                    ${flagHtml}
                    <span style="font-size:10px;color:#6b7280">${p.pays_nom ?? ''}</span>
                    <span style="flex:1"></span>
                    <span style="font-size:10px;color:#6b7280;font-family:monospace">${p.code}</span>
                </div>
                <div style="font-size:13px;font-weight:600;margin-bottom:6px;line-height:1.3">${p.titre}</div>
                <div style="display:flex;gap:8px;font-size:11px;color:#6b7280;margin-bottom:8px">
                    <span>${p.commune ?? p.region ?? '—'}</span>
                    <span>·</span>
                    <span>${statut}</span>
                </div>
                <div style="background:#f3f4f6;border-radius:6px;padding:4px 8px;font-size:11px;margin-bottom:8px">
                    Complétude&nbsp;: <strong>${p.completude}%</strong>
                </div>
                <a href="/projets/${p.id}"
                   style="display:block;text-align:center;background:#111827;color:#fff;
                          text-decoration:none;padding:5px 10px;border-radius:6px;font-size:12px;font-weight:500">
                    Voir la fiche →
                </a>
            </div>
        `);
        L.marker([lat, lng]).bindPopup(popup).addTo(layer);
    });

    if (projets.length > 0) {
        const coords = projets.map(getCoords);
        map.fitBounds(coords, { padding: [30, 30] });
    }
}

function ProjetMap({ projets, height = 420 }) {
    const mapRef = useRef(null);
    const instanceRef = useRef(null);
    const markersLayerRef = useRef(null);
    const leafletRef = useRef(null);

    // ── Init map once ──────────────────────────────────────────────────────────
    useEffect(() => {
        let cancelled = false;

        import('leaflet').then((L) => {
            if (cancelled || instanceRef.current) return;

            delete L.Icon.Default.prototype._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            });

            const map = L.map(mapRef.current, {
                center: DEFAULT_COORDS,
                zoom: 5,
                scrollWheelZoom: false,
            });
            instanceRef.current = map;
            leafletRef.current = L;

            setTimeout(() => map.invalidateSize(true), 200);
            const ro = new ResizeObserver(() => map.invalidateSize(true));
            ro.observe(mapRef.current);
            map._resizeObserver = ro;

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 18,
            }).addTo(map);

            const layer = L.layerGroup().addTo(map);
            markersLayerRef.current = layer;

            refreshMarkers(L, projets, layer, map);
        });

        return () => {
            cancelled = true;
            if (instanceRef.current) {
                instanceRef.current._resizeObserver?.disconnect();
                instanceRef.current.remove();
                instanceRef.current = null;
                markersLayerRef.current = null;
                leafletRef.current = null;
            }
        };
    }, []);

    // ── Reactive markers when projets change (filters) ─────────────────────────
    useEffect(() => {
        const L = leafletRef.current;
        const layer = markersLayerRef.current;
        const map = instanceRef.current;
        if (!L || !layer || !map) return;
        refreshMarkers(L, projets, layer, map);
    }, [projets]);

    return (
        <div style={{ position: 'relative', width: '100%', height: `${height}px` }}>
            <div
                ref={mapRef}
                style={{
                    position: 'absolute', inset: 0,
                    height: `${height}px`, width: '100%',
                    borderRadius: '0 0 0.75rem 0.75rem',
                }}
            />
        </div>
    );
}

// ── Datatable projets ─────────────────────────────────────────────────────────
const PAGE_SIZE = 10;

function ProjetsDataTable({ projets }) {
    const { devise_affichage = 'locale', taux_eur = {} } = usePage().props;
    const fmtMontant = (v, sourceDevise = 'XOF') => fmt(v, sourceDevise, devise_affichage, taux_eur);

    const [search, setSearch]         = useState('');
    const [filterStatut, setStatut]   = useState('');
    const [filterElig, setElig]       = useState('');
    const [page, setPage]             = useState(1);

    const filtered = projets.filter(p => {
        const q = search.toLowerCase();
        const matchSearch = !q || p.code.toLowerCase().includes(q) || p.titre.toLowerCase().includes(q) || (p.porteur ?? '').toLowerCase().includes(q);
        const matchStatut = !filterStatut || p.statut === filterStatut;
        const matchElig   = filterElig === '' || (filterElig === '1' ? p.eligible === true : p.eligible === false);
        return matchSearch && matchStatut && matchElig;
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const rows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const resetPage = () => setPage(1);

    if (projets.length === 0) return (
        <Card className="shadow-none border-border/60 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted mb-4">
                    <FolderOpen className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="font-medium">Aucun projet pour le moment</p>
                <p className="text-sm text-muted-foreground mt-1">Créez votre premier projet via le bouton ci-dessus.</p>
            </CardContent>
        </Card>
    );

    const selCls = "h-8 min-w-[140px] rounded-md border border-border bg-background px-2.5 pr-7 text-xs font-medium shadow-sm cursor-pointer hover:bg-muted focus:outline-none focus:ring-1 focus:ring-ring transition-colors";

    return (
        <Card className="shadow-none border-border/60">
            {/* Toolbar */}
            <CardHeader className="pb-3 pt-4 px-5">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-1 flex-wrap">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                            <Input
                                value={search}
                                onChange={e => { setSearch(e.target.value); resetPage(); }}
                                placeholder="Rechercher code, titre, porteur…"
                                className="h-8 pl-8 w-72 text-xs"
                            />
                        </div>
                        <select value={filterStatut} onChange={e => { setStatut(e.target.value); resetPage(); }} className={selCls}>
                            <option value="">Tous les statuts</option>
                            {Object.entries(STATUT).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                        <select value={filterElig} onChange={e => { setElig(e.target.value); resetPage(); }} className={selCls}>
                            <option value="">Éligibilité</option>
                            <option value="1">Éligible</option>
                            <option value="0">Non éligible</option>
                        </select>
                        {(search || filterStatut || filterElig) && (
                            <button onClick={() => { setSearch(''); setStatut(''); setElig(''); resetPage(); }}
                                className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline">
                                Réinitialiser
                            </button>
                        )}
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                        {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
                    </span>
                </div>
            </CardHeader>

            {/* Table */}
            <CardContent className="px-0 pb-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-y border-border/60 bg-muted/30">
                                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Code</th>
                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Titre</th>
                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Porteur</th>
                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Domaine</th>
                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Catégorie</th>
                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Statut</th>
                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Éligibilité</th>
                                <th className="px-3 py-2.5 text-right text-xs font-semibold text-muted-foreground">Subvention</th>
                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Décaissement</th>
                                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Complétude</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {rows.length === 0 ? (
                                <tr><td colSpan={10} className="py-10 text-center text-xs text-muted-foreground">Aucun résultat pour ces critères.</td></tr>
                            ) : rows.map((p) => {
                                const st = STATUT[p.statut] ?? { label: p.statut, cls: 'bg-slate-100 text-slate-600' };
                                const taux = p.montant_accorde > 0 ? Math.round((p.montant_decaisse / p.montant_accorde) * 100) : 0;
                                return (
                                    <tr key={p.id} className="hover:bg-muted/20 transition-colors group">
                                        <td className="px-4 py-2.5">
                                            <Link href={`/projets/${p.id}`} className="font-mono text-xs font-semibold text-foreground group-hover:underline">{p.code}</Link>
                                        </td>
                                        <td className="px-3 py-2.5 max-w-[180px]">
                                            <Link href={`/projets/${p.id}`} className="text-xs font-medium text-foreground line-clamp-2 leading-snug group-hover:underline">{p.titre}</Link>
                                        </td>
                                        <td className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{p.porteur ?? '—'}</td>
                                        <td className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{p.domaine ?? '—'}</td>
                                        <td className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{p.categorie ?? '—'}</td>
                                        <td className="px-3 py-2.5">
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${st.cls}`}>{st.label}</span>
                                        </td>
                                        <td className="px-3 py-2.5">
                                            {p.eligible === true  && <span className="flex items-center gap-1 text-xs text-green-700"><CheckCircle2 className="h-3.5 w-3.5" />Éligible</span>}
                                            {p.eligible === false && <span className="flex items-center gap-1 text-xs text-red-500"><XCircle className="h-3.5 w-3.5" />Non éligible</span>}
                                            {p.eligible === null  && <span className="text-xs text-muted-foreground">—</span>}
                                        </td>
                                        <td className="px-3 py-2.5 text-right">
                                            {p.montant_accorde > 0
                                                ? <span className="text-xs font-semibold tabular-nums whitespace-nowrap">{fmtMontant(p.montant_accorde, p.devise)}</span>
                                                : <span className="text-xs text-muted-foreground">—</span>
                                            }
                                        </td>
                                        <td className="px-3 py-2.5">
                                            {p.montant_accorde > 0 ? (
                                                <TooltipProvider delayDuration={200}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className="flex items-center gap-1.5 cursor-default w-fit">
                                                                <Progress value={taux} className="h-1.5 w-12" />
                                                                <span className={`text-xs font-semibold tabular-nums ${taux >= 80 ? 'text-green-600' : taux >= 50 ? 'text-amber-600' : 'text-red-500'}`}>{taux}%</span>
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="top" className="text-xs">
                                                            <p className="font-medium">{fmtMontant(p.montant_decaisse, p.devise)} décaissés</p>
                                                            <p className="text-muted-foreground">sur {fmtMontant(p.montant_accorde, p.devise)} accordés</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            ) : <span className="text-xs text-muted-foreground">—</span>}
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <div className="flex items-center gap-1.5">
                                                <Progress value={p.completude} className="h-1.5 w-12" />
                                                <span className={`text-xs font-semibold tabular-nums ${p.completude >= 80 ? 'text-green-600' : p.completude >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                                                    {p.completude}%
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-5 py-3 border-t border-border/60">
                        <span className="text-xs text-muted-foreground">
                            Page {currentPage} sur {totalPages} · {filtered.length} projets
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="h-7 w-7 flex items-center justify-center rounded-md border border-border/60 text-xs disabled:opacity-30 hover:bg-muted transition-colors"
                            >‹</button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                                <button
                                    key={n}
                                    onClick={() => setPage(n)}
                                    className={`h-7 w-7 flex items-center justify-center rounded-md text-xs transition-colors ${
                                        n === currentPage
                                            ? 'bg-foreground text-background font-semibold'
                                            : 'border border-border/60 hover:bg-muted'
                                    }`}
                                >{n}</button>
                            ))}
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="h-7 w-7 flex items-center justify-center rounded-md border border-border/60 text-xs disabled:opacity-30 hover:bg-muted transition-colors"
                            >›</button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// ── Champ formulaire ─────────────────────────────────────────────────────────
function Field({ label, error, required, children }) {
    return (
        <div className="space-y-1.5">
            <Label className="text-xs font-medium">
                {label}{required && <span className="text-destructive ml-0.5">*</span>}
            </Label>
            {children}
            {error && <p className="text-xs text-destructive mt-0.5">{error}</p>}
        </div>
    );
}

const STATUTS   = [
    { value: 'en_preparation', label: 'En préparation' },
    { value: 'en_cours',       label: 'En cours' },
    { value: 'suspendu',       label: 'Suspendu' },
    { value: 'termine',        label: 'Terminé' },
];
const DOMAINES  = ['Valorisation des Ressources Naturelles', 'Tourisme Durable', 'Agriculture', 'Éducation', 'Santé', 'Infrastructure', 'Autre'];
const CATEGORIES = ['Economique', 'Sociale', 'Mixte'];

// ── Modal création projet ─────────────────────────────────────────────────────
function NouveauProjetModal({ open, onClose, pays, programmes, defaultPaysId }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        code: '', titre: '', porteur: '', commune: '', region: '',
        pays_id: defaultPaysId ?? pays[0]?.id ?? '',
        programme_id: programmes[0]?.id ?? '',
        montant_accorde: '', date_debut: '', date_fin_prevue: '',
        statut: 'en_preparation',
        domaine: '', categorie: '', eligible: '', decision: '', accord_scac: '',
        description: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/projets', {
            onSuccess: () => { reset(); onClose(); router.reload({ only: ['projets', 'stats'] }); },
        });
    };

    const selCls = "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring";

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
                <form onSubmit={submit}>
                    <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/60">
                        <DialogTitle className="text-base font-semibold">Nouveau projet</DialogTitle>
                    </DialogHeader>

                    <div className="px-6 py-5 space-y-5">

                        {/* Identification */}
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Identification</p>
                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Code projet" error={errors.code} required>
                                    <Input value={data.code} onChange={e => setData('code', e.target.value)} placeholder="ex. FSD-MON-001" className="uppercase h-9 text-sm" />
                                </Field>
                                <Field label="Statut" error={errors.statut} required>
                                    <select value={data.statut} onChange={e => setData('statut', e.target.value)} className={selCls}>
                                        {STATUTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                    </select>
                                </Field>
                                <Field label="Titre" error={errors.titre} required>
                                    <Input value={data.titre} onChange={e => setData('titre', e.target.value)} placeholder="Intitulé complet du projet" className="h-9 text-sm" />
                                </Field>
                                <Field label="Porteur / Organisation" error={errors.porteur}>
                                    <Input value={data.porteur} onChange={e => setData('porteur', e.target.value)} placeholder="Nom du porteur" className="h-9 text-sm" />
                                </Field>
                                <Field label="Domaine" error={errors.domaine}>
                                    <select value={data.domaine} onChange={e => setData('domaine', e.target.value)} className={selCls}>
                                        <option value="">— Sélectionner —</option>
                                        {DOMAINES.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </Field>
                                <Field label="Catégorie" error={errors.categorie}>
                                    <select value={data.categorie} onChange={e => setData('categorie', e.target.value)} className={selCls}>
                                        <option value="">— Sélectionner —</option>
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </Field>
                            </div>
                        </div>

                        {/* Localisation & Programme */}
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Localisation & Programme</p>
                            <div className="grid grid-cols-3 gap-3">
                                <Field label="Commune" error={errors.commune}>
                                    <Input value={data.commune} onChange={e => setData('commune', e.target.value)} placeholder="Commune" className="h-9 text-sm" />
                                </Field>
                                <Field label="Région" error={errors.region}>
                                    <Input value={data.region} onChange={e => setData('region', e.target.value)} placeholder="Région" className="h-9 text-sm" />
                                </Field>
                                <Field label="Pays" error={errors.pays_id} required>
                                    <select value={data.pays_id} onChange={e => setData('pays_id', e.target.value)} className={selCls}>
                                        {pays.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
                                    </select>
                                </Field>
                                <Field label="Programme" error={errors.programme_id} className="col-span-3">
                                    <select value={data.programme_id} onChange={e => setData('programme_id', e.target.value)} className={selCls}>
                                        <option value="">— Aucun —</option>
                                        {programmes.map(p => <option key={p.id} value={p.id}>{p.nom} ({p.code})</option>)}
                                    </select>
                                </Field>
                            </div>
                        </div>

                        {/* Financement */}
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Financement</p>
                            <div className="grid grid-cols-3 gap-3">
                                <Field label="Montant accordé" error={errors.montant_accorde}>
                                    <MoneyInput value={data.montant_accorde} onChange={v => setData('montant_accorde', v)} devise={pays.find(p => p.id == data.pays_id)?.devise ?? 'XOF'} />
                                </Field>
                                <Field label="Date début" error={errors.date_debut}>
                                    <Input type="date" value={data.date_debut} onChange={e => setData('date_debut', e.target.value)} className="h-9 text-sm" />
                                </Field>
                                <Field label="Date fin prévue" error={errors.date_fin_prevue}>
                                    <Input type="date" value={data.date_fin_prevue} onChange={e => setData('date_fin_prevue', e.target.value)} className="h-9 text-sm" />
                                </Field>
                            </div>
                        </div>

                        {/* Éligibilité */}
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Éligibilité</p>
                            <div className="grid grid-cols-3 gap-3">
                                <Field label="Éligible" error={errors.eligible}>
                                    <select value={data.eligible} onChange={e => setData('eligible', e.target.value)} className={selCls}>
                                        <option value="">— Non renseigné —</option>
                                        <option value="1">Oui</option>
                                        <option value="0">Non</option>
                                    </select>
                                </Field>
                                <Field label="Accord SCAC" error={errors.accord_scac}>
                                    <select value={data.accord_scac} onChange={e => setData('accord_scac', e.target.value)} className={selCls}>
                                        <option value="">— Non renseigné —</option>
                                        <option value="1">Oui</option>
                                        <option value="0">Non</option>
                                    </select>
                                </Field>
                                <Field label="Décision comité" error={errors.decision}>
                                    <Input value={data.decision} onChange={e => setData('decision', e.target.value)} placeholder="ex. Validé avec modification" className="h-9 text-sm" />
                                </Field>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="px-6 py-4 border-t border-border/60 gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={onClose}>Annuler</Button>
                        <Button type="submit" size="sm" disabled={processing} className="gap-1.5">
                            <Save className="h-3.5 w-3.5" />
                            {processing ? 'Enregistrement…' : 'Créer le projet'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ── Page ─────────────────────────────────────────────────────────────────────
// ── Bloc carte avec filtres ───────────────────────────────────────────────────
function CarteBlock({ projets, height = 420 }) {
    const [filterPays, setFilterPays]       = useState('');
    const [filterStatut, setFilterStatut]   = useState('');
    const [filterDomaine, setFilterDomaine] = useState('');

    const uniquePays    = [...new Set(projets.map(p => p.pays_nom).filter(Boolean))].sort();
    const uniqueDomaines = [...new Set(projets.map(p => p.domaine).filter(Boolean))].sort();

    const filtered = projets.filter(p => {
        if (filterPays    && p.pays_nom !== filterPays)    return false;
        if (filterStatut  && p.statut   !== filterStatut)  return false;
        if (filterDomaine && p.domaine  !== filterDomaine) return false;
        return true;
    });

    const hasFilters = filterPays || filterStatut || filterDomaine;
    const selCls = "h-8 rounded-md border border-border bg-background px-2.5 text-xs font-medium shadow-sm cursor-pointer hover:bg-muted focus:outline-none focus:ring-1 focus:ring-ring transition-colors";

    return (
        <Card className="shadow-none border-border/60 overflow-hidden">
            <CardHeader className="pb-2 pt-4 px-5">
                <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Carte des projets
                        </CardTitle>
                        <CardDescription className="text-xs mt-0.5">
                            {filtered.length} projet{filtered.length !== 1 ? 's' : ''} affiché{filtered.length !== 1 ? 's' : ''}
                            {hasFilters && (
                                <span> · <button
                                    onClick={() => { setFilterPays(''); setFilterStatut(''); setFilterDomaine(''); }}
                                    className="underline underline-offset-2 hover:text-foreground transition-colors"
                                >Réinitialiser</button></span>
                            )}
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        {uniquePays.length > 1 && (
                            <select value={filterPays} onChange={e => setFilterPays(e.target.value)} className={selCls}>
                                <option value="">Tous les pays</option>
                                {uniquePays.map(nom => <option key={nom} value={nom}>{nom}</option>)}
                            </select>
                        )}
                        <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)} className={selCls}>
                            <option value="">Tous statuts</option>
                            {Object.entries(STATUT).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                        {uniqueDomaines.length > 0 && (
                            <select value={filterDomaine} onChange={e => setFilterDomaine(e.target.value)} className={selCls}>
                                <option value="">Tous domaines</option>
                                {uniqueDomaines.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div style={{ isolation: 'isolate' }}>
                    <ProjetMap projets={filtered} height={height} />
                </div>
            </CardContent>
        </Card>
    );
}

export default function Dashboard({ stats, projets, programmes }) {
    const s = stats ?? {};
    const projetsList = projets ?? [];
    const [modalOpen, setModalOpen] = useState(false);
    const { pays_list, active_pays_id, devise_affichage = 'locale', taux_eur = {} } = usePage().props;

    // Devise source des stats globales = celle du pays actif (ou XOF par défaut)
    const activePays = pays_list?.find(p => p.id === active_pays_id);
    const statsDevise = activePays?.devise ?? 'XOF';

    // Raccourci : formate en tenant compte de la devise d'affichage globale
    const fmtMontant = (v, sourceDevise = statsDevise) =>
        fmt(v, sourceDevise, devise_affichage, taux_eur);

    const paysLabel = pays_list?.find(p => p.id === active_pays_id)?.nom ?? null;
    const tousLesPays = !active_pays_id;

    const kpis = (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard label="Microprojets actifs"   value={s.actifs ?? 0}                                   subtitle="projets financés"      icon={Users}         accent="orange" />
            <KpiCard label="Subvention totale FSD" value={fmtMontant(s.subvention_totale)}                 subtitle="montant total accordé" icon={Wallet}        accent="teal" />
            <KpiCard label="Total décaissé"        value={fmtMontant(s.total_decaisse)}                    subtitle={`${s.taux_decaisse ?? 0}% du budget`} icon={TrendingUp} accent="blue" />
            <KpiCard label="Projets éligibles"     value={`${s.eligibles ?? 0} / ${s.total_projets ?? 0}`} subtitle="dossiers validés"     icon={ClipboardCheck} accent="violet" />
        </div>
    );

    return (
        <AppLayout title="Tableau de bord" breadcrumbs={[{ label: 'Tableau de bord', href: '/dashboard' }]}>
            <Head title="Tableau de bord" />

            <div className="space-y-5">

                {/* ── Header ── */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Tableau de bord</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Programme FSD{paysLabel ? ` — ${paysLabel}` : ' — Tous les pays'}
                        </p>
                    </div>
                    <Button size="sm" className="gap-1.5" onClick={() => setModalOpen(true)}>
                        <Plus className="h-3.5 w-3.5" />
                        Nouveau projet
                    </Button>
                </div>

                {tousLesPays ? (
                    /* ── Vue globale : KPIs → carte → tableau ── */
                    <>
                        {kpis}
                        {projetsList.length > 0 && <CarteBlock projets={projetsList} height={520} />}
                        <ProjetsDataTable projets={projetsList} />
                    </>
                ) : (
                    /* ── Vue pays : KPIs → tableau → carte ── */
                    <>
                        {kpis}
                        <ProjetsDataTable projets={projetsList} />
                        {projetsList.length > 0 && <CarteBlock projets={projetsList} height={380} />}
                    </>
                )}
            </div>

            <NouveauProjetModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                pays={pays_list ?? []}
                programmes={programmes ?? []}
                defaultPaysId={active_pays_id ?? pays_list?.[0]?.id}
            />
        </AppLayout>
    );
}
