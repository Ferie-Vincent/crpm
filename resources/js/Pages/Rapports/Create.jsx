import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Loader2 } from 'lucide-react';

const TEMPLATES = [
    { value: 'SCAC', label: 'SCAC — Service de Coopération' },
    { value: 'AFD', label: 'AFD — Agence Française de Développement' },
    { value: 'UE', label: 'UE — Union Européenne' },
    { value: 'generique', label: 'Générique' },
];

const SECTIONS = [
    { id: 'synthese', label: 'Synthèse exécutive' },
    { id: 'projets', label: 'Liste des projets' },
    { id: 'decaissements', label: 'Décaissements' },
    { id: 'beneficiaires', label: 'Bénéficiaires' },
    { id: 'missions', label: 'Visites terrain' },
    { id: 'cartographie', label: 'Cartographie' },
];

export default function RapportCreate({ pays }) {
    const { data, setData, post, processing, errors } = useForm({
        pays_id: pays[0]?.id ?? '',
        titre: '',
        template: 'generique',
        format: 'pdf',
        periode_debut: '',
        periode_fin: '',
        sections: SECTIONS.map((s) => s.id),
    });

    const toggleSection = (id) => {
        setData('sections', data.sections.includes(id)
            ? data.sections.filter((s) => s !== id)
            : [...data.sections, id]
        );
    };

    const submit = (e) => {
        e.preventDefault();
        post('/rapports');
    };

    return (
        <AppLayout title="Nouveau rapport">
            <Head title="Nouveau rapport" />

            <div className="max-w-2xl space-y-6">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/rapports">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Rapports
                    </Link>
                </Button>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuration du rapport</CardTitle>
                            <CardDescription>Définissez les paramètres de votre rapport.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Titre */}
                            <div className="space-y-2">
                                <Label htmlFor="titre">Titre du rapport</Label>
                                <Input
                                    id="titre"
                                    value={data.titre}
                                    onChange={(e) => setData('titre', e.target.value)}
                                    placeholder="Ex. Rapport trimestriel Q1 2025"
                                />
                                {errors.titre && <p className="text-xs text-destructive">{errors.titre}</p>}
                            </div>

                            {/* Pays */}
                            {pays.length > 1 && (
                                <div className="space-y-2">
                                    <Label>Pays</Label>
                                    <Select value={String(data.pays_id)} onValueChange={(v) => setData('pays_id', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner un pays" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {pays.map((p) => (
                                                <SelectItem key={p.id} value={String(p.id)}>{p.nom}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Template */}
                            <div className="space-y-2">
                                <Label>Template bailleur</Label>
                                <Select value={data.template} onValueChange={(v) => setData('template', v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TEMPLATES.map((t) => (
                                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Format */}
                            <div className="space-y-2">
                                <Label>Format</Label>
                                <Select value={data.format} onValueChange={(v) => setData('format', v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pdf">PDF</SelectItem>
                                        <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Période */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label htmlFor="periode_debut">Période — début</Label>
                                    <Input
                                        id="periode_debut"
                                        type="date"
                                        value={data.periode_debut}
                                        onChange={(e) => setData('periode_debut', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="periode_fin">Période — fin</Label>
                                    <Input
                                        id="periode_fin"
                                        type="date"
                                        value={data.periode_fin}
                                        onChange={(e) => setData('periode_fin', e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sections */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Sections à inclure</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {SECTIONS.map((section) => (
                                <div key={section.id} className="flex items-center gap-3">
                                    <Checkbox
                                        id={section.id}
                                        checked={data.sections.includes(section.id)}
                                        onCheckedChange={() => toggleSection(section.id)}
                                    />
                                    <Label htmlFor={section.id} className="cursor-pointer font-normal">
                                        {section.label}
                                    </Label>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" asChild>
                            <Link href="/rapports">Annuler</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Prévisualiser
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
