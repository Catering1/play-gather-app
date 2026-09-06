import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { initialsOf } from "./format";

export type Profile = {
  id: string;
  name: string;
  city: string;
  bio: string | null;
  initials: string;
  memberSince: string;
};

type AuthValue = {
  loading: boolean;
  user: User | null;
  profile: Profile | null;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, city, bio, created_at")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return {
    id: data.id,
    name: data.name,
    city: data.city,
    bio: data.bio,
    initials: initialsOf(data.name),
    memberSince: new Date(data.created_at).getFullYear().toString(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    let active = true;
    fetchProfile(user.id).then((p) => {
      if (active) setProfile(p);
    });
    return () => {
      active = false;
    };
  }, [user]);

  const value = useMemo<AuthValue>(
    () => ({
      loading,
      user,
      profile,
      refreshProfile: async () => {
        if (user) setProfile(await fetchProfile(user.id));
      },
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [loading, user, profile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa de estar dentro de <AuthProvider>.");
  return ctx;
}

export async function signUp(input: {
  email: string;
  password: string;
  name: string;
  city: string;
}) {
  const { data, error } = await supabase.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: { data: { name: input.name.trim(), city: input.city } },
  });

  if (error) throw new Error(translateAuthError(error.message));
  // Sem sessão = o Supabase está configurado para exigir confirmação por email.
  return { needsEmailConfirmation: !data.session };
}

export async function signIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) throw new Error(translateAuthError(error.message));
}

function translateAuthError(message: string) {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Email ou palavra-passe errados.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Já existe uma conta com este email. Tenta entrar.";
  if (m.includes("password should be at least"))
    return "A palavra-passe precisa de pelo menos 6 caracteres.";
  if (m.includes("unable to validate email") || m.includes("invalid email") || m.includes("is invalid"))
    return "Esse email não parece válido. Confirma que escreveste bem.";
  if (m.includes("email not confirmed"))
    return "Ainda não confirmaste o teu email. Vê a tua caixa de correio.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Demasiadas tentativas. Espera um bocado e tenta outra vez.";
  return message;
}
