import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const hasErrors = errors.email || errors.password;

    return (
        <>
            <Head title="Connexion" />
            <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
                <div className="w-full max-w-sm space-y-6">
                    {/* Logo */}
                    <div className="flex flex-col items-center space-y-2 text-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">
                            BDP
                        </div>
                        <h1 className="text-xl font-semibold">Base de données de projet</h1>
                        <p className="text-sm text-muted-foreground">FSD Casamance — Gestion des microprojets</p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Connexion</CardTitle>
                            <CardDescription>
                                Entrez vos identifiants pour accéder à votre espace.
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            {/* Status message (e.g. password reset link sent) */}
                            {status && (
                                <Alert className="mb-4">
                                    <AlertDescription>{status}</AlertDescription>
                                </Alert>
                            )}

                            {/* Error summary */}
                            {hasErrors && (
                                <Alert variant="destructive" className="mb-4">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        {errors.email || errors.password}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <form onSubmit={submit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Adresse e-mail</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        autoComplete="username"
                                        autoFocus
                                        placeholder="prenom.nom@organisation.org"
                                        onChange={(e) => setData('email', e.target.value)}
                                        className={errors.email ? 'border-destructive' : ''}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Mot de passe</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        onChange={(e) => setData('password', e.target.value)}
                                        className={errors.password ? 'border-destructive' : ''}
                                    />
                                </div>

                                <Button type="submit" className="w-full" disabled={processing}>
                                    {processing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Connexion en cours…
                                        </>
                                    ) : (
                                        'Se connecter'
                                    )}
                                </Button>
                            </form>
                        </CardContent>

                        {canResetPassword && (
                            <CardFooter className="flex justify-center">
                                <Link
                                    href={route('password.request')}
                                    className="text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
                                >
                                    Mot de passe oublié ?
                                </Link>
                            </CardFooter>
                        )}
                    </Card>
                </div>
            </div>
        </>
    );
}
