import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, Clock, Loader2, MapPin, Tag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { BottomNav } from "@/components/BottomNav";
import { formatPrice } from "@/data/games";
import { countGamesOrganized, deleteGame, getGameDetail, joinGame, leaveGame } from "@/lib/queries";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/jogo/$id")({
  head: () => ({
    meta: [
      { title: "Jogo — MatchFind" },
      { name: "description", content: "Detalhes do jogo, jogadores inscritos e vagas disponíveis." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GameDetail,
});

function GameDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: game, isLoading } = useQuery({
    queryKey: ["game", id],
    queryFn: () => getGameDetail(id),
  });

  const { data: organizerGames } = useQuery({
    queryKey: ["organizer-count", game?.organizer.id],
    queryFn: () => countGamesOrganized(game!.organizer.id),
    enabled: Boolean(game?.organizer.id),
  });

  const joined = Boolean(user && game?.players.some((p) => p.id === user.id));
  const isOrganizer = Boolean(user && game && game.organizer.id === user.id);
  const free = game ? game.slots - game.taken : 0;
  const isPast = game ? game.startsAt.getTime() < Date.now() : false;

  const membership = useMutation({
    mutationFn: async () => {
      if (!user || !game) return;
      if (joined) await leaveGame(game.id, user.id);
      else await joinGame(game.id, user.id);
    },
    onSuccess: () => {
      toast.success(joined ? "Saíste do jogo." : "Estás inscrito!");
      queryClient.invalidateQueries({ queryKey: ["game", id] });
      queryClient.invalidateQueries({ queryKey: ["games"] });
      queryClient.invalidateQueries({ queryKey: ["my-games"] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
      queryClient.invalidateQueries({ queryKey: ["game", id] });
    },
  });

  const removal = useMutation({
    mutationFn: () => deleteGame(id),
    onSuccess: () => {
      toast.success("Jogo cancelado.");
      queryClient.invalidateQueries({ queryKey: ["games"] });
      queryClient.invalidateQueries({ queryKey: ["my-games"] });
      navigate({ to: "/explorar" });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-6 text-center">
        <div>
          <p className="font-display text-xl font-bold">Este jogo já não existe.</p>
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
            <Info icon={<Tag className="size-4" />} label="Preço" value={formatPrice(game.price)} />
          </section>

          {game.price > 0 && (
            <p className="rounded-2xl bg-glass px-4 py-3 text-xs text-muted-foreground ring-1 ring-border">
              O pagamento é feito diretamente ao organizador, no local.
            </p>
          )}

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
                  <span
                    className={`grid size-8 place-items-center rounded-full font-display text-[11px] font-bold ${
                      pl.id === user?.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-tint ring-1 ring-border"
                    }`}
                  >
                    {pl.initials}
                  </span>
                  <span className={`text-sm ${pl.id === user?.id ? "font-semibold text-primary" : ""}`}>
                    {pl.id === user?.id ? "Tu" : pl.name}
                    {pl.id === game.organizer.id && (
                      <span className="ml-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        organizador
                      </span>
                    )}
                  </span>
                </li>
              ))}
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
            {organizerGames !== undefined && (
              <span className="font-mono text-xs text-muted-foreground">
                {organizerGames} {organizerGames === 1 ? "jogo" : "jogos"}
              </span>
            )}
          </section>

          {isOrganizer && (
            <button
              onClick={() => {
                if (confirm("Cancelar este jogo? Os jogadores inscritos perdem a vaga.")) {
                  removal.mutate();
                }
              }}
              disabled={removal.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-destructive/10 py-3 text-sm font-semibold text-destructive ring-1 ring-destructive/30 disabled:opacity-60"
            >
              <Trash2 className="size-4" />
              Cancelar jogo
            </button>
          )}
        </main>

        <div className="fixed inset-x-0 bottom-[68px] z-30 mx-auto max-w-md px-5">
          <JoinButton
            isPast={isPast}
            full={free <= 0 && !joined}
            joined={joined}
            isOrganizer={isOrganizer}
            pending={membership.isPending}
            loggedIn={Boolean(user)}
            onJoin={() => membership.mutate()}
            onLogin={() => navigate({ to: "/entrar", search: { redirect: `/jogo/${id}` } })}
          />
        </div>

        <BottomNav />
      </div>
    </div>
  );
}

function JoinButton({
  isPast,
  full,
  joined,
  isOrganizer,
  pending,
  loggedIn,
  onJoin,
  onLogin,
}: {
  isPast: boolean;
  full: boolean;
  joined: boolean;
  isOrganizer: boolean;
  pending: boolean;
  loggedIn: boolean;
  onJoin: () => void;
  onLogin: () => void;
}) {
  const base =
    "flex w-full items-center justify-center gap-2 rounded-full py-3.5 font-display text-[15px] font-bold tracking-tight transition-transform duration-150 active:scale-[0.96] disabled:active:scale-100";
  const muted = "bg-glass-strong text-muted-foreground ring-1 ring-border backdrop-blur-lg";

  if (isPast) return <div className={`${base} ${muted}`}>Este jogo já aconteceu</div>;
  if (isOrganizer) return <div className={`${base} ${muted}`}>És o organizador deste jogo</div>;

  if (!loggedIn) {
    return (
      <button onClick={onLogin} className={`${base} bg-primary text-primary-foreground`}>
        Entrar para me juntar
      </button>
    );
  }

  if (full) return <div className={`${base} ${muted}`}>Jogo cheio</div>;

  return (
    <button
      onClick={onJoin}
      disabled={pending}
      className={`${base} ${
        joined
          ? "bg-glass-strong text-foreground ring-1 ring-border backdrop-blur-lg"
          : "bg-primary text-primary-foreground"
      } disabled:opacity-70`}
    >
      {pending && <Loader2 className="size-4 animate-spin" />}
      {joined ? "Inscrito · sair" : "Juntar-me"}
    </button>
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
