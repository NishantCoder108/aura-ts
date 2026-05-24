import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import logo from "@/assets/logo.svg";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";


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
    <div className="flex items-center justify-center min-h-screen font-circular">
      <div className="max-w-80 p-3">
        <div className="flex  gap-3 flex-col mb-11">
          <div className="flex items-center justify-center">
            <img src={logo} alt="ZenPlay Logo" className="h-16 w-16" />
          </div>
          <h2 className="text-xl text-start font-semibold  tracking-tight text-[#4e4e4e]">
            Create a ZenPlay account
          </h2>

        </div>
        {error ? <span className="text-sm font-semibold text-red-500">{error}</span> : null}


        <form className="grid gap-5" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-xs font-medium text-[#919498]">
            <span>First name</span>
            <input
              className="h-9 rounded-md border text-[#4e4e4e] border-stone-300 px-3 py-2 text-sm"
              name="firstName"
              type="text"
              required
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

          <label className="grid gap-2 text-xs font-medium text-[#919498]">
            <span>Email</span>
            <input
              className="h-9 rounded-md border text-[#4e4e4e] border-stone-300 px-3 py-2 text-sm"
              name="email"
              type="email"
              required
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

          <label className="grid gap-2 text-xs font-medium text-[#919498]">
            <span>Username</span>
            <input
              className="h-9 rounded-md border text-[#4e4e4e] border-stone-300 px-3 py-2 text-sm"
              name="username"
              type="text"
              required
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

          <label className="grid gap-2 text-xs font-medium text-[#919498]">
            <span>Password</span>
            <input
              className="h-9 rounded-md border text-[#4e4e4e] border-stone-300 px-3 py-2 text-sm"
              name="password"
              type="password"
              required
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



          <Button className="h-9 rounded-md text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white w-full cursor-pointer" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Continue"}
          </Button>
        </form>
        <p className="text-xs sm:text-sm text-[#919498] mt-2 " >
          By continuing, you are indicating that you accept our <span className="underline">Terms of Service</span> and <span className="underline">Privacy Policy</span>
        </p>
        <p className="text-sm text-[#919498] mt-2 ">
          Already have an account?{" "}
          <Link className="font-semibold text-blue-600 hover:text-blue-700 underline pl-1" to="/login">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
