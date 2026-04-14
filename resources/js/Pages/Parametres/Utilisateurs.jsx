import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Loader2, Plus, UserPlus } from 'lucide-react';
import { useState } from 'react';

const ROLE_LABELS = {
    super_admin: 'Super admin',
    gestionnaire: 'Gestionnaire',
    auditeur: 'Auditeur',
    agent_terrain: 'Agent terrain',
    admin_organisation: 'Admin organisation',
};

const ROLE_VARIANTS = {
    super_admin: 'destructive',
    gestionnaire: 'default',
    auditeur: 'secondary',
    agent_terrain: 'outline',
    admin_organisation: 'warning',
};

export default function Utilisateurs({ utilisateurs, roles, pays }) {
    const [open, setOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        role: '',
        pays_id: pays[0]?.id ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/parametres/utilisateurs/inviter', {
            onSuccess: () => {
                setOpen(false);
                reset();
            },
        });
    };

    return (
        <AppLayout title="Utilisateurs">
            <Head title="Utilisateurs" />

            <div className="space-y-6 max-w-4xl">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/parametres">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Paramètres
                        </Link>
                    </Button>

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Inviter un utilisateur
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Inviter un utilisateur</DialogTitle>
                                <DialogDescription>
                                    Un lien d'invitation valable 72h sera envoyé par e-mail.
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={submit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Adresse e-mail</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="prenom.nom@organisation.org"
                                    />
                                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>Rôle</Label>
                                    <Select value={data.role} onValueChange={(v) => setData('role', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner un rôle" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roles.filter((r) => r.name !== 'super_admin').map((r) => (
                                                <SelectItem key={r.id} value={r.name}>
                                                    {ROLE_LABELS[r.name] ?? r.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.role && <p className="text-xs text-destructive">{errors.role}</p>}
                                </div>

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

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                        Annuler
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Envoyer l'invitation
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="rounded-lg border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nom</TableHead>
                                <TableHead>E-mail</TableHead>
                                <TableHead>Rôle</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {utilisateurs.map((u) => (
                                <TableRow key={u.id}>
                                    <TableCell className="font-medium">{u.name}</TableCell>
                                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-1 flex-wrap">
                                            {u.roles.map((role) => (
                                                <Badge key={role} variant={ROLE_VARIANTS[role] ?? 'secondary'}>
                                                    {ROLE_LABELS[role] ?? role}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
