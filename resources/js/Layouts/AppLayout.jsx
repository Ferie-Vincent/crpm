import { Link, usePage, router } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Toaster } from '@/components/ui/toaster';
import {
    LayoutDashboard,
    FolderOpen,
    FileText,
    Settings,
    LogOut,
    User,
    MoreHorizontal,
    Bell,
    Search,
    ChevronRight,
    Globe,
    BookOpen,
} from 'lucide-react';
import { Input } from '@/components/ui/input';

const navItems = [
    { label: 'Tableau de bord', href: '/dashboard',  icon: LayoutDashboard, match: '/dashboard' },
    { label: 'Projets',         href: '/projets',    icon: FolderOpen,      match: '/projets' },
    { label: 'Programmes',      href: '/programmes', icon: BookOpen,        match: '/programmes' },
    { label: 'Rapports',        href: '/rapports',   icon: FileText,        match: '/rapports' },
    { label: 'Paramètres',      href: '/parametres', icon: Settings,        match: '/parametres' },
];

function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function isActive(href, currentPath) {
    return currentPath?.startsWith(href);
}

function Flag({ cca2 }) {
    if (!cca2) return <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />;
    return (
        <img
            src={`https://flagcdn.com/w40/${cca2.toLowerCase()}.png`}
            width={20}
            height={13}
            alt={cca2}
            className="rounded-sm shadow-sm shrink-0 object-cover"
        />
    );
}

function PaysSelector({ paysList, activePaysId, userPaysId }) {
    if (userPaysId || paysList.length <= 1) return null;

    const active = paysList.find(p => p.id === activePaysId) ?? null;

    function select(id) {
        router.post('/select-pays', { pays_id: id || null }, { preserveScroll: false });
    }

    return (
        <div className="px-3 pb-3 border-b border-white/10">
            <p className="px-1 pb-1.5 text-[9px] font-semibold uppercase tracking-widest text-white/30">Pays actif</p>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-white/10 transition-colors text-left">
                        <Flag cca2={active?.cca2} />
                        <span className="flex-1 truncate font-medium text-white/80">
                            {active ? active.nom : 'Tous les pays'}
                        </span>
                        <svg className="h-3 w-3 text-white/30 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start" className="w-52 max-h-72 overflow-y-auto p-1">
                    <DropdownMenuItem
                        onClick={() => select(null)}
                        className={cn('flex items-center gap-2 text-xs rounded-md px-2 py-1.5 cursor-pointer', !activePaysId && 'bg-muted font-semibold')}
                    >
                        <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span>Tous les pays</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {paysList.map(p => (
                        <DropdownMenuItem
                            key={p.id}
                            onClick={() => select(p.id)}
                            className={cn('flex items-center gap-2 text-xs rounded-md px-2 py-1.5 cursor-pointer', activePaysId === p.id && 'bg-muted font-semibold')}
                        >
                            <Flag cca2={p.cca2} />
                            <span className="flex-1 truncate">{p.nom}</span>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

export default function AppLayout({ children, title, breadcrumbs = [] }) {
    const { auth, pays_list, active_pays_id, user_pays_id } = usePage().props;
    const user = auth?.user;
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    return (
        <div className="flex h-screen overflow-hidden bg-background">

            {/* ── Sidebar ── */}
            <aside className="flex w-[228px] shrink-0 flex-col bg-[#1B4332] border-r border-black/10">

                {/* Logo */}
                <div className="flex h-[64px] items-center justify-center px-4 border-b border-white/10">
                    <img src="/assets/images/logo/crpm.png" alt="CRPM" className="h-11 w-auto object-contain brightness-0 invert" />
                </div>

                {/* Sélecteur de pays (admin uniquement) */}
                <PaysSelector
                    paysList={pays_list ?? []}
                    activePaysId={active_pays_id}
                    userPaysId={user_pays_id}
                />

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto px-3 py-4">
                    <p className="px-2 pb-2 text-[9px] font-semibold uppercase tracking-widest text-white/30">
                        Navigation
                    </p>
                    <ul className="space-y-0.5">
                        {navItems.map((item) => {
                            const active = isActive(item.match, currentPath);
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all',
                                            active
                                                ? 'bg-white/15 text-white font-semibold shadow-sm'
                                                : 'text-white/60 hover:bg-white/8 hover:text-white/90'
                                        )}
                                    >
                                        <item.icon className="h-4 w-4 shrink-0" />
                                        {item.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* User footer */}
                {user && (
                    <div className="border-t border-white/10 p-3">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-sm hover:bg-white/10 transition-colors">
                                    <Avatar className="h-7 w-7 shrink-0">
                                        <AvatarFallback className="text-[10px] bg-white/20 text-white font-semibold">
                                            {getInitials(user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0 text-left">
                                        <p className="text-xs font-medium truncate leading-none text-white">{user.name}</p>
                                        <p className="text-[10px] text-white/50 truncate mt-0.5">{user.email}</p>
                                    </div>
                                    <MoreHorizontal className="h-3.5 w-3.5 text-white/40 shrink-0" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" side="top" className="w-52">
                                <DropdownMenuItem asChild>
                                    <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                                        <User className="h-3.5 w-3.5" /> Profil
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/logout" method="post" as="button"
                                        className="flex w-full items-center gap-2 cursor-pointer text-destructive focus:text-destructive">
                                        <LogOut className="h-3.5 w-3.5" /> Déconnexion
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </aside>

            {/* ── Main area ── */}
            <div className="flex flex-1 flex-col overflow-hidden">

                {/* Topbar */}
                <header className="flex h-[64px] shrink-0 items-center gap-4 border-b border-border bg-white/80 backdrop-blur-sm px-6 shadow-sm">
                    {/* Breadcrumb / title */}
                    <div className="flex items-center gap-1.5 text-sm min-w-0">
                        {breadcrumbs.length > 0 ? (
                            breadcrumbs.map((b, i) => (
                                <span key={i} className="flex items-center gap-1.5">
                                    {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />}
                                    {i < breadcrumbs.length - 1 ? (
                                        <Link href={b.href} className="text-muted-foreground hover:text-foreground transition-colors">
                                            {b.label}
                                        </Link>
                                    ) : (
                                        <span className="font-semibold text-foreground">{b.label}</span>
                                    )}
                                </span>
                            ))
                        ) : title ? (
                            <span className="font-semibold text-foreground">{title}</span>
                        ) : null}
                    </div>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Right actions */}
                    <div className="flex items-center gap-2">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher…"
                                className="h-8 w-48 pl-8 text-sm bg-muted/60 border-border/60 focus:border-border focus:bg-background"
                            />
                        </div>
                        <button className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                            <Bell className="h-4 w-4" />
                        </button>
                        {user && (
                            <Avatar className="h-7 w-7">
                                <AvatarFallback className="text-[10px] bg-primary text-primary-foreground font-semibold">
                                    {getInitials(user.name)}
                                </AvatarFallback>
                            </Avatar>
                        )}
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>

            <Toaster />
        </div>
    );
}
