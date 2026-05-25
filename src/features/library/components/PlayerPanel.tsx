import { Pause, Play, Repeat, Repeat1, SkipBack, SkipForward } from "lucide-react";

import { YouTubePlayer } from "@/components/player/YouTubePlayer";
import type { PlaybackCommand, PlaybackState } from "@/components/player/youtubeApi";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Item } from "@/lib/types";
import { panelClass } from "../styles";

interface PlayerPanelProps {
  autoplayToken: number;
  canNext: boolean;
  canPrevious: boolean;
  currentItem: Item | null;
  isPlaying: boolean;
  loopList: boolean;
  loopOne: boolean;
  onEnded: () => void;
  onNext: () => void;
  onPlaybackStateChange: (state: PlaybackState) => void;
  onPrevious: () => void;
  onTogglePlayback: () => void;
  playbackCommand: PlaybackCommand | null;
  setLoopList: (value: (current: boolean) => boolean) => void;
  setLoopOne: (value: (current: boolean) => boolean) => void;
}

const controlClass =
  "size-11 rounded-full border-white/70 bg-white/35 text-[#514940] shadow-sm backdrop-blur transition hover:bg-white/70 disabled:pointer-events-none disabled:opacity-35";
const activeClass = "border-white bg-white/85 text-[#2f2b27] shadow-[0_12px_28px_rgba(47,43,39,0.14)]";
const mainClass =
  "size-14 rounded-full border-white bg-[#2f2d2b] text-white shadow-[0_18px_42px_rgba(47,43,39,0.24)] hover:bg-[#1f1d1b] disabled:pointer-events-none disabled:opacity-35";

export function PlayerPanel({
  autoplayToken,
  canNext,
  canPrevious,
  currentItem,
  isPlaying,
  loopList,
  loopOne,
  onEnded,
  onNext,
  onPlaybackStateChange,
  onPrevious,
  onTogglePlayback,
  playbackCommand,
  setLoopList,
  setLoopOne,
}: PlayerPanelProps) {
  return (
    <section className={cn(panelClass, "grid gap-4")}>
      <div>
        <p className="text-xs font-medium text-[#756d65]">Ambient player</p>
        <h2 className="truncate text-xl font-semibold tracking-tight">
          {currentItem?.title ?? "Choose a focus video"}
        </h2>
      </div>
      <YouTubePlayer
        autoplayToken={autoplayToken}
        onEnded={onEnded}
        onPlaybackStateChange={onPlaybackStateChange}
        playbackCommand={playbackCommand}
        videoId={currentItem?.youtubeVideoId ?? null}
      />
      <div className="flex flex-wrap items-center justify-center gap-2 rounded-[1.5rem] border border-white/40 bg-white/20 p-2 backdrop-blur">
        <Button aria-label="Loop selected video" className={cn(controlClass, loopOne && activeClass)} size="icon" title="Loop selected video" type="button" variant="outline" onClick={() => setLoopOne((value) => !value)}>
          <Repeat1 size={18} />
        </Button>
        <Button aria-label="Previous video" className={controlClass} disabled={!canPrevious} size="icon" title="Previous video" type="button" variant="outline" onClick={onPrevious}>
          <SkipBack size={18} />
        </Button>
        <Button aria-label={isPlaying ? "Pause video" : "Play video"} className={mainClass} disabled={!currentItem} size="icon" title={isPlaying ? "Pause video" : "Play video"} type="button" onClick={onTogglePlayback}>
          {isPlaying ? <Pause size={22} /> : <Play size={22} />}
        </Button>
        <Button aria-label="Next video" className={controlClass} disabled={!canNext} size="icon" title="Next video" type="button" variant="outline" onClick={onNext}>
          <SkipForward size={18} />
        </Button>

        <Button aria-label="Loop current list" className={cn(controlClass, loopList && activeClass)} size="icon" title="Loop current list" type="button" variant="outline" onClick={() => setLoopList((value) => !value)}>
          <Repeat size={18} />
        </Button>
      </div>
    </section>
  );
}
