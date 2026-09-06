export function initialsOf(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function timeLabel(date: Date) {
  return new Intl.DateTimeFormat("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/** "Hoje", "Amanhã", "Domingo" (dentro de uma semana) ou "12 set". */
export function dayLabel(date: Date) {
  const midnight = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((midnight(date) - midnight(new Date())) / 86_400_000);

  if (days === 0) return "Hoje";
  if (days === 1) return "Amanhã";
  if (days > 1 && days < 7) {
    const weekday = new Intl.DateTimeFormat("pt-PT", { weekday: "long" }).format(date);
    return weekday.charAt(0).toUpperCase() + weekday.slice(1);
  }
  return new Intl.DateTimeFormat("pt-PT", { day: "numeric", month: "short" }).format(date);
}

export function todayLabel() {
  const weekday = new Intl.DateTimeFormat("pt-PT", { weekday: "long" }).format(new Date());
  return weekday.charAt(0).toUpperCase() + weekday.slice(1);
}
