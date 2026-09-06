import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { BottomNav } from "./BottomNav";
import { useAuth } from "@/lib/auth";

export function AppShell({
  children,
  header = true,
}: {
  children: ReactNode;
  header?: ReactNode | boolean;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 mf-aurora" />
      <div className="relative mx-auto max-w-md">
        {header === true ? <AppHeader /> : header}
        {children}
        <BottomNav />
      </div>
    </div>
  );
}

export function AppHeader() {
  const { profile } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/75 backdrop-blur-xl">
      <div className="flex items-center justify-between px-5 py-3.5">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="font-display text-lg font-extrabold tracking-tight">MatchFind</span>
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-primary">beta</span>
        </Link>
        <div className="flex items-center gap-2">
          {profile ? (
            <>
              <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <MapPin className="size-3" /> {profile.city}
              </span>
              <Link
                to="/perfil"
                aria-label="O meu perfil"
                className="grid size-8 place-items-center rounded-full bg-tint font-display text-xs font-bold ring-1 ring-border"
              >
                {profile.initials}
              </Link>
            </>
          ) : (
            <Link
              to="/entrar"
              className="rounded-full bg-primary px-4 py-1.5 font-display text-xs font-bold text-primary-foreground"
            >
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
