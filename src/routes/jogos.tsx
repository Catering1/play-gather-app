import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { RequireAuth } from "@/components/RequireAuth";
import { GameCard } from "@/components/GameCard";
import { formatPrice } from "@/data/games";
import { listGamesForPlayer } from "@/lib/queries";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/jogos")({
  head: () => ({
    meta: [
      { title: "Os meus jogos — MatchFind" },
      { name: "description", content: "Os teus próximos jogos e o teu histórico." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <MeusJogos />
    </RequireAuth>
  ),
});

function MeusJogos() {
  const { user } = useAuth();

  const { data: games = [], isLoading } = useQuery({
    queryKey: ["my-games", user?.id],
    queryFn: () => listGamesForPlayer(user!.id),
    enabled: Boolean(user),
  });

  const now = Date.now();
  const upcoming = games.filter((g) => g.startsAt.getTime() >= now);
  const past = games
    .filter((g) => g.startsAt.getTime() < now)
    .sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime());

  return (
    <AppShell>
      <main className="space-y-7 px-5 pb-28 pt-6">
        <header>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Os meus jogos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tudo onde estás inscrito, do próximo ao último.
          </p>
        </header>

        {isLoading && (
          <div className="grid place-items-center rounded-2xl bg-glass p-8 ring-1 ring-border">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && games.length === 0 && (
          <div className="rounded-3xl bg-glass p-6 text-center ring-1 ring-border backdrop-blur-md">
            <p className="font-display text-base font-bold">Ainda não tens jogos</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Junta-te a um jogo existente ou organiza o teu.
            </p>
            <div className="mt-4 flex gap-2">
              <Link
                to="/explorar"
                className="flex-1 rounded-full bg-primary py-2.5 font-display text-sm font-bold text-primary-foreground"
              >
                Explorar
              </Link>
              <Link
                to="/criar"
                className="flex-1 rounded-full bg-glass py-2.5 font-display text-sm font-bold ring-1 ring-border"
              >
                Criar jogo
              </Link>
            </div>
          </div>
        )}

        {upcoming.length > 0 && (
          <section>
            <h2 className="mb-3 font-display text-base font-bold tracking-tight">Próximos jogos</h2>
            <div className="space-y-3">
              {upcoming.map((g, i) => (
                <GameCard key={g.id} game={g} delay={i * 70} />
              ))}
            </div>
          </section>
        )}

        {past.length > 0 && (
          <section>
            <h2 className="mb-3 font-display text-base font-bold tracking-tight">Histórico</h2>
            <ul className="space-y-2">
              {past.map((g) => (
                <li
                  key={g.id}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-glass p-4 ring-1 ring-border backdrop-blur-md"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{g.title}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {g.sport} · {g.venue}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">
                    {g.dayLabel} · {formatPrice(g.price)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </AppShell>
  );
}
