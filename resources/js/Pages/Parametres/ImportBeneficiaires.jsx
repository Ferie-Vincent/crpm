import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Upload, FileSpreadsheet, CheckCircle2, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';
import axios from 'axios';

export default function ImportBeneficiaires({ pays }) {
    const [preview, setPreview] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const fileRef = useRef(null);

    const { data, setData, post, processing, errors, wasSuccessful } = useForm({
        fichier: null,
        pays_id: pays[0]?.id ?? '',
    });

    const handleFile = async (file) => {
        setData('fichier', file);
        if (!file) return;

        setPreviewLoading(true);
        const fd = new FormData();
        fd.append('fichier', file);
        fd.append('pays_id', data.pays_id);
        fd.append('_token', document.querySelector('meta[name="csrf-token"]')?.content ?? '');

        try {
            const res = await axios.post('/beneficiaires/preview', fd);
            setPreview(res.data);
        } catch (e) {
            setPreview(null);
        } finally {
            setPreviewLoading(false);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post('/beneficiaires/import');
    };

    if (wasSuccessful) {
        return (
            <AppLayout title="Import bénéficiaires">
                <Head title="Import bénéficiaires" />
                <Card className="max-w-md mx-auto mt-8">
                    <CardContent className="pt-6 text-center space-y-4">
                        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
                        <h2 className="text-lg font-semibold">Import réussi</h2>
                        <p className="text-sm text-muted-foreground">
                            {preview?.total ?? ''} bénéficiaires importés avec succès.
                        </p>
                        <div className="flex gap-2 justify-center">
                            <Button variant="outline" asChild><Link href="/parametres">Paramètres</Link></Button>
                            <Button onClick={() => window.location.reload()}>Nouvel import</Button>
                        </div>
                    </CardContent>
                </Card>
            </AppLayout>
        );
    }

    return (
        <AppLayout title="Import bénéficiaires">
            <Head title="Import bénéficiaires" />

            <div className="space-y-6 max-w-3xl">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/parametres">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Paramètres
                    </Link>
                </Button>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Import bénéficiaires</CardTitle>
                            <CardDescription>
                                Importez un fichier Excel (.xlsx, .xls) ou CSV. Colonnes attendues : nom, prénom, genre, téléphone, commune, village, activite_principale.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {pays.length > 1 && (
                                <div className="space-y-2">
                                    <Label>Pays</Label>
                                    <Select value={String(data.pays_id)} onValueChange={(v) => setData('pays_id', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pays" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {pays.map((p) => (
                                                <SelectItem key={p.id} value={String(p.id)}>{p.nom}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Drop zone */}
                            <div
                                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                                    dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                                }`}
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                                onClick={() => fileRef.current?.click()}
                            >
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept=".xlsx,.xls,.csv"
                                    className="hidden"
                                    onChange={(e) => handleFile(e.target.files[0])}
                                />
                                {data.fichier ? (
                                    <div className="space-y-2">
                                        <FileSpreadsheet className="h-8 w-8 text-primary mx-auto" />
                                        <p className="text-sm font-medium">{data.fichier.name}</p>
                                        <p className="text-xs text-muted-foreground">{(data.fichier.size / 1024).toFixed(0)} Ko</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                                        <p className="text-sm font-medium">Glissez votre fichier ici</p>
                                        <p className="text-xs text-muted-foreground">ou cliquez pour parcourir — .xlsx, .xls, .csv (max 10 Mo)</p>
                                    </div>
                                )}
                            </div>
                            {errors.fichier && <p className="text-xs text-destructive">{errors.fichier}</p>}
                        </CardContent>
                    </Card>

                    {/* Preview */}
                    {previewLoading && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Analyse du fichier…
                        </div>
                    )}

                    {preview && !previewLoading && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm">Aperçu ({preview.total} lignes)</CardTitle>
                                    <Badge variant="secondary">{preview.headers?.length} colonnes</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 overflow-auto max-h-64">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            {(preview.headers ?? []).map((h, i) => (
                                                <TableHead key={i} className="whitespace-nowrap">{h}</TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(preview.preview ?? []).map((row, i) => (
                                            <TableRow key={i}>
                                                {row.map((cell, j) => (
                                                    <TableCell key={j} className="text-xs">{cell ?? '—'}</TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" asChild><Link href="/parametres">Annuler</Link></Button>
                        <Button type="submit" disabled={processing || !data.fichier}>
                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Importer {preview ? `(${preview.total} lignes)` : ''}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
