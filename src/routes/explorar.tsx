import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { List, Loader2, MapPin, Search } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { GameCard } from "@/components/GameCard";
import { ClientOnly } from "@/components/ClientOnly";
import { SPORTS, LEVELS, CITIES, type Sport, type Level } from "@/data/games";
import { listGames } from "@/lib/queries";

// Import dinâmico: o Leaflet acede a `window` assim que é carregado, o que
// rebenta na renderização no servidor. Isto isola-o num chunk à parte que só
// é pedido no browser, quando o utilizador muda para o modo mapa.
const MapView = lazy(() => import("@/components/MapView").then((m) => ({ default: m.MapView })));

function MapFallback() {
  return (
    <div className="grid h-[60vh] place-items-center rounded-3xl bg-glass ring-1 ring-border">
      <Loader2 className="size-5 animate-spin text-muted-foreground" />
    </div>
  );
}

const WHENS = ["Todos", "Hoje", "Amanhã", "Esta semana"] as const;
type When = (typeof WHENS)[number];

type ExplorarSearch = {
  q?: string;
  city?: string;
  when?: When;
  sport?: Sport;
  level?: Level;
  maxPrice?: number;
};

export const Route = createFileRoute("/explorar")({
  validateSearch: (search: Record<string, unknown>): ExplorarSearch => {
    const out: ExplorarSearch = {};
    const q = search["q"];
    if (typeof q === "string" && q.trim()) out.q = q.slice(0, 60);
    if (CITIES.includes(search["city"] as string)) out.city = search["city"] as string;
    if (WHENS.includes(search["when"] as When)) out.when = search["when"] as When;
    if (SPORTS.includes(search["sport"] as Sport)) out.sport = search["sport"] as Sport;
    if (LEVELS.includes(search["level"] as Level)) out.level = search["level"] as Level;
    const price = search["maxPrice"];
    if (price !== undefined && Number.isFinite(Number(price))) {
      out.maxPrice = Math.min(Math.max(Number(price), 0), 50);
    }
    return out;
  },
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

function Explorar() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/explorar" });

  const maxPrice = search.maxPrice ?? 50;
  const [term, setTerm] = useState(search.q ?? "");
  const [view, setView] = useState<"list" | "map">("list");

  // Um valor undefined no patch significa "tirar este filtro" — as chaves
  // vazias são removidas para não ficarem no endereço da página.
  const setFilter = (patch: { [K in keyof ExplorarSearch]?: ExplorarSearch[K] | undefined }) =>
    navigate({
      search: (prev) => {
        const merged: Record<string, unknown> = { ...prev, ...patch };
        for (const key of Object.keys(merged)) {
          if (merged[key] === undefined) delete merged[key];
        }
        return merged as ExplorarSearch;
      },
      replace: true,
    });

  // Espera 400ms depois da última tecla antes de procurar, para não
  // disparar um pedido à base de dados por cada letra escrita.
  useEffect(() => {
    const id = setTimeout(() => {
      const next = term.trim() || undefined;
      if (next !== search.q) setFilter({ q: next });
    }, 400);
    return () => clearTimeout(id);
  }, [term]);

  const { data: results = [], isLoading } = useQuery({
    queryKey: ["games", "explorar", search],
    queryFn: () =>
      listGames({
        search: search.q,
        city: search.city,
        when: search.when,
        sport: search.sport,
        level: search.level,
        maxPrice: search.maxPrice,
      }),
  });

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

        <div className="flex items-center gap-2.5 rounded-full bg-glass px-4 py-3 ring-1 ring-border backdrop-blur-md">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Local, clube ou nome do jogo…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {(["Todas", ...SPORTS] as const).map((s) => {
            const active = s === "Todas" ? !search.sport : search.sport === s;
            return (
              <button
                key={s}
                onClick={() => setFilter({ sport: s === "Todas" ? undefined : s })}
                className={`shrink-0 rounded-full px-4 py-2 text-sm transition-transform duration-150 active:scale-[0.94] ${
                  active
                    ? "bg-primary font-semibold text-primary-foreground"
                    : "bg-glass font-medium text-foreground ring-1 ring-border backdrop-blur-md"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <select
            value={search.when ?? "Todos"}
            onChange={(e) =>
              setFilter({ when: e.target.value === "Todos" ? undefined : (e.target.value as When) })
            }
            className={selectClass}
          >
            {WHENS.map((d) => (
              <option key={d} className="bg-background">
                {d}
              </option>
            ))}
          </select>
          <select
            value={search.city ?? "Todas"}
            onChange={(e) =>
              setFilter({ city: e.target.value === "Todas" ? undefined : e.target.value })
            }
            className={selectClass}
          >
            {["Todas", ...CITIES].map((c) => (
              <option key={c} className="bg-background">
                {c}
              </option>
            ))}
          </select>
          <select
            value={search.level ?? "Todos"}
            onChange={(e) =>
              setFilter({
                level: e.target.value === "Todos" ? undefined : (e.target.value as Level),
              })
            }
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
            <span className="font-mono text-xs">
              {maxPrice === 0 ? "Grátis" : maxPrice >= 50 ? "Qualquer" : `${maxPrice}€`}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={50}
            step={1}
            value={maxPrice}
            onChange={(e) =>
              setFilter({
                maxPrice: Number(e.target.value) >= 50 ? undefined : Number(e.target.value),
              })
            }
            className="mt-3 w-full accent-[var(--primary)]"
          />
        </div>

        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {isLoading
              ? "a procurar…"
              : `${results.length} ${results.length === 1 ? "jogo" : "jogos"}`}
          </p>
          <div className="flex gap-1 rounded-full bg-glass p-1 ring-1 ring-border backdrop-blur-md">
            <button
              type="button"
              onClick={() => setView("list")}
              aria-pressed={view === "list"}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-transform duration-150 active:scale-[0.94] ${
                view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              <List className="size-3.5" /> Lista
            </button>
            <button
              type="button"
              onClick={() => setView("map")}
              aria-pressed={view === "map"}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-transform duration-150 active:scale-[0.94] ${
                view === "map" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              <MapPin className="size-3.5" /> Mapa
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="grid place-items-center rounded-2xl bg-glass p-8 ring-1 ring-border">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && view === "map" && (
          <ClientOnly fallback={<MapFallback />}>
            <Suspense fallback={<MapFallback />}>
              <MapView games={results} city={search.city} />
            </Suspense>
          </ClientOnly>
        )}

        {!isLoading && view === "list" && (
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
                <Link
                  to="/criar"
                  className="mt-4 inline-block rounded-full bg-primary px-5 py-2.5 font-display text-sm font-bold text-primary-foreground"
                >
                  Criar um jogo
                </Link>
              </div>
            )}
          </div>
        )}
      </main>
    </AppShell>
  );
}
