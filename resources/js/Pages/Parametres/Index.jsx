import { useState, useEffect, useRef } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
    Users, Globe, Building2, DollarSign, Settings, Upload,
    Plus, Pencil, Trash2, Save, Search, Loader2, UserPlus,
    ChevronRight, ShieldCheck, BarChart3, FolderOpen, Navigation,
    Check, X, Mail, Lock,
} from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────
function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function Flag({ cca2, size = 'sm' }) {
    const dims = size === 'sm' ? { w: 20, h: 14 } : { w: 28, h: 20 };
    if (!cca2) return <span className="inline-block rounded-sm bg-muted/60 border border-border/40" style={{ width: dims.w, height: dims.h }} />;
    return (
        <img
            src={`https://flagcdn.com/w40/${cca2.toLowerCase()}.png`}
            width={dims.w}
            height={dims.h}
            alt={cca2}
            className="rounded-sm shadow-sm shrink-0 object-cover"
        />
    );
}

const ROLE_CONFIG = {
    super_admin:        { label: 'Super admin',     cls: 'bg-red-100 text-red-700' },
    gestionnaire:       { label: 'Gestionnaire',    cls: 'bg-primary/10 text-primary' },
    auditeur:           { label: 'Auditeur',        cls: 'bg-purple-100 text-purple-700' },
    agent_terrain:      { label: 'Agent terrain',   cls: 'bg-orange-100 text-orange-700' },
    admin_organisation: { label: 'Admin org.',      cls: 'bg-blue-100 text-blue-700' },
};

const STATUTS_PAYS = {
    actif:    { label: 'Actif',    cls: 'bg-green-100 text-green-700' },
    en_cours: { label: 'En cours', cls: 'bg-blue-100 text-blue-700' },
    cloture:  { label: 'Clôturé',  cls: 'bg-slate-100 text-slate-500' },
};

const TIMEZONES = [
    'Africa/Dakar', 'Africa/Abidjan', 'Africa/Bamako', 'Africa/Conakry',
    'Africa/Nairobi', 'Africa/Lagos', 'Africa/Johannesburg', 'Europe/Paris', 'UTC',
];

const selCls = "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring";

// ── Sidebar nav ───────────────────────────────────────────────────────────────
const NAV = [
    {
        group: 'Gestion',
        items: [
            { key: 'apercu',         label: 'Aperçu',              icon: BarChart3 },
            { key: 'utilisateurs',   label: 'Utilisateurs',        icon: Users },
            { key: 'pays',           label: 'Pays',                icon: Globe },
            { key: 'beneficiaires',  label: 'Import bénéficiaires',icon: Upload },
        ],
    },
    {
        group: 'Configuration',
        items: [
            { key: 'organisation',   label: 'Organisation',        icon: Building2 },
            { key: 'devise',         label: 'Devise',              icon: DollarSign },
            { key: 'systeme',        label: 'Système',             icon: Settings },
        ],
    },
];

// ── Sections ──────────────────────────────────────────────────────────────────

// ── Aperçu ───────────────────────────────────────────────────────────────────
function SectionApercu({ utilisateurs, pays, completions }) {
    const stats = [
        { label: 'Utilisateurs',  value: utilisateurs.length,  icon: Users,      color: 'text-blue-600',   bg: 'bg-blue-50' },
        { label: 'Pays couverts', value: pays.length,           icon: Globe,      color: 'text-green-600',  bg: 'bg-green-50' },
        { label: 'Projets actifs',value: pays.reduce((s, p) => s + (p.projets_count ?? 0), 0), icon: FolderOpen, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Rôles définis', value: new Set(utilisateurs.flatMap(u => u.roles)).size, icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-base font-semibold">Aperçu de la plateforme</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Vue d'ensemble de la configuration actuelle.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map(s => (
                    <div key={s.label} className="rounded-xl border border-border/60 p-4 bg-white space-y-2">
                        <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${s.bg}`}>
                            <s.icon className={`h-4 w-4 ${s.color}`} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{s.value}</p>
                            <p className="text-xs text-muted-foreground">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Config health */}
            <div className="rounded-xl border border-border/60 bg-white overflow-hidden">
                <div className="px-5 py-4 border-b border-border/40">
                    <h3 className="text-sm font-semibold">Configuration du programme</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Taux de complétude par section</p>
                </div>
                <div className="divide-y divide-border/40">
                    {[
                        { label: 'Organisation', key: 'organisation', icon: Building2 },
                        { label: 'Devise',        key: 'devise',       icon: DollarSign },
                        { label: 'Système',       key: 'systeme',      icon: Settings },
                    ].map(item => {
                        const pct = completions?.[item.key] ?? 0;
                        return (
                            <div key={item.key} className="flex items-center gap-4 px-5 py-3.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/60 shrink-0">
                                    <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <p className="text-sm font-medium">{item.label}</p>
                                        <span className={`text-xs font-semibold ${pct === 100 ? 'text-green-600' : 'text-muted-foreground'}`}>{pct}%</span>
                                    </div>
                                    <Progress value={pct} className="h-1.5" />
                                </div>
                                {pct === 100
                                    ? <Check className="h-4 w-4 text-green-500 shrink-0" />
                                    : <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                                }
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Pays summary */}
            {pays.length > 0 && (
                <div className="rounded-xl border border-border/60 bg-white overflow-hidden">
                    <div className="px-5 py-4 border-b border-border/40">
                        <h3 className="text-sm font-semibold">Pays du programme</h3>
                    </div>
                    <div className="divide-y divide-border/40">
                        {pays.map(p => {
                            const st = STATUTS_PAYS[p.statut] ?? STATUTS_PAYS.actif;
                            return (
                                <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                                    <Flag cca2={p.cca2} />
                                    <p className="text-sm font-medium flex-1">{p.nom}</p>
                                    <span className="text-xs text-muted-foreground">{p.projets_count} projet{p.projets_count !== 1 ? 's' : ''}</span>
                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Utilisateurs ──────────────────────────────────────────────────────────────
function InviterModal({ open, onClose, roles, pays }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email:   '',
        role:    '',
        pays_id: pays[0]?.id ?? '',
    });
    const submit = (e) => {
        e.preventDefault();
        post('/parametres/utilisateurs/inviter', { onSuccess: () => { reset(); onClose(); } });
    };
    return (
        <Dialog open={open} onOpenChange={v => { if (!v) { reset(); onClose(); } }}>
            <DialogContent className="max-w-md p-0">
                <form onSubmit={submit}>
                    <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/60">
                        <DialogTitle className="text-base font-semibold flex items-center gap-2">
                            <UserPlus className="h-4 w-4 text-primary" />
                            Inviter un utilisateur
                        </DialogTitle>
                        <p className="text-xs text-muted-foreground mt-1">Un lien d'activation valable 72h sera envoyé par e-mail.</p>
                    </DialogHeader>
                    <div className="px-6 py-5 space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">Adresse e-mail <span className="text-destructive">*</span></Label>
                            <div className="relative">
                                <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                <Input
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    placeholder="prenom.nom@organisation.org"
                                    className="pl-8 h-9 text-sm"
                                />
                            </div>
                            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">Rôle <span className="text-destructive">*</span></Label>
                            <select value={data.role} onChange={e => setData('role', e.target.value)} className={selCls}>
                                <option value="">— Sélectionner un rôle —</option>
                                {roles.filter(r => r.name !== 'super_admin').map(r => (
                                    <option key={r.id} value={r.name}>{ROLE_CONFIG[r.name]?.label ?? r.name}</option>
                                ))}
                            </select>
                            {errors.role && <p className="text-xs text-destructive">{errors.role}</p>}
                        </div>
                        {pays.length > 1 && (
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Pays</Label>
                                <select value={data.pays_id} onChange={e => setData('pays_id', e.target.value)} className={selCls}>
                                    {pays.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
                                </select>
                            </div>
                        )}
                    </div>
                    <DialogFooter className="px-6 py-4 border-t border-border/60 gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => { reset(); onClose(); }}>Annuler</Button>
                        <Button type="submit" size="sm" disabled={processing || !data.email || !data.role} className="gap-1.5">
                            {processing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
                            {processing ? 'Envoi…' : "Envoyer l'invitation"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function SectionUtilisateurs({ utilisateurs, roles, pays }) {
    const [inviteOpen, setInviteOpen] = useState(false);
    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-base font-semibold">Utilisateurs</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">{utilisateurs.length} membre{utilisateurs.length !== 1 ? 's' : ''} sur la plateforme</p>
                </div>
                <Button size="sm" className="gap-1.5" onClick={() => setInviteOpen(true)}>
                    <UserPlus className="h-3.5 w-3.5" /> Inviter
                </Button>
            </div>

            <div className="rounded-xl border border-border/60 bg-white overflow-hidden">
                {utilisateurs.length === 0 ? (
                    <div className="py-16 text-center text-muted-foreground text-sm">Aucun utilisateur trouvé.</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border/60 bg-muted/30">
                                <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">Utilisateur</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">E-mail</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Rôle(s)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {utilisateurs.map(u => (
                                <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0">
                                                {getInitials(u.name)}
                                            </div>
                                            <span className="font-medium">{u.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground text-xs">{u.email}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1 flex-wrap">
                                            {u.roles.map(r => {
                                                const cfg = ROLE_CONFIG[r] ?? { label: r, cls: 'bg-muted text-muted-foreground' };
                                                return (
                                                    <span key={r} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.cls}`}>{cfg.label}</span>
                                                );
                                            })}
                                            {u.roles.length === 0 && <span className="text-xs text-muted-foreground/60">—</span>}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <InviterModal open={inviteOpen} onClose={() => setInviteOpen(false)} roles={roles} pays={pays} />
        </div>
    );
}

// ── Pays ──────────────────────────────────────────────────────────────────────
function AjouterPaysModal({ open, onClose, existingCodes }) {
    const [countries, setCountries] = useState([]);
    const [loading, setLoading]     = useState(false);
    const [query, setQuery]         = useState('');
    const [selected, setSelected]   = useState(null);
    const [statut, setStatut]       = useState('actif');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError]         = useState('');

    useEffect(() => {
        if (!open) return;
        setLoading(true);
        fetch('https://restcountries.com/v3.1/region/africa?fields=name,cca2,cca3,currencies,flags')
            .then(r => r.json())
            .then(data => {
                setCountries(data.map(c => ({
                    cca3:  c.cca3,
                    cca2:  c.cca2?.toLowerCase(),
                    nom:   c.name?.common ?? c.cca3,
                    devise: Object.keys(c.currencies ?? {})[0] ?? 'XOF',
                })).sort((a, b) => a.nom.localeCompare(b.nom, 'fr')));
            })
            .catch(() => setError("Impossible de charger la liste. Vérifiez votre connexion."))
            .finally(() => setLoading(false));
    }, [open]);

    useEffect(() => {
        if (open) { setQuery(''); setSelected(null); setError(''); setStatut('actif'); }
    }, [open]);

    const filtered = countries.filter(c => {
        const q = query.toLowerCase();
        return (c.nom.toLowerCase().includes(q) || c.cca3.toLowerCase().includes(q))
            && !existingCodes.includes(c.cca3);
    });

    const showDropdown = query.length > 0 && !selected && filtered.length > 0;

    function handleSubmit(e) {
        e.preventDefault();
        if (!selected) { setError('Sélectionnez un pays dans la liste.'); return; }
        setSubmitting(true);
        router.post('/parametres/pays', {
            code: selected.cca3, cca2: selected.cca2,
            nom: selected.nom, devise: selected.devise, statut,
        }, { onSuccess: () => { setSubmitting(false); onClose(); }, onError: () => setSubmitting(false) });
    }

    return (
        <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
            <DialogContent className="max-w-sm p-0">
                <form onSubmit={handleSubmit}>
                    <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/60">
                        <DialogTitle className="text-base font-semibold">Ajouter un pays</DialogTitle>
                    </DialogHeader>
                    <div className="px-6 py-5 space-y-4">
                        <div className="space-y-1.5 relative">
                            <Label className="text-xs font-medium">Pays <span className="text-destructive">*</span></Label>
                            <div className="relative">
                                {loading
                                    ? <Loader2 className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground animate-spin" />
                                    : <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                }
                                <input
                                    value={query}
                                    onChange={e => { setQuery(e.target.value); setSelected(null); }}
                                    placeholder="Rechercher un pays…"
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent pl-8 pr-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    autoComplete="off"
                                    disabled={loading}
                                />
                            </div>
                            {showDropdown && (
                                <div className="absolute z-50 mt-1 max-h-52 w-full overflow-auto rounded-md border border-border bg-popover shadow-md">
                                    {filtered.slice(0, 12).map(c => (
                                        <button key={c.cca3} type="button" onClick={() => { setSelected(c); setQuery(c.nom); }}
                                            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted text-left">
                                            <Flag cca2={c.cca2} />
                                            <span className="flex-1">{c.nom}</span>
                                            <span className="font-mono text-[10px] text-muted-foreground">{c.cca3}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                            {error && <p className="text-xs text-destructive">{error}</p>}
                        </div>

                        {selected && (
                            <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5">
                                <Flag cca2={selected.cca2} size="md" />
                                <div className="flex-1">
                                    <p className="text-sm font-semibold">{selected.nom}</p>
                                    <p className="text-xs text-muted-foreground font-mono">{selected.cca3} · {selected.devise}</p>
                                </div>
                                <Check className="h-4 w-4 text-green-500" />
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">Statut</Label>
                            <select value={statut} onChange={e => setStatut(e.target.value)} className={selCls}>
                                {Object.entries(STATUTS_PAYS).map(([v, s]) => <option key={v} value={v}>{s.label}</option>)}
                            </select>
                        </div>
                    </div>
                    <DialogFooter className="px-6 py-4 border-t border-border/60 gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={onClose}>Annuler</Button>
                        <Button type="submit" size="sm" disabled={submitting || !selected} className="gap-1.5">
                            <Save className="h-3.5 w-3.5" />
                            {submitting ? 'Enregistrement…' : 'Ajouter'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function EditPaysModal({ pays, onClose }) {
    const { data, setData, put, processing, errors } = useForm({ statut: pays.statut });
    const submit = (e) => {
        e.preventDefault();
        put(`/parametres/pays/${pays.id}`, { onSuccess: onClose });
    };
    return (
        <Dialog open onOpenChange={v => { if (!v) onClose(); }}>
            <DialogContent className="max-w-sm p-0">
                <form onSubmit={submit}>
                    <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/60">
                        <DialogTitle className="text-base font-semibold flex items-center gap-2">
                            <Flag cca2={pays.cca2} />
                            {pays.nom}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="px-6 py-5 space-y-1.5">
                        <Label className="text-xs font-medium">Statut</Label>
                        <select value={data.statut} onChange={e => setData('statut', e.target.value)} className={selCls}>
                            {Object.entries(STATUTS_PAYS).map(([v, s]) => <option key={v} value={v}>{s.label}</option>)}
                        </select>
                        {errors.statut && <p className="text-xs text-destructive">{errors.statut}</p>}
                    </div>
                    <DialogFooter className="px-6 py-4 border-t border-border/60 gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={onClose}>Annuler</Button>
                        <Button type="submit" size="sm" disabled={processing} className="gap-1.5">
                            <Save className="h-3.5 w-3.5" />{processing ? 'Enregistrement…' : 'Sauvegarder'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function SectionPays({ pays }) {
    const [addOpen, setAddOpen]   = useState(false);
    const [editItem, setEditItem] = useState(null);
    const existingCodes = pays.map(p => p.code);

    function handleDelete(p) {
        if (!confirm(`Supprimer « ${p.nom} » ? Cette action est irréversible.`)) return;
        router.delete(`/parametres/pays/${p.id}`);
    }

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-base font-semibold">Pays</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">{pays.length} pays couverts par le programme</p>
                </div>
                <Button size="sm" className="gap-1.5" onClick={() => setAddOpen(true)}>
                    <Plus className="h-3.5 w-3.5" /> Ajouter un pays
                </Button>
            </div>

            <div className="rounded-xl border border-border/60 bg-white overflow-hidden">
                {pays.length === 0 ? (
                    <div className="py-16 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted mx-auto mb-3">
                            <Globe className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">Aucun pays configuré</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border/60 bg-muted/30">
                                <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground w-8" />
                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Pays</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Code</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Devise</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Statut</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Projets</th>
                                <th className="px-5 py-3 w-16" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {pays.map(p => {
                                const st = STATUTS_PAYS[p.statut] ?? STATUTS_PAYS.actif;
                                return (
                                    <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                                        <td className="px-5 py-3"><Flag cca2={p.cca2} /></td>
                                        <td className="px-4 py-3 font-medium">{p.nom}</td>
                                        <td className="px-4 py-3 font-mono text-xs font-bold text-muted-foreground">{p.code}</td>
                                        <td className="px-4 py-3 text-xs text-muted-foreground">{p.devise}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right text-xs font-semibold tabular-nums">{p.projets_count}</td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => setEditItem(p)}
                                                    className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </button>
                                                <button onClick={() => handleDelete(p)} disabled={p.projets_count > 0}
                                                    className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed">
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            <AjouterPaysModal open={addOpen} onClose={() => setAddOpen(false)} existingCodes={existingCodes} />
            {editItem && <EditPaysModal pays={editItem} onClose={() => setEditItem(null)} />}
        </div>
    );
}

// ── Import bénéficiaires ──────────────────────────────────────────────────────
function SectionBeneficiaires() {
    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-base font-semibold">Import bénéficiaires</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Importez des bénéficiaires en masse via un fichier Excel.</p>
            </div>

            <div className="rounded-xl border border-border/60 bg-white p-6 space-y-5">
                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                        <Upload className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold">Import via Excel</h3>
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                            Téléchargez le modèle Excel, remplissez les informations des bénéficiaires et importez le fichier. Les données seront validées avant insertion.
                        </p>
                    </div>
                </div>

                <div className="rounded-lg bg-muted/40 border border-border/40 p-4 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Colonnes attendues</p>
                    <div className="flex flex-wrap gap-1.5">
                        {['nom', 'prenom', 'genre', 'age', 'commune', 'region', 'pays', 'projet_code', 'type_aide'].map(col => (
                            <span key={col} className="font-mono text-xs bg-white border border-border/60 px-2 py-0.5 rounded">{col}</span>
                        ))}
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="gap-1.5" asChild>
                        <a href="/beneficiaires/import">
                            <Upload className="h-3.5 w-3.5" /> Importer un fichier
                        </a>
                    </Button>
                    <Button size="sm" variant="ghost" className="gap-1.5" asChild>
                        <a href="/beneficiaires/preview">
                            Prévisualiser
                        </a>
                    </Button>
                </div>
            </div>
        </div>
    );
}

// ── Configuration programme ───────────────────────────────────────────────────
function SectionOrganisation({ parametres }) {
    const { data, setData, put, processing, errors } = useForm({
        nom_organisation: parametres?.nom_organisation ?? '',
    });
    const submit = (e) => { e.preventDefault(); put('/parametres/programme'); };
    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-base font-semibold">Organisation</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Informations sur votre organisation ou programme.</p>
            </div>
            <form onSubmit={submit} className="rounded-xl border border-border/60 bg-white p-6 space-y-5">
                <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Nom de l'organisation</Label>
                    <Input value={data.nom_organisation} onChange={e => setData('nom_organisation', e.target.value)}
                        placeholder="Ex. CRPM — Coopération Régionale des Politiques Migratoires" className="h-9 text-sm" />
                    {errors.nom_organisation && <p className="text-xs text-destructive">{errors.nom_organisation}</p>}
                </div>
                <div className="flex justify-end">
                    <Button type="submit" size="sm" disabled={processing} className="gap-1.5">
                        {processing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                        Enregistrer
                    </Button>
                </div>
            </form>
        </div>
    );
}

const DEVISE_OPTIONS = [
    {
        id:      'locale',
        label:   'Monnaie locale',
        sub:     'Utilise la devise du pays de chaque projet (XOF, MGA, KMF…)',
        devise:  null, // resolved per-project from pays.devise
        symbole: null,
    },
    {
        id:      'usd',
        label:   'Dollar américain',
        sub:     'Affiche tous les montants en USD',
        devise:  'USD',
        symbole: '$',
    },
    {
        id:      'eur',
        label:   'Euro',
        sub:     'Affiche tous les montants en EUR',
        devise:  'EUR',
        symbole: '€',
    },
];

function SectionDevise({ parametres }) {
    // Determine which option is currently selected
    function detectOption(devise) {
        if (!devise || devise === 'locale') return 'locale';
        if (devise === 'USD') return 'usd';
        if (devise === 'EUR') return 'eur';
        return 'locale';
    }

    const [selected, setSelected] = useState(detectOption(parametres?.devise));
    const [processing, setProcessing] = useState(false);
    const [saved, setSaved] = useState(false);

    function handleSave() {
        const opt = DEVISE_OPTIONS.find(o => o.id === selected);
        setProcessing(true);
        router.put('/parametres/programme', {
            devise:         opt.devise ?? 'locale',
            symbole_devise: opt.symbole ?? '',
        }, {
            onFinish: () => {
                setProcessing(false);
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            },
        });
    }

    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-base font-semibold">Devise</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Choisissez la devise utilisée pour afficher les montants sur toute la plateforme.
                </p>
            </div>

            <div className="space-y-3">
                {DEVISE_OPTIONS.map(opt => {
                    const isSelected = selected === opt.id;
                    return (
                        <button
                            key={opt.id}
                            type="button"
                            onClick={() => setSelected(opt.id)}
                            className={cn(
                                'w-full flex items-start gap-4 rounded-xl border-2 p-4 text-left transition-all',
                                isSelected
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border/60 bg-white hover:border-border hover:bg-muted/20'
                            )}
                        >
                            {/* Radio circle */}
                            <div className={cn(
                                'mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center',
                                isSelected ? 'border-primary' : 'border-muted-foreground/40'
                            )}>
                                {isSelected && <div className="h-2 w-2 rounded-full bg-primary" />}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className={cn('text-sm font-semibold', isSelected ? 'text-primary' : 'text-foreground')}>
                                        {opt.label}
                                    </p>
                                    {opt.devise && (
                                        <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                                            {opt.devise}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">{opt.sub}</p>
                            </div>

                            {/* Preview */}
                            <div className="text-right shrink-0">
                                <p className={cn('text-base font-bold tabular-nums', isSelected ? 'text-primary' : 'text-muted-foreground')}>
                                    {opt.id === 'locale'
                                        ? '1 250 000 XOF'
                                        : `${opt.symbole}1 250 000`
                                    }
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">aperçu</p>
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="flex items-center justify-end gap-3">
                {saved && <span className="text-xs text-green-600 font-medium flex items-center gap-1"><Check className="h-3.5 w-3.5" /> Enregistré</span>}
                <Button size="sm" disabled={processing} onClick={handleSave} className="gap-1.5">
                    {processing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    Enregistrer
                </Button>
            </div>
        </div>
    );
}

function SectionSysteme({ parametres }) {
    const { data, setData, put, processing, errors } = useForm({
        timezone:         parametres?.timezone ?? 'Africa/Dakar',
        seuil_completude: parametres?.seuil_completude ?? 80,
    });
    const submit = (e) => { e.preventDefault(); put('/parametres/programme'); };
    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-base font-semibold">Système</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Paramètres techniques de la plateforme.</p>
            </div>
            <form onSubmit={submit} className="rounded-xl border border-border/60 bg-white p-6 space-y-5">
                <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Fuseau horaire</Label>
                    <select value={data.timezone} onChange={e => setData('timezone', e.target.value)} className={selCls}>
                        {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                    </select>
                    {errors.timezone && <p className="text-xs text-destructive">{errors.timezone}</p>}
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Seuil de complétude « à jour » (%)</Label>
                    <div className="flex items-center gap-3">
                        <Input type="number" min={0} max={100} value={data.seuil_completude}
                            onChange={e => setData('seuil_completude', Number(e.target.value))}
                            className="h-9 text-sm w-24" />
                        <Progress value={data.seuil_completude} className="h-2 flex-1" />
                        <span className="text-sm font-semibold w-8 text-right">{data.seuil_completude}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Un projet est « à jour » si sa complétude dépasse ce seuil.
                    </p>
                    {errors.seuil_completude && <p className="text-xs text-destructive">{errors.seuil_completude}</p>}
                </div>
                <div className="flex justify-end">
                    <Button type="submit" size="sm" disabled={processing} className="gap-1.5">
                        {processing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                        Enregistrer
                    </Button>
                </div>
            </form>
        </div>
    );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ParametresIndex({ completions, utilisateurs, pays, roles, pays_invite, parametres }) {
    const [active, setActive] = useState('apercu');
    const { props } = usePage();

    function renderContent() {
        switch (active) {
            case 'apercu':        return <SectionApercu utilisateurs={utilisateurs} pays={pays} completions={completions} />;
            case 'utilisateurs':  return <SectionUtilisateurs utilisateurs={utilisateurs} roles={roles} pays={pays_invite} />;
            case 'pays':          return <SectionPays pays={pays} />;
            case 'beneficiaires': return <SectionBeneficiaires />;
            case 'organisation':  return <SectionOrganisation parametres={parametres} />;
            case 'devise':        return <SectionDevise parametres={parametres} />;
            case 'systeme':       return <SectionSysteme parametres={parametres} />;
            default:              return null;
        }
    }

    return (
        <AppLayout title="Paramètres">
            <Head title="Paramètres" />

            <div className="flex gap-6 min-h-[calc(100vh-120px)]">

                {/* ── Sidebar ── */}
                <aside className="w-52 shrink-0">
                    <nav className="space-y-5 sticky top-0">
                        {NAV.map(group => (
                            <div key={group.group}>
                                <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                                    {group.group}
                                </p>
                                <ul className="space-y-0.5">
                                    {group.items.map(item => {
                                        const isActive = active === item.key;
                                        return (
                                            <li key={item.key}>
                                                <button
                                                    onClick={() => setActive(item.key)}
                                                    className={cn(
                                                        'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors text-left',
                                                        isActive
                                                            ? 'bg-primary text-primary-foreground font-medium'
                                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                                    )}
                                                >
                                                    <item.icon className="h-4 w-4 shrink-0" />
                                                    {item.label}
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
                    </nav>
                </aside>

                {/* ── Content ── */}
                <div className="flex-1 min-w-0">
                    {renderContent()}
                </div>
            </div>
        </AppLayout>
    );
}
