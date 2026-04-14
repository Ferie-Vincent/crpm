import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Search, Plus } from 'lucide-react';
import { useState, useCallback } from 'react';
import debounce from 'lodash.debounce';

const STATUT_CONFIG = {
    en_preparation: { label: 'En préparation', variant: 'secondary' },
    en_cours:       { label: 'En cours',        variant: 'default' },
    suspendu:       { label: 'Suspendu',         variant: 'warning' },
    termine:        { label: 'Terminé',          variant: 'success' },
    annule:         { label: 'Annulé',           variant: 'destructive' },
};

function completudeVariant(v) {
    if (v >= 80) return 'success';
    if (v >= 50) return 'warning';
    return 'danger';
}

export default function ProjetsIndex({ projets, filters }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const { pays_list, active_pays_id } = usePage().props;
    const paysLabel = pays_list?.find(p => p.id === active_pays_id)?.nom ?? null;

    const applyFilter = useCallback(
        debounce((key, value) => {
            router.get('/projets', { ...filters, [key]: value || undefined }, { preserveState: true, replace: true });
        }, 400),
        [filters]
    );

    const handleSearch = (e) => {
        setSearch(e.target.value);
        applyFilter('search', e.target.value);
    };

    const handleStatut = (value) => {
        router.get('/projets', { ...filters, statut: value === 'tous' ? undefined : value }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout title="Projets">
            <Head title="Projets" />

            <div className="space-y-4">

                {/* ── En-tête ── */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Projets</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {paysLabel ?? 'Tous les pays'}
                        </p>
                    </div>
                    <Button size="sm" className="gap-1.5" asChild>
                        <Link href="/projets/create"><Plus className="h-3.5 w-3.5" />Nouveau projet</Link>
                    </Button>
                </div>

                {/* ── Filtres ── */}
                <div className="flex gap-3 flex-wrap">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher un projet…"
                            value={search}
                            onChange={handleSearch}
                            className="pl-9"
                        />
                    </div>

                    <Select defaultValue={filters.statut ?? 'tous'} onValueChange={handleStatut}>
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Statut" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="tous">Tous les statuts</SelectItem>
                            {Object.entries(STATUT_CONFIG).map(([key, { label }]) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Table */}
                <div className="rounded-lg border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Titre</TableHead>
                                <TableHead>Porteur</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="w-[120px]">Complétude</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {projets.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                        Aucun projet trouvé.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                projets.data.map((projet) => {
                                    const statut = STATUT_CONFIG[projet.statut] ?? { label: projet.statut, variant: 'secondary' };
                                    return (
                                        <TableRow key={projet.id} className="cursor-pointer" onClick={() => router.visit(`/projets/${projet.id}`)}>
                                            <TableCell className="font-mono text-xs">{projet.code}</TableCell>
                                            <TableCell className="font-medium">{projet.titre}</TableCell>
                                            <TableCell className="text-muted-foreground">{projet.porteur ?? '—'}</TableCell>
                                            <TableCell>
                                                <Badge variant={statut.variant}>{statut.label}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Progress value={projet.completude} className="h-1.5 flex-1" />
                                                    <span className="text-xs text-muted-foreground w-8 text-right">{projet.completude}%</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {projets.last_page > 1 && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{projets.total} projet{projets.total !== 1 ? 's' : ''}</span>
                        <div className="flex gap-2">
                            {projets.links.map((link, i) => (
                                <Button
                                    key={i}
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    disabled={!link.url}
                                    onClick={() => link.url && router.visit(link.url, { preserveState: true })}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
