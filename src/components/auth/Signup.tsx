import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";

const shellClassName =
  "min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.18),transparent_24%),radial-gradient(circle_at_top_right,rgba(236,72,153,0.12),transparent_18%),linear-gradient(180deg,#fff8f1_0%,#f4f1eb_48%,#efece6_100%)] px-4 py-10";
const panelClassName =
  "mx-auto grid w-full max-w-2xl gap-8 rounded-[28px] border border-stone-200/70 bg-white/85 p-6 shadow-[0_24px_70px_rgba(120,113,108,0.16)] backdrop-blur md:p-8";
const inputClassName =
  "h-12 w-full rounded-2xl border border-stone-200 bg-white/90 px-4 text-sm text-stone-900 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100";

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    email: "",
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await signup(formData);
      navigate("/", { replace: true });
    } catch (submitError) {
      setError(
        submitError instanceof ApiError
          ? submitError.message
          : "Unable to create your account right now.",
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
            Start fresh
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900 md:text-4xl">
            Create your URLVibe account.
          </h1>
          <p className="max-w-xl text-sm leading-6 text-stone-600 md:text-base">
            Save YouTube links into custom playlists, mark favorites, and loop
            the exact view you are in.
          </p>
        </div>

        <form className="grid gap-5" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-medium text-stone-700">
            <span>First name</span>
            <input
              className={inputClassName}
              name="firstName"
              type="text"
              autoComplete="given-name"
              value={formData.firstName}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  firstName: event.target.value,
                }))
              }
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-stone-700">
            <span>Email</span>
            <input
              className={inputClassName}
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-stone-700">
            <span>Username</span>
            <input
              className={inputClassName}
              name="username"
              type="text"
              autoComplete="username"
              value={formData.username}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  username: event.target.value,
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
              autoComplete="new-password"
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
            {isSubmitting ? "Creating account..." : "Sign up"}
          </Button>
        </form>

        <p className="text-sm text-stone-600">
          Already have an account?{" "}
          <Link className="font-semibold text-amber-700 hover:text-amber-800" to="/login">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
