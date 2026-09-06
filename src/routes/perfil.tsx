import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, LogOut, Pencil } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { RequireAuth } from "@/components/RequireAuth";
import { Field, inputClass } from "@/components/Field";
import { CITIES } from "@/data/games";
import { listGamesForPlayer, updateProfile } from "@/lib/queries";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "O meu perfil — MatchFind" },
      { name: "description", content: "As tuas estatísticas e definições de conta." },
      { property: "og:type", content: "profile" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <Perfil />
    </RequireAuth>
  ),
});

function Perfil() {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);

  const { data: games = [] } = useQuery({
    queryKey: ["my-games", user?.id],
    queryFn: () => listGamesForPlayer(user!.id),
    enabled: Boolean(user),
  });

  const now = Date.now();
  const upcoming = games.filter((g) => g.startsAt.getTime() >= now);
  const organized = games.filter((g) => g.organizer.id === user?.id);

  const favourite = (() => {
    const counts = new Map<string, number>();
    for (const g of games) counts.set(g.sport, (counts.get(g.sport) ?? 0) + 1);
    const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    return best?.[0] ?? "—";
  })();

  const stats = [
    { label: "Jogos", value: String(games.length) },
    { label: "Organizados", value: String(organized.length) },
    { label: "Próximos", value: String(upcoming.length) },
    { label: "Favorito", value: favourite },
  ];

  if (!profile) {
    return (
      <AppShell>
        <div className="grid min-h-[60vh] place-items-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <main className="space-y-7 px-5 pb-28 pt-6">
        <header className="flex items-center gap-4">
          <span className="grid size-16 place-items-center rounded-full bg-tint font-display text-xl font-extrabold ring-1 ring-border">
            {profile.initials}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-2xl font-extrabold tracking-tight">
              {profile.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {profile.city} · membro desde {profile.memberSince}
            </p>
          </div>
          <button
            onClick={() => setEditing((v) => !v)}
            aria-label="Editar perfil"
            className="grid size-9 shrink-0 place-items-center rounded-full bg-glass ring-1 ring-border"
          >
            <Pencil className="size-4" />
          </button>
        </header>

        {editing ? (
          <EditForm
            initial={{ name: profile.name, city: profile.city, bio: profile.bio ?? "" }}
            onCancel={() => setEditing(false)}
            onSaved={async () => {
              await refreshProfile();
              queryClient.invalidateQueries({ queryKey: ["games"] });
              setEditing(false);
            }}
            userId={profile.id}
          />
        ) : (
          profile.bio && <p className="text-sm text-muted-foreground">{profile.bio}</p>
        )}

        <section className="grid grid-cols-2 gap-2">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl bg-glass p-4 ring-1 ring-border backdrop-blur-md"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {s.label}
              </p>
              <p className="mt-1 truncate font-display text-2xl font-extrabold tracking-tight text-primary">
                {s.value}
              </p>
            </div>
          ))}
        </section>

        <button
          onClick={async () => {
            await signOut();
            queryClient.clear();
            navigate({ to: "/" });
          }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-glass py-3 text-sm font-semibold text-muted-foreground ring-1 ring-border"
        >
          <LogOut className="size-4" />
          Sair da conta
        </button>
      </main>
    </AppShell>
  );
}

function EditForm({
  initial,
  userId,
  onCancel,
  onSaved,
}: {
  initial: { name: string; city: string; bio: string };
  userId: string;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState(initial);

  const save = useMutation({
    mutationFn: () =>
      updateProfile(userId, {
        name: form.name.trim(),
        city: form.city,
        bio: form.bio.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success("Perfil atualizado.");
      onSaved();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <form
      className="space-y-4 rounded-3xl bg-glass p-4 ring-1 ring-border backdrop-blur-md"
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
    >
      <Field label="Nome">
        <input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
          minLength={2}
          maxLength={60}
          className={inputClass}
        />
      </Field>
      <Field label="Cidade">
        <select
          value={form.city}
          onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
          className={inputClass}
        >
          {CITIES.map((c) => (
            <option key={c} className="bg-background">
              {c}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Sobre ti">
        <textarea
          value={form.bio}
          onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
          maxLength={200}
          rows={3}
          placeholder="Ex: Médio defensivo aos fins de semana."
          className={inputClass}
        />
      </Field>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-full bg-glass py-3 text-sm font-semibold ring-1 ring-border"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={save.isPending}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-3 font-display text-sm font-bold text-primary-foreground disabled:opacity-60"
        >
          {save.isPending && <Loader2 className="size-4 animate-spin" />}
          Guardar
        </button>
      </div>
    </form>
  );
}
