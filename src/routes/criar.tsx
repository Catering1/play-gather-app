import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Field, inputClass } from "@/components/Field";
import { SPORTS, LEVELS, CITIES } from "@/data/games";

export const Route = createFileRoute("/criar")({
  head: () => ({
    meta: [
      { title: "Criar jogo — MatchFind" },
      {
        name: "description",
        content: "Organiza um jogo em segundos: desporto, data, local, jogadores, nível e preço.",
      },
      { property: "og:title", content: "Criar jogo — MatchFind" },
      {
        property: "og:description",
        content: "Organiza um jogo em segundos e enche a tua equipa.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Criar,
});

function Criar() {
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    sport: "Futebol",
    date: "2026-09-12",
    time: "19:00",
    venue: "",
    city: "Lisboa",
    players: 10,
    level: "Todos os níveis",
    price: 8,
  });

  const set = (k: keyof typeof form, v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <AppShell>
      <main className="space-y-6 px-5 pb-28 pt-6">
        <header>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Criar jogo</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Preenche os detalhes e publica — os jogadores aparecem sozinhos.
          </p>
        </header>

        {done ? (
          <div className="rounded-3xl bg-glass-strong p-6 text-center ring-1 ring-border backdrop-blur-lg">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-primary text-primary-foreground">
              <Check className="size-6" />
            </span>
            <h2 className="mt-4 font-display text-xl font-bold tracking-tight">Jogo publicado</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {form.sport} · {form.date} às {form.time} · {form.venue || "local por definir"},{" "}
              {form.city}
            </p>
            <button
              onClick={() => setDone(false)}
              className="mt-5 rounded-full bg-glass px-5 py-2.5 text-sm font-semibold ring-1 ring-border"
            >
              Editar detalhes
            </button>
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setDone(true);
            }}
          >
            <Field label="Desporto">
              <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                {SPORTS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => set("sport", s)}
                    className={`shrink-0 rounded-full px-4 py-2 text-sm transition-transform duration-150 active:scale-[0.94] ${
                      form.sport === s
                        ? "bg-primary font-semibold text-primary-foreground"
                        : "bg-glass font-medium ring-1 ring-border backdrop-blur-md"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Data">
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => set("date", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Hora">
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => set("time", e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Local">
              <input
                value={form.venue}
                onChange={(e) => set("venue", e.target.value)}
                placeholder="Ex: Campo da Tapada"
                className={inputClass}
              />
            </Field>

            <Field label="Cidade">
              <select
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                className={inputClass}
              >
                {CITIES.map((c) => (
                  <option key={c} className="bg-background">
                    {c}
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Jogadores">
                <input
                  type="number"
                  min={2}
                  max={22}
                  value={form.players}
                  onChange={(e) => set("players", Number(e.target.value))}
                  className={inputClass}
                />
              </Field>
              <Field label="Preço por pessoa (€)">
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={form.price}
                  onChange={(e) => set("price", Number(e.target.value))}
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Nível">
              <select
                value={form.level}
                onChange={(e) => set("level", e.target.value)}
                className={inputClass}
              >
                {LEVELS.map((l) => (
                  <option key={l} className="bg-background">
                    {l}
                  </option>
                ))}
              </select>
            </Field>

            <button
              type="submit"
              className="w-full rounded-full bg-primary py-3.5 font-display text-[15px] font-bold tracking-tight text-primary-foreground transition-transform duration-150 active:scale-[0.96]"
            >
              Publicar jogo
            </button>
          </form>
        )}
      </main>
    </AppShell>
  );
}
