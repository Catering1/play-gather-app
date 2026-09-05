import futebolImg from "@/assets/futebol.jpg";
import tenisImg from "@/assets/tenis.jpg";
import pingpongImg from "@/assets/pingpong.jpg";
import basquetebolImg from "@/assets/basquetebol.jpg";
import badmintonImg from "@/assets/badminton.jpg";
import voleibolImg from "@/assets/voleibol.jpg";

export type Sport =
  | "Futebol"
  | "Ping Pong"
  | "Ténis"
  | "Basquetebol"
  | "Badminton"
  | "Voleibol";

export type Level = "Iniciante" | "Intermédio" | "Avançado" | "Todos os níveis";

export const SPORTS: Sport[] = [
  "Futebol",
  "Ping Pong",
  "Ténis",
  "Basquetebol",
  "Badminton",
  "Voleibol",
];

export const LEVELS: Level[] = [
  "Iniciante",
  "Intermédio",
  "Avançado",
  "Todos os níveis",
];

export const CITIES = ["Lisboa", "Porto", "Setúbal", "Braga", "Cascais"];

export const SPORT_IMAGE: Record<Sport, string> = {
  Futebol: futebolImg,
  "Ping Pong": pingpongImg,
  Ténis: tenisImg,
  Basquetebol: basquetebolImg,
  Badminton: badmintonImg,
  Voleibol: voleibolImg,
};

export type Player = {
  id: string;
  name: string;
  initials: string;
};

export type Game = {
  id: string;
  title: string;
  sport: Sport;
  date: string; // ISO-ish, ex: 2026-09-05
  dayLabel: string;
  time: string;
  venue: string;
  city: string;
  price: number; // 0 = grátis
  level: Level;
  slots: number;
  players: Player[];
  organizer: { name: string; initials: string; rating: number; games: number };
  image: string;
};

const p = (id: string, name: string): Player => ({
  id,
  name,
  initials: name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join(""),
});

export const GAMES: Game[] = [
  {
    id: "futsal-tapada",
    title: "Futsal 5×5",
    sport: "Futebol",
    date: "2026-09-05",
    dayLabel: "Hoje",
    time: "18:30",
    venue: "Campo da Tapada",
    city: "Lisboa",
    price: 12,
    level: "Intermédio",
    slots: 10,
    players: [
      p("1", "João Ferreira"),
      p("2", "Rui Santos"),
      p("3", "Marta Dias"),
      p("4", "Tiago Melo"),
      p("5", "Ana Lopes"),
      p("6", "Pedro Nunes"),
      p("7", "Sofia Cruz"),
      p("8", "Bruno Alves"),
    ],
    organizer: { name: "Rui Santos", initials: "RS", rating: 4.9, games: 64 },
    image: futebolImg,
  },
  {
    id: "tenis-luzes",
    title: "Ténis individual",
    sport: "Ténis",
    date: "2026-09-05",
    dayLabel: "Hoje",
    time: "20:00",
    venue: "Clube das Luzes · Campo 4",
    city: "Lisboa",
    price: 15,
    level: "Avançado",
    slots: 2,
    players: [p("9", "Carolina Reis")],
    organizer: { name: "Carolina Reis", initials: "CR", rating: 4.8, games: 31 },
    image: tenisImg,
  },
  {
    id: "pingpong-municipal",
    title: "Ping Pong duplas",
    sport: "Ping Pong",
    date: "2026-09-06",
    dayLabel: "Amanhã",
    time: "19:00",
    venue: "Ginásio Municipal",
    city: "Porto",
    price: 0,
    level: "Todos os níveis",
    slots: 6,
    players: [p("10", "Hugo Matos"), p("11", "Inês Faria"), p("12", "Nuno Braga")],
    organizer: { name: "Hugo Matos", initials: "HM", rating: 4.6, games: 18 },
    image: pingpongImg,
  },
  {
    id: "basquete-santos",
    title: "3×3 no campo",
    sport: "Basquetebol",
    date: "2026-09-05",
    dayLabel: "Hoje",
    time: "21:00",
    venue: "Santos · Campo de asfalto",
    city: "Lisboa",
    price: 5,
    level: "Intermédio",
    slots: 6,
    players: [p("13", "Diogo Pinto"), p("14", "Leo Marques")],
    organizer: { name: "Diogo Pinto", initials: "DP", rating: 4.7, games: 42 },
    image: basquetebolImg,
  },
  {
    id: "badminton-alvalade",
    title: "Badminton duplas",
    sport: "Badminton",
    date: "2026-09-07",
    dayLabel: "Domingo",
    time: "15:00",
    venue: "Pavilhão de Alvalade",
    city: "Lisboa",
    price: 8,
    level: "Iniciante",
    slots: 4,
    players: [p("15", "Rita Gomes"), p("16", "Miguel Sá")],
    organizer: { name: "Rita Gomes", initials: "RG", rating: 4.5, games: 12 },
    image: badmintonImg,
  },
  {
    id: "voleibol-costa",
    title: "Voleibol de praia 4×4",
    sport: "Voleibol",
    date: "2026-09-06",
    dayLabel: "Amanhã",
    time: "17:30",
    venue: "Praia da Costa",
    city: "Setúbal",
    price: 6,
    level: "Todos os níveis",
    slots: 8,
    players: [p("17", "Beatriz Lima"), p("18", "André Costa"), p("19", "Vera Pina")],
    organizer: { name: "André Costa", initials: "AC", rating: 4.9, games: 55 },
    image: voleibolImg,
  },
  {
    id: "futebol-braga",
    title: "Futebol 7 noturno",
    sport: "Futebol",
    date: "2026-09-08",
    dayLabel: "Segunda",
    time: "21:30",
    venue: "Complexo Norte",
    city: "Braga",
    price: 10,
    level: "Avançado",
    slots: 14,
    players: [p("20", "Filipe Rocha"), p("21", "Tomás Vieira")],
    organizer: { name: "Filipe Rocha", initials: "FR", rating: 4.4, games: 27 },
    image: futebolImg,
  },
  {
    id: "tenis-cascais",
    title: "Ténis duplas ao pôr do sol",
    sport: "Ténis",
    date: "2026-09-06",
    dayLabel: "Amanhã",
    time: "19:15",
    venue: "Clube de Cascais",
    city: "Cascais",
    price: 18,
    level: "Intermédio",
    slots: 4,
    players: [p("22", "Sara Neves"), p("23", "Ricardo Paz")],
    organizer: { name: "Sara Neves", initials: "SN", rating: 4.8, games: 39 },
    image: tenisImg,
  },
];

export function getGame(id: string) {
  return GAMES.find((g) => g.id === id);
}

export function formatPrice(price: number) {
  return price === 0 ? "Grátis" : `${price}€`;
}
