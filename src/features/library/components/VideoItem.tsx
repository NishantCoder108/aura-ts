import type { Dispatch, SetStateAction } from "react";
import { Check, Heart, Pause, Play, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Item } from "@/lib/types";
import { fieldClass, primaryButtonClass, quietButtonClass } from "../styles";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    <article
      className={cn(
        "grid gap-3 rounded-2xl border bg-white/32 p-3 transition",
        isSelected ? "border-white shadow-sm" : "border-white/45",
      )}
    >
      <button
        className="grid gap-1 text-left"
        type="button"
        onClick={() => onSelect(item.id)}
      >
        <div className="flex items-start justify-between gap-3">
          {/* <span className="text-xs font-semibold text-[#4d4741]">
            {item.label}
          </span> */}
          <span className="text-xs text-[#756d65]">
            {new Date(item.updatedAt).toLocaleDateString()}
          </span>
        </div>
      </button>

      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-[#4d4741]">{item.title}</span>
        <div className="flex items-center gap-2">
        <Select
          value={item.label}
          onValueChange={(value) => onMove(item.id, value)}
        >
          <SelectTrigger className="w-full max-w-28 sm:max-w-32 cursor-pointer">
            <SelectValue placeholder="Label" />
          </SelectTrigger>
          <SelectContent position="item-aligned">
            <SelectGroup>
              {labelNames.map((label) => (
                <SelectItem key={label} value={label}>
                  {label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
          <Button
            className={cn(
              primaryButtonClass,
              "rounded-full bg-transparent hover:bg-transparent",
            )}
            type="button"
            onClick={() => onPlay(item)}
          >
            {isSelected ? (
              <Pause size={16} className="text-black" />
            ) : (
              <Play size={16} className="text-black" />
            )}
          </Button>
          <Button
            className="bg-transparent cursor-pointer"
            // size="icon-sm"
            type="button"
            variant={item.isFavorite ? "default" : "ghost"}
            onClick={() => onToggleFavorite(item)}
          >
            <Heart
              className={item.isFavorite ? "fill-rose-500 text-rose-500" : ""}
              size={16}
            />
          </Button>
          <Button
            className="h-10  text-red-500 hover:text-red-800 hover:bg-transparent cursor-pointer"
            size="icon-sm"
            type="button"
            variant={"ghost"}
            onClick={() => onDelete(item.id)}
          >
            <Trash2 size={16} />
          </Button>
        </div>
        {/* <input className={fieldClass} type="text" value={titleDrafts[item.id] ?? item.title} onChange={(event) => setTitleDrafts((current) => ({ ...current, [item.id]: event.target.value }))} /> 
        <Button className={quietButtonClass} disabled={savingTitleId === item.id} type="button" variant="outline" onClick={() => onUpdateTitle(item.id)}>
          {savingTitleId === item.id ? "Saving..." : <><Check size={16} /> Save</>}
        </Button>*/}
      </div>
    </article>
  );
}
