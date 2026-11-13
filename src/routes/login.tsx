import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Lock, Mail, Sparkles, Store } from "lucide-react";
import { useApp } from "@/lib/store/app-context";
import { Btn } from "@/components/app/ui";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log In — Merchant Growth AI" },
      { name: "description", content: "Access your Merchant Growth AI account and business analytics." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { signIn, toggleDemoMode, user, business } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect
  if (user) {
    if (business && !business.onboardingCompleted) {
      navigate({ to: "/onboarding" as any });
    } else {
      navigate({ to: "/" as any });
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter your email and password");
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      toast.error("Authentication failed", { description: error.message });
    } else {
      toast.success("Welcome back!", { description: `Logged in as ${email}` });
      navigate({ to: "/" as any });
    }
  };

  const handleExploreDemo = () => {
    toggleDemoMode(true);
    toast.success("Demo Mode Activated", {
      description: "Loaded sample artisan coffee merchant workspace.",
    });
    navigate({ to: "/" as any });
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header Branding */}
        <div className="mb-8 text-center">
          <img
            src="/logo.png"
            alt="Merchant Growth AI"
            className="mx-auto mb-4 size-16 object-contain drop-shadow-md"
          />
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your Merchant Growth AI workspace
          </p>
        </div>

        {/* Card Form */}
        <div className="surface p-6 sm:p-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-card-foreground">
                Email Address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  required
                  placeholder="merchant@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background/50 py-2.5 pl-10 pr-4 text-sm font-medium transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-semibold text-card-foreground">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background/50 py-2.5 pl-10 pr-4 text-sm font-medium transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <Btn
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-2.5 text-sm font-semibold shadow-md"
            >
              {loading ? "Signing in…" : "Sign In to Dashboard"}
              <ArrowRight className="size-4" />
            </Btn>
          </form>

          <div className="relative my-6 text-center text-xs">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <span className="relative bg-card px-2 text-muted-foreground">or test without an account</span>
          </div>

          <button
            type="button"
            onClick={handleExploreDemo}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-primary/30 bg-primary/10 py-2.5 text-xs font-semibold text-ink transition-transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Sparkles className="size-3.5 text-primary" />
            Explore Pre-loaded Demo Store
          </button>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            Don't have an account yet?{" "}
            <Link to={"/signup" as any} className="font-semibold text-ink hover:underline">
              Create a free account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
