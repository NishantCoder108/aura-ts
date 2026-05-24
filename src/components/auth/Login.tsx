import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import logo from "@/assets/logo.svg";

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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
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
    <div className="flex items-center justify-center min-h-screen font-circular">
      <div className="max-w-80 p-3">
        <div className="flex  gap-3 flex-col mb-11">
          <div className="flex items-center justify-center">
            <img src={logo} alt="ZenPlay Logo" className="h-16 w-16" />
          </div>
          <h2 className="text-xl text-start font-semibold  tracking-tight text-[#4e4e4e]">
            Sign in to ZenPlay
          </h2>
        </div>
        {error ? <span className="text-sm font-semibold text-red-500">{error}</span> : null}

        <form className="grid gap-5" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-xs font-medium text-[#919498]">
            <span>Email or username</span>
            <input
              className="h-9 rounded-md border text-[#4e4e4e] border-stone-300 px-3 py-2 text-sm"
              name="identifier"
              type="text"
              required
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

          <label className="grid gap-2 text-xs font-medium text-[#919498]">
            <span>Password</span>
            <input
              className="h-9 rounded-md border text-[#4e4e4e] border-stone-300 px-3 py-2 text-sm"
              name="password"
              type="password"
              required
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

          <Button className="h-9 rounded-md text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white   w-full  cursor-pointer" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Continue"}
          </Button>
        </form>

        <p className="text-xs sm:text-sm text-[#919498] mt-2 " >
          By continuing, you are indicating that you accept our <span className="underline">Terms of Service</span> and <span className="underline">Privacy Policy</span>
        </p>
        <p className="text-sm text-[#919498] mt-2">
          Don't have an account?
          <Link className="font-semibold text-blue-600 hover:text-blue-700 underline pl-1" to="/signup">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
