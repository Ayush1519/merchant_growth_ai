import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Lock, Mail, Phone, Store, User } from "lucide-react";
import { useApp } from "@/lib/store/app-context";
import { Btn } from "@/components/app/ui";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign Up — Merchant Growth AI" },
      { name: "description", content: "Create your merchant account to unlock AI analytics, inventory alerts, and growth campaigns." },
    ],
  }),
  component: SignUpPage,
});

function SignUpPage() {
  const navigate = useNavigate();
  const { signUp, user } = useApp();

  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    navigate({ to: "/onboarding" as any });
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password || !businessName) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, fullName, phone, businessName);
    setLoading(false);

    if (error) {
      toast.error("Registration failed", { description: error.message });
    } else {
      toast.success("Account created successfully! 🎉", {
        description: "Let's set up your business profile and growth targets.",
      });
      navigate({ to: "/onboarding" as any });
    }
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
            Start Growing Today
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your Merchant Growth AI account in 30 seconds
          </p>
        </div>

        {/* Form Card */}
        <div className="surface p-6 sm:p-8">
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-card-foreground">
                Your Full Name *
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Rivera"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background/50 py-2.5 pl-10 pr-4 text-sm font-medium transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-card-foreground">
                Business / Store Name *
              </label>
              <div className="relative">
                <Store className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Blue Peak Artisan Goods"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background/50 py-2.5 pl-10 pr-4 text-sm font-medium transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-card-foreground">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    placeholder="you@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background/50 py-2.5 pl-10 pr-3 text-sm font-medium transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-card-foreground">
                  Phone (Optional)
                </label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background/50 py-2.5 pl-10 pr-3 text-sm font-medium transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-card-foreground">
                Password *
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background/50 py-2.5 pl-10 pr-4 text-sm font-medium transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <Btn
              type="submit"
              disabled={loading}
              className="mt-4 w-full py-2.5 text-sm font-semibold shadow-md"
            >
              {loading ? "Creating Account…" : "Create Merchant Account"}
              <ArrowRight className="size-4" />
            </Btn>
          </form>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link to={"/login" as any} className="font-semibold text-ink hover:underline">
              Log in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
