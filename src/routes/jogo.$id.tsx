import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, CalendarDays, Clock, MapPin, Star } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { getGame, formatPrice } from "@/data/games";

export const Route = createFileRoute("/jogo/$id")({
  loader: ({ params }) => {
    const game = getGame(params.id);
    if (!game) throw notFound();
    return { game };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Jogo indisponível — MatchFind" }, { name: "robots", content: "noindex" }],
      };
    }
    const { game } = loaderData;
    const title = `${game.title} · ${game.venue} — MatchFind`;
    const description = `${game.sport} em ${game.city}, ${game.dayLabel} às ${game.time}. ${formatPrice(game.price)}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  errorComponent: () => <Fallback text="Não conseguimos carregar este jogo." />,
  notFoundComponent: () => <Fallback text="Este jogo já não existe." />,
  component: GameDetail,
});

function Fallback({ text }: { text: string }) {
  return (
    <div className="grid min-h-screen place-items-center bg-background px-6 text-center">
      <div>
        <p className="font-display text-xl font-bold">{text}</p>
        <Link
          to="/explorar"
          className="mt-4 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Ver outros jogos
        </Link>
      </div>
    </div>
  );
}

function GameDetail() {
  const { game } = Route.useLoaderData();
  const [joined, setJoined] = useState(false);
  const free = game.slots - game.players.length - (joined ? 1 : 0);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 mf-aurora" />
      <div className="relative mx-auto max-w-md pb-40">
        <div className="relative">
          <img
            src={game.image}
            alt={`${game.sport} em ${game.venue}`}
            width={1024}
            height={640}
            className="aspect-4/3 w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
          <Link
            to="/explorar"
            aria-label="Voltar"
            className="absolute left-4 top-4 grid size-10 place-items-center rounded-full bg-background/70 ring-1 ring-border backdrop-blur-md"
          >
            <ArrowLeft className="size-5" />
          </Link>
        </div>

        <main className="-mt-8 space-y-5 px-5">
          <section>
            <span className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary">
              {game.sport}
            </span>
            <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight">
              {game.title}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{game.level}</p>
          </section>

          <section className="grid grid-cols-3 gap-2">
            <Info icon={<CalendarDays className="size-4" />} label="Data" value={game.dayLabel} />
            <Info icon={<Clock className="size-4" />} label="Hora" value={game.time} />
            <Info
              icon={<Star className="size-4" />}
              label="Preço"
              value={formatPrice(game.price)}
            />
          </section>

          <section className="flex items-start gap-3 rounded-2xl bg-glass p-4 ring-1 ring-border backdrop-blur-md">
            <MapPin className="mt-0.5 size-4 text-primary" />
            <div>
              <p className="text-sm font-semibold">{game.venue}</p>
              <p className="text-sm text-muted-foreground">{game.city}</p>
            </div>
          </section>

          <section className="rounded-3xl bg-glass p-4 ring-1 ring-border backdrop-blur-md">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold tracking-tight">Jogadores</h2>
              <span className="font-mono text-xs text-muted-foreground">
                {free} {free === 1 ? "vaga" : "vagas"} de {game.slots}
              </span>
            </div>
            <ul className="mt-3 space-y-2">
              {game.players.map((pl) => (
                <li key={pl.id} className="flex items-center gap-3">
                  <span className="grid size-8 place-items-center rounded-full bg-tint font-display text-[11px] font-bold ring-1 ring-border">
                    {pl.initials}
                  </span>
                  <span className="text-sm">{pl.name}</span>
                </li>
              ))}
              {joined && (
                <li className="flex items-center gap-3">
                  <span className="grid size-8 place-items-center rounded-full bg-primary font-display text-[11px] font-bold text-primary-foreground">
                    TU
                  </span>
                  <span className="text-sm font-semibold text-primary">Tu (inscrito)</span>
                </li>
              )}
            </ul>
          </section>

          <section className="flex items-center justify-between rounded-3xl bg-glass-strong p-4 ring-1 ring-border backdrop-blur-lg">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-tint font-display text-xs font-bold ring-1 ring-border">
                {game.organizer.initials}
              </span>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Organizador
                </p>
                <p className="text-sm font-semibold">{game.organizer.name}</p>
              </div>
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              ★ {game.organizer.rating} · {game.organizer.games} jogos
            </span>
          </section>
        </main>

        <div className="fixed inset-x-0 bottom-[68px] z-30 mx-auto max-w-md px-5">
          <button
            onClick={() => setJoined((v) => !v)}
            className={`w-full rounded-full py-3.5 font-display text-[15px] font-bold tracking-tight transition-transform duration-150 active:scale-[0.96] ${
              joined
                ? "bg-glass-strong text-foreground ring-1 ring-border backdrop-blur-lg"
                : "bg-primary text-primary-foreground"
            }`}
          >
            {joined ? "Inscrito · anular" : "Juntar-me"}
          </button>
        </div>

        <BottomNav />
      </div>
    </div>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-glass p-3 ring-1 ring-border backdrop-blur-md">
      <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
        {icon}
        {label}
      </span>
      <p className="mt-1 font-display text-base font-bold tracking-tight">{value}</p>
    </div>
  );
}
