import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Loader2 } from 'lucide-react';

const TIMEZONES = [
    'Africa/Dakar', 'Africa/Abidjan', 'Africa/Bamako', 'Africa/Conakry',
    'Africa/Bissau', 'Africa/Banjul', 'Europe/Paris', 'UTC',
];

export default function Programme({ parametres }) {
    const { data, setData, put, processing, errors } = useForm({
        nom_organisation: parametres?.nom_organisation ?? '',
        devise:           parametres?.devise ?? 'XOF',
        symbole_devise:   parametres?.symbole_devise ?? 'FCFA',
        timezone:         parametres?.timezone ?? 'Africa/Dakar',
        seuil_completude: parametres?.seuil_completude ?? 80,
    });

    const submit = (e) => {
        e.preventDefault();
        put('/parametres/programme');
    };

    return (
        <AppLayout title="Configuration du programme">
            <Head title="Configuration du programme" />

            <div className="space-y-6 max-w-2xl">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/parametres">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Paramètres
                    </Link>
                </Button>

                <form onSubmit={submit}>
                    <Tabs defaultValue="organisation">
                        <TabsList>
                            <TabsTrigger value="organisation">Organisation</TabsTrigger>
                            <TabsTrigger value="devise">Devise</TabsTrigger>
                            <TabsTrigger value="systeme">Système</TabsTrigger>
                        </TabsList>

                        <TabsContent value="organisation" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Organisation</CardTitle>
                                    <CardDescription>Informations sur votre organisation / programme.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="nom_organisation">Nom de l'organisation</Label>
                                        <Input
                                            id="nom_organisation"
                                            value={data.nom_organisation}
                                            onChange={(e) => setData('nom_organisation', e.target.value)}
                                            placeholder="Ex. FSD Casamance"
                                        />
                                        {errors.nom_organisation && <p className="text-xs text-destructive">{errors.nom_organisation}</p>}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="devise" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Devise</CardTitle>
                                    <CardDescription>
                                        La devise est utilisée partout dans l'application. Ne jamais mettre de devise en dur dans le code.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="devise">Code devise (ISO 4217)</Label>
                                        <Input
                                            id="devise"
                                            value={data.devise}
                                            onChange={(e) => setData('devise', e.target.value.toUpperCase())}
                                            placeholder="XOF"
                                            maxLength={3}
                                        />
                                        {errors.devise && <p className="text-xs text-destructive">{errors.devise}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="symbole_devise">Symbole affiché</Label>
                                        <Input
                                            id="symbole_devise"
                                            value={data.symbole_devise}
                                            onChange={(e) => setData('symbole_devise', e.target.value)}
                                            placeholder="FCFA"
                                            maxLength={5}
                                        />
                                        {errors.symbole_devise && <p className="text-xs text-destructive">{errors.symbole_devise}</p>}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="systeme" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Système</CardTitle>
                                    <CardDescription>Paramètres techniques de l'application.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Fuseau horaire</Label>
                                        <Select value={data.timezone} onValueChange={(v) => setData('timezone', v)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {TIMEZONES.map((tz) => (
                                                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="seuil_completude">Seuil complétude « à jour » (%)</Label>
                                        <Input
                                            id="seuil_completude"
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={data.seuil_completude}
                                            onChange={(e) => setData('seuil_completude', Number(e.target.value))}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Un projet est considéré « à jour » si sa complétude atteint ce seuil.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    <div className="flex justify-end mt-4">
                        <Button type="submit" disabled={processing}>
                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Enregistrer
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
