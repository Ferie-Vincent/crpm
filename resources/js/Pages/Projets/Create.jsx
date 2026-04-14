import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save } from 'lucide-react';
import { MoneyInput } from '@/components/ui/money-input';

const STATUTS = [
    { value: 'en_preparation', label: 'En préparation' },
    { value: 'en_cours',       label: 'En cours' },
    { value: 'suspendu',       label: 'Suspendu' },
    { value: 'termine',        label: 'Terminé' },
    { value: 'annule',         label: 'Annulé' },
];

const DOMAINES = [
    'Valorisation des Ressources Naturelles',
    'Tourisme Durable',
    'Agriculture',
    'Éducation',
    'Santé',
    'Infrastructure',
    'Autre',
];

const CATEGORIES = ['Economique', 'Sociale', 'Mixte'];

function Field({ label, error, required, children }) {
    return (
        <div className="space-y-1.5">
            <Label className="text-xs font-medium">
                {label}{required && <span className="text-destructive ml-0.5">*</span>}
            </Label>
            {children}
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}

export default function ProjetCreate({ pays, programmes, default_pays_id }) {
    const { data, setData, post, processing, errors } = useForm({
        code:            '',
        titre:           '',
        porteur:         '',
        commune:         '',
        region:          '',
        pays_id:         default_pays_id ?? (pays[0]?.id ?? ''),
        programme_id:    programmes[0]?.id ?? '',
        montant_accorde: '',
        date_debut:      '',
        date_fin_prevue: '',
        statut:          'en_preparation',
        domaine:         '',
        categorie:       '',
        eligible:        '',
        decision:        '',
        accord_scac:     '',
        description:     '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/projets');
    };

    return (
        <AppLayout
            title="Nouveau projet"
            breadcrumbs={[
                { label: 'Projets', href: '/projets' },
                { label: 'Nouveau projet', href: '/projets/create' },
            ]}
        >
            <Head title="Nouveau projet" />

            <form onSubmit={submit} className="space-y-5 max-w-4xl">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" asChild className="-ml-2">
                        <Link href="/projets"><ArrowLeft className="mr-1.5 h-4 w-4" /> Projets</Link>
                    </Button>
                    <Button type="submit" size="sm" disabled={processing} className="gap-1.5">
                        <Save className="h-3.5 w-3.5" />
                        {processing ? 'Enregistrement…' : 'Enregistrer'}
                    </Button>
                </div>

                {/* Identification */}
                <Card className="shadow-none border-border/60">
                    <CardHeader className="pb-2 pt-4 px-5">
                        <CardTitle className="text-sm font-semibold">Identification</CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Code projet" error={errors.code} required>
                            <Input
                                value={data.code}
                                onChange={e => setData('code', e.target.value)}
                                placeholder="ex. FSD-MON-001"
                                className="uppercase"
                            />
                        </Field>

                        <Field label="Titre" error={errors.titre} required>
                            <Input
                                value={data.titre}
                                onChange={e => setData('titre', e.target.value)}
                                placeholder="Intitulé complet du projet"
                            />
                        </Field>

                        <Field label="Porteur / Organisation" error={errors.porteur}>
                            <Input
                                value={data.porteur}
                                onChange={e => setData('porteur', e.target.value)}
                                placeholder="Nom de l'organisation porteur"
                            />
                        </Field>

                        <Field label="Programme" error={errors.programme_id}>
                            <select
                                value={data.programme_id}
                                onChange={e => setData('programme_id', e.target.value)}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                            >
                                <option value="">— Aucun programme —</option>
                                {programmes.map(p => (
                                    <option key={p.id} value={p.id}>{p.nom} ({p.code})</option>
                                ))}
                            </select>
                        </Field>

                        <Field label="Domaine" error={errors.domaine}>
                            <select
                                value={data.domaine}
                                onChange={e => setData('domaine', e.target.value)}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                            >
                                <option value="">— Sélectionner —</option>
                                {DOMAINES.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </Field>

                        <Field label="Catégorie" error={errors.categorie}>
                            <select
                                value={data.categorie}
                                onChange={e => setData('categorie', e.target.value)}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                            >
                                <option value="">— Sélectionner —</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </Field>
                    </CardContent>
                </Card>

                {/* Localisation */}
                <Card className="shadow-none border-border/60">
                    <CardHeader className="pb-2 pt-4 px-5">
                        <CardTitle className="text-sm font-semibold">Localisation</CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Field label="Commune" error={errors.commune}>
                            <Input value={data.commune} onChange={e => setData('commune', e.target.value)} placeholder="Commune" />
                        </Field>
                        <Field label="Région" error={errors.region}>
                            <Input value={data.region} onChange={e => setData('region', e.target.value)} placeholder="Région" />
                        </Field>
                        <Field label="Pays" error={errors.pays_id} required>
                            <select
                                value={data.pays_id}
                                onChange={e => setData('pays_id', e.target.value)}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                            >
                                {pays.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
                            </select>
                        </Field>
                    </CardContent>
                </Card>

                {/* Financement */}
                <Card className="shadow-none border-border/60">
                    <CardHeader className="pb-2 pt-4 px-5">
                        <CardTitle className="text-sm font-semibold">Financement & calendrier</CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Montant accordé" error={errors.montant_accorde}>
                            <MoneyInput
                                value={data.montant_accorde}
                                onChange={v => setData('montant_accorde', v)}
                                devise={pays.find(p => p.id == data.pays_id)?.devise ?? 'XOF'}
                            />
                        </Field>

                        <Field label="Statut" error={errors.statut} required>
                            <select
                                value={data.statut}
                                onChange={e => setData('statut', e.target.value)}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                            >
                                {STATUTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                        </Field>

                        <Field label="Date de début" error={errors.date_debut}>
                            <Input type="date" value={data.date_debut} onChange={e => setData('date_debut', e.target.value)} />
                        </Field>

                        <Field label="Date de fin prévue" error={errors.date_fin_prevue}>
                            <Input type="date" value={data.date_fin_prevue} onChange={e => setData('date_fin_prevue', e.target.value)} />
                        </Field>
                    </CardContent>
                </Card>

                {/* Éligibilité */}
                <Card className="shadow-none border-border/60">
                    <CardHeader className="pb-2 pt-4 px-5">
                        <CardTitle className="text-sm font-semibold">Éligibilité & décision</CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Field label="Éligible" error={errors.eligible}>
                            <select
                                value={data.eligible}
                                onChange={e => setData('eligible', e.target.value)}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                            >
                                <option value="">— Non renseigné —</option>
                                <option value="1">Oui</option>
                                <option value="0">Non</option>
                            </select>
                        </Field>

                        <Field label="Accord SCAC" error={errors.accord_scac}>
                            <select
                                value={data.accord_scac}
                                onChange={e => setData('accord_scac', e.target.value)}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                            >
                                <option value="">— Non renseigné —</option>
                                <option value="1">Oui</option>
                                <option value="0">Non</option>
                            </select>
                        </Field>

                        <Field label="Décision comité" error={errors.decision}>
                            <Input
                                value={data.decision}
                                onChange={e => setData('decision', e.target.value)}
                                placeholder="ex. Validé avec modification"
                            />
                        </Field>
                    </CardContent>
                </Card>

                {/* Description */}
                <Card className="shadow-none border-border/60">
                    <CardHeader className="pb-2 pt-4 px-5">
                        <CardTitle className="text-sm font-semibold">Description</CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5">
                        <textarea
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                            rows={4}
                            placeholder="Description du projet, objectifs, activités prévues…"
                            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                        />
                        {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
                    </CardContent>
                </Card>

                {/* Submit */}
                <div className="flex justify-end gap-2 pb-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/projets">Annuler</Link>
                    </Button>
                    <Button type="submit" size="sm" disabled={processing} className="gap-1.5">
                        <Save className="h-3.5 w-3.5" />
                        {processing ? 'Enregistrement…' : 'Créer le projet'}
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
}
