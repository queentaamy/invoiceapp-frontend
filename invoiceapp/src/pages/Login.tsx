import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import { AppLogo } from "../components/ui/AppLogo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const { error } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      error("Missing fields", "Please enter your email and password.");
      return;
    }
    setIsLoading(true);
    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch (e) {
      const rawMessage =
        e instanceof Error
          ? e.message
          : "Something went wrong. Please try again.";
      const message = rawMessage.toLowerCase();
      const looksLikeInvalidLogin =
        message.includes("invalid") ||
        message.includes("unauthorized") ||
        message.includes("401") ||
        message.includes("not found");
      const looksLikeNetworkIssue =
        message.includes("failed to fetch") ||
        message.includes("network") ||
        message.includes("cors") ||
        message.includes("load failed");

      if (looksLikeInvalidLogin) {
        error(
          "Unable to sign in",
          "This account does not exist yet, or the password is incorrect. Create a new account to sign-in.",
        );
      } else if (looksLikeNetworkIssue) {
        error(
          "Connection problem",
          "We could not reach the server. The backend may be down/asleep, your internet may be unstable, or CORS/API URL may be misconfigured.",
        );
      } else {
        error("Unable to sign in", rawMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className="relative min-h-dvh overflow-x-hidden bg-center bg-cover"
      style={{ backgroundImage: "url('/bg-invoiceapp.png')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-sky-100/45 via-white/20 to-white/35" />

      <div className="relative z-10 flex min-h-dvh items-center px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto w-full max-w-sm sm:max-w-[26rem]">
          <div className="relative rounded-[24px] border border-white/65 bg-white/54 px-5 py-5 shadow-[0_18px_44px_rgba(15,23,42,0.16)] backdrop-blur-md sm:px-6 sm:py-6">
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 sm:-top-8">
              <div>
                <AppLogo
                  size={68}
                  className="rounded-[18px] sm:rounded-[20px]"
                />
              </div>
            </div>

            <div className="pt-7 sm:pt-8">
              <div className="mb-5 text-center sm:mb-6">
                <h1 className="text-[24px] font-bold leading-tight tracking-tight text-ink-900 sm:text-[28px]">
                  Sign in with email
                </h1>
                <p className="mx-auto mt-2 max-w-[28ch] text-sm leading-6 text-ink-600 sm:text-[15px]">
                  Make a new doc to bring your words, data, and teams together.
                  For free
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 w-full rounded-xl border border-white/80 bg-white/78 pl-10 pr-3 text-sm text-ink-800 transition placeholder:text-ink-400 focus:border-[#2B31E9] focus:ring-2 focus:ring-[#2B31E9]/25 focus:outline-none sm:h-[46px] sm:text-[15px]"
                    required
                  />
                </div>

                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 w-full rounded-xl border border-white/80 bg-white/78 pl-10 pr-10 text-sm text-ink-800 transition placeholder:text-ink-400 focus:border-[#2B31E9] focus:ring-2 focus:ring-[#2B31E9]/25 focus:outline-none sm:h-[46px] sm:text-[15px]"
                    required
                  />
                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div className="flex justify-end pt-0.5">
                  <button
                    type="button"
                    className="text-xs sm:text-[13px] text-ink-500 hover:text-ink-700 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-1 h-11 w-full rounded-xl bg-gradient-to-b from-[#1f2335] to-[#0d1020] text-sm font-semibold text-white shadow-[0_8px_20px_rgba(17,24,39,0.34)] transition hover:from-[#22283f] hover:to-[#10142b] disabled:cursor-not-allowed disabled:opacity-60 sm:h-[46px] sm:text-[15px]"
                >
                  {isLoading ? "Signing in..." : "Continue"}
                </button>
              </form>

              <p className="mt-4 text-center text-sm text-ink-600 sm:mt-5 sm:text-[15px]">
                New here?{" "}
                <Link
                  to="/signup"
                  className="font-semibold text-ink-900 hover:text-[#1d229f]"
                >
                  Create account
                </Link>
              </p>

              {import.meta.env.VITE_ENABLE_DEMO_MODE === "true" && (
                <p className="mt-2.5 text-center text-xs text-ink-500">
                  Demo mode active: any email and password can sign in.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
