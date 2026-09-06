import { supabase } from "./supabase";
import { SPORT_IMAGE, type Level, type Sport } from "@/data/games";
import { dayLabel, initialsOf, timeLabel } from "./format";

export type Person = { id: string; name: string; initials: string };

export type Game = {
  id: string;
  title: string;
  sport: Sport;
  startsAt: Date;
  dayLabel: string;
  time: string;
  venue: string;
  city: string;
  price: number;
  level: Level;
  slots: number;
  taken: number;
  image: string;
  organizer: Person;
};

export type GameDetail = Game & { players: Person[] };

const LIST_SELECT =
  "id, title, sport, starts_at, venue, city, price_cents, level, slots," +
  " organizer:profiles!games_organizer_id_fkey (id, name), game_players (player_id)";

const DETAIL_SELECT =
  "id, title, sport, starts_at, venue, city, price_cents, level, slots," +
  " organizer:profiles!games_organizer_id_fkey (id, name)," +
  " game_players (player_id, player:profiles!game_players_player_id_fkey (id, name))";

type Row = {
  id: string;
  title: string;
  sport: Sport;
  starts_at: string;
  venue: string;
  city: string;
  price_cents: number;
  level: Level;
  slots: number;
  organizer: { id: string; name: string } | null;
  game_players: { player_id: string; player?: { id: string; name: string } | null }[];
};

function person(p: { id: string; name: string }): Person {
  return { id: p.id, name: p.name, initials: initialsOf(p.name) };
}

function toGame(row: Row): Game {
  const startsAt = new Date(row.starts_at);
  return {
    id: row.id,
    title: row.title,
    sport: row.sport,
    startsAt,
    dayLabel: dayLabel(startsAt),
    time: timeLabel(startsAt),
    venue: row.venue,
    city: row.city,
    price: row.price_cents / 100,
    level: row.level,
    slots: row.slots,
    taken: row.game_players.length,
    image: SPORT_IMAGE[row.sport],
    organizer: person(row.organizer ?? { id: "", name: "Desconhecido" }),
  };
}

/** PostgREST usa vírgulas e parênteses como sintaxe: retiram-se do texto pesquisado. */
function safeSearch(term: string) {
  return term.replace(/[,()%\\*]/g, " ").trim().slice(0, 60);
}

export type GameFilters = {
  sport?: Sport | "Todas" | undefined;
  city?: string | undefined;
  level?: Level | "Todos" | undefined;
  maxPrice?: number | undefined;
  when?: "Todos" | "Hoje" | "Amanhã" | "Esta semana" | undefined;
  search?: string | undefined;
  limit?: number | undefined;
};

export async function listGames(filters: GameFilters = {}): Promise<Game[]> {
  let q = supabase
    .from("games")
    .select(LIST_SELECT)
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true });

  if (filters.sport && filters.sport !== "Todas") q = q.eq("sport", filters.sport);
  if (filters.city && filters.city !== "Todas") q = q.eq("city", filters.city);
  if (filters.level && filters.level !== "Todos") q = q.eq("level", filters.level);
  if (typeof filters.maxPrice === "number") q = q.lte("price_cents", filters.maxPrice * 100);

  if (filters.when && filters.when !== "Todos") {
    const start = new Date();
    const end = new Date();
    if (filters.when === "Hoje") end.setHours(23, 59, 59, 999);
    if (filters.when === "Amanhã") {
      start.setDate(start.getDate() + 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() + 1);
      end.setHours(23, 59, 59, 999);
    }
    if (filters.when === "Esta semana") end.setDate(end.getDate() + 7);
    q = q.gte("starts_at", start.toISOString()).lte("starts_at", end.toISOString());
  }

  const term = filters.search ? safeSearch(filters.search) : "";
  if (term) {
    q = q.or(`title.ilike.%${term}%,venue.ilike.%${term}%,city.ilike.%${term}%`);
  }

  if (filters.limit) q = q.limit(filters.limit);

  const { data, error } = await q;
  if (error) throw error;
  return (data as unknown as Row[]).map(toGame);
}

export async function getGameDetail(id: string): Promise<GameDetail | null> {
  const { data, error } = await supabase
    .from("games")
    .select(DETAIL_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = data as unknown as Row;
  return {
    ...toGame(row),
    players: row.game_players
      .map((gp) => gp.player)
      .filter((p): p is { id: string; name: string } => Boolean(p))
      .map(person),
  };
}

export async function listGamesForPlayer(playerId: string): Promise<Game[]> {
  const { data: signups, error: signupError } = await supabase
    .from("game_players")
    .select("game_id")
    .eq("player_id", playerId);

  if (signupError) throw signupError;
  const ids = (signups ?? []).map((s) => s.game_id);
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from("games")
    .select(LIST_SELECT)
    .in("id", ids)
    .order("starts_at", { ascending: true });

  if (error) throw error;
  return (data as unknown as Row[]).map(toGame);
}

export type NewGame = {
  title: string;
  sport: Sport;
  date: string;
  time: string;
  venue: string;
  city: string;
  slots: number;
  level: Level;
  price: number;
};

export async function createGame(input: NewGame, organizerId: string) {
  const startsAt = new Date(`${input.date}T${input.time}`);
  if (Number.isNaN(startsAt.getTime())) throw new Error("Data ou hora inválida.");
  if (startsAt.getTime() < Date.now()) throw new Error("Essa data já passou.");

  const { data, error } = await supabase
    .from("games")
    .insert({
      organizer_id: organizerId,
      title: input.title.trim(),
      sport: input.sport,
      starts_at: startsAt.toISOString(),
      venue: input.venue.trim(),
      city: input.city,
      price_cents: Math.round(input.price * 100),
      level: input.level,
      slots: input.slots,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id as string;
}

export async function joinGame(gameId: string, playerId: string) {
  const { error } = await supabase
    .from("game_players")
    .insert({ game_id: gameId, player_id: playerId });

  if (error) {
    if (error.message.includes("GAME_FULL")) throw new Error("Este jogo já está cheio.");
    if (error.message.includes("GAME_PAST")) throw new Error("Este jogo já começou.");
    if (error.code === "23505") throw new Error("Já estás inscrito neste jogo.");
    throw error;
  }
}

export async function leaveGame(gameId: string, playerId: string) {
  const { error } = await supabase
    .from("game_players")
    .delete()
    .eq("game_id", gameId)
    .eq("player_id", playerId);

  if (error) throw error;
}

export async function deleteGame(gameId: string) {
  const { error } = await supabase.from("games").delete().eq("id", gameId);
  if (error) throw error;
}

export async function updateProfile(
  userId: string,
  patch: { name?: string | undefined; city?: string | undefined; bio?: string | undefined },
) {
  const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
  if (error) throw error;
}

export async function countGamesOrganized(organizerId: string) {
  const { count, error } = await supabase
    .from("games")
    .select("id", { count: "exact", head: true })
    .eq("organizer_id", organizerId);

  if (error) throw error;
  return count ?? 0;
}
