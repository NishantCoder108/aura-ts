import { Link } from "react-router";

import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.18),transparent_24%),radial-gradient(circle_at_top_right,rgba(236,72,153,0.12),transparent_18%),linear-gradient(180deg,#fff8f1_0%,#f4f1eb_48%,#efece6_100%)] px-4">
      <div className="grid w-full max-w-xl gap-4 rounded-[28px] border border-stone-200/70 bg-white/85 p-8 text-left shadow-[0_24px_70px_rgba(120,113,108,0.16)] backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
          404
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
          That page drifted out of the playlist.
        </h1>
        <p className="text-sm leading-6 text-stone-600">
          Try heading back to your library or signing in again.
        </p>
        <Button asChild className="h-12 w-fit rounded-full px-6 text-sm font-semibold">
          <Link to="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
