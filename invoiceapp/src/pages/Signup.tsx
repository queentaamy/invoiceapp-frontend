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
      className="auth-stage-enter relative h-dvh overflow-hidden bg-center bg-cover"
      style={{ backgroundImage: "url('/bg-invoiceapp.png')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-sky-100/45 via-white/20 to-white/35" />
      <div className="auth-glow-enter pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.72)_0%,rgba(191,219,254,0.34)_38%,rgba(255,255,255,0)_72%)]" />

      <div className="relative z-10 h-full overflow-y-auto overscroll-contain px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-full items-center justify-center py-4 sm:py-6">
          <div className="mx-auto w-full max-w-sm sm:max-w-[26rem]">
            <div className="auth-card-enter relative rounded-[24px] border border-white/65 bg-white/54 px-5 py-5 shadow-[0_18px_44px_rgba(15,23,42,0.16)] backdrop-blur-md sm:px-6 sm:py-6">
              <div className="auth-logo-enter absolute -top-7 left-1/2 sm:-top-8">
                <div>
                  <AppLogo
                    size={68}
                    className="rounded-[18px] sm:rounded-[20px]"
                  />
                </div>
              </div>

              <div className="pt-7 sm:pt-8">
                <div className="auth-copy-enter mb-5 text-center sm:mb-6">
                  <h1 className="text-[24px] font-bold leading-tight tracking-tight text-ink-900 sm:text-[28px]">
                    Create your account
                  </h1>
                  <p className="mx-auto mt-2 max-w-[29ch] text-sm leading-6 text-ink-600 sm:text-[15px]">
                    Start managing invoices with the same seamless experience.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form-stagger space-y-3">
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
                      className="h-11 w-full rounded-xl border border-white/80 bg-white/78 pl-10 pr-3 text-base text-ink-800 transition placeholder:text-ink-400 focus:border-[#2B31E9] focus:ring-2 focus:ring-[#2B31E9]/25 focus:outline-none sm:h-[46px]"
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
                      className="h-11 w-full rounded-xl border border-white/80 bg-white/78 pl-10 pr-3 text-base text-ink-800 transition placeholder:text-ink-400 focus:border-[#2B31E9] focus:ring-2 focus:ring-[#2B31E9]/25 focus:outline-none sm:h-[46px]"
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
                      className="h-11 w-full rounded-xl border border-white/80 bg-white/78 pl-10 pr-10 text-base text-ink-800 transition placeholder:text-ink-400 focus:border-[#2B31E9] focus:ring-2 focus:ring-[#2B31E9]/25 focus:outline-none sm:h-[46px]"
                      required
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 transition-colors hover:text-ink-600"
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
                      className="h-11 w-full rounded-xl border border-white/80 bg-white/78 pl-10 pr-10 text-base text-ink-800 transition placeholder:text-ink-400 focus:border-[#2B31E9] focus:ring-2 focus:ring-[#2B31E9]/25 focus:outline-none sm:h-[46px]"
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 transition-colors hover:text-ink-600"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="mt-1 h-11 w-full rounded-xl bg-gradient-to-b from-[#1f2335] to-[#0d1020] text-sm font-semibold text-white shadow-[0_8px_20px_rgba(17,24,39,0.34)] transition hover:from-[#22283f] hover:to-[#10142b] disabled:cursor-not-allowed disabled:opacity-60 sm:h-[46px] sm:text-[15px]"
                  >
                    {isLoading ? "Creating account..." : "Create account"}
                  </button>
                </form>

                <p className="mt-3.5 text-center text-xs leading-relaxed text-ink-500">
                  By signing up you agree to our{" "}
                  <Link
                    to="/terms"
                    className="font-semibold text-ink-900 hover:text-[#1d229f]"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy"
                    className="font-semibold text-ink-900 hover:text-[#1d229f]"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>

                <p className="mt-4 text-center text-sm text-ink-600 sm:text-[15px]">
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
    </div>
  );
}
