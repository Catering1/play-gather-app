import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Field, inputClass } from "@/components/Field";
import { CITIES, DEFAULT_CITY } from "@/data/games";
import { signIn, signInWithGoogle, signUp, useAuth } from "@/lib/auth";

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
  const [googleBusy, setGoogleBusy] = useState(false);
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

  async function handleGoogle() {
    setGoogleBusy(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo correu mal. Tenta outra vez.");
      setGoogleBusy(false);
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
          disabled={busy || googleBusy}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 font-display text-[15px] font-bold tracking-tight text-primary-foreground transition-transform duration-150 active:scale-[0.96] disabled:opacity-60"
        >
          {busy && <Loader2 className="size-4 animate-spin" />}
          {mode === "entrar" ? "Entrar" : "Criar conta"}
        </button>
      </form>

      <div className="mt-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">ou</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={googleBusy || busy}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background py-3.5 font-display text-[15px] font-bold tracking-tight text-foreground transition-transform duration-150 active:scale-[0.96] disabled:opacity-60"
      >
        {googleBusy && <Loader2 className="size-4 animate-spin" />}
        {!googleBusy && (
          <svg className="size-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="currentColor"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="currentColor"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="currentColor"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="currentColor"
            />
          </svg>
        )}
        Entrar com Google
      </button>

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
