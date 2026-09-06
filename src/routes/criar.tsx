import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { RequireAuth } from "@/components/RequireAuth";
import { Field, inputClass } from "@/components/Field";
import { SPORTS, LEVELS, CITIES, DEFAULT_CITY, type Level, type Sport } from "@/data/games";
import { createGame } from "@/lib/queries";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/criar")({
  head: () => ({
    meta: [
      { title: "Criar jogo — MatchFind" },
      {
        name: "description",
        content: "Organiza um jogo em segundos: desporto, data, local, jogadores, nível e preço.",
      },
      { property: "og:title", content: "Criar jogo — MatchFind" },
      { property: "og:description", content: "Organiza um jogo em segundos e enche a tua equipa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <Criar />
    </RequireAuth>
  ),
});

function tomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function Criar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();

  const [form, setForm] = useState({
    title: "",
    sport: "Futebol" as Sport,
    date: tomorrow(),
    time: "19:00",
    venue: "",
    city: profile?.city ?? DEFAULT_CITY,
    players: 10,
    level: "Todos os níveis" as Level,
    price: 8,
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const create = useMutation({
    mutationFn: () =>
      createGame(
        {
          title: form.title,
          sport: form.sport,
          date: form.date,
          time: form.time,
          venue: form.venue,
          city: form.city,
          slots: form.players,
          level: form.level,
          price: form.price,
        },
        user!.id,
      ),
    onSuccess: (id) => {
      toast.success("Jogo publicado!");
      queryClient.invalidateQueries({ queryKey: ["games"] });
      queryClient.invalidateQueries({ queryKey: ["my-games"] });
      navigate({ to: "/jogo/$id", params: { id } });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <AppShell>
      <main className="space-y-6 px-5 pb-28 pt-6">
        <header>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Criar jogo</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Preenche os detalhes e publica — ficas automaticamente inscrito.
          </p>
        </header>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate();
          }}
        >
          <Field label="Nome do jogo">
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              required
              minLength={3}
              maxLength={80}
              placeholder="Ex: Futsal 5×5 de quinta"
              className={inputClass}
            />
          </Field>

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
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => set("date", e.target.value)}
                required
                className={inputClass}
              />
            </Field>
            <Field label="Hora">
              <input
                type="time"
                value={form.time}
                onChange={(e) => set("time", e.target.value)}
                required
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Local">
            <input
              value={form.venue}
              onChange={(e) => set("venue", e.target.value)}
              required
              minLength={2}
              maxLength={120}
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
                max={40}
                value={form.players}
                onChange={(e) => set("players", Number(e.target.value))}
                required
                className={inputClass}
              />
            </Field>
            <Field label="Preço por pessoa (€)">
              <input
                type="number"
                min={0}
                max={200}
                step="0.5"
                value={form.price}
                onChange={(e) => set("price", Number(e.target.value))}
                required
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Nível">
            <select
              value={form.level}
              onChange={(e) => set("level", e.target.value as Level)}
              className={inputClass}
            >
              {LEVELS.map((l) => (
                <option key={l} className="bg-background">
                  {l}
                </option>
              ))}
            </select>
          </Field>

          <p className="text-xs text-muted-foreground">
            O dinheiro é entregue a ti no local — a app não trata de pagamentos.
          </p>

          <button
            type="submit"
            disabled={create.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 font-display text-[15px] font-bold tracking-tight text-primary-foreground transition-transform duration-150 active:scale-[0.96] disabled:opacity-60"
          >
            {create.isPending && <Loader2 className="size-4 animate-spin" />}
            Publicar jogo
          </button>
        </form>
      </main>
    </AppShell>
  );
}
