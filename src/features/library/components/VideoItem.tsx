import type { Dispatch, SetStateAction } from "react";
import { Check, Heart, Play, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Item } from "@/lib/types";
import { fieldClass, primaryButtonClass, quietButtonClass } from "../styles";

interface VideoItemProps {
  isSelected: boolean;
  item: Item;
  labelNames: string[];
  onDelete: (itemId: string) => void;
  onMove: (itemId: string, label: string) => void;
  onPlay: (item: Item) => void;
  onSelect: (itemId: string) => void;
  onToggleFavorite: (item: Item) => void;
  onUpdateTitle: (itemId: string) => void;
  savingTitleId: string | null;
  setTitleDrafts: Dispatch<SetStateAction<Record<string, string>>>;
  titleDrafts: Record<string, string>;
}

export function VideoItem({
  isSelected,
  item,
  labelNames,
  onDelete,
  onMove,
  onPlay,
  onSelect,
  onToggleFavorite,
  onUpdateTitle,
  savingTitleId,
  setTitleDrafts,
  titleDrafts,
}: VideoItemProps) {
  return (
    <article className={cn("grid gap-3 rounded-2xl border bg-white/32 p-3 transition", isSelected ? "border-white shadow-sm" : "border-white/45")}>
      <button className="grid gap-1 text-left" type="button" onClick={() => onSelect(item.id)}>
        <div className="flex items-start justify-between gap-3">
          <span className="text-xs font-semibold text-[#4d4741]">{item.label}</span>
          <span className="text-xs text-[#756d65]">{new Date(item.updatedAt).toLocaleDateString()}</span>
        </div>
        <p className="break-all text-xs leading-5 text-[#756d65]">{item.youtubeUrl}</p>
      </button>

      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
        <input className={fieldClass} type="text" value={titleDrafts[item.id] ?? item.title} onChange={(event) => setTitleDrafts((current) => ({ ...current, [item.id]: event.target.value }))} />
        <Button className={quietButtonClass} disabled={savingTitleId === item.id} type="button" variant="outline" onClick={() => onUpdateTitle(item.id)}>
          {savingTitleId === item.id ? "Saving..." : <><Check size={16} /> Save</>}
        </Button>
      </div>

      <div className="grid gap-2 sm:grid-cols-[auto_auto_minmax(0,1fr)_auto]">
        <Button className={primaryButtonClass} size="icon-sm" type="button" onClick={() => onPlay(item)}>
          <Play size={16} />
        </Button>
        <Button
          className={cn(item.isFavorite ? "h-10 rounded-xl border-white bg-white/80 text-rose-500 hover:bg-white" : quietButtonClass)}
          size="icon-sm"
          type="button"
          variant="outline"
          onClick={() => onToggleFavorite(item)}
        >
          <Heart size={16} />
        </Button>
        <select className={fieldClass} value={item.label} onChange={(event) => onMove(item.id, event.target.value)}>
          {labelNames.map((label) => (
            <option key={label} value={label}>{label}</option>
          ))}
        </select>
        <Button className="h-10 rounded-xl border-white/70 bg-white/35 text-red-500 hover:bg-white/70" size="icon-sm" type="button" variant="outline" onClick={() => onDelete(item.id)}>
          <Trash2 size={16} />
        </Button>
      </div>
    </article>
  );
}
