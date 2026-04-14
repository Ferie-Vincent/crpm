import AppLayout from '@/Layouts/AppLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Globe, Save, Search, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

// ── Drapeau ───────────────────────────────────────────────────────────────────
function Flag({ cca2 }) {
    if (!cca2) return <span className="inline-block w-6 h-4 rounded-sm bg-muted/60 border border-border/40" />;
    const src = `https://flagcdn.com/w40/${cca2.toLowerCase()}.png`;
    const fallback = [...cca2.toUpperCase()].map(c =>
        String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)
    ).join('');
    return (
        <img
            src={src}
            width={24}
            height={16}
            alt={cca2}
            className="rounded-sm shadow-sm shrink-0 object-cover"
            onError={e => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'inline';
            }}
        />
    );
}

const STATUTS = [
    { value: 'actif',    label: 'Actif',    cls: 'bg-green-100 text-green-700' },
    { value: 'en_cours', label: 'En cours', cls: 'bg-blue-100 text-blue-700' },
    { value: 'cloture',  label: 'Clôturé',  cls: 'bg-slate-100 text-slate-500' },
];

const selCls = "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring";

// ── Modal ajout (via API RestCountries) ──────────────────────────────────────
function AjouterPaysModal({ open, onClose, existingCodes }) {
    const [countries, setCountries]   = useState([]);
    const [loading, setLoading]       = useState(false);
    const [query, setQuery]           = useState('');
    const [selected, setSelected]     = useState(null);
    const [statut, setStatut]         = useState('actif');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError]           = useState('');
    const inputRef = useRef(null);

    // Charger pays africains depuis RestCountries
    useEffect(() => {
        if (!open) return;
        setLoading(true);
        fetch('https://restcountries.com/v3.1/region/africa?fields=name,cca2,cca3,currencies,flags')
            .then(r => r.json())
            .then(data => {
                const list = data
                    .map(c => ({
                        cca3:   c.cca3,
                        cca2:   c.cca2?.toLowerCase(),
                        nom:    c.name?.common ?? c.cca3,
                        devise: Object.keys(c.currencies ?? {})[0] ?? 'XOF',
                    }))
                    .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
                setCountries(list);
            })
            .catch(() => setError("Impossible de charger la liste des pays. Vérifiez votre connexion."))
            .finally(() => setLoading(false));
    }, [open]);

    useEffect(() => {
        if (open) { setQuery(''); setSelected(null); setError(''); setStatut('actif'); }
    }, [open]);

    const filtered = countries.filter(c => {
        const q = query.toLowerCase();
        return (c.nom.toLowerCase().includes(q) || c.cca3.toLowerCase().includes(q)) &&
               !existingCodes.includes(c.cca3);
    });

    function handleSelect(c) {
        setSelected(c);
        setQuery(c.nom);
        setError('');
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (!selected) { setError('Sélectionnez un pays dans la liste.'); return; }
        setSubmitting(true);
        router.post('/parametres/pays', {
            code:   selected.cca3,
            cca2:   selected.cca2,
            nom:    selected.nom,
            devise: selected.devise,
            statut,
        }, {
            onSuccess: () => { setSubmitting(false); onClose(); },
            onError:   () => setSubmitting(false),
        });
    }

    const showDropdown = query.length > 0 && !selected && filtered.length > 0;

    return (
        <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
            <DialogContent className="max-w-md">
                <form onSubmit={handleSubmit}>
                    <DialogHeader className="pb-4">
                        <DialogTitle className="text-base font-semibold">Ajouter un pays</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        {/* Recherche pays */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">Pays <span className="text-destructive">*</span></Label>
                            <div className="relative">
                                {loading ? (
                                    <Loader2 className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground animate-spin" />
                                ) : selected ? (
                                    <Flag cca2={selected.cca2} />
                                ) : (
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                )}
                                <input
                                    ref={inputRef}
                                    value={query}
                                    onChange={e => { setQuery(e.target.value); setSelected(null); }}
                                    placeholder="Rechercher un pays africain…"
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent pl-8 pr-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    autoComplete="off"
                                    disabled={loading}
                                />
                                {selected && (
                                    <button type="button" onClick={() => { setSelected(null); setQuery(''); }}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs">
                                        ✕
                                    </button>
                                )}
                            </div>

                            {/* Dropdown résultats */}
                            {showDropdown && (
                                <div className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-md border border-border bg-popover shadow-md">
                                    {filtered.slice(0, 15).map(c => (
                                        <button
                                            key={c.cca3}
                                            type="button"
                                            onClick={() => handleSelect(c)}
                                            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                                        >
                                            <Flag cca2={c.cca2} />
                                            <span className="flex-1">{c.nom}</span>
                                            <span className="font-mono text-[10px] text-muted-foreground">{c.cca3}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                            {error && <p className="text-xs text-destructive">{error}</p>}
                        </div>

                        {/* Infos auto-remplies */}
                        {selected && (
                            <div className="rounded-lg border border-border/60 bg-muted/30 p-3 grid grid-cols-3 gap-3 text-xs">
                                <div>
                                    <p className="text-muted-foreground mb-0.5">Code ISO</p>
                                    <p className="font-mono font-bold">{selected.cca3}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground mb-0.5">Devise</p>
                                    <p className="font-mono font-bold">{selected.devise}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground mb-0.5">Drapeau</p>
                                    <Flag cca2={selected.cca2} />
                                </div>
                            </div>
                        )}

                        {/* Statut */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">Statut <span className="text-destructive">*</span></Label>
                            <select value={statut} onChange={e => setStatut(e.target.value)} className={selCls}>
                                {STATUTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                        </div>
                    </div>

                    <DialogFooter className="pt-4 gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={onClose}>Annuler</Button>
                        <Button type="submit" size="sm" disabled={submitting || !selected} className="gap-1.5">
                            <Save className="h-3.5 w-3.5" />
                            {submitting ? 'Enregistrement…' : 'Ajouter le pays'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ── Modal édition ─────────────────────────────────────────────────────────────
function EditPaysModal({ pays, onClose }) {
    const { data, setData, put, processing, errors } = useForm({
        statut: pays.statut,
    });

    const submit = (e) => {
        e.preventDefault();
        put(`/parametres/pays/${pays.id}`, { onSuccess: onClose });
    };

    return (
        <Dialog open onOpenChange={v => { if (!v) onClose(); }}>
            <DialogContent className="max-w-sm">
                <form onSubmit={submit}>
                    <DialogHeader className="pb-4">
                        <DialogTitle className="flex items-center gap-2 text-base font-semibold">
                            <Flag cca2={pays.cca2} />
                            {pays.nom}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-1.5 py-2">
                        <Label className="text-xs font-medium">Statut</Label>
                        <select value={data.statut} onChange={e => setData('statut', e.target.value)} className={selCls}>
                            {STATUTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                        {errors.statut && <p className="text-xs text-destructive">{errors.statut}</p>}
                    </div>
                    <DialogFooter className="pt-4 gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={onClose}>Annuler</Button>
                        <Button type="submit" size="sm" disabled={processing} className="gap-1.5">
                            <Save className="h-3.5 w-3.5" />
                            {processing ? 'Enregistrement…' : 'Sauvegarder'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ParametresPays({ pays }) {
    const [addOpen, setAddOpen]   = useState(false);
    const [editItem, setEditItem] = useState(null);

    const existingCodes = pays.map(p => p.code);

    function handleDelete(p) {
        if (!confirm(`Supprimer « ${p.nom} » ? Cette action est irréversible.`)) return;
        router.delete(`/parametres/pays/${p.id}`);
    }

    return (
        <AppLayout
            title="Gestion des pays"
            breadcrumbs={[
                { label: 'Paramètres', href: '/parametres' },
                { label: 'Pays', href: '/parametres/pays' },
            ]}
        >
            <Head title="Pays" />

            <div className="space-y-5 max-w-3xl">

                {/* En-tête */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Pays</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Pays couverts par le programme FSD.
                        </p>
                    </div>
                    <Button size="sm" className="gap-1.5" onClick={() => setAddOpen(true)}>
                        <Plus className="h-3.5 w-3.5" />
                        Ajouter un pays
                    </Button>
                </div>

                {/* Tableau */}
                <Card className="shadow-none border-border/60">
                    {pays.length === 0 ? (
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted mb-4">
                                <Globe className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="font-medium">Aucun pays configuré</p>
                        </CardContent>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border/60 bg-muted/30">
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground w-8" />
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Pays</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Code</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Devise</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Statut</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Projets</th>
                                        <th className="px-5 py-3" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/40">
                                    {pays.map(p => {
                                        const st = STATUTS.find(s => s.value === p.statut) ?? STATUTS[0];
                                        return (
                                            <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                                                <td className="px-5 py-3">
                                                    <Flag cca2={p.cca2} />
                                                </td>
                                                <td className="px-4 py-3 font-medium">{p.nom}</td>
                                                <td className="px-4 py-3 font-mono text-xs font-bold text-muted-foreground">{p.code}</td>
                                                <td className="px-4 py-3 text-xs text-muted-foreground">{p.devise}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
                                                </td>
                                                <td className="px-4 py-3 text-right text-xs font-semibold tabular-nums">{p.projets_count}</td>
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button onClick={() => setEditItem(p)}
                                                            className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                                                            title="Modifier le statut">
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button onClick={() => handleDelete(p)}
                                                            disabled={p.projets_count > 0}
                                                            className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
                                                            title={p.projets_count > 0 ? 'Des projets sont liés à ce pays' : 'Supprimer'}>
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>

            <AjouterPaysModal
                open={addOpen}
                onClose={() => setAddOpen(false)}
                existingCodes={existingCodes}
            />
            {editItem && <EditPaysModal pays={editItem} onClose={() => setEditItem(null)} />}
        </AppLayout>
    );
}
