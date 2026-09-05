import { Link } from "@tanstack/react-router";
import { Home, Compass, CalendarClock, User, Plus } from "lucide-react";

const items = [
  { to: "/", label: "Início", icon: Home },
  { to: "/explorar", label: "Explorar", icon: Compass },
] as const;

const rightItems = [
  { to: "/perfil", label: "Jogos", icon: CalendarClock },
  { to: "/perfil", label: "Perfil", icon: User },
] as const;

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-md items-center justify-around px-6 py-2.5">
        {items.map(({ to, label, icon: Icon }) => (
          <Link
            key={label}
            to={to}
            className="flex flex-col items-center gap-1 text-muted-foreground transition-transform duration-150 active:scale-95"
            activeOptions={{ exact: to === "/" }}
            activeProps={{ className: "text-primary" }}
          >
            <Icon className="size-5" strokeWidth={2} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        ))}

        <Link
          to="/criar"
          aria-label="Criar jogo"
          className="-mt-7 grid size-14 place-items-center rounded-full bg-primary text-primary-foreground ring-4 ring-background transition-transform duration-150 active:scale-95"
        >
          <Plus className="size-6" strokeWidth={2.5} />
        </Link>

        {rightItems.map(({ to, label, icon: Icon }) => (
          <Link
            key={label}
            to={to}
            className="flex flex-col items-center gap-1 text-muted-foreground transition-transform duration-150 active:scale-95"
          >
            <Icon className="size-5" strokeWidth={2} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
