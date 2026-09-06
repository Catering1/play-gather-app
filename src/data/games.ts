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

export const DEFAULT_CITY = "Lisboa";

export const SPORT_IMAGE: Record<Sport, string> = {
  Futebol: futebolImg,
  "Ping Pong": pingpongImg,
  Ténis: tenisImg,
  Basquetebol: basquetebolImg,
  Badminton: badmintonImg,
  Voleibol: voleibolImg,
};

export function formatPrice(price: number) {
  return price === 0 ? "Grátis" : `${price}€`;
}
