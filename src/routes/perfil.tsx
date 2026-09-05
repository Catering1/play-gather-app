import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { GameCard } from "@/components/GameCard";
import { USER, UPCOMING, HISTORY } from "@/data/user";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "O meu perfil — MatchFind" },
      {
        name: "description",
        content: "Estatísticas, próximos jogos e histórico das tuas partidas no MatchFind.",
      },
      { property: "og:title", content: "O meu perfil — MatchFind" },
      {
        property: "og:description",
        content: "Estatísticas, próximos jogos e histórico das tuas partidas.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Perfil,
});

function Perfil() {
  return (
    <AppShell>
      <main className="space-y-7 px-5 pb-28 pt-6">
        <header className="flex items-center gap-4">
          <span className="grid size-16 place-items-center rounded-full bg-tint font-display text-xl font-extrabold ring-1 ring-border">
            {USER.initials}
          </span>
          <div>
            <h1 className="font-display text-2xl font-extrabold tracking-tight">{USER.name}</h1>
            <p className="text-sm text-muted-foreground">
              {USER.city} · membro desde {USER.memberSince}
            </p>
          </div>
        </header>

        <p className="text-sm text-muted-foreground">{USER.bio}</p>

        <section className="grid grid-cols-2 gap-2">
          {USER.stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl bg-glass p-4 ring-1 ring-border backdrop-blur-md"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {s.label}
              </p>
              <p className="mt-1 font-display text-2xl font-extrabold tracking-tight text-primary">
                {s.value}
              </p>
            </div>
          ))}
        </section>

        <section>
          <h2 className="mb-3 font-display text-base font-bold tracking-tight">Próximos jogos</h2>
          <div className="space-y-3">
            {UPCOMING.map((g, i) => (
              <GameCard key={g.id} game={g} delay={i * 70} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-display text-base font-bold tracking-tight">Histórico</h2>
          <ul className="space-y-2">
            {HISTORY.map((h) => (
              <li
                key={h.id}
                className="flex items-center justify-between rounded-2xl bg-glass p-4 ring-1 ring-border backdrop-blur-md"
              >
                <div>
                  <p className="text-sm font-semibold">{h.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {h.sport} · {h.date}
                  </p>
                </div>
                <span
                  className={`font-mono text-xs ${
                    h.result.startsWith("Vitória") ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {h.result}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </AppShell>
  );
}
