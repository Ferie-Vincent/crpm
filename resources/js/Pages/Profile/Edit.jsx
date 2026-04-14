import { useRef, useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    User, Mail, Lock, Shield, MapPin, Calendar, Clock,
    CheckCircle2, Save, KeyRound, Building2,
} from 'lucide-react';

function initiales(name) {
    if (!name) return '?';
    return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

function fmtDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function fmtDateTime(d) {
    if (!d) return '—';
    return new Date(d).toLocaleString('fr-FR', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

// ── Champ de formulaire ───────────────────────────────────────────────────────
function Field({ label, error, children }) {
    return (
        <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</Label>
            {children}
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}

// ── Ligne d'info sidebar ──────────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value, iconColor = 'text-muted-foreground' }) {
    return (
        <div className="flex items-start gap-3 py-3 border-b border-border/40 last:border-0">
            <div className={`mt-0.5 shrink-0 ${iconColor}`}>
                <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide leading-none mb-0.5">{label}</p>
                <p className="text-sm font-medium text-foreground truncate">{value || '—'}</p>
            </div>
        </div>
    );
}

export default function ProfileEdit({ status }) {
    const { auth, pays_list } = usePage().props;
    const user = auth.user;

    // Rôle (premier rôle Spatie)
    const role = user.roles?.[0]?.name ?? null;
    const roleLabel = {
        'super_admin': 'Super Administrateur',
        'admin': 'Administrateur',
        'gestionnaire': 'Gestionnaire',
        'agent': 'Agent de terrain',
        'auditeur': 'Auditeur',
    }[role] ?? role;

    const paysNom = pays_list?.find(p => p.id === user.pays_id)?.nom;

    // ── Formulaire infos personnelles ─────────────────────────────────────────
    const {
        data: infoData, setData: setInfo,
        patch: patchInfo, errors: infoErrors,
        processing: infoProcessing, recentlySuccessful: infoSaved,
    } = useForm({ name: user.name ?? '', email: user.email ?? '' });

    // ── Formulaire mot de passe ───────────────────────────────────────────────
    const passwordRef = useRef();
    const currentRef  = useRef();
    const {
        data: pwData, setData: setPw,
        put: putPw, errors: pwErrors,
        processing: pwProcessing, recentlySuccessful: pwSaved,
        reset: resetPw,
    } = useForm({ current_password: '', password: '', password_confirmation: '' });

    function submitInfo(e) {
        e.preventDefault();
        patchInfo(route('profile.update'));
    }

    function submitPw(e) {
        e.preventDefault();
        putPw(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => resetPw(),
            onError: (errs) => {
                if (errs.password) { resetPw('password', 'password_confirmation'); passwordRef.current?.focus(); }
                if (errs.current_password) { resetPw('current_password'); currentRef.current?.focus(); }
            },
        });
    }

    const ini = initiales(user.name);

    return (
        <AppLayout>
            <Head title="Mon profil" />

            {/* ── Hero banner ─────────────────────────────────────────────── */}
            <div className="relative overflow-hidden rounded-xl mx-6 mt-6 mb-6 shadow-sm">
                {/* Gradient background */}
                <div
                    className="h-32"
                    style={{
                        background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(140 40% 18%) 50%, hsl(24 80% 40%) 100%)',
                    }}
                >
                    {/* Decorative circles */}
                    <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 bg-white -translate-y-1/2 translate-x-1/4" />
                    <div className="absolute bottom-0 left-1/3 w-32 h-32 rounded-full opacity-5 bg-white translate-y-1/2" />
                </div>

                {/* Avatar + identité */}
                <div className="absolute bottom-0 left-6 translate-y-1/2 flex items-end gap-4">
                    <div
                        className="h-20 w-20 rounded-2xl border-4 border-background shadow-lg flex items-center justify-center text-2xl font-bold text-white select-none"
                        style={{ background: 'hsl(var(--primary))' }}
                    >
                        {ini}
                    </div>
                </div>
            </div>

            {/* ── Nom + badges (sous le hero) ─────────────────────────────── */}
            <div className="px-6 pt-12 pb-2 flex items-start justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-xl font-bold text-foreground">{user.name}</h1>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <Mail className="h-3.5 w-3.5" />
                        {user.email}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {roleLabel && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                            <Shield className="h-3 w-3" />
                            {roleLabel}
                        </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Actif
                    </span>
                </div>
            </div>

            <Separator className="mx-6 mb-6" />

            {/* ── Corps : sidebar + formulaires ───────────────────────────── */}
            <div className="px-6 pb-10 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">

                {/* Sidebar */}
                <div className="space-y-4">
                    <Card className="shadow-none border-border/60">
                        <CardHeader className="pb-2 pt-4 px-4">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Informations du compte
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                            <InfoRow icon={Shield}   label="Rôle"           value={roleLabel}         iconColor="text-primary" />
                            <InfoRow icon={MapPin}   label="Pays / Bureau"  value={paysNom}           iconColor="text-blue-500" />
                            <InfoRow icon={Calendar} label="Membre depuis"  value={fmtDate(user.created_at)} iconColor="text-amber-500" />
                            <InfoRow icon={Clock}    label="Dernière mise à jour" value={fmtDateTime(user.updated_at)} iconColor="text-rose-500" />
                        </CardContent>
                    </Card>

                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 leading-relaxed">
                        <p className="font-medium mb-0.5">Rôle & organisation</p>
                        Pour modifier votre rôle ou votre affectation, contactez un administrateur.
                    </div>
                </div>

                {/* Formulaires */}
                <div className="space-y-5">

                    {/* Informations personnelles */}
                    <Card className="shadow-none border-border/60">
                        <CardHeader className="pb-3 pt-5 px-6">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                                    <User className="h-4 w-4 text-primary" />
                                </div>
                                <CardTitle className="text-base font-semibold">Informations personnelles</CardTitle>
                            </div>
                        </CardHeader>
                        <Separator />
                        <CardContent className="px-6 pt-5 pb-6">
                            <form onSubmit={submitInfo}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                                    <Field label="Nom complet" error={infoErrors.name}>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                className="pl-9"
                                                value={infoData.name}
                                                onChange={e => setInfo('name', e.target.value)}
                                                placeholder="Votre nom complet"
                                                required
                                            />
                                        </div>
                                    </Field>
                                    <Field label="Adresse e-mail" error={infoErrors.email}>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="email"
                                                className="pl-9"
                                                value={infoData.email}
                                                onChange={e => setInfo('email', e.target.value)}
                                                placeholder="votre@email.com"
                                                required
                                            />
                                        </div>
                                    </Field>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="h-5">
                                        {infoSaved && (
                                            <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                                                <CheckCircle2 className="h-4 w-4" />
                                                Informations mises à jour
                                            </span>
                                        )}
                                    </div>
                                    <Button type="submit" disabled={infoProcessing} className="gap-2">
                                        <Save className="h-4 w-4" />
                                        Mettre à jour
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Mot de passe */}
                    <Card className="shadow-none border-border/60">
                        <CardHeader className="pb-3 pt-5 px-6">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                                    <KeyRound className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-base font-semibold">Changer le mot de passe</CardTitle>
                                </div>
                            </div>
                        </CardHeader>
                        <Separator />
                        <CardContent className="px-6 pt-5 pb-6">
                            <form onSubmit={submitPw}>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
                                    <Field label="Mot de passe actuel" error={pwErrors.current_password}>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                ref={currentRef}
                                                type="password"
                                                className="pl-9"
                                                value={pwData.current_password}
                                                onChange={e => setPw('current_password', e.target.value)}
                                                autoComplete="current-password"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </Field>
                                    <Field label="Nouveau mot de passe" error={pwErrors.password}>
                                        <div className="relative">
                                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                ref={passwordRef}
                                                type="password"
                                                className="pl-9"
                                                value={pwData.password}
                                                onChange={e => setPw('password', e.target.value)}
                                                autoComplete="new-password"
                                                placeholder="Minimum 8 caractères"
                                            />
                                        </div>
                                    </Field>
                                    <Field label="Confirmer" error={pwErrors.password_confirmation}>
                                        <div className="relative">
                                            <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="password"
                                                className="pl-9"
                                                value={pwData.password_confirmation}
                                                onChange={e => setPw('password_confirmation', e.target.value)}
                                                autoComplete="new-password"
                                                placeholder="Répéter le mot de passe"
                                            />
                                        </div>
                                    </Field>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="h-5">
                                        {pwSaved && (
                                            <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                                                <CheckCircle2 className="h-4 w-4" />
                                                Mot de passe mis à jour
                                            </span>
                                        )}
                                    </div>
                                    <Button type="submit" disabled={pwProcessing} className="gap-2">
                                        <Lock className="h-4 w-4" />
                                        Changer le mot de passe
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </AppLayout>
    );
}
