import { useEffect, useRef } from "react";

import {
  loadYouTubeApi,
  type PlaybackCommand,
  type PlaybackState,
  type YouTubeApi,
  type YouTubePlayerInstance,
} from "./youtubeApi";

interface YouTubePlayerProps {
  autoplayToken: number;
  onEnded: () => void;
  onPlaybackStateChange: (state: PlaybackState) => void;
  playbackCommand: PlaybackCommand | null;
  videoId: string | null;
}

export function YouTubePlayer({
  autoplayToken,
  onEnded,
  onPlaybackStateChange,
  playbackCommand,
  videoId,
}: YouTubePlayerProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YouTubePlayerInstance | null>(null);
  const ytRef = useRef<YouTubeApi | null>(null);
  const isReadyRef = useRef(false);
  const pendingVideoIdRef = useRef<string | null>(null);
  const pendingCommandRef = useRef<PlaybackCommand["action"] | null>(null);
  const onEndedRef = useRef(onEnded);
  const onPlaybackRef = useRef(onPlaybackStateChange);

  useEffect(() => {
    onEndedRef.current = onEnded;
    onPlaybackRef.current = onPlaybackStateChange;
  }, [onEnded, onPlaybackStateChange]);

  function setState(state: PlaybackState) {
    onPlaybackRef.current(state);
  }

  function runCommand(action: PlaybackCommand["action"]) {
    const player = playerRef.current;
    if (!player || !isReadyRef.current) {
      pendingCommandRef.current = action;
      return;
    }
    if (action === "play") {
      player.playVideo?.();
      setState("playing");
    } else if (action === "pause") {
      player.pauseVideo?.();
      setState("paused");
    } else {
      player.stopVideo?.();
      setState("idle");
    }
  }

  function loadVideo(nextVideoId: string) {
    const player = playerRef.current;
    if (!player || !isReadyRef.current) {
      pendingVideoIdRef.current = nextVideoId;
      return;
    }
    if (player.loadVideoById) player.loadVideoById(nextVideoId);
    else {
      player.cueVideoById?.(nextVideoId);
      player.playVideo?.();
    }
    setState("playing");
  }

  useEffect(() => {
    if (!mountRef.current) return;
    let isCancelled = false;

    void loadYouTubeApi()
      .then((yt) => {
        if (isCancelled || !mountRef.current || playerRef.current) return;
        ytRef.current = yt;
        playerRef.current = new yt.Player(mountRef.current, {
          height: "320",
          width: "100%",
          playerVars: { autoplay: 0, modestbranding: 1, rel: 0 },
          events: {
            onReady: () => {
              isReadyRef.current = true;
              if (pendingVideoIdRef.current) {
                loadVideo(pendingVideoIdRef.current);
                pendingVideoIdRef.current = null;
              }
              if (pendingCommandRef.current) {
                runCommand(pendingCommandRef.current);
                pendingCommandRef.current = null;
              }
            },
            onStateChange: (event) => {
              if (event.data === yt.PlayerState.PLAYING) setState("playing");
              if (event.data === yt.PlayerState.PAUSED) setState("paused");
              if (event.data === yt.PlayerState.ENDED) {
                setState("ended");
                onEndedRef.current();
              }
            },
          },
        });
      })
      .catch((error: unknown) => console.error(error));

    return () => {
      isCancelled = true;
      isReadyRef.current = false;
      pendingVideoIdRef.current = null;
      pendingCommandRef.current = null;
      playerRef.current?.destroy();
      playerRef.current = null;
      ytRef.current = null;
    };
    // The setup effect owns stable refs for imperative player control.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!videoId) {
      pendingVideoIdRef.current = null;
      playerRef.current?.stopVideo?.();
      setState("idle");
      return;
    }
    loadVideo(videoId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, autoplayToken]);

  useEffect(() => {
    if (playbackCommand) runCommand(playbackCommand.action);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playbackCommand]);

  return (
    <div className="relative min-h-80 overflow-hidden rounded-[24px] border border-white/40 bg-stone-950 shadow-inner">
      <div ref={mountRef} className="absolute inset-0 h-full w-full" />
      {!videoId ? (
        <div className="absolute inset-0 grid place-items-center px-6 text-center text-sm font-medium text-white/80">
          Pick a track to start your YouTube queue.
        </div>
      ) : null}
    </div>
  );
}
