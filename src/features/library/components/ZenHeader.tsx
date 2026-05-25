import { Heart, ListVideo, LogOut, Plus, Rows3 } from "lucide-react";

import logo from "@/assets/logo.svg";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LabelSummary, User, ViewSelection } from "@/lib/types";
import { chipClass, quietButtonClass } from "../styles";

interface ZenHeaderProps {
  activeView: ViewSelection;
  labels: LabelSummary[];
  onLogout: () => void;
  onPrepareNewLabel: () => void;
  onViewChange: (view: ViewSelection) => void;
  user: User | null;
}

export function ZenHeader({
  activeView,
  labels,
  onLogout,
  onPrepareNewLabel,
  onViewChange,
  user,
}: ZenHeaderProps) {
  const isActive = (view: ViewSelection) =>
    activeView.type === view.type &&
    (view.type !== "label" || activeView.type !== "label" || activeView.label === view.label);
  const buttonClass = (view: ViewSelection) =>
    cn(
      chipClass,
      isActive(view)
        ? "border-white bg-white/80 text-[#312d29] shadow-sm"
        : "border-white/50 bg-white/28 text-[#6e655d] hover:bg-white/55",
    );

  return (
    <header className="grid gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src={logo} alt="ZenPlay Logo" className="h-12 w-12 rounded-xl shadow-sm" />
          <div>
            <p className="text-xs font-medium text-[#756d65]">Welcome back, {user?.firstName}</p>
            <h1 className="text-3xl font-semibold tracking-tight text-[#312d29]">ZenPlay</h1>
          </div>
        </div>
        <Button className={quietButtonClass} type="button" variant="outline" onClick={onLogout}>
          <LogOut size={16} />
          <span className="hidden sm:inline">Log out</span>
        </Button>
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        <button className={buttonClass({ type: "all" })} onClick={() => onViewChange({ type: "all" })} type="button">
          <Rows3 size={16} />
          All
        </button>
        <button className={buttonClass({ type: "favorites" })} onClick={() => onViewChange({ type: "favorites" })} type="button">
          <Heart size={16} />
          Favorites
        </button>
        {labels.map((entry) => (
          <button className={buttonClass({ type: "label", label: entry.label })} key={entry.label} onClick={() => onViewChange({ type: "label", label: entry.label })} type="button">
            <ListVideo size={16} />
            {entry.label}
            <span className="text-xs opacity-70">{entry.itemCount}</span>
          </button>
        ))}
        <Button className={quietButtonClass} type="button" variant="outline" onClick={onPrepareNewLabel}>
          <Plus size={16} />
          New
        </Button>
      </div>
    </header>
  );
}
