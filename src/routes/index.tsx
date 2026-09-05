import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { GameCard } from "@/components/GameCard";
import { GAMES, SPORTS, CITIES, type Sport } from "@/data/games";

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

function Home() {
  const navigate = useNavigate();
  const [sport, setSport] = useState<Sport | "Todas">("Todas");
  const [city, setCity] = useState("Lisboa");
  const [day, setDay] = useState("Hoje");
  const [query, setQuery] = useState("");

  const recommended = GAMES.filter((g) => sport === "Todas" || g.sport === sport).slice(0, 3);

  return (
    <AppShell>
      <main className="space-y-9 px-5 pb-28 pt-6">
        <section style={{ animation: "mf-rise 600ms var(--ease-tap) both" }}>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            sábado · {GAMES.length} jogos em {city}
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
              navigate({ to: "/explorar" });
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
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="rounded-2xl bg-glass px-4 py-3 text-sm ring-1 ring-border backdrop-blur-md outline-none"
              >
                {["Hoje", "Amanhã", "Este fim de semana", "Esta semana"].map((d) => (
                  <option key={d} className="bg-background">
                    {d}
                  </option>
                ))}
              </select>
            </div>
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
            {recommended.map((g, i) => (
              <GameCard key={g.id} game={g} delay={i * 70} />
            ))}
            {recommended.length === 0 && (
              <p className="rounded-2xl bg-glass p-4 text-sm text-muted-foreground ring-1 ring-border">
                Ainda não há jogos desta modalidade por aqui.
              </p>
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
