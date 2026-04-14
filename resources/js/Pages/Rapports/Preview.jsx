import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { fmt, separerMilliers } from '@/lib/currency';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Download, AlertTriangle, Loader2 } from 'lucide-react';
import { useState } from 'react';

const STATUT_CONFIG = {
    en_preparation: { label: 'En préparation', variant: 'secondary' },
    en_cours:       { label: 'En cours',        variant: 'default' },
    suspendu:       { label: 'Suspendu',         variant: 'warning' },
    termine:        { label: 'Terminé',          variant: 'success' },
    annule:         { label: 'Annulé',           variant: 'destructive' },
};

export default function RapportPreview({ rapport, projets, stats }) {
    const { devise_affichage = 'locale', taux_eur = {} } = usePage().props;
    const formatMontant = (v, sourceDevise = 'XOF') => fmt(v, sourceDevise, devise_affichage, taux_eur);
    const [generating, setGenerating] = useState(false);

    const hasIncompleteProjects = projets.some((p) => p.completude < 50);

    const handleGenerate = () => {
        setGenerating(true);
        router.post(`/rapports/${rapport.id}/generate`, {}, {
            onFinish: () => setGenerating(false),
        });
    };

    return (
        <AppLayout title="Prévisualisation rapport">
            <Head title="Prévisualisation rapport" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/rapports">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Rapports
                        </Link>
                    </Button>
                    <Button onClick={handleGenerate} disabled={generating}>
                        {generating ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Génération…</>
                        ) : (
                            <><Download className="mr-2 h-4 w-4" />Générer {rapport.format.toUpperCase()}</>
                        )}
                    </Button>
                </div>

                {/* Report header */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-xl font-semibold">{rapport.titre}</h1>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Template {rapport.template} · {rapport.format.toUpperCase()} · {rapport.pays?.nom}
                                </p>
                            </div>
                            <Badge variant={rapport.statut === 'pret' ? 'success' : 'secondary'}>
                                {rapport.statut === 'pret' ? 'Prêt' : 'En cours'}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Alert for incomplete data */}
                {hasIncompleteProjects && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            {projets.filter((p) => p.completude < 50).length} projet(s) ont une complétude inférieure à 50%.
                            Les données exportées pourraient être incomplètes.
                        </AlertDescription>
                    </Alert>
                )}

                {/* KPI summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Projets', value: stats.total_projets },
                        { label: 'Complétude moy.', value: `${Math.round(stats.completude_moy)}%` },
                        { label: 'Total accordé', value: formatMontant(stats.total_accorde) },
                        { label: 'Total décaissé', value: formatMontant(stats.total_decaisse) },
                    ].map((kpi) => (
                        <Card key={kpi.label}>
                            <CardContent className="pt-4 pb-4">
                                <p className="text-xs text-muted-foreground">{kpi.label}</p>
                                <p className="text-lg font-semibold">{kpi.value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Projects table preview */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Projets inclus ({projets.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Titre</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead className="text-right">Complétude</TableHead>
                                    <TableHead className="text-right">Accordé</TableHead>
                                    <TableHead className="text-right">Décaissé</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {projets.map((p) => {
                                    const statut = STATUT_CONFIG[p.statut] ?? { label: p.statut, variant: 'secondary' };
                                    return (
                                        <TableRow key={p.id} className={p.completude < 50 ? 'bg-amber-50' : ''}>
                                            <TableCell className="font-mono text-xs">{p.code}</TableCell>
                                            <TableCell>{p.titre}</TableCell>
                                            <TableCell><Badge variant={statut.variant}>{statut.label}</Badge></TableCell>
                                            <TableCell className="text-right">{p.completude}%</TableCell>
                                            <TableCell className="text-right">{formatMontant(p.montant_accorde, p.devise ?? 'XOF')}</TableCell>
                                            <TableCell className="text-right">{formatMontant(p.montant_decaisse, p.devise ?? 'XOF')}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
