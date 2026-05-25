import { ListVideo, Play, Repeat, Repeat1 } from "lucide-react";

import { YouTubePlayer } from "@/components/player/YouTubePlayer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Item } from "@/lib/types";
import { panelClass, primaryButtonClass, quietButtonClass } from "../styles";

interface PlayerPanelProps {
  autoplayToken: number;
  currentItem: Item | null;
  loopList: boolean;
  loopOne: boolean;
  onEnded: () => void;
  onPlayList: () => void;
  onPlaySelected: () => void;
  setLoopList: (value: (current: boolean) => boolean) => void;
  setLoopOne: (value: (current: boolean) => boolean) => void;
}

export function PlayerPanel({
  autoplayToken,
  currentItem,
  loopList,
  loopOne,
  onEnded,
  onPlayList,
  onPlaySelected,
  setLoopList,
  setLoopOne,
}: PlayerPanelProps) {
  const toggleClass = (active: boolean) =>
    cn(active ? "border-white bg-white/80 text-[#312d29]" : quietButtonClass, "h-10 rounded-xl");

  return (
    <section className={cn(panelClass, "grid gap-4")}>
      <div>
        <p className="text-xs font-medium text-[#756d65]">Ambient player</p>
        <h2 className="truncate text-xl font-semibold tracking-tight">
          {currentItem?.title ?? "Choose a focus video"}
        </h2>
      </div>
      <YouTubePlayer autoplayToken={autoplayToken} onEnded={onEnded} videoId={currentItem?.youtubeVideoId ?? null} />
      <div className="grid gap-2 sm:grid-cols-2">
        <Button className={primaryButtonClass} type="button" onClick={onPlaySelected}>
          <Play size={16} />
          Play selected
        </Button>
        <Button className={quietButtonClass} type="button" variant="outline" onClick={onPlayList}>
          <ListVideo size={16} />
          Play view
        </Button>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <Button className={toggleClass(loopOne)} type="button" variant="outline" onClick={() => setLoopOne((value) => !value)}>
          <Repeat1 size={16} />
          Loop selected
        </Button>
        <Button className={toggleClass(loopList)} type="button" variant="outline" onClick={() => setLoopList((value) => !value)}>
          <Repeat size={16} />
          Loop view
        </Button>
      </div>
    </section>
  );
}
