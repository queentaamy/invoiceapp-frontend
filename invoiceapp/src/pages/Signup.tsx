import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import { AppLogo } from "../components/ui/AppLogo";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signup, isAuthenticated } = useAuth();
  const { error, success } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !password) {
      error("Missing fields", "Please fill in all required fields.");
      return;
    }
    if (password !== confirm) {
      error("Password mismatch", "Your passwords do not match.");
      return;
    }
    if (password.length < 8) {
      error("Password too short", "Password must be at least 8 characters.");
      return;
    }
    setIsLoading(true);
    try {
      await signup({ name, email, password });
      success("Account created!", "Welcome to InvoiceFlow.");
      navigate("/dashboard");
    } catch (e) {
      error(
        "Signup failed",
        e instanceof Error ? e.message : "Something went wrong",
      );
    } finally {
      setIsLoading(false);
    }
    return;
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
                  Create your account
                </h1>
                <p className="mt-2 text-sm sm:text-[15px] 2xl:text-base text-ink-600 max-w-[32ch] mx-auto">
                  Start managing invoices with the same seamless experience.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-3.5 2xl:space-y-4"
              >
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
                  />
                  <input
                    type="text"
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-11 sm:h-12 2xl:h-[52px] rounded-xl 2xl:rounded-2xl bg-white/75 border border-white/80 focus:border-[#2B31E9] focus:ring-2 focus:ring-[#2B31E9]/25 outline-none pl-10 pr-3 text-sm sm:text-[15px] text-ink-800 placeholder:text-ink-400 transition"
                    required
                  />
                </div>

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
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-11 sm:h-12 2xl:h-[52px] rounded-xl 2xl:rounded-2xl bg-white/75 border border-white/80 focus:border-[#2B31E9] focus:ring-2 focus:ring-[#2B31E9]/25 outline-none pl-10 pr-10 text-sm sm:text-[15px] text-ink-800 placeholder:text-ink-400 transition"
                    required
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
                  />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full h-11 sm:h-12 2xl:h-[52px] rounded-xl 2xl:rounded-2xl bg-white/75 border border-white/80 focus:border-[#2B31E9] focus:ring-2 focus:ring-[#2B31E9]/25 outline-none pl-10 pr-10 text-sm sm:text-[15px] text-ink-800 placeholder:text-ink-400 transition"
                    required
                  />
                  <button
                    type="button"
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 sm:h-12 2xl:h-[52px] rounded-xl 2xl:rounded-2xl bg-gradient-to-b from-[#1f2335] to-[#0d1020] text-white text-sm sm:text-[15px] font-semibold shadow-[0_8px_20px_rgba(17,24,39,0.45)] hover:from-[#22283f] hover:to-[#10142b] disabled:opacity-60 disabled:cursor-not-allowed transition"
                >
                  {isLoading ? "Creating account..." : "Create account"}
                </button>
              </form>

              <p className="mt-4 text-center text-xs text-ink-500 leading-relaxed">
                By signing up you agree to our{" "}
                <Link to="/terms" className="font-semibold text-ink-900 hover:text-[#1d229f]">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="font-semibold text-ink-900 hover:text-[#1d229f]">
                  Privacy Policy
                </Link>
                .
              </p>

              <p className="mt-4 text-center text-sm sm:text-[15px] text-ink-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-ink-900 hover:text-[#1d229f]"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
