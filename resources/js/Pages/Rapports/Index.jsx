import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Download, Trash2, Eye, FileText, Loader2 } from 'lucide-react';
import { useState } from 'react';

// ── Constantes ────────────────────────────────────────────────────────────────
const TEMPLATES = [
    { value: 'SCAC',      label: 'SCAC — Service de Coopération' },
    { value: 'AFD',       label: 'AFD — Agence Française de Développement' },
    { value: 'UE',        label: 'UE — Union Européenne' },
    { value: 'generique', label: 'Générique' },
];

const SECTIONS = [
    { id: 'synthese',       label: 'Synthèse exécutive' },
    { id: 'projets',        label: 'Liste des projets' },
    { id: 'decaissements',  label: 'Décaissements' },
    { id: 'beneficiaires',  label: 'Bénéficiaires' },
    { id: 'missions',       label: 'Visites terrain' },
    { id: 'cartographie',   label: 'Cartographie' },
];

const TEMPLATE_LABELS = { SCAC: 'SCAC', AFD: 'AFD', UE: 'UE', generique: 'Générique' };
const FORMAT_LABELS   = { pdf: 'PDF', excel: 'Excel' };

const STATUT_CONFIG = {
    en_generation: { label: 'En cours…', cls: 'bg-amber-100 text-amber-700' },
    pret:          { label: 'Prêt',      cls: 'bg-green-100 text-green-700' },
    erreur:        { label: 'Erreur',    cls: 'bg-red-100 text-red-700' },
};

function formatDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR');
}

// ── Modal création rapport ────────────────────────────────────────────────────
function NouveauRapportModal({ open, onClose, pays }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        pays_id:      pays[0]?.id ?? '',
        titre:        '',
        template:     'generique',
        format:       'pdf',
        periode_debut:'',
        periode_fin:  '',
        sections:     SECTIONS.map(s => s.id),
    });

    const toggleSection = (id) => {
        setData('sections', data.sections.includes(id)
            ? data.sections.filter(s => s !== id)
            : [...data.sections, id]
        );
    };

    const submit = (e) => {
        e.preventDefault();
        // store redirige vers preview — le modal se ferme automatiquement via navigation
        post('/rapports', { onSuccess: () => { reset(); onClose(); } });
    };

    return (
        <Dialog open={open} onOpenChange={v => { if (!v) { reset(); onClose(); } }}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0">
                <form onSubmit={submit}>
                    <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/60">
                        <DialogTitle className="text-base font-semibold flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Nouveau rapport
                        </DialogTitle>
                    </DialogHeader>

                    <div className="px-6 py-5 space-y-4">

                        {/* Titre */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">
                                Titre du rapport <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                value={data.titre}
                                onChange={e => setData('titre', e.target.value)}
                                placeholder="ex. Rapport trimestriel Q1 2025"
                                className="h-9 text-sm"
                            />
                            {errors.titre && <p className="text-xs text-destructive">{errors.titre}</p>}
                        </div>

                        {/* Pays (si plusieurs) */}
                        {pays.length > 1 && (
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Pays <span className="text-destructive">*</span></Label>
                                <Select value={String(data.pays_id)} onValueChange={v => setData('pays_id', v)}>
                                    <SelectTrigger className="h-9 text-sm">
                                        <SelectValue placeholder="Sélectionner un pays" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {pays.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.nom}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                {errors.pays_id && <p className="text-xs text-destructive">{errors.pays_id}</p>}
                            </div>
                        )}

                        {/* Template + Format */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Template bailleur</Label>
                                <Select value={data.template} onValueChange={v => setData('template', v)}>
                                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {TEMPLATES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Format</Label>
                                <Select value={data.format} onValueChange={v => setData('format', v)}>
                                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pdf">PDF</SelectItem>
                                        <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Période */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Période — début</Label>
                                <Input type="date" value={data.periode_debut} onChange={e => setData('periode_debut', e.target.value)} className="h-9 text-sm" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Période — fin</Label>
                                <Input type="date" value={data.periode_fin} onChange={e => setData('periode_fin', e.target.value)} className="h-9 text-sm" />
                            </div>
                        </div>

                        {/* Sections */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">Sections à inclure</Label>
                            <div className="rounded-md border border-input px-3 py-2 space-y-2">
                                {SECTIONS.map(s => (
                                    <div key={s.id} className="flex items-center gap-2">
                                        <Checkbox
                                            id={`section-${s.id}`}
                                            checked={data.sections.includes(s.id)}
                                            onCheckedChange={() => toggleSection(s.id)}
                                        />
                                        <Label htmlFor={`section-${s.id}`} className="text-xs font-normal cursor-pointer">{s.label}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="px-6 py-4 border-t border-border/60 gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => { reset(); onClose(); }}>Annuler</Button>
                        <Button type="submit" size="sm" disabled={processing} className="gap-1.5">
                            {processing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
                            {processing ? 'Création…' : 'Créer le rapport'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function RapportsIndex({ rapports, pays }) {
    const [modalOpen, setModalOpen] = useState(false);

    const handleDelete = (rapport) => {
        if (confirm(`Supprimer le rapport "${rapport.titre}" ?`)) {
            router.delete(`/rapports/${rapport.id}`);
        }
    };

    return (
        <AppLayout title="Rapports" breadcrumbs={[{ label: 'Rapports', href: '/rapports' }]}>
            <Head title="Rapports" />

            <div className="space-y-5">

                {/* Header */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Rapports</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {rapports.total} rapport{rapports.total !== 1 ? 's' : ''} généré{rapports.total !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <Button size="sm" className="gap-1.5" onClick={() => setModalOpen(true)}>
                        <Plus className="h-3.5 w-3.5" />
                        Nouveau rapport
                    </Button>
                </div>

                {/* Table */}
                {rapports.data.length === 0 ? (
                    <Card className="shadow-none border-border/60 border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted mb-4">
                                <FileText className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="font-medium">Aucun rapport</p>
                            <p className="text-sm text-muted-foreground mt-1">Créez votre premier rapport.</p>
                            <Button size="sm" className="mt-4 gap-1.5" onClick={() => setModalOpen(true)}>
                                <Plus className="h-3.5 w-3.5" />
                                Nouveau rapport
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="shadow-none border-border/60">
                        <CardContent className="px-0 pb-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-y border-border/60 bg-muted/30">
                                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Titre</th>
                                            <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Template</th>
                                            <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Format</th>
                                            <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Période</th>
                                            <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Statut</th>
                                            <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Créé le</th>
                                            <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/40">
                                        {rapports.data.map(r => {
                                            const st = STATUT_CONFIG[r.statut] ?? { label: r.statut, cls: 'bg-slate-100 text-slate-500' };
                                            return (
                                                <tr key={r.id} className="hover:bg-muted/20 transition-colors group">
                                                    <td className="px-4 py-2.5 text-xs font-medium text-foreground">{r.titre}</td>
                                                    <td className="px-3 py-2.5 text-xs text-muted-foreground">{TEMPLATE_LABELS[r.template] ?? r.template}</td>
                                                    <td className="px-3 py-2.5 text-xs text-muted-foreground">{FORMAT_LABELS[r.format] ?? r.format}</td>
                                                    <td className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                                                        {r.periode_debut ? `${formatDate(r.periode_debut)} → ${formatDate(r.periode_fin)}` : '—'}
                                                    </td>
                                                    <td className="px-3 py-2.5">
                                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${st.cls}`}>{st.label}</span>
                                                    </td>
                                                    <td className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{formatDate(r.created_at)}</td>
                                                    <td className="px-4 py-2.5">
                                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                                                                <Link href={`/rapports/${r.id}/preview`}>
                                                                    <Eye className="h-3.5 w-3.5" />
                                                                </Link>
                                                            </Button>
                                                            {r.statut === 'pret' && r.fichier_path && (
                                                                <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                                                                    <a href={`/rapports/${r.id}/download`}>
                                                                        <Download className="h-3.5 w-3.5" />
                                                                    </a>
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="ghost" size="icon"
                                                                className="h-7 w-7 text-destructive hover:text-destructive"
                                                                onClick={() => handleDelete(r)}
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {rapports.last_page > 1 && (
                                <div className="flex items-center justify-between px-5 py-3 border-t border-border/60">
                                    <span className="text-xs text-muted-foreground">
                                        Page {rapports.current_page} sur {rapports.last_page}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        {rapports.links.map((link, i) => (
                                            link.url ? (
                                                <Link
                                                    key={i}
                                                    href={link.url}
                                                    className={`h-7 min-w-7 px-2 flex items-center justify-center rounded-md text-xs transition-colors ${
                                                        link.active
                                                            ? 'bg-foreground text-background font-semibold'
                                                            : 'border border-border/60 hover:bg-muted'
                                                    }`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ) : (
                                                <span key={i} className="h-7 min-w-7 px-2 flex items-center justify-center rounded-md text-xs border border-border/60 opacity-30" dangerouslySetInnerHTML={{ __html: link.label }} />
                                            )
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>

            <NouveauRapportModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                pays={pays ?? []}
            />
        </AppLayout>
    );
}
