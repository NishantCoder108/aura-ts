import { useEffect, useRef } from "react";

declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YouTubeApi {
  Player: new (
    element: HTMLElement,
    options: {
      height?: string;
      width?: string;
      videoId?: string;
      playerVars?: Record<string, number | string>;
      events?: {
        onReady?: () => void;
        onStateChange?: (event: { data: number }) => void;
      };
    },
  ) => YouTubePlayerInstance;
  PlayerState: {
    ENDED: number;
  };
}

interface YouTubePlayerInstance {
  destroy: () => void;
  loadVideoById?: (videoId: string) => void;
  cueVideoById?: (videoId: string) => void;
  playVideo?: () => void;
  stopVideo?: () => void;
}

interface YouTubePlayerProps {
  videoId: string | null;
  autoplayToken: number;
  onEnded: () => void;
}

let scriptPromise: Promise<YouTubeApi> | null = null;

function loadYouTubeApi() {
  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (scriptPromise) {
    return scriptPromise;
  }

  scriptPromise = new Promise<YouTubeApi>((resolve, reject) => {
    const finalize = () => {
      if (window.YT?.Player) {
        resolve(window.YT);
      } else {
        reject(new Error("YouTube API failed to load"));
      }
    };

    window.onYouTubeIframeAPIReady = finalize;

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://www.youtube.com/iframe_api"]',
    );

    if (existingScript) {
      existingScript.addEventListener("load", finalize, { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("YouTube API failed to load")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.addEventListener("error", () => {
      reject(new Error("YouTube API failed to load"));
    });
    document.body.appendChild(script);
  });

  return scriptPromise;
}

export function YouTubePlayer({
  videoId,
  autoplayToken,
  onEnded,
}: YouTubePlayerProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YouTubePlayerInstance | null>(null);
  const isReadyRef = useRef(false);
  const pendingVideoIdRef = useRef<string | null>(null);
  const onEndedRef = useRef(onEnded);

  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  useEffect(() => {
    if (!mountRef.current) {
      return;
    }

    let isCancelled = false;

    void loadYouTubeApi()
      .then((yt) => {
        if (isCancelled || !mountRef.current || playerRef.current) {
          return;
        }

        playerRef.current = new yt.Player(mountRef.current, {
          height: "320",
          width: "100%",
          playerVars: {
            autoplay: 0,
            rel: 0,
            modestbranding: 1,
          },
          events: {
            onReady: () => {
              isReadyRef.current = true;

              if (pendingVideoIdRef.current) {
                const nextVideoId = pendingVideoIdRef.current;
                pendingVideoIdRef.current = null;
                playerRef.current?.loadVideoById?.(nextVideoId);
              }
            },
            onStateChange: (event) => {
              if (event.data === yt.PlayerState.ENDED) {
                onEndedRef.current();
              }
            },
          },
        });
      })
      .catch((error: unknown) => {
        console.error(error);
      });

    return () => {
      isCancelled = true;
      isReadyRef.current = false;
      pendingVideoIdRef.current = null;
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const player = playerRef.current;

    if (!player) {
      return;
    }

    if (!videoId) {
      pendingVideoIdRef.current = null;
      player.stopVideo?.();
      return;
    }

    if (!isReadyRef.current) {
      pendingVideoIdRef.current = videoId;
      return;
    }

    if (typeof player.loadVideoById === "function") {
      player.loadVideoById(videoId);
      return;
    }

    if (typeof player.cueVideoById === "function") {
      player.cueVideoById(videoId);
      player.playVideo?.();
      return;
    }

    console.warn("YouTube player is not ready to load a video yet.");
  }, [videoId, autoplayToken]);

  return (
    <div className="relative min-h-80 overflow-hidden rounded-[24px] border border-stone-200 bg-stone-950 shadow-inner">
      <div ref={mountRef} className="absolute inset-0 h-full w-full" />
      {!videoId ? (
        <div className="absolute inset-0 grid place-items-center px-6 text-center text-sm font-medium text-white/80">
          Pick a track to start your YouTube queue.
        </div>
      ) : null}
    </div>
  );
}
