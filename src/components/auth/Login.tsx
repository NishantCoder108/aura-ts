import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";

const shellClassName =
  "min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.18),transparent_24%),radial-gradient(circle_at_top_right,rgba(236,72,153,0.12),transparent_18%),linear-gradient(180deg,#fff8f1_0%,#f4f1eb_48%,#efece6_100%)] px-4 py-10";
const panelClassName =
  "mx-auto grid w-full max-w-2xl gap-8 rounded-[28px] border border-stone-200/70 bg-white/85 p-6 shadow-[0_24px_70px_rgba(120,113,108,0.16)] backdrop-blur md:p-8";
const inputClassName =
  "h-12 w-full rounded-2xl border border-stone-200 bg-white/90 px-4 text-sm text-stone-900 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(formData);
      const nextPath =
        typeof location.state === "object" &&
        location.state !== null &&
        "from" in location.state &&
        typeof location.state.from === "object" &&
        location.state.from !== null &&
        "pathname" in location.state.from &&
        typeof location.state.from.pathname === "string"
          ? location.state.from.pathname
          : "/";

      navigate(nextPath, { replace: true });
    } catch (submitError) {
      setError(
        submitError instanceof ApiError
          ? submitError.message
          : "Unable to sign in right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={shellClassName}>
      <div className={panelClassName}>
        <div className="grid gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
            Welcome back
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900 md:text-4xl">
            Log in to your URLVibe library.
          </h1>
          <p className="max-w-xl text-sm leading-6 text-stone-600 md:text-base">
            Use your email or username to get back to your playlists, favorites,
            and loop queue.
          </p>
        </div>

        <form className="grid gap-5" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-medium text-stone-700">
            <span>Email or username</span>
            <input
              className={inputClassName}
              name="identifier"
              type="text"
              autoComplete="username"
              value={formData.identifier}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  identifier: event.target.value,
                }))
              }
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-stone-700">
            <span>Password</span>
            <input
              className={inputClassName}
              name="password"
              type="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
            />
          </label>

          {error ? <p className="text-sm text-red-700">{error}</p> : null}

          <Button className="h-12 rounded-full text-sm font-semibold" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Log in"}
          </Button>
        </form>

        <p className="text-sm text-stone-600">
          Need an account?{" "}
          <Link className="font-semibold text-amber-700 hover:text-amber-800" to="/signup">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
