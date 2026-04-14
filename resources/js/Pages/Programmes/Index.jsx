import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
    Plus, Save, Pencil, Trash2, FolderOpen, BookOpen, Search,
    AlertTriangle, Archive, ArchiveRestore, ChevronDown, ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

// ── Helpers ───────────────────────────────────────────────────────────────────
const STATUT_CONFIG = {
    actif:    { label: 'Actif',    cls: 'bg-green-100 text-green-700' },
    suspendu: { label: 'Suspendu', cls: 'bg-amber-100 text-amber-700' },
    cloture:  { label: 'Clôturé',  cls: 'bg-slate-100 text-slate-600' },
    archive:  { label: 'Archivé', cls: 'bg-zinc-100 text-zinc-500' },
};

function Flag({ cca2 }) {
    if (!cca2) return null;
    return <img src={`https://flagcdn.com/w40/${cca2.toLowerCase()}.png`} width={18} height={13} className="rounded-sm shadow-sm shrink-0 object-cover" alt={cca2} />;
}

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

function fmtDate(d) {
    if (!d) return null;
    return new Date(d).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' });
}

// ── Modal création / édition ──────────────────────────────────────────────────
function ProgrammeModal({ open, onClose, programme = null, pays }) {
    const editing = !!programme;
    const selCls = "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring";

    const { data, setData, post, put, processing, errors, reset } = useForm({
        pays_ids:        programme?.pays_ids        ?? [],
        code:            programme?.code            ?? '',
        nom:             programme?.nom             ?? '',
        description:     programme?.description     ?? '',
        bailleur:        programme?.bailleur        ?? '',
        appui_technique: programme?.appui_technique ?? '',
        date_debut:      programme?.date_debut      ?? '',
        date_fin:        programme?.date_fin        ?? '',
        statut:          programme?.statut && programme.statut !== 'archive' ? programme.statut : 'actif',
    });

    const togglePays = (id) => {
        setData('pays_ids', data.pays_ids.includes(id)
            ? data.pays_ids.filter(i => i !== id)
            : [...data.pays_ids, id]
        );
    };

    const submit = (e) => {
        e.preventDefault();
        const opts = { onSuccess: () => { reset(); onClose(); } };
        editing ? put(`/programmes/${programme.id}`, opts) : post('/programmes', opts);
    };

    return (
        <Dialog open={open} onOpenChange={v => { if (!v) { reset(); onClose(); } }}>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-0">
                <form onSubmit={submit}>
                    <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/60">
                        <DialogTitle className="text-base font-semibold">
                            {editing ? `Modifier — ${programme.code}` : 'Nouveau programme'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="px-6 py-5 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Pays couverts" error={errors.pays_ids}>
                                <div className="rounded-md border border-input bg-transparent px-3 py-2 space-y-1.5 max-h-36 overflow-y-auto">
                                    {pays.map(p => (
                                        <label key={p.id} className="flex items-center gap-2 cursor-pointer hover:bg-muted/40 rounded px-1 py-0.5 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={data.pays_ids.includes(p.id)}
                                                onChange={() => togglePays(p.id)}
                                                className="h-3.5 w-3.5 rounded border-input accent-primary"
                                            />
                                            {p.cca2 && <Flag cca2={p.cca2} />}
                                            <span className="text-xs">{p.nom}</span>
                                        </label>
                                    ))}
                                </div>
                            </Field>
                            <Field label="Code programme" error={errors.code} required>
                                <Input
                                    value={data.code}
                                    onChange={e => setData('code', e.target.value.toUpperCase())}
                                    placeholder="ex. FSD-SN-2013"
                                    className="h-9 text-sm font-mono uppercase"
                                />
                            </Field>
                        </div>

                        <Field label="Intitulé du programme" error={errors.nom} required>
                            <Input value={data.nom} onChange={e => setData('nom', e.target.value)} placeholder="Nom complet" className="h-9 text-sm" />
                        </Field>

                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Bailleur / Financeur" error={errors.bailleur}>
                                <Input value={data.bailleur} onChange={e => setData('bailleur', e.target.value)} placeholder="ex. Union Européenne, AFD…" className="h-9 text-sm" />
                            </Field>
                            <Field label="Appui Technique" error={errors.appui_technique}>
                                <Input value={data.appui_technique} onChange={e => setData('appui_technique', e.target.value)} placeholder="ex. Expertise France…" className="h-9 text-sm" />
                            </Field>
                        </div>

                        <Field label="Description" error={errors.description}>
                            <textarea
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                rows={2}
                                placeholder="Objectifs, contexte, bénéficiaires…"
                                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                            />
                        </Field>

                        <div className="grid grid-cols-3 gap-3">
                            <Field label="Date début" error={errors.date_debut}>
                                <Input type="date" value={data.date_debut} onChange={e => setData('date_debut', e.target.value)} className="h-9 text-sm" />
                            </Field>
                            <Field label="Date fin" error={errors.date_fin}>
                                <Input type="date" value={data.date_fin} onChange={e => setData('date_fin', e.target.value)} className="h-9 text-sm" />
                            </Field>
                            <Field label="Statut" error={errors.statut} required>
                                <select value={data.statut} onChange={e => setData('statut', e.target.value)} className={selCls}>
                                    <option value="actif">Actif</option>
                                    <option value="suspendu">Suspendu</option>
                                    <option value="cloture">Clôturé</option>
                                </select>
                            </Field>
                        </div>
                    </div>

                    <DialogFooter className="px-6 py-4 border-t border-border/60 gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => { reset(); onClose(); }}>Annuler</Button>
                        <Button type="submit" size="sm" disabled={processing} className="gap-1.5">
                            <Save className="h-3.5 w-3.5" />
                            {processing ? 'Enregistrement…' : (editing ? 'Mettre à jour' : 'Créer')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ── Confirm archive / delete ──────────────────────────────────────────────────
function ConfirmDialog({ open, onClose, title, description, actionLabel, actionCls, onConfirm, processing }) {
    return (
        <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
            <DialogContent className="max-w-sm p-0">
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/60">
                    <DialogTitle className="flex items-center gap-2 text-base">{title}</DialogTitle>
                </DialogHeader>
                <div className="px-6 py-4 text-sm text-muted-foreground">{description}</div>
                <DialogFooter className="px-6 py-4 border-t border-border/60 gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={onClose}>Annuler</Button>
                    <Button type="button" size="sm" disabled={processing} onClick={onConfirm} className={actionCls}>
                        {processing ? 'En cours…' : actionLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ── Tableau programmes ────────────────────────────────────────────────────────
function ProgrammeTable({ programmes, onEdit, onArchive, onRestore, onDelete, showArchived }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-y border-border/60 bg-muted/30">
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Code</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Intitulé</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Pays couverts</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Bailleur</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Appui technique</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Période</th>
                        <th className="px-3 py-2.5 text-center text-xs font-semibold text-muted-foreground">Projets</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Statut</th>
                        <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                    {programmes.length === 0 ? (
                        <tr>
                            <td colSpan={9} className="py-10 text-center text-xs text-muted-foreground">
                                {showArchived ? 'Aucun programme archivé.' : 'Aucun résultat.'}
                            </td>
                        </tr>
                    ) : programmes.map(p => {
                        const st = STATUT_CONFIG[p.statut] ?? { label: p.statut, cls: 'bg-slate-100 text-slate-500' };
                        const archived = p.statut === 'archive';

                        return (
                            <tr key={p.id} className={cn('transition-colors group', archived ? 'bg-zinc-50/50 opacity-70' : 'hover:bg-muted/20')}>
                                <td className="px-4 py-3">
                                    <span className="font-mono text-xs font-bold text-foreground bg-muted px-2 py-0.5 rounded">{p.code}</span>
                                </td>
                                <td className="px-3 py-3 max-w-[220px]">
                                    <p className="text-xs font-semibold leading-snug">{p.nom}</p>
                                    {p.description && <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{p.description}</p>}
                                </td>
                                <td className="px-3 py-3">
                                    {p.pays_couverts?.length > 0 ? (
                                        <div className="flex items-center gap-1 flex-wrap">
                                            {p.pays_couverts.map(pay => (
                                                <div key={pay.id} title={pay.nom} className="relative group/flag">
                                                    <Flag cca2={pay.cca2} />
                                                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover/flag:opacity-100 transition-opacity pointer-events-none z-10">
                                                        {pay.nom}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <span className="text-xs text-muted-foreground">—</span>}
                                </td>
                                <td className="px-3 py-3 text-xs text-muted-foreground">{p.bailleur ?? '—'}</td>
                                <td className="px-3 py-3 text-xs text-muted-foreground">{p.appui_technique ?? '—'}</td>
                                <td className="px-3 py-3 text-xs text-muted-foreground whitespace-nowrap">
                                    {fmtDate(p.date_debut) && fmtDate(p.date_fin)
                                        ? `${fmtDate(p.date_debut)} → ${fmtDate(p.date_fin)}`
                                        : fmtDate(p.date_debut) ?? fmtDate(p.date_fin) ?? '—'
                                    }
                                </td>
                                <td className="px-3 py-3 text-center">
                                    <span className={`inline-flex items-center justify-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${p.projets_count > 0 ? 'bg-blue-100 text-blue-700' : 'bg-muted text-muted-foreground'}`}>
                                        <FolderOpen className="h-3 w-3" />
                                        {p.projets_count}
                                    </span>
                                </td>
                                <td className="px-3 py-3">
                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${st.cls}`}>{st.label}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {archived ? (
                                            // Archived: restore or delete
                                            <>
                                                <button
                                                    onClick={() => onRestore(p)}
                                                    title="Restaurer"
                                                    className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-green-50 text-muted-foreground hover:text-green-600 transition-colors"
                                                >
                                                    <ArchiveRestore className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => onDelete(p)}
                                                    disabled={p.projets_count > 0}
                                                    title={p.projets_count > 0 ? 'Des projets sont liés' : 'Supprimer définitivement'}
                                                    className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </>
                                        ) : (
                                            // Active: edit or archive
                                            <>
                                                <button
                                                    onClick={() => onEdit(p)}
                                                    title="Modifier"
                                                    className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => onArchive(p)}
                                                    title="Archiver"
                                                    className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-amber-50 text-muted-foreground hover:text-amber-600 transition-colors"
                                                >
                                                    <Archive className="h-3.5 w-3.5" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ProgrammesIndex({ programmes, pays }) {
    const [createOpen, setCreateOpen]   = useState(false);
    const [editTarget, setEditTarget]   = useState(null);
    const [archiveTarget, setArchiveTarget] = useState(null);
    const [restoreTarget, setRestoreTarget] = useState(null);
    const [deleteTarget, setDeleteTarget]   = useState(null);
    const [search, setSearch]           = useState('');
    const [showArchived, setShowArchived] = useState(false);
    const [processing, setProcessing]   = useState(false);
    const { errors } = usePage().props;

    const actifs   = programmes.filter(p => p.statut !== 'archive');
    const archives  = programmes.filter(p => p.statut === 'archive');

    const filteredActifs = actifs.filter(p => {
        const q = search.toLowerCase();
        return !q || p.code.toLowerCase().includes(q) || p.nom.toLowerCase().includes(q) || (p.bailleur ?? '').toLowerCase().includes(q);
    });

    const filteredArchives = archives.filter(p => {
        const q = search.toLowerCase();
        return !q || p.code.toLowerCase().includes(q) || p.nom.toLowerCase().includes(q);
    });

    function doArchive() {
        setProcessing(true);
        router.post(`/programmes/${archiveTarget.id}/archiver`, {}, {
            onFinish: () => { setProcessing(false); setArchiveTarget(null); },
        });
    }

    function doRestore() {
        setProcessing(true);
        router.post(`/programmes/${restoreTarget.id}/restaurer`, {}, {
            onFinish: () => { setProcessing(false); setRestoreTarget(null); },
        });
    }

    function doDelete() {
        setProcessing(true);
        router.delete(`/programmes/${deleteTarget.id}`, {
            onFinish: () => { setProcessing(false); setDeleteTarget(null); },
        });
    }

    return (
        <AppLayout title="Programmes" breadcrumbs={[{ label: 'Programmes', href: '/programmes' }]}>
            <Head title="Programmes" />

            <div className="space-y-5">

                {/* ── Header ── */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Programmes</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {actifs.length} programme{actifs.length !== 1 ? 's' : ''} actif{actifs.length !== 1 ? 's' : ''}
                            {archives.length > 0 && <span className="ml-1.5 text-muted-foreground/60">· {archives.length} archivé{archives.length !== 1 ? 's' : ''}</span>}
                        </p>
                    </div>
                    <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
                        <Plus className="h-3.5 w-3.5" /> Nouveau programme
                    </Button>
                </div>

                {/* ── Erreur ── */}
                {errors.delete && (
                    <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                        <AlertTriangle className="h-4 w-4 shrink-0" /> {errors.delete}
                    </div>
                )}

                {/* ── Table programmes actifs ── */}
                <Card className="shadow-none border-border/60">
                    <CardHeader className="pb-3 pt-4 px-5">
                        <div className="flex items-center justify-between gap-3">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                                <Input
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Rechercher code, nom, bailleur…"
                                    className="h-8 pl-8 w-72 text-xs"
                                />
                            </div>
                            <span className="text-xs text-muted-foreground">
                                {filteredActifs.length} résultat{filteredActifs.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </CardHeader>

                    {actifs.length === 0 && !search ? (
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted mb-4">
                                <BookOpen className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="font-medium">Aucun programme actif</p>
                            <p className="text-sm text-muted-foreground mt-1">Créez le premier programme pour commencer.</p>
                            <Button size="sm" className="mt-4 gap-1.5" onClick={() => setCreateOpen(true)}>
                                <Plus className="h-3.5 w-3.5" /> Nouveau programme
                            </Button>
                        </CardContent>
                    ) : (
                        <CardContent className="px-0 pb-0">
                            <ProgrammeTable
                                programmes={filteredActifs}
                                onEdit={setEditTarget}
                                onArchive={setArchiveTarget}
                                onRestore={setRestoreTarget}
                                onDelete={setDeleteTarget}
                                showArchived={false}
                            />
                        </CardContent>
                    )}
                </Card>

                {/* ── Section archives ── */}
                {archives.length > 0 && (
                    <div className="rounded-xl border border-border/60 bg-white overflow-hidden">
                        {/* Toggle header */}
                        <button
                            onClick={() => setShowArchived(v => !v)}
                            className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors"
                        >
                            <div className="flex items-center gap-2.5">
                                <Archive className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium text-muted-foreground">Archives</span>
                                <span className="text-xs bg-zinc-100 text-zinc-600 font-semibold px-2 py-0.5 rounded-full">
                                    {archives.length}
                                </span>
                            </div>
                            {showArchived
                                ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                : <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            }
                        </button>

                        {showArchived && (
                            <div className="border-t border-border/40">
                                <ProgrammeTable
                                    programmes={filteredArchives}
                                    onEdit={setEditTarget}
                                    onArchive={setArchiveTarget}
                                    onRestore={setRestoreTarget}
                                    onDelete={setDeleteTarget}
                                    showArchived={true}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── Modals ── */}
            <ProgrammeModal open={createOpen} onClose={() => setCreateOpen(false)} pays={pays} />
            {editTarget && (
                <ProgrammeModal open={!!editTarget} onClose={() => setEditTarget(null)} programme={editTarget} pays={pays} />
            )}

            <ConfirmDialog
                open={!!archiveTarget}
                onClose={() => setArchiveTarget(null)}
                title={<><Archive className="h-4 w-4 text-amber-500" /> Archiver le programme</>}
                description={<>Voulez-vous archiver <strong>{archiveTarget?.nom}</strong> ? Le programme sera masqué mais ses données seront conservées. Vous pourrez le restaurer à tout moment.</>}
                actionLabel="Archiver"
                actionCls="bg-amber-500 hover:bg-amber-600 text-white"
                onConfirm={doArchive}
                processing={processing}
            />

            <ConfirmDialog
                open={!!restoreTarget}
                onClose={() => setRestoreTarget(null)}
                title={<><ArchiveRestore className="h-4 w-4 text-green-600" /> Restaurer le programme</>}
                description={<>Voulez-vous restaurer <strong>{restoreTarget?.nom}</strong> ? Il redeviendra actif sur la plateforme.</>}
                actionLabel="Restaurer"
                actionCls="bg-green-600 hover:bg-green-700 text-white"
                onConfirm={doRestore}
                processing={processing}
            />

            <ConfirmDialog
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                title={<><AlertTriangle className="h-4 w-4 text-destructive" /> Supprimer définitivement</>}
                description={<>Voulez-vous supprimer définitivement <strong>{deleteTarget?.nom}</strong> ? Cette action est irréversible.</>}
                actionLabel="Supprimer"
                actionCls="bg-destructive hover:bg-destructive/90 text-white"
                onConfirm={doDelete}
                processing={processing}
            />
        </AppLayout>
    );
}
