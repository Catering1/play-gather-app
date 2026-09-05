import { GAMES } from "./games";

export const USER = {
  name: "João Ferreira",
  initials: "JF",
  city: "Lisboa",
  memberSince: "2024",
  bio: "Médio defensivo aos fins de semana, ténis à terça.",
  stats: [
    { label: "Jogos", value: "48" },
    { label: "Avaliação", value: "4.8" },
    { label: "Presenças", value: "96%" },
    { label: "Favorito", value: "Futebol" },
  ],
};

export const UPCOMING = GAMES.slice(0, 2);

export const HISTORY = [
  { id: "h1", title: "Futsal 5×5", sport: "Futebol", date: "29 ago", result: "Vitória 6–4" },
  { id: "h2", title: "Ténis individual", sport: "Ténis", date: "24 ago", result: "Derrota 4–6" },
  { id: "h3", title: "3×3 no campo", sport: "Basquetebol", date: "18 ago", result: "Vitória 21–17" },
  { id: "h4", title: "Ping Pong duplas", sport: "Ping Pong", date: "11 ago", result: "Vitória 3–1" },
];
