import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { GameCard } from "@/components/GameCard";
import { SPORTS, CITIES, DEFAULT_CITY, type Sport } from "@/data/games";
import { listGames } from "@/lib/queries";
import { useAuth } from "@/lib/auth";
import { todayLabel } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MatchFind — Encontra o teu próximo jogo" },
      {
        name: "description",
        content:
          "Encontra e organiza jogos de futebol, ténis, ping pong, basquetebol, badminton e voleibol perto de ti.",
      },
      { property: "og:title", content: "MatchFind — Encontra o teu próximo jogo" },
      {
        property: "og:description",
        content: "Jogos desportivos amadores perto de ti, todos os dias.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const STEPS = [
  { n: "01", strong: "Escolhe a modalidade", rest: " e a zona onde queres jogar." },
  { n: "02", strong: "Junta-te ao jogo", rest: " e confirma a tua vaga." },
  { n: "03", strong: "Apita-se o início", rest: ", entras em campo e jogas." },
];

const WHENS = ["Todos", "Hoje", "Amanhã", "Esta semana"] as const;

function Home() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [sport, setSport] = useState<Sport | "Todas">("Todas");
  const [city, setCity] = useState(profile?.city ?? DEFAULT_CITY);
  const [when, setWhen] = useState<(typeof WHENS)[number]>("Todos");
  const [query, setQuery] = useState("");

  const { data: games = [], isLoading } = useQuery({
    queryKey: ["games", "home", city],
    queryFn: () => listGames({ city, limit: 50 }),
  });

  const recommended = games.filter((g) => sport === "Todas" || g.sport === sport).slice(0, 3);

  return (
    <AppShell>
      <main className="space-y-9 px-5 pb-28 pt-6">
        <section style={{ animation: "mf-rise 600ms var(--ease-tap) both" }}>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            {todayLabel()} · {isLoading ? "…" : games.length}{" "}
            {games.length === 1 ? "jogo" : "jogos"} em {city}
          </p>
          <h1 className="mt-3 text-balance font-display text-[40px] font-extrabold leading-[0.95] tracking-tight">
            Encontra o teu próximo jogo.
          </h1>
          <p className="mt-3 max-w-[30ch] text-pretty text-sm text-muted-foreground">
            Do golo ao ponto, do saque ao ace. Joga perto de ti, hoje ou esta semana.
          </p>

          <form
            className="mt-5 space-y-2.5"
            onSubmit={(e) => {
              e.preventDefault();
              const search: { q?: string; city: string; when: typeof when; sport?: Sport } = {
                city,
                when,
              };
              if (query.trim()) search.q = query.trim();
              if (sport !== "Todas") search.sport = sport;
              navigate({ to: "/explorar", search });
            }}
          >
            <div className="flex items-center gap-2.5 rounded-full bg-glass px-4 py-3 ring-1 ring-border backdrop-blur-md">
              <Search className="size-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Local, clube ou modalidade…"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="rounded-2xl bg-glass px-4 py-3 text-sm ring-1 ring-border backdrop-blur-md outline-none"
              >
                {CITIES.map((c) => (
                  <option key={c} className="bg-background">
                    {c}
                  </option>
                ))}
              </select>
              <select
                value={when}
                onChange={(e) => setWhen(e.target.value as (typeof WHENS)[number])}
                className="rounded-2xl bg-glass px-4 py-3 text-sm ring-1 ring-border backdrop-blur-md outline-none"
              >
                {WHENS.map((d) => (
                  <option key={d} className="bg-background">
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-primary py-3 font-display text-sm font-bold tracking-tight text-primary-foreground transition-transform duration-150 active:scale-[0.97]"
            >
              Procurar jogos
            </button>
          </form>
        </section>

        <section style={{ animation: "mf-rise 600ms var(--ease-tap) 80ms both" }}>
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {(["Todas", ...SPORTS] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSport(s)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm transition-transform duration-150 active:scale-[0.94] ${
                  sport === s
                    ? "bg-primary font-semibold text-primary-foreground"
                    : "bg-glass font-medium text-foreground ring-1 ring-border backdrop-blur-md"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-base font-bold tracking-tight">Em destaque</h2>
            <Link
              to="/explorar"
              className="font-mono text-[10px] uppercase tracking-widest text-primary"
            >
              Ver todos
            </Link>
          </div>
          <div className="space-y-3">
            {isLoading && (
              <div className="grid place-items-center rounded-2xl bg-glass p-8 ring-1 ring-border">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            )}
            {!isLoading && recommended.map((g, i) => <GameCard key={g.id} game={g} delay={i * 70} />)}
            {!isLoading && recommended.length === 0 && (
              <div className="rounded-2xl bg-glass p-5 text-center ring-1 ring-border">
                <p className="text-sm text-muted-foreground">
                  Ainda não há jogos {sport === "Todas" ? "" : `de ${sport} `}em {city}.
                </p>
                <Link
                  to="/criar"
                  className="mt-3 inline-block rounded-full bg-primary px-5 py-2.5 font-display text-sm font-bold text-primary-foreground"
                >
                  Sê o primeiro a criar um
                </Link>
              </div>
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-display text-lg font-bold tracking-tight">Como funciona</h2>
          <div className="space-y-3">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="flex items-start gap-4 rounded-2xl bg-glass p-4 ring-1 ring-border backdrop-blur-md"
              >
                <span className="font-mono text-sm font-medium text-primary">{s.n}</span>
                <p className="text-sm leading-snug">
                  <span className="font-semibold">{s.strong}</span>
                  {s.rest}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </AppShell>
  );
}
