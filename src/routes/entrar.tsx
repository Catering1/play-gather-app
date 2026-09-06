import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Field, inputClass } from "@/components/Field";
import { CITIES, DEFAULT_CITY } from "@/data/games";
import { signIn, signUp, useAuth } from "@/lib/auth";

export const Route = createFileRoute("/entrar")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => {
    // Só caminhos internos: evita que um link malicioso reencaminhe para fora do site.
    const target = search["redirect"];
    return typeof target === "string" && target.startsWith("/") && !target.startsWith("//")
      ? { redirect: target }
      : {};
  },
  head: () => ({
    meta: [
      { title: "Entrar — MatchFind" },
      { name: "description", content: "Entra ou cria conta para te juntares a jogos." },
    ],
  }),
  component: Entrar,
});

function Entrar() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [mode, setMode] = useState<"entrar" | "criar">("entrar");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState(DEFAULT_CITY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmEmail, setConfirmEmail] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: redirect ?? "/", replace: true });
  }, [user, redirect, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "entrar") {
        await signIn(email, password);
      } else {
        const { needsEmailConfirmation } = await signUp({ email, password, name, city });
        if (needsEmailConfirmation) setConfirmEmail(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo correu mal. Tenta outra vez.");
    } finally {
      setBusy(false);
    }
  }

  if (authLoading) {
    return (
      <Screen>
        <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground" />
      </Screen>
    );
  }

  if (confirmEmail) {
    return (
      <Screen>
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Confirma o teu email</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enviámos um link para <span className="text-foreground">{email}</span>. Abre-o e depois
          volta aqui para entrares.
        </p>
        <button
          onClick={() => {
            setConfirmEmail(false);
            setMode("entrar");
          }}
          className="mt-6 w-full rounded-full bg-primary py-3.5 font-display text-[15px] font-bold text-primary-foreground"
        >
          Já confirmei
        </button>
      </Screen>
    );
  }

  return (
    <Screen>
      <Link to="/" className="flex items-baseline gap-2">
        <span className="font-display text-2xl font-extrabold tracking-tight">MatchFind</span>
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-primary">beta</span>
      </Link>

      <h1 className="mt-6 font-display text-2xl font-extrabold tracking-tight">
        {mode === "entrar" ? "Bem-vindo de volta." : "Cria a tua conta."}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {mode === "entrar"
          ? "Entra para te juntares a jogos e organizares os teus."
          : "Demora menos de um minuto e é grátis."}
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        {mode === "criar" && (
          <>
            <Field label="Nome">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                autoComplete="name"
                placeholder="Ex: João Ferreira"
                className={inputClass}
              />
            </Field>
            <Field label="Cidade">
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={inputClass}
              >
                {CITIES.map((c) => (
                  <option key={c} className="bg-background">
                    {c}
                  </option>
                ))}
              </select>
            </Field>
          </>
        )}

        <Field label="Email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="tu@exemplo.pt"
            className={inputClass}
          />
        </Field>

        <Field label="Palavra-passe">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={mode === "entrar" ? "current-password" : "new-password"}
            placeholder="Pelo menos 6 caracteres"
            className={inputClass}
          />
        </Field>

        {error && (
          <p className="rounded-2xl bg-destructive/15 px-4 py-3 text-sm text-destructive">{error}</p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 font-display text-[15px] font-bold tracking-tight text-primary-foreground transition-transform duration-150 active:scale-[0.96] disabled:opacity-60"
        >
          {busy && <Loader2 className="size-4 animate-spin" />}
          {mode === "entrar" ? "Entrar" : "Criar conta"}
        </button>
      </form>

      <button
        onClick={() => {
          setMode(mode === "entrar" ? "criar" : "entrar");
          setError(null);
        }}
        className="mt-5 w-full text-center text-sm text-muted-foreground"
      >
        {mode === "entrar" ? (
          <>
            Ainda não tens conta? <span className="font-semibold text-primary">Criar conta</span>
          </>
        ) : (
          <>
            Já tens conta? <span className="font-semibold text-primary">Entrar</span>
          </>
        )}
      </button>

      <Link
        to="/"
        className="mt-8 block text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
      >
        Ver jogos sem entrar
      </Link>
    </Screen>
  );
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 mf-aurora" />
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
        {children}
      </div>
    </div>
  );
}
