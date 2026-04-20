import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import { AppLogo } from "../components/ui/AppLogo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
          "This account does not exist yet, or the password is incorrect. Create a new account to continue.",
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

      <div className="relative z-10 min-h-dvh px-4 sm:px-6 lg:px-8 2xl:px-10 py-10 sm:py-12 2xl:py-16 flex items-center">
        <div className="mx-auto w-full max-w-sm sm:max-w-md 2xl:max-w-lg">
          <div className="relative rounded-[24px] sm:rounded-[26px] 2xl:rounded-[30px] border border-white/60 bg-white/52 backdrop-blur-md shadow-[0_16px_48px_rgba(15,23,42,0.18)] px-5 sm:px-7 2xl:px-9 py-6 sm:py-8 2xl:py-10">
            <div className="absolute -top-8 sm:-top-9 left-1/2 -translate-x-1/2">
              <div>
                <AppLogo
                  size={80}
                  className="rounded-[20px] sm:rounded-[22px]"
                />
              </div>
            </div>

            <div className="pt-8 sm:pt-10">
              <div className="text-center mb-6 sm:mb-7 2xl:mb-9">
                <h1 className="text-[26px] sm:text-[30px] 2xl:text-[36px] leading-tight font-bold text-ink-900 tracking-tight">
                  Sign in with email
                </h1>
                <p className="mt-2 text-sm sm:text-[15px] 2xl:text-base text-ink-600 max-w-[32ch] mx-auto">
                  Make a new doc to bring your words, data, and teams together.
                  For free
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-3.5 2xl:space-y-4"
              >
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
                    className="w-full h-11 sm:h-12 2xl:h-[52px] rounded-xl 2xl:rounded-2xl bg-white/75 border border-white/80 focus:border-[#2B31E9] focus:ring-2 focus:ring-[#2B31E9]/25 outline-none pl-10 pr-3 text-sm sm:text-[15px] text-ink-800 placeholder:text-ink-400 transition"
                    required
                  />
                </div>

                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-11 sm:h-12 2xl:h-[52px] rounded-xl 2xl:rounded-2xl bg-white/75 border border-white/80 focus:border-[#2B31E9] focus:ring-2 focus:ring-[#2B31E9]/25 outline-none pl-10 pr-3 text-sm sm:text-[15px] text-ink-800 placeholder:text-ink-400 transition"
                    required
                  />
                </div>

                <div className="flex justify-end -mt-1">
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
                  className="w-full h-11 sm:h-12 2xl:h-[52px] rounded-xl 2xl:rounded-2xl bg-gradient-to-b from-[#1f2335] to-[#0d1020] text-white text-sm sm:text-[15px] font-semibold shadow-[0_8px_20px_rgba(17,24,39,0.45)] hover:from-[#22283f] hover:to-[#10142b] disabled:opacity-60 disabled:cursor-not-allowed transition"
                >
                  {isLoading ? "Signing in..." : "Continue"}
                </button>
              </form>

              <p className="mt-5 sm:mt-6 text-center text-sm sm:text-[15px] text-ink-600">
                New here?{" "}
                <Link
                  to="/signup"
                  className="font-semibold text-ink-900 hover:text-[#1d229f]"
                >
                  Create account
                </Link>
              </p>

              {import.meta.env.VITE_ENABLE_DEMO_MODE === "true" && (
                <p className="mt-3 text-center text-xs text-ink-500">
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
