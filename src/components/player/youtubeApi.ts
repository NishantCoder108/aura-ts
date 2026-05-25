export type PlaybackState = "idle" | "playing" | "paused" | "ended";
export type PlaybackCommand = {
  action: "play" | "pause" | "stop";
  id: number;
};

declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export interface YouTubeApi {
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
    PAUSED: number;
    PLAYING: number;
  };
}

export interface YouTubePlayerInstance {
  destroy: () => void;
  cueVideoById?: (videoId: string) => void;
  loadVideoById?: (videoId: string) => void;
  pauseVideo?: () => void;
  playVideo?: () => void;
  stopVideo?: () => void;
}

let scriptPromise: Promise<YouTubeApi> | null = null;

export function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<YouTubeApi>((resolve, reject) => {
    const finalize = () => {
      if (window.YT?.Player) resolve(window.YT);
      else reject(new Error("YouTube API failed to load"));
    };
    window.onYouTubeIframeAPIReady = finalize;

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://www.youtube.com/iframe_api"]',
    );
    if (existingScript) {
      existingScript.addEventListener("load", finalize, { once: true });
      existingScript.addEventListener("error", () => reject(new Error("YouTube API failed to load")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.addEventListener("error", () => reject(new Error("YouTube API failed to load")));
    document.body.appendChild(script);
  });

  return scriptPromise;
}
