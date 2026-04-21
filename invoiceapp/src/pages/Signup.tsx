import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
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
  }

  return (
    <div className="min-h-screen bg-surface-muted flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8">
          <AppLogo size={28} />
          <span className="font-semibold text-ink-900">InvoiceFlow</span>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-ink-900">Create an account</h2>
          <p className="mt-1.5 text-sm text-ink-400">
            Start managing your invoices in minutes
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Full name"
            type="text"
            placeholder="Alex Johnson"
            value={name}
            onChange={(e) => setName(e.target.value)}
            leftAddon={<User size={14} />}
            required
          />
          <Input
            label="Email address"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftAddon={<Mail size={14} />}
            required
          />
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Min. 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftAddon={<Lock size={14} />}
            rightAddon={
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-ink-400 hover:text-ink-600 transition-colors"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            }
            required
          />
          <Input
            label="Confirm password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Repeat password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            leftAddon={<Lock size={14} />}
            rightAddon={
              <button
                type="button"
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="text-ink-400 hover:text-ink-600 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            }
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            rightIcon={<ArrowRight size={16} />}
            className="w-full mt-2"
          >
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-ink-400">
          By signing up you agree to our{" "}
          <Link to="/terms" className="text-[#2B31E9] hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="text-[#2B31E9] hover:underline">
            Privacy Policy
          </Link>
          .
        </p>

        <p className="mt-4 text-center text-sm text-ink-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-[#2B31E9] hover:text-[#1d229f]"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
