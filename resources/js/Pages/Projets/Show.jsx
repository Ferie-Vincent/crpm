import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { MoneyInput } from '@/components/ui/money-input';
import { fmt as fmtCurrency, separerMilliers as sepMilliers } from '@/lib/currency';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    ArrowLeft, Download, FileText, MapPin, User, Calendar,
    AlertTriangle, CheckCircle2, XCircle, Clock, TrendingUp,
    ClipboardList, Star, Navigation, Building2, Tag, Banknote,
    ThumbsUp, ThumbsDown, Lightbulb, Pencil, Plus, Save, Lock, Trash2, Upload,
    History, Binoculars, FolderOpen, CreditCard, Layers, Activity, FileUp, FileX, Eye,
} from 'lucide-react';

const STATUT_CONFIG = {
    en_preparation: { label: 'En préparation', cls: 'bg-slate-100 text-slate-700' },
    en_cours:       { label: 'En cours',        cls: 'bg-blue-100 text-blue-700' },
    suspendu:       { label: 'Suspendu',         cls: 'bg-amber-100 text-amber-700' },
    termine:        { label: 'Terminé',          cls: 'bg-green-100 text-green-700' },
    annule:         { label: 'Annulé',           cls: 'bg-red-100 text-red-700' },
};

// Coordinates for communes in the Casamance region
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
};

const EVAL_CONFIG = {
    'Très Bon': { cls: 'bg-green-100 text-green-700 border-green-200', stars: 5 },
    'Bon':      { cls: 'bg-blue-100 text-blue-700 border-blue-200',    stars: 4 },
    'Moyen':    { cls: 'bg-amber-100 text-amber-700 border-amber-200', stars: 3 },
    'Faible':   { cls: 'bg-red-100 text-red-700 border-red-200',       stars: 2 },
};

function fmtNum(v) {
    if (!v && v !== 0) return '—';
    return sepMilliers(v);
}

function fmtDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function InfoRow({ label, value, children }) {
    return (
        <div className="flex items-start gap-3 py-2.5 border-b border-border/40 last:border-0">
            <span className="w-40 shrink-0 text-xs text-muted-foreground pt-0.5">{label}</span>
            <span className="text-sm font-medium flex-1">{children ?? value ?? '—'}</span>
        </div>
    );
}

function StatBlock({ label, value, sub, color = 'text-foreground' }) {
    return (
        <div className="rounded-xl border border-border/60 p-4 space-y-1">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
    );
}

// ── Onglets colorés ───────────────────────────────────────────────────────────
function ColoredTabs({ tabs, activeValue, onValueChange }) {
    return (
        <TabsList className="h-auto bg-transparent p-0 gap-0 w-full justify-start rounded-none">
            {tabs.map(({ value, label, badge, color, badgeBg, badgeText }) => {
                const isActive = activeValue === value;
                return (
                    <TabsTrigger
                        key={value}
                        value={value}
                        onClick={() => onValueChange(value)}
                        className="relative h-12 px-5 rounded-none border-0 shadow-none bg-transparent transition-colors whitespace-nowrap text-sm font-medium"
                        style={{
                            color: isActive ? color : undefined,
                            fontWeight: isActive ? 600 : undefined,
                            backgroundColor: isActive ? `${color}0d` : undefined,
                        }}
                    >
                        {label}
                        {badge !== null && badge > 0 && (
                            <span
                                className="ml-2 inline-flex items-center justify-center rounded-full text-[10px] font-semibold px-1.5 py-0.5 min-w-[18px]"
                                style={{ background: badgeBg, color: badgeText }}
                            >
                                {badge}
                            </span>
                        )}
                        {/* Barre colorée en bas */}
                        <span
                            className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full transition-all duration-200"
                            style={{ background: isActive ? color : 'transparent' }}
                        />
                    </TabsTrigger>
                );
            })}
        </TabsList>
    );
}

// ── Constantes formulaire ────────────────────────────────────────────────────
const LOG_TYPE_CONFIG = {
    modification: { label: 'Modification', icon: Pencil,    color: 'text-blue-600',   bg: 'bg-blue-50',   ring: 'border-blue-200',   badgeCls: 'bg-blue-100 text-blue-700' },
    decaissement: { label: 'Décaissement', icon: CreditCard, color: 'text-green-600', bg: 'bg-green-50',  ring: 'border-green-200',  badgeCls: 'bg-green-100 text-green-700' },
    phase:        { label: 'Phase',        icon: Layers,     color: 'text-indigo-600', bg: 'bg-indigo-50', ring: 'border-indigo-200', badgeCls: 'bg-indigo-100 text-indigo-700' },
    activite:     { label: 'Activité',     icon: Activity,   color: 'text-sky-600',   bg: 'bg-sky-50',    ring: 'border-sky-200',    badgeCls: 'bg-sky-100 text-sky-700' },
    document:     { label: 'Document',     icon: FileText,   color: 'text-slate-600', bg: 'bg-slate-50',  ring: 'border-slate-200',  badgeCls: 'bg-slate-100 text-slate-700' },
    mission:      { label: 'Mission',      icon: Navigation, color: 'text-orange-600', bg: 'bg-orange-50', ring: 'border-orange-200', badgeCls: 'bg-orange-100 text-orange-700' },
};

const STATUTS_OPTIONS   = [
    { value: 'en_preparation', label: 'En préparation' },
    { value: 'en_cours',       label: 'En cours' },
    { value: 'suspendu',       label: 'Suspendu' },
    { value: 'termine',        label: 'Terminé' },
    { value: 'annule',         label: 'Annulé' },
];
const DOMAINES_OPTIONS  = ['Valorisation des Ressources Naturelles', 'Tourisme Durable', 'Agriculture', 'Éducation', 'Santé', 'Infrastructure', 'Autre'];
const CATEGORIES_OPTIONS = ['Economique', 'Sociale', 'Mixte'];

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

// ── Modal modification projet ─────────────────────────────────────────────────
function ModifierProjetModal({ open, onClose, projet, programmes }) {
    const meta = projet.meta ?? {};
    const selCls = "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring";

    const { data, setData, put, processing, errors, reset } = useForm({
        titre:           projet.titre          ?? '',
        description:     projet.description    ?? '',
        porteur:         projet.porteur        ?? '',
        commune:         projet.commune        ?? '',
        region:          projet.region         ?? '',
        montant_accorde: projet.montant_accorde ?? '',
        date_debut:      projet.date_debut      ? projet.date_debut.slice(0, 10) : '',
        date_fin_prevue: projet.date_fin_prevue ? projet.date_fin_prevue.slice(0, 10) : '',
        statut:          projet.statut         ?? 'en_preparation',
        domaine:         meta.domaine          ?? '',
        categorie:       meta.categorie        ?? '',
        eligible:        meta.eligible != null  ? String(Number(meta.eligible)) : '',
        accord_scac:     meta.accord_scac != null ? String(Number(meta.accord_scac)) : '',
        decision:        meta.decision         ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(`/projets/${projet.id}`, { onSuccess: () => onClose() });
    };

    return (
        <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
                <form onSubmit={submit}>
                    <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/60">
                        <DialogTitle className="text-base font-semibold flex items-center gap-2">
                            <Pencil className="h-4 w-4" />
                            Modifier — {projet.code}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="px-6 py-5 space-y-5">

                        {/* Identification */}
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Identification</p>
                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Titre" error={errors.titre} required>
                                    <Input value={data.titre} onChange={e => setData('titre', e.target.value)} className="h-9 text-sm" />
                                </Field>
                                <Field label="Porteur / Organisation" error={errors.porteur}>
                                    <Input value={data.porteur} onChange={e => setData('porteur', e.target.value)} className="h-9 text-sm" />
                                </Field>
                                <Field label="Domaine" error={errors.domaine}>
                                    <select value={data.domaine} onChange={e => setData('domaine', e.target.value)} className={selCls}>
                                        <option value="">— Sélectionner —</option>
                                        {DOMAINES_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </Field>
                                <Field label="Catégorie" error={errors.categorie}>
                                    <select value={data.categorie} onChange={e => setData('categorie', e.target.value)} className={selCls}>
                                        <option value="">— Sélectionner —</option>
                                        {CATEGORIES_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </Field>
                            </div>
                        </div>

                        {/* Localisation & Programme */}
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Localisation & Programme</p>
                            <div className="grid grid-cols-3 gap-3">
                                <Field label="Commune" error={errors.commune}>
                                    <Input value={data.commune} onChange={e => setData('commune', e.target.value)} className="h-9 text-sm" />
                                </Field>
                                <Field label="Région" error={errors.region}>
                                    <Input value={data.region} onChange={e => setData('region', e.target.value)} className="h-9 text-sm" />
                                </Field>
                                <Field label="Programme">
                                    <div className="flex h-9 w-full items-center rounded-md border border-input bg-muted/40 px-3 text-sm text-muted-foreground cursor-not-allowed">
                                        {(programmes ?? []).find(p => p.id == projet.programme_id)?.nom ?? '—'}
                                        <span className="ml-auto"><Lock className="h-3 w-3" /></span>
                                    </div>
                                </Field>
                            </div>
                        </div>

                        {/* Financement */}
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Financement & Statut</p>
                            <div className="grid grid-cols-3 gap-3">
                                <Field label="Montant accordé" error={errors.montant_accorde}>
                                    <MoneyInput value={data.montant_accorde} onChange={v => setData('montant_accorde', v)} devise={projet.pays?.devise ?? 'XOF'} />
                                </Field>
                                <Field label="Date début" error={errors.date_debut}>
                                    <Input type="date" value={data.date_debut} onChange={e => setData('date_debut', e.target.value)} className="h-9 text-sm" />
                                </Field>
                                <Field label="Date fin prévue" error={errors.date_fin_prevue}>
                                    <Input type="date" value={data.date_fin_prevue} onChange={e => setData('date_fin_prevue', e.target.value)} className="h-9 text-sm" />
                                </Field>
                                <Field label="Statut" error={errors.statut} required>
                                    <select value={data.statut} onChange={e => setData('statut', e.target.value)} className={selCls}>
                                        {STATUTS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                    </select>
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

                        {/* Description */}
                        <Field label="Description" error={errors.description}>
                            <textarea
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                rows={3}
                                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                            />
                        </Field>
                    </div>

                    <DialogFooter className="px-6 py-4 border-t border-border/60 gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={onClose}>Annuler</Button>
                        <Button type="submit" size="sm" disabled={processing} className="gap-1.5">
                            <Save className="h-3.5 w-3.5" />
                            {processing ? 'Enregistrement…' : 'Enregistrer les modifications'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ── Modal nouveau décaissement ───────────────────────────────────────────────
function NouveauDecaissementModal({ open, onClose, projet }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        date_decaissement: '',
        montant:           '',
        reference:         '',
        objet:             '',
        notes:             '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(`/projets/${projet.id}/decaissements`, {
            onSuccess: () => { reset(); onClose(); },
        });
    };

    const restant = (projet.montant_accorde ?? 0) - (projet.montant_decaisse ?? 0);

    return (
        <Dialog open={open} onOpenChange={v => { if (!v) { reset(); onClose(); } }}>
            <DialogContent className="max-w-md p-0">
                <form onSubmit={submit}>
                    <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/60">
                        <DialogTitle className="text-base font-semibold flex items-center gap-2">
                            <Banknote className="h-4 w-4 text-green-600" />
                            Nouveau décaissement
                        </DialogTitle>
                    </DialogHeader>

                    <div className="px-6 py-5 space-y-4">
                        {restant > 0 && (
                            <div className="rounded-md bg-green-50 border border-green-100 px-3 py-2 text-xs text-green-700">
                                Solde disponible : <span className="font-semibold">{fmt(restant, projet.pays?.devise ?? 'XOF')}</span>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Date" error={errors.date_decaissement} required>
                                <Input type="date" value={data.date_decaissement} onChange={e => setData('date_decaissement', e.target.value)} className="h-9 text-sm" />
                            </Field>
                            <Field label="Montant" error={errors.montant} required>
                                <MoneyInput value={data.montant} onChange={v => setData('montant', v)} devise={projet.pays?.devise ?? 'XOF'} />
                            </Field>
                        </div>

                        <Field label="Référence de la tranche" error={errors.reference}>
                            <Input value={data.reference} onChange={e => setData('reference', e.target.value)} placeholder="ex. T1, T2…" className="h-9 text-sm" />
                        </Field>

                        <Field label="Objet du décaissement" error={errors.objet}>
                            <Input value={data.objet} onChange={e => setData('objet', e.target.value)} placeholder="ex. Tranche 1 — démarrage travaux" className="h-9 text-sm" />
                        </Field>

                        <Field label="Notes" error={errors.notes}>
                            <textarea
                                value={data.notes}
                                onChange={e => setData('notes', e.target.value)}
                                rows={2}
                                placeholder="Informations complémentaires…"
                                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                            />
                        </Field>
                    </div>

                    <DialogFooter className="px-6 py-4 border-t border-border/60 gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => { reset(); onClose(); }}>Annuler</Button>
                        <Button type="submit" size="sm" disabled={processing} className="gap-1.5 bg-green-700 hover:bg-green-800">
                            <Save className="h-3.5 w-3.5" />
                            {processing ? 'Enregistrement…' : 'Enregistrer'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ── Statuts config partagés ───────────────────────────────────────────────────
const PHASE_ST_OPTIONS = [
    { value: 'planifie', label: 'Planifiée' },
    { value: 'en_cours', label: 'En cours' },
    { value: 'complete', label: 'Complétée' },
    { value: 'reporte',  label: 'Reportée' },
];
const ACT_ST_OPTIONS = [
    { value: 'planifie', label: 'Planifiée' },
    { value: 'en_cours', label: 'En cours' },
    { value: 'complete', label: 'Complétée' },
    { value: 'annule',   label: 'Annulée' },
];
const DOC_CATEGORIES = ['convention', 'rapport', 'photo', 'facture', 'contrat', 'autre'];

// ── Modal Phase ───────────────────────────────────────────────────────────────
function PhaseModal({ open, onClose, projet, phase }) {
    const editing = !!phase;
    const { data, setData, post, put, processing, errors, reset } = useForm({
        nom:         phase?.nom         ?? '',
        description: phase?.description ?? '',
        ordre:       phase?.ordre       ?? '',
        statut:      phase?.statut      ?? 'planifie',
        date_debut:  phase?.date_debut  ? phase.date_debut.slice(0,10) : '',
        date_fin:    phase?.date_fin    ? phase.date_fin.slice(0,10) : '',
    });
    const selCls = "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring";
    const submit = (e) => {
        e.preventDefault();
        const opts = { onSuccess: () => { reset(); onClose(); } };
        editing ? put(`/projets/${projet.id}/phases/${phase.id}`, opts) : post(`/projets/${projet.id}/phases`, opts);
    };
    return (
        <Dialog open={open} onOpenChange={v => { if (!v) { reset(); onClose(); } }}>
            <DialogContent className="max-w-md p-0">
                <form onSubmit={submit}>
                    <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/60">
                        <DialogTitle className="text-base font-semibold">{editing ? 'Modifier la phase' : 'Nouvelle phase'}</DialogTitle>
                    </DialogHeader>
                    <div className="px-6 py-5 space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-2">
                                <Field label="Nom de la phase" error={errors.nom} required>
                                    <Input value={data.nom} onChange={e => setData('nom', e.target.value)} className="h-9 text-sm" placeholder="ex. Phase 1 — Démarrage" />
                                </Field>
                            </div>
                            <Field label="Ordre" error={errors.ordre}>
                                <Input type="number" min="0" value={data.ordre} onChange={e => setData('ordre', e.target.value)} className="h-9 text-sm" placeholder="1" />
                            </Field>
                        </div>
                        <Field label="Description" error={errors.description}>
                            <textarea value={data.description} onChange={e => setData('description', e.target.value)} rows={2}
                                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
                        </Field>
                        <div className="grid grid-cols-3 gap-3">
                            <Field label="Statut" error={errors.statut} required>
                                <select value={data.statut} onChange={e => setData('statut', e.target.value)} className={selCls}>
                                    {PHASE_ST_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                </select>
                            </Field>
                            <Field label="Début prévu" error={errors.date_debut}>
                                <Input type="date" value={data.date_debut} onChange={e => setData('date_debut', e.target.value)} className="h-9 text-sm" />
                            </Field>
                            <Field label="Fin prévue" error={errors.date_fin}>
                                <Input type="date" value={data.date_fin} onChange={e => setData('date_fin', e.target.value)} className="h-9 text-sm" />
                            </Field>
                        </div>
                    </div>
                    <DialogFooter className="px-6 py-4 border-t border-border/60 gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => { reset(); onClose(); }}>Annuler</Button>
                        <Button type="submit" size="sm" disabled={processing} className="gap-1.5">
                            <Save className="h-3.5 w-3.5" />{processing ? 'Enregistrement…' : (editing ? 'Mettre à jour' : 'Créer la phase')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ── Modal Activité ────────────────────────────────────────────────────────────
function ActiviteModal({ open, onClose, projet, activite, phases }) {
    const editing = !!activite;
    const { data, setData, post, put, processing, errors, reset } = useForm({
        phase_id:        activite?.phase_id        ?? '',
        nom:             activite?.nom             ?? '',
        description:     activite?.description     ?? '',
        responsable:     activite?.responsable     ?? '',
        date_debut:      activite?.date_debut      ? activite.date_debut.slice(0,10) : '',
        date_fin_prevue: activite?.date_fin_prevue ? activite.date_fin_prevue.slice(0,10) : '',
        statut:          activite?.statut          ?? 'planifie',
        progression:     activite?.progression     ?? 0,
    });
    const selCls = "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring";
    const submit = (e) => {
        e.preventDefault();
        const opts = { onSuccess: () => { reset(); onClose(); } };
        editing ? put(`/projets/${projet.id}/activites/${activite.id}`, opts) : post(`/projets/${projet.id}/activites`, opts);
    };
    return (
        <Dialog open={open} onOpenChange={v => { if (!v) { reset(); onClose(); } }}>
            <DialogContent className="max-w-lg p-0">
                <form onSubmit={submit}>
                    <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/60">
                        <DialogTitle className="text-base font-semibold">{editing ? 'Modifier l\'activité' : 'Nouvelle activité'}</DialogTitle>
                    </DialogHeader>
                    <div className="px-6 py-5 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Nom de l'activité" error={errors.nom} required>
                                <Input value={data.nom} onChange={e => setData('nom', e.target.value)} className="h-9 text-sm" placeholder="Intitulé de l'activité" />
                            </Field>
                            <Field label="Phase" error={errors.phase_id}>
                                <select value={data.phase_id} onChange={e => setData('phase_id', e.target.value)} className={selCls}>
                                    <option value="">— Sans phase —</option>
                                    {phases.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
                                </select>
                            </Field>
                        </div>
                        <Field label="Description" error={errors.description}>
                            <textarea value={data.description} onChange={e => setData('description', e.target.value)} rows={2}
                                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Responsable" error={errors.responsable}>
                                <Input value={data.responsable} onChange={e => setData('responsable', e.target.value)} className="h-9 text-sm" placeholder="Nom ou service" />
                            </Field>
                            <Field label="Statut" error={errors.statut} required>
                                <select value={data.statut} onChange={e => setData('statut', e.target.value)} className={selCls}>
                                    {ACT_ST_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                </select>
                            </Field>
                            <Field label="Date début" error={errors.date_debut}>
                                <Input type="date" value={data.date_debut} onChange={e => setData('date_debut', e.target.value)} className="h-9 text-sm" />
                            </Field>
                            <Field label="Date fin prévue" error={errors.date_fin_prevue}>
                                <Input type="date" value={data.date_fin_prevue} onChange={e => setData('date_fin_prevue', e.target.value)} className="h-9 text-sm" />
                            </Field>
                        </div>
                        <Field label={`Progression — ${data.progression}%`} error={errors.progression}>
                            <input type="range" min="0" max="100" step="5" value={data.progression}
                                onChange={e => setData('progression', parseInt(e.target.value))}
                                className="w-full h-2 accent-foreground cursor-pointer" />
                        </Field>
                    </div>
                    <DialogFooter className="px-6 py-4 border-t border-border/60 gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => { reset(); onClose(); }}>Annuler</Button>
                        <Button type="submit" size="sm" disabled={processing} className="gap-1.5">
                            <Save className="h-3.5 w-3.5" />{processing ? 'Enregistrement…' : (editing ? 'Mettre à jour' : 'Créer l\'activité')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ── Modal Document ────────────────────────────────────────────────────────────
function DocumentModal({ open, onClose, projet }) {
    const { data, setData, post, processing, errors, reset } = useForm({ fichier: null, categorie: 'autre' });
    const selCls = "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring";
    const submit = (e) => {
        e.preventDefault();
        post(`/projets/${projet.id}/documents`, {
            forceFormData: true,
            onSuccess: () => { reset(); onClose(); },
        });
    };
    return (
        <Dialog open={open} onOpenChange={v => { if (!v) { reset(); onClose(); } }}>
            <DialogContent className="max-w-sm p-0">
                <form onSubmit={submit}>
                    <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/60">
                        <DialogTitle className="text-base font-semibold flex items-center gap-2">
                            <Upload className="h-4 w-4" /> Ajouter un document
                        </DialogTitle>
                    </DialogHeader>
                    <div className="px-6 py-5 space-y-4">
                        <Field label="Fichier" error={errors.fichier} required>
                            <input type="file" onChange={e => setData('fichier', e.target.files[0])}
                                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm file:border-0 file:bg-transparent file:text-sm file:font-medium cursor-pointer" />
                        </Field>
                        <Field label="Catégorie" error={errors.categorie}>
                            <select value={data.categorie} onChange={e => setData('categorie', e.target.value)} className={selCls}>
                                {DOC_CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                            </select>
                        </Field>
                    </div>
                    <DialogFooter className="px-6 py-4 border-t border-border/60 gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => { reset(); onClose(); }}>Annuler</Button>
                        <Button type="submit" size="sm" disabled={processing || !data.fichier} className="gap-1.5">
                            <Upload className="h-3.5 w-3.5" />{processing ? 'Envoi…' : 'Téléverser'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ── Modal mission de suivi ────────────────────────────────────────────────────
function MissionModal({ open, onClose, projet }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        date_visite:     '',
        observations:    '',
        points_positifs: '',
        points_negatifs: '',
        recommandations: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(`/projets/${projet.id}/missions`, { onSuccess: () => { reset(); onClose(); } });
    };

    const textAreaCls = "flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none";

    return (
        <Dialog open={open} onOpenChange={v => { if (!v) { reset(); onClose(); } }}>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-0">
                <form onSubmit={submit}>
                    <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/60">
                        <DialogTitle className="text-base font-semibold flex items-center gap-2">
                            <Navigation className="h-4 w-4 text-orange-500" />
                            Nouvelle mission de suivi — {projet.code}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="px-6 py-5 space-y-4">
                        <Field label="Date de visite" error={errors.date_visite} required>
                            <Input type="date" value={data.date_visite} onChange={e => setData('date_visite', e.target.value)} className="h-9 text-sm" />
                        </Field>

                        <Field label="Observations / Compte-rendu" error={errors.observations}>
                            <textarea
                                value={data.observations}
                                onChange={e => setData('observations', e.target.value)}
                                className={textAreaCls}
                                placeholder="Observations générales sur l'état d'avancement du projet…"
                                rows={4}
                            />
                        </Field>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <Field label="Points positifs" error={errors.points_positifs}>
                                <textarea
                                    value={data.points_positifs}
                                    onChange={e => setData('points_positifs', e.target.value)}
                                    className={`${textAreaCls} border-green-200 focus-visible:ring-green-400`}
                                    placeholder="Ce qui fonctionne bien…"
                                    rows={3}
                                />
                            </Field>
                            <Field label="Points négatifs" error={errors.points_negatifs}>
                                <textarea
                                    value={data.points_negatifs}
                                    onChange={e => setData('points_negatifs', e.target.value)}
                                    className={`${textAreaCls} border-red-200 focus-visible:ring-red-400`}
                                    placeholder="Difficultés rencontrées…"
                                    rows={3}
                                />
                            </Field>
                            <Field label="Recommandations" error={errors.recommandations}>
                                <textarea
                                    value={data.recommandations}
                                    onChange={e => setData('recommandations', e.target.value)}
                                    className={`${textAreaCls} border-amber-200 focus-visible:ring-amber-400`}
                                    placeholder="Actions correctives proposées…"
                                    rows={3}
                                />
                            </Field>
                        </div>
                    </div>

                    <DialogFooter className="px-6 py-4 border-t border-border/60 gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => { reset(); onClose(); }}>Annuler</Button>
                        <Button type="submit" size="sm" disabled={processing || !data.date_visite} className="gap-1.5 bg-orange-600 hover:bg-orange-700">
                            <Navigation className="h-3.5 w-3.5" />{processing ? 'Enregistrement…' : 'Enregistrer la mission'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function ProjetShow({ projet, programmes }) {
    const { devise_affichage = 'locale', taux_eur = {} } = usePage().props;
    const statut = STATUT_CONFIG[projet.statut] ?? { label: projet.statut, cls: 'bg-slate-100 text-slate-700' };
    const devise = projet.pays?.devise ?? 'XOF';

    // Formate un montant en tenant compte de la devise d'affichage globale.
    // Utilise la devise du projet comme source, convertit si besoin.
    const fmt = (v, src = devise) => fmtCurrency(v, src, devise_affichage, taux_eur);
    const meta = projet.meta ?? {};
    const [activeTab, setActiveTab] = useState('synthese');
    const [modifierOpen, setModifierOpen] = useState(false);
    const [decaissementOpen, setDecaissementOpen] = useState(false);
    const missions      = projet.missions_terrain ?? [];
    const decaissements = projet.decaissements    ?? [];
    const documents     = projet.documents        ?? [];
    const phases        = projet.phases           ?? [];
    const activites     = projet.activites        ?? [];
    const logs          = projet.logs             ?? [];
    const [phaseModalOpen, setPhaseModalOpen]       = useState(false);
    const [editPhase, setEditPhase]                 = useState(null);
    const [activiteModalOpen, setActiviteModalOpen] = useState(false);
    const [editActivite, setEditActivite]           = useState(null);
    const [docModalOpen, setDocModalOpen]           = useState(false);
    const [missionModalOpen, setMissionModalOpen]   = useState(false);

    const tauxDecaissement = projet.montant_accorde > 0
        ? Math.round((projet.montant_decaisse / projet.montant_accorde) * 100)
        : 0;

    const totalDecaisse = decaissements.reduce((sum, d) => sum + parseFloat(d.montant ?? 0), 0);

    // Missions with GPS
    const missionsGps = missions.filter(m => m.latitude && m.longitude);
    // Use first GPS point, then commune lookup, then Ziguinchor default
    const communeCoords = COMMUNE_COORDS[projet.commune] ?? COMMUNE_COORDS[projet.region] ?? [12.5573, -16.2719];
    const mapLat = missionsGps[0]?.latitude  ?? communeCoords[0];
    const mapLng = missionsGps[0]?.longitude ?? communeCoords[1];

    const handleExportPdf = () => router.post(`/projets/${projet.id}/export-pdf`);

    return (
        <AppLayout
            title={projet.titre}
            breadcrumbs={[
                { label: 'Projets', href: '/projets' },
                { label: projet.code, href: `/projets/${projet.id}` },
            ]}
        >
            <Head title={projet.titre} />

            <div className="space-y-5">

                {/* ── Topbar ── */}
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" asChild className="-ml-2">
                        <Link href="/projets">
                            <ArrowLeft className="mr-1.5 h-4 w-4" /> Projets
                        </Link>
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleExportPdf}>
                            <Download className="mr-1.5 h-3.5 w-3.5" /> Exporter PDF
                        </Button>
                        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setModifierOpen(true)}>
                            <Pencil className="h-3.5 w-3.5" /> Modifier
                        </Button>
                    </div>
                </div>

                {/* ── Hero ── */}
                <Card className="shadow-none border-border/60">
                    <CardContent className="pt-5 pb-5">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div className="space-y-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-mono text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">{projet.code}</span>
                                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statut.cls}`}>{statut.label}</span>
                                    {meta.domaine && (
                                        <span className="text-xs text-muted-foreground px-2 py-0.5 rounded border border-border/60">{meta.domaine}</span>
                                    )}
                                </div>
                                <h1 className="text-lg font-bold leading-tight mt-1">{projet.titre}</h1>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap mt-1">
                                    {projet.porteur && <span className="flex items-center gap-1"><User className="h-3 w-3" />{projet.porteur}</span>}
                                    {projet.commune && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{projet.commune}{projet.region ? `, ${projet.region}` : ''}</span>}
                                    {projet.date_debut && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{fmtDate(projet.date_debut)} → {fmtDate(projet.date_fin_prevue)}</span>}
                                    {projet.programme && <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{projet.programme.nom}</span>}
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <div className="text-4xl font-bold">{projet.completude}<span className="text-lg text-muted-foreground font-normal">%</span></div>
                                <div className="text-xs text-muted-foreground mb-2">complétude</div>
                                <Progress value={projet.completude} className="h-1.5 w-28 ml-auto" />
                                {projet.completude < 50 && (
                                    <p className="flex items-center gap-1 text-amber-600 text-xs mt-1 justify-end">
                                        <AlertTriangle className="h-3 w-3" /> Données insuffisantes
                                    </p>
                                )}
                            </div>
                        </div>

                        <Separator className="my-4" />

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-xs text-muted-foreground">Montant accordé</p>
                                <p className="text-sm font-semibold mt-0.5">{fmt(projet.montant_accorde, devise)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Décaissé</p>
                                <p className="text-sm font-semibold mt-0.5">{fmt(projet.montant_decaisse, devise)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Taux décaissement</p>
                                <p className="text-sm font-semibold mt-0.5">{tauxDecaissement}%</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Évaluation</p>
                                <p className="text-sm font-semibold mt-0.5">{meta.evaluation ?? '—'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* ── Tabs ── */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <div className="border-b border-border/60 bg-white rounded-t-xl overflow-x-auto">
                        <ColoredTabs
                            activeValue={activeTab}
                            onValueChange={setActiveTab}
                            tabs={[
                                { value: 'synthese',        label: 'Synthèse',          badge: null,                 color: '#3b82f6', badgeBg: '#dbeafe', badgeText: '#1d4ed8' },
                                { value: 'phases',          label: 'Phases & Jalons',   badge: phases.length,        color: '#6366f1', badgeBg: '#e0e7ff', badgeText: '#3730a3' },
                                { value: 'activites',       label: 'Activités',         badge: activites.length,     color: '#0ea5e9', badgeBg: '#e0f2fe', badgeText: '#0369a1' },
                                { value: 'decaissements',   label: 'Décaissements',     badge: decaissements.length, color: '#10b981', badgeBg: '#d1fae5', badgeText: '#065f46' },
                                { value: 'eligibilite',     label: 'Éligibilité',       badge: null,                 color: '#8b5cf6', badgeBg: '#ede9fe', badgeText: '#5b21b6' },
                                { value: 'documents',       label: 'Documents',         badge: documents.length,     color: '#64748b', badgeBg: '#f1f5f9', badgeText: '#334155' },
                                { value: 'missions',        label: 'Missions de suivi', badge: missions.length,      color: '#f97316', badgeBg: '#ffedd5', badgeText: '#9a3412' },
                                { value: 'evaluation',      label: 'Évaluation',        badge: null,                 color: '#f59e0b', badgeBg: '#fef3c7', badgeText: '#92400e' },
                                { value: 'geolocalisation', label: 'Géolocalisation',   badge: null,                 color: '#14b8a6', badgeBg: '#ccfbf1', badgeText: '#115e59' },
                                { value: 'historique',      label: 'Historique',        badge: logs.length,          color: '#6b7280', badgeBg: '#f3f4f6', badgeText: '#374151' },
                            ]}
                        />
                    </div>

                    {/* ── SYNTHÈSE ── */}
                    <TabsContent value="synthese" className="mt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="shadow-none border-border/60">
                                <CardHeader className="pb-2 pt-4 px-5">
                                    <CardTitle className="text-sm font-semibold">Identification</CardTitle>
                                </CardHeader>
                                <CardContent className="px-5 pb-4">
                                    <InfoRow label="Code projet">{projet.code}</InfoRow>
                                    <InfoRow label="Sigle">{meta.sigle}</InfoRow>
                                    <InfoRow label="N° Excel">{meta.num_excel}</InfoRow>
                                    <InfoRow label="Domaine">{meta.domaine}</InfoRow>
                                    <InfoRow label="Catégorie">{meta.categorie}</InfoRow>
                                    <InfoRow label="Porteur">{projet.porteur}</InfoRow>
                                    <InfoRow label="Commune / Région">
                                        {[projet.commune, projet.region].filter(Boolean).join(', ') || '—'}
                                    </InfoRow>
                                </CardContent>
                            </Card>

                            <Card className="shadow-none border-border/60">
                                <CardHeader className="pb-2 pt-4 px-5">
                                    <CardTitle className="text-sm font-semibold">Programme & financement</CardTitle>
                                </CardHeader>
                                <CardContent className="px-5 pb-4">
                                    <InfoRow label="Programme">{projet.programme?.nom}</InfoRow>
                                    <InfoRow label="Bailleur">{projet.programme?.bailleur}</InfoRow>
                                    <InfoRow label="Date début">{fmtDate(projet.date_debut)}</InfoRow>
                                    <InfoRow label="Date fin prévue">{fmtDate(projet.date_fin_prevue)}</InfoRow>
                                    <InfoRow label="Montant accordé">
                                        <span className="font-semibold">{fmt(projet.montant_accorde, devise)}</span>
                                    </InfoRow>
                                    <InfoRow label="Montant décaissé">
                                        <span className="font-semibold">{fmt(projet.montant_decaisse, devise)}</span>
                                    </InfoRow>
                                    <InfoRow label="Taux d'exécution">
                                        <span className="font-semibold">{tauxDecaissement}%</span>
                                    </InfoRow>
                                </CardContent>
                            </Card>
                        </div>

                        {projet.description && (
                            <Card className="shadow-none border-border/60">
                                <CardHeader className="pb-2 pt-4 px-5">
                                    <CardTitle className="text-sm font-semibold">Description</CardTitle>
                                </CardHeader>
                                <CardContent className="px-5 pb-4">
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{projet.description}</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* ── PHASES & JALONS ── */}
                    <TabsContent value="phases" className="mt-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">{phases.length} phase{phases.length !== 1 ? 's' : ''} définie{phases.length !== 1 ? 's' : ''}</p>
                            <Button size="sm" className="gap-1.5" onClick={() => { setEditPhase(null); setPhaseModalOpen(true); }}>
                                <Plus className="h-3.5 w-3.5" /> Nouvelle phase
                            </Button>
                        </div>

                        {phases.length === 0 ? (
                            <Card className="shadow-none border-border/60 border-dashed">
                                <CardContent className="py-12 text-center text-muted-foreground text-sm">
                                    Aucune phase définie. Structurez votre projet en ajoutant des phases.
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {phases.map((phase, idx) => {
                                    const PHASE_ST = {
                                        planifie:  { label: 'Planifiée',  cls: 'bg-slate-100 text-slate-600' },
                                        en_cours:  { label: 'En cours',   cls: 'bg-blue-100 text-blue-700' },
                                        complete:  { label: 'Complétée',  cls: 'bg-green-100 text-green-700' },
                                        reporte:   { label: 'Reportée',   cls: 'bg-amber-100 text-amber-700' },
                                    };
                                    const st = PHASE_ST[phase.statut] ?? { label: phase.statut, cls: 'bg-slate-100 text-slate-600' };
                                    return (
                                        <Card key={phase.id} className="shadow-none border-border/60">
                                            <CardContent className="pt-4 pb-4 px-5">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold mt-0.5">
                                                            {idx + 1}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <p className="text-sm font-semibold">{phase.nom}</p>
                                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
                                                                {phase.activites_count > 0 && (
                                                                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{phase.activites_count} activité{phase.activites_count !== 1 ? 's' : ''}</span>
                                                                )}
                                                            </div>
                                                            {phase.description && <p className="text-xs text-muted-foreground mt-1">{phase.description}</p>}
                                                            {(phase.date_debut || phase.date_fin) && (
                                                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                                    <Calendar className="h-3 w-3" />
                                                                    {phase.date_debut ? fmtDate(phase.date_debut) : '?'} → {phase.date_fin ? fmtDate(phase.date_fin) : '?'}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditPhase(phase); setPhaseModalOpen(true); }}>
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive"
                                                            onClick={() => { if (confirm('Supprimer cette phase ?')) router.delete(`/projets/${projet.id}/phases/${phase.id}`); }}>
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </TabsContent>

                    {/* ── ACTIVITÉS ── */}
                    <TabsContent value="activites" className="mt-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">{activites.length} activité{activites.length !== 1 ? 's' : ''}</p>
                            <Button size="sm" className="gap-1.5" onClick={() => { setEditActivite(null); setActiviteModalOpen(true); }}>
                                <Plus className="h-3.5 w-3.5" /> Nouvelle activité
                            </Button>
                        </div>

                        {activites.length === 0 ? (
                            <Card className="shadow-none border-border/60 border-dashed">
                                <CardContent className="py-12 text-center text-muted-foreground text-sm">
                                    Aucune activité définie pour ce projet.
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="shadow-none border-border/60">
                                <CardContent className="px-0 pb-0">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-y border-border/60 bg-muted/30">
                                                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Activité</th>
                                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Phase</th>
                                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Responsable</th>
                                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Période</th>
                                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Progression</th>
                                                <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Statut</th>
                                                <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/40">
                                            {activites.map(a => {
                                                const ACT_ST = {
                                                    planifie: { label: 'Planifiée',  cls: 'bg-slate-100 text-slate-600' },
                                                    en_cours: { label: 'En cours',   cls: 'bg-blue-100 text-blue-700' },
                                                    complete: { label: 'Complétée',  cls: 'bg-green-100 text-green-700' },
                                                    annule:   { label: 'Annulée',    cls: 'bg-red-100 text-red-600' },
                                                };
                                                const st = ACT_ST[a.statut] ?? { label: a.statut, cls: 'bg-slate-100' };
                                                return (
                                                    <tr key={a.id} className="hover:bg-muted/20 transition-colors group">
                                                        <td className="px-4 py-2.5">
                                                            <p className="text-xs font-medium">{a.nom}</p>
                                                            {a.description && <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{a.description}</p>}
                                                        </td>
                                                        <td className="px-3 py-2.5 text-xs text-muted-foreground">{a.phase?.nom ?? '—'}</td>
                                                        <td className="px-3 py-2.5 text-xs text-muted-foreground">{a.responsable ?? '—'}</td>
                                                        <td className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                                                            {a.date_debut ? fmtDate(a.date_debut) : '—'}{a.date_fin_prevue ? ` → ${fmtDate(a.date_fin_prevue)}` : ''}
                                                        </td>
                                                        <td className="px-3 py-2.5">
                                                            <div className="flex items-center gap-1.5">
                                                                <Progress value={a.progression} className="h-1.5 w-14" />
                                                                <span className="text-xs text-muted-foreground">{a.progression}%</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-2.5">
                                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
                                                        </td>
                                                        <td className="px-4 py-2.5">
                                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditActivite(a); setActiviteModalOpen(true); }}>
                                                                    <Pencil className="h-3.5 w-3.5" />
                                                                </Button>
                                                                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive"
                                                                    onClick={() => { if (confirm('Supprimer cette activité ?')) router.delete(`/projets/${projet.id}/activites/${a.id}`); }}>
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* ── DÉCAISSEMENTS ── */}
                    <TabsContent value="decaissements" className="mt-4 space-y-4">
                        {/* Progress bar */}
                        <Card className="shadow-none border-border/60">
                            <CardContent className="pt-4 pb-4 px-5">
                                <div className="flex items-end justify-between mb-2">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Total décaissé</p>
                                        <p className="text-2xl font-bold">{fmt(projet.montant_decaisse, devise)}</p>
                                    </div>
                                    <div className="flex items-end gap-4">
                                        <div className="text-right">
                                            <p className="text-xs text-muted-foreground">Sur accordé</p>
                                            <p className="text-sm font-medium">{fmt(projet.montant_accorde, devise)}</p>
                                        </div>
                                        {/* Bouton décaissement conditionnel */}
                                        {meta.eligible === true && ['en_cours', 'termine'].includes(projet.statut) ? (
                                            <Button size="sm" className="gap-1.5 bg-green-700 hover:bg-green-800 shrink-0" onClick={() => setDecaissementOpen(true)}>
                                                <Plus className="h-3.5 w-3.5" /> Nouveau décaissement
                                            </Button>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-md">
                                                <Lock className="h-3 w-3" />
                                                {!meta.eligible ? 'Éligibilité non confirmée' : 'Statut non compatible'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <Progress value={tauxDecaissement} className="h-2" />
                                <p className="text-xs text-muted-foreground mt-1">{tauxDecaissement}% exécuté — {decaissements.length} tranche{decaissements.length !== 1 ? 's' : ''}</p>
                            </CardContent>
                        </Card>

                        {/* Table */}
                        <div className="rounded-xl border border-border/60 overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/30">
                                        <TableHead className="text-xs">Tranche</TableHead>
                                        <TableHead className="text-xs">Date</TableHead>
                                        <TableHead className="text-xs">Objet</TableHead>
                                        <TableHead className="text-xs text-right">Montant</TableHead>
                                        <TableHead className="text-xs">Statut</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {decaissements.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-muted-foreground py-8 text-sm">
                                                Aucun décaissement enregistré.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        decaissements.map((d) => (
                                            <TableRow key={d.id}>
                                                <TableCell className="font-mono text-xs font-semibold">{d.reference ?? '—'}</TableCell>
                                                <TableCell className="text-sm">{fmtDate(d.date_decaissement)}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{d.objet ?? '—'}</TableCell>
                                                <TableCell className="text-right text-sm font-semibold">{fmt(d.montant, devise)}</TableCell>
                                                <TableCell>
                                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                                        d.statut === 'effectue' ? 'bg-green-100 text-green-700' :
                                                        d.statut === 'annule'   ? 'bg-red-100 text-red-700' :
                                                        'bg-slate-100 text-slate-600'
                                                    }`}>{d.statut}</span>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>

                    {/* ── ÉLIGIBILITÉ ── */}
                    <TabsContent value="eligibilite" className="mt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="shadow-none border-border/60">
                                <CardContent className="pt-5 pb-5 flex flex-col items-center text-center gap-2">
                                    {meta.eligible
                                        ? <CheckCircle2 className="h-8 w-8 text-green-500" />
                                        : <XCircle className="h-8 w-8 text-red-400" />
                                    }
                                    <p className="text-xs text-muted-foreground">Éligibilité</p>
                                    <p className={`text-sm font-bold ${meta.eligible ? 'text-green-700' : 'text-red-600'}`}>
                                        {meta.eligible ? 'Éligible' : 'Non éligible'}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="shadow-none border-border/60">
                                <CardContent className="pt-5 pb-5 flex flex-col items-center text-center gap-2">
                                    {meta.accord_scac
                                        ? <CheckCircle2 className="h-8 w-8 text-green-500" />
                                        : <XCircle className="h-8 w-8 text-slate-400" />
                                    }
                                    <p className="text-xs text-muted-foreground">Accord SCAC</p>
                                    <p className={`text-sm font-bold ${meta.accord_scac ? 'text-green-700' : 'text-slate-500'}`}>
                                        {meta.accord_scac ? 'Accordé' : 'Non accordé'}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="shadow-none border-border/60">
                                <CardContent className="pt-5 pb-5 flex flex-col items-center text-center gap-2">
                                    <ClipboardList className="h-8 w-8 text-blue-400" />
                                    <p className="text-xs text-muted-foreground">Décision comité</p>
                                    <p className="text-sm font-bold text-foreground text-center">{meta.decision ?? '—'}</p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="shadow-none border-border/60">
                            <CardHeader className="pb-2 pt-4 px-5">
                                <CardTitle className="text-sm font-semibold">Détail de l'éligibilité</CardTitle>
                            </CardHeader>
                            <CardContent className="px-5 pb-4 space-y-0">
                                <InfoRow label="Porteur du projet">{projet.porteur}</InfoRow>
                                <InfoRow label="Domaine d'activité">{meta.domaine}</InfoRow>
                                <InfoRow label="Catégorie">{meta.categorie}</InfoRow>
                                <InfoRow label="Commune / Région">
                                    {[projet.commune, projet.region].filter(Boolean).join(', ') || '—'}
                                </InfoRow>
                                <InfoRow label="Décision comité">{meta.decision}</InfoRow>
                                <InfoRow label="Accord SCAC">
                                    {meta.accord_scac
                                        ? <span className="text-green-700 font-semibold">Oui</span>
                                        : <span className="text-slate-500">Non</span>
                                    }
                                </InfoRow>
                                <InfoRow label="Éligible">
                                    {meta.eligible
                                        ? <span className="text-green-700 font-semibold">Oui</span>
                                        : <span className="text-red-600 font-semibold">Non</span>
                                    }
                                </InfoRow>
                                <InfoRow label="N° de référence Excel">{meta.num_excel}</InfoRow>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ── DOCUMENTS ── */}
                    <TabsContent value="documents" className="mt-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">{documents.length} document{documents.length !== 1 ? 's' : ''}</p>
                            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setDocModalOpen(true)}>
                                <Plus className="h-3.5 w-3.5" /> Ajouter un document
                            </Button>
                        </div>

                        {documents.length === 0 ? (
                            <Card className="shadow-none border-border/60 border-dashed">
                                <CardContent className="py-12 text-center text-muted-foreground text-sm">
                                    Aucun document joint à ce projet.
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-2">
                                {documents.map(doc => {
                                    const sizeLabel = doc.taille ? (doc.taille > 1048576 ? `${(doc.taille/1048576).toFixed(1)} Mo` : `${Math.round(doc.taille/1024)} Ko`) : null;
                                    return (
                                        <div key={doc.id} className="flex items-center gap-3 rounded-lg border border-border/60 px-4 py-3 hover:bg-muted/20 transition-colors group">
                                            <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{doc.nom_original}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    {doc.categorie && <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{doc.categorie}</span>}
                                                    {sizeLabel && <span className="text-xs text-muted-foreground">{sizeLabel}</span>}
                                                    <span className="text-xs text-muted-foreground">{fmtDate(doc.created_at)}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button size="sm" variant="outline" className="h-7 text-xs gap-1" asChild>
                                                    <a href={`/storage/${doc.chemin}`} target="_blank" rel="noreferrer">
                                                        <Download className="h-3 w-3" /> Télécharger
                                                    </a>
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive"
                                                    onClick={() => { if (confirm('Supprimer ce document ?')) router.delete(`/projets/${projet.id}/documents/${doc.id}`); }}>
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </TabsContent>

                    {/* ── MISSIONS DE SUIVI ── */}
                    <TabsContent value="missions" className="mt-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                {missions.length} mission{missions.length !== 1 ? 's' : ''} de suivi
                            </p>
                            <Button size="sm" className="gap-1.5" onClick={() => setMissionModalOpen(true)}>
                                <Plus className="h-3.5 w-3.5" /> Nouvelle mission
                            </Button>
                        </div>
                        {missions.length === 0 ? (
                            <Card className="shadow-none border-border/60 border-dashed">
                                <CardContent className="py-12 text-center text-muted-foreground text-sm">
                                    Aucune mission de suivi enregistrée pour ce projet.
                                </CardContent>
                            </Card>
                        ) : (
                            missions.map((m, idx) => (
                                <Card key={m.id} className="shadow-none border-border/60">
                                    <CardContent className="pt-4 pb-4 px-5">
                                        <div className="flex items-start justify-between gap-3 flex-wrap">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground shrink-0">
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold">{fmtDate(m.date_visite)}</p>
                                                    <p className="text-xs text-muted-foreground">par {m.agent?.name ?? 'Agent terrain'}</p>
                                                </div>
                                            </div>
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                                m.statut === 'valide'  ? 'bg-green-100 text-green-700' :
                                                m.statut === 'soumis'  ? 'bg-blue-100 text-blue-700' :
                                                'bg-slate-100 text-slate-600'
                                            }`}>{m.statut}</span>
                                        </div>

                                        {m.observations && (
                                            <div className="mt-3 pl-11">
                                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Compte-rendu</p>
                                                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{m.observations}</p>
                                            </div>
                                        )}

                                        {(m.points_positifs || m.points_negatifs || m.recommandations) && (
                                            <div className="mt-3 pl-11 grid grid-cols-1 md:grid-cols-3 gap-3">
                                                {m.points_positifs && (
                                                    <div className="rounded-lg bg-green-50 border border-green-100 p-3">
                                                        <div className="flex items-center gap-1.5 mb-1">
                                                            <ThumbsUp className="h-3.5 w-3.5 text-green-600" />
                                                            <p className="text-xs font-semibold text-green-700">Points positifs</p>
                                                        </div>
                                                        <p className="text-xs text-green-800 whitespace-pre-wrap">{m.points_positifs}</p>
                                                    </div>
                                                )}
                                                {m.points_negatifs && (
                                                    <div className="rounded-lg bg-red-50 border border-red-100 p-3">
                                                        <div className="flex items-center gap-1.5 mb-1">
                                                            <ThumbsDown className="h-3.5 w-3.5 text-red-600" />
                                                            <p className="text-xs font-semibold text-red-700">Points négatifs</p>
                                                        </div>
                                                        <p className="text-xs text-red-800 whitespace-pre-wrap">{m.points_negatifs}</p>
                                                    </div>
                                                )}
                                                {m.recommandations && (
                                                    <div className="rounded-lg bg-amber-50 border border-amber-100 p-3">
                                                        <div className="flex items-center gap-1.5 mb-1">
                                                            <Lightbulb className="h-3.5 w-3.5 text-amber-600" />
                                                            <p className="text-xs font-semibold text-amber-700">Recommandations</p>
                                                        </div>
                                                        <p className="text-xs text-amber-800 whitespace-pre-wrap">{m.recommandations}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {(m.latitude && m.longitude) && (
                                            <div className="mt-2 pl-11">
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Navigation className="h-3 w-3" />
                                                    GPS : {parseFloat(m.latitude).toFixed(6)}, {parseFloat(m.longitude).toFixed(6)}
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </TabsContent>

                    {/* ── ÉVALUATION ── */}
                    <TabsContent value="evaluation" className="mt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Evaluation grade */}
                            <Card className="shadow-none border-border/60">
                                <CardHeader className="pb-2 pt-4 px-5">
                                    <CardTitle className="text-sm font-semibold">Note d'évaluation</CardTitle>
                                </CardHeader>
                                <CardContent className="px-5 pb-5">
                                    {meta.evaluation ? (
                                        <div className="flex flex-col items-center gap-3 py-4">
                                            <div className={`rounded-2xl border px-8 py-4 text-center ${EVAL_CONFIG[meta.evaluation]?.cls ?? 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                                                <p className="text-3xl font-bold">{meta.evaluation}</p>
                                            </div>
                                            {EVAL_CONFIG[meta.evaluation] && (
                                                <div className="flex gap-1">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`h-4 w-4 ${i < EVAL_CONFIG[meta.evaluation].stars ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}`}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground py-6 text-center">Pas encore évalué</p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* KPI summary */}
                            <Card className="shadow-none border-border/60">
                                <CardHeader className="pb-2 pt-4 px-5">
                                    <CardTitle className="text-sm font-semibold">Indicateurs clés</CardTitle>
                                </CardHeader>
                                <CardContent className="px-5 pb-4 space-y-0">
                                    <InfoRow label="Complétude du dossier">
                                        <span className="flex items-center gap-2">
                                            {projet.completude}%
                                            <Progress value={projet.completude} className="h-1.5 w-20" />
                                        </span>
                                    </InfoRow>
                                    <InfoRow label="Taux de décaissement">
                                        <span className="flex items-center gap-2">
                                            {tauxDecaissement}%
                                            <Progress value={tauxDecaissement} className="h-1.5 w-20" />
                                        </span>
                                    </InfoRow>
                                    <InfoRow label="Statut">
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statut.cls}`}>{statut.label}</span>
                                    </InfoRow>
                                    <InfoRow label="Missions de suivi">{missions.length} visite{missions.length !== 1 ? 's' : ''}</InfoRow>
                                    <InfoRow label="Décaissements">{decaissements.length} tranche{decaissements.length !== 1 ? 's' : ''}</InfoRow>
                                    <InfoRow label="Documents">{documents.length} document{documents.length !== 1 ? 's' : ''}</InfoRow>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Documents if any */}
                        {documents.length > 0 && (
                            <Card className="shadow-none border-border/60">
                                <CardHeader className="pb-2 pt-4 px-5">
                                    <CardTitle className="text-sm font-semibold">Documents ({documents.length})</CardTitle>
                                </CardHeader>
                                <CardContent className="px-5 pb-4 space-y-2">
                                    {documents.map((doc) => (
                                        <div key={doc.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-border/40 hover:bg-muted/30 transition-colors">
                                            <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{doc.nom_original}</p>
                                                <p className="text-xs text-muted-foreground">{doc.categorie}</p>
                                            </div>
                                            <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
                                                <a href={`/storage/${doc.chemin}`} target="_blank" rel="noreferrer">Voir</a>
                                            </Button>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* ── GÉOLOCALISATION ── */}
                    <TabsContent value="geolocalisation" className="mt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="shadow-none border-border/60">
                                <CardHeader className="pb-2 pt-4 px-5">
                                    <CardTitle className="text-sm font-semibold">Localisation</CardTitle>
                                </CardHeader>
                                <CardContent className="px-5 pb-4 space-y-0">
                                    <InfoRow label="Commune">{projet.commune}</InfoRow>
                                    <InfoRow label="Région">{projet.region}</InfoRow>
                                    <InfoRow label="Pays">{projet.pays?.nom}</InfoRow>
                                    <InfoRow label="Points GPS">
                                        {missionsGps.length > 0
                                            ? `${missionsGps.length} point${missionsGps.length !== 1 ? 's' : ''} collecté${missionsGps.length !== 1 ? 's' : ''}`
                                            : 'Aucun point GPS enregistré'
                                        }
                                    </InfoRow>
                                </CardContent>
                            </Card>

                            {/* GPS points from missions */}
                            {missionsGps.length > 0 && (
                                <Card className="shadow-none border-border/60 md:col-span-2">
                                    <CardHeader className="pb-2 pt-4 px-5">
                                        <CardTitle className="text-sm font-semibold">Points GPS des visites terrain</CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-5 pb-4">
                                        <div className="space-y-2">
                                            {missionsGps.map((m) => (
                                                <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-border/40">
                                                    <Navigation className="h-4 w-4 text-blue-500 shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium">{fmtDate(m.date_visite)}</p>
                                                        <p className="text-xs text-muted-foreground font-mono">
                                                            {parseFloat(m.latitude).toFixed(6)}, {parseFloat(m.longitude).toFixed(6)}
                                                        </p>
                                                    </div>
                                                    <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                                                        <a
                                                            href={`https://www.openstreetmap.org/?mlat=${m.latitude}&mlon=${m.longitude}&zoom=15`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                        >
                                                            Voir carte
                                                        </a>
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* OpenStreetMap embed */}
                        <Card className="shadow-none border-border/60 overflow-hidden">
                            <CardHeader className="pb-2 pt-4 px-5">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-semibold">Carte — {projet.commune ?? projet.region ?? 'Casamance'}</CardTitle>
                                    <a
                                        href={`https://www.openstreetmap.org/?mlat=${mapLat}&mlon=${mapLng}&zoom=12`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Ouvrir dans OSM ↗
                                    </a>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <iframe
                                    title={`Carte ${projet.commune}`}
                                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapLng - 0.15},${mapLat - 0.10},${mapLng + 0.15},${mapLat + 0.10}&layer=mapnik&marker=${mapLat},${mapLng}`}
                                    className="w-full h-72 border-0"
                                    loading="lazy"
                                />
                            </CardContent>
                        </Card>

                        {/* Add GPS button */}
                        <div className="flex justify-center">
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/missions/create?projet_id=${projet.id}`}>
                                    <Navigation className="mr-1.5 h-3.5 w-3.5" />
                                    Enregistrer une nouvelle visite avec GPS
                                </Link>
                            </Button>
                        </div>
                    </TabsContent>

                    {/* ── HISTORIQUE ── */}
                    <TabsContent value="historique" className="mt-4">
                        {logs.length === 0 ? (
                            <Card className="shadow-none border-border/60 border-dashed">
                                <CardContent className="py-12 text-center text-muted-foreground text-sm">
                                    Aucune action enregistrée sur ce projet.
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="relative">
                                {/* Timeline line */}
                                <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border/60" />

                                <div className="space-y-1">
                                    {logs.map((log) => {
                                        const cfg = LOG_TYPE_CONFIG[log.type] ?? LOG_TYPE_CONFIG.modification;
                                        return (
                                            <div key={log.id} className="flex gap-4 group py-1.5">
                                                {/* Dot */}
                                                <div className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 ${cfg.ring} ${cfg.bg}`}>
                                                    <cfg.icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0 rounded-lg border border-border/40 bg-white px-4 py-2.5 group-hover:bg-muted/20 transition-colors">
                                                    <div className="flex items-start justify-between gap-2 flex-wrap">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className={`text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${cfg.badgeCls}`}>
                                                                {cfg.label}
                                                            </span>
                                                            <p className="text-sm text-foreground">{log.description}</p>
                                                        </div>
                                                        <div className="text-right shrink-0">
                                                            <p className="text-xs text-muted-foreground">
                                                                {new Date(log.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                            </p>
                                                            <p className="text-[10px] text-muted-foreground/60">
                                                                {new Date(log.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {log.user && (
                                                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                            <User className="h-3 w-3" />
                                                            {log.user.name}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* ── Modal phase ── */}
            <PhaseModal open={phaseModalOpen} onClose={() => { setPhaseModalOpen(false); setEditPhase(null); }} projet={projet} phase={editPhase} />
            {/* ── Modal activité ── */}
            <ActiviteModal open={activiteModalOpen} onClose={() => { setActiviteModalOpen(false); setEditActivite(null); }} projet={projet} activite={editActivite} phases={phases} />
            {/* ── Modal document ── */}
            <DocumentModal open={docModalOpen} onClose={() => setDocModalOpen(false)} projet={projet} />
            {/* ── Modal mission ── */}
            <MissionModal open={missionModalOpen} onClose={() => setMissionModalOpen(false)} projet={projet} />

            {/* Modals */}
            <ModifierProjetModal
                open={modifierOpen}
                onClose={() => setModifierOpen(false)}
                projet={projet}
                programmes={programmes}
            />
            <NouveauDecaissementModal
                open={decaissementOpen}
                onClose={() => setDecaissementOpen(false)}
                projet={projet}
            />
        </AppLayout>
    );
}
