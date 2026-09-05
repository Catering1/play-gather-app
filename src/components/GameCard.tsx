import { Link } from "@tanstack/react-router";
import { type Game, formatPrice } from "@/data/games";

export function GameCard({ game, delay = 0 }: { game: Game; delay?: number }) {
  const free = game.slots - game.players.length;

  return (
    <Link
      to="/jogo/$id"
      params={{ id: game.id }}
      className="block rounded-3xl bg-glass p-3 ring-1 ring-border backdrop-blur-md transition-transform duration-200 active:scale-[0.99]"
      style={{ animation: `mf-rise 600ms var(--ease-tap) ${delay}ms both` }}
    >
      <div className="relative overflow-hidden rounded-2xl">
        <img
          src={game.image}
          alt={`${game.sport} — ${game.venue}`}
          loading="lazy"
          width={1024}
          height={640}
          className="aspect-16/10 w-full object-cover"
        />
        <span className="absolute left-3 top-3 rounded-full bg-background/80 px-2.5 py-1 text-xs font-semibold backdrop-blur-md">
          {game.sport}
        </span>
      </div>
      <div className="px-2 pb-1 pt-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-base font-bold tracking-tight">{game.title}</h3>
          <span className="font-mono text-xs text-muted-foreground">
            {game.dayLabel} · {game.time}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {game.venue} · {game.city}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-mono text-xs text-muted-foreground">
            {free}/{game.slots} vagas · {game.level}
          </span>
          <span className="font-mono text-xs text-foreground">{formatPrice(game.price)}</span>
        </div>
      </div>
    </Link>
  );
}
