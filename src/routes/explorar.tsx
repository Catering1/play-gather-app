import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { GameCard } from "@/components/GameCard";
import { GAMES, SPORTS, LEVELS, CITIES, type Sport, type Level } from "@/data/games";

export const Route = createFileRoute("/explorar")({
  head: () => ({
    meta: [
      { title: "Explorar jogos — MatchFind" },
      {
        name: "description",
        content: "Filtra jogos por desporto, data, localização, nível e preço.",
      },
      { property: "og:title", content: "Explorar jogos — MatchFind" },
      {
        property: "og:description",
        content: "Filtra jogos por desporto, data, localização, nível e preço.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Explorar,
});

const DAYS = ["Todos", "Hoje", "Amanhã", "Domingo", "Segunda"];

function Explorar() {
  const [sport, setSport] = useState<Sport | "Todas">("Todas");
  const [day, setDay] = useState("Todos");
  const [city, setCity] = useState("Todas");
  const [level, setLevel] = useState<Level | "Todos">("Todos");
  const [maxPrice, setMaxPrice] = useState(20);

  const results = useMemo(
    () =>
      GAMES.filter(
        (g) =>
          (sport === "Todas" || g.sport === sport) &&
          (day === "Todos" || g.dayLabel === day) &&
          (city === "Todas" || g.city === city) &&
          (level === "Todos" || g.level === level) &&
          g.price <= maxPrice,
      ),
    [sport, day, city, level, maxPrice],
  );

  const selectClass =
    "rounded-2xl bg-glass px-3 py-2.5 text-sm ring-1 ring-border backdrop-blur-md outline-none";

  return (
    <AppShell>
      <main className="space-y-6 px-5 pb-28 pt-6">
        <header>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Explorar</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Encontra o jogo certo com os filtros abaixo.
          </p>
        </header>

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

        <div className="grid grid-cols-3 gap-2">
          <select value={day} onChange={(e) => setDay(e.target.value)} className={selectClass}>
            {DAYS.map((d) => (
              <option key={d} className="bg-background">
                {d}
              </option>
            ))}
          </select>
          <select value={city} onChange={(e) => setCity(e.target.value)} className={selectClass}>
            {["Todas", ...CITIES].map((c) => (
              <option key={c} className="bg-background">
                {c}
              </option>
            ))}
          </select>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as Level | "Todos")}
            className={selectClass}
          >
            {["Todos", ...LEVELS].map((l) => (
              <option key={l} className="bg-background">
                {l}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-2xl bg-glass p-4 ring-1 ring-border backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Preço máximo
            </span>
            <span className="font-mono text-xs">{maxPrice === 0 ? "Grátis" : `${maxPrice}€`}</span>
          </div>
          <input
            type="range"
            min={0}
            max={20}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="mt-3 w-full accent-[var(--primary)]"
          />
        </div>

        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {results.length} {results.length === 1 ? "jogo" : "jogos"}
        </p>

        <div className="space-y-3">
          {results.map((g, i) => (
            <GameCard key={g.id} game={g} delay={i * 60} />
          ))}
          {results.length === 0 && (
            <div className="rounded-3xl bg-glass p-6 text-center ring-1 ring-border backdrop-blur-md">
              <p className="font-display text-base font-bold">Sem jogos com estes filtros</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Alarga a data, o nível ou o preço para veres mais opções.
              </p>
            </div>
          )}
        </div>
      </main>
    </AppShell>
  );
}
