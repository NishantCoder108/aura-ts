import type { Dispatch, SetStateAction } from "react";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Item, ViewSelection } from "@/lib/types";
import { fieldClass, panelClass, quietButtonClass } from "../styles";
import { VideoItem } from "./VideoItem";

interface VideoLibraryProps {
  actionError: string;
  activeView: ViewSelection;
  headerTitle: string;
  isLoading: boolean;
  items: Item[];
  labelNames: string[];
  onDelete: (itemId: string) => void;
  onMove: (itemId: string, label: string) => void;
  onPlay: (item: Item) => void;
  onRename: () => void;
  onSelect: (itemId: string) => void;
  onToggleFavorite: (item: Item) => void;
  onUpdateTitle: (itemId: string) => void;
  renameDraft: string;
  savingTitleId: string | null;
  selectedItem: Item | null;
  setRenameDraft: (value: string) => void;
  setTitleDrafts: Dispatch<SetStateAction<Record<string, string>>>;
  titleDrafts: Record<string, string>;
}

export function VideoLibrary({
  actionError,
  activeView,
  headerTitle,
  isLoading,
  items,
  labelNames,
  onDelete,
  onMove,
  onPlay,
  onRename,
  onSelect,
  onToggleFavorite,
  onUpdateTitle,
  renameDraft,
  savingTitleId,
  selectedItem,
  setRenameDraft,
  setTitleDrafts,
  titleDrafts,
}: VideoLibraryProps) {
  return (
    <section className={cn(panelClass, "grid gap-4")}>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div>
          <p className="text-xs font-medium text-[#756d65]">Playlist desk</p>
          <h2 className="text-xl font-semibold tracking-tight">{headerTitle}</h2>
        </div>
        {activeView.type === "label" ? (
          <div className="grid gap-2 sm:grid-cols-[13rem_auto]">
            <input className={fieldClass} value={renameDraft} onChange={(event) => setRenameDraft(event.target.value)} />
            <Button className={quietButtonClass} type="button" variant="outline" onClick={onRename}>
              <Pencil size={16} />
              Rename
            </Button>
          </div>
        ) : null}
      </div>

      {actionError ? (
        <p className="rounded-xl border border-red-200/80 bg-red-50/80 px-3 py-2 text-sm text-red-600">
          {actionError}
        </p>
      ) : null}

      {isLoading ? (
        <div className="grid min-h-36 place-items-center rounded-2xl border border-dashed border-white/60 text-sm text-[#756d65]">
          Loading videos...
        </div>
      ) : items.length === 0 ? (
        <div className="grid min-h-36 place-items-center rounded-2xl border border-dashed border-white/60 px-5 text-center text-sm text-[#756d65]">
          No videos in this view yet. Save a YouTube URL to get started.
        </div>
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <VideoItem
              isSelected={selectedItem?.id === item.id}
              item={item}
              key={item.id}
              labelNames={labelNames}
              onDelete={onDelete}
              onMove={onMove}
              onPlay={onPlay}
              onSelect={onSelect}
              onToggleFavorite={onToggleFavorite}
              onUpdateTitle={onUpdateTitle}
              savingTitleId={savingTitleId}
              setTitleDrafts={setTitleDrafts}
              titleDrafts={titleDrafts}
            />
          ))}
        </div>
      )}
    </section>
  );
}
