import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  Bell,
  Briefcase,
  Check,
  Globe,
  Lock,
  LogOut,
  Moon,
  Shield,
  Sparkles,
  Sun,
  Trash2,
  User,
} from "lucide-react";
import { useApp } from "@/lib/store/app-context";
import { Btn, PageHeader, SectionTitle } from "@/components/app/ui";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings & Profile — Merchant Growth AI" },
      { name: "description", content: "Manage your merchant profile, business parameters, notifications, and security." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const { user, business, settings, updateBusinessProfile, updateSettings, signOut, resetPassword } = useApp();

  // Profile Form
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");

  // Business Form
  const [businessName, setBusinessName] = useState(business?.businessName || "");
  const [category, setCategory] = useState(business?.category || "Specialty Retail & Goods");
  const [location, setLocation] = useState(business?.location || "");
  const [description, setDescription] = useState(business?.description || "");
  const [currency, setCurrency] = useState("INR");

  // Notifications
  const [emailNotifs, setEmailNotifs] = useState(settings?.emailNotifications ?? true);
  const [aiNotifs, setAiNotifs] = useState(settings?.aiInsightsNotifications ?? true);
  const [mktNotifs, setMktNotifs] = useState(settings?.marketingNotifications ?? true);

  // Theme
  const [theme, setTheme] = useState<"light" | "dark">((settings?.theme as any) || "light");

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateBusinessProfile({
      businessName,
      category,
      location,
      description,
      currency,
    });
    toast.success("Business profile saved! ✅");
  };

  const handleSaveNotifications = async () => {
    await updateSettings({
      emailNotifications: emailNotifs,
      aiInsightsNotifications: aiNotifs,
      marketingNotifications: mktNotifs,
      theme,
    });
    toast.success("Notification preferences updated");
  };

  const toggleTheme = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    updateSettings({ theme: newTheme });
    toast.info(`Switched to ${newTheme} mode`);
  };

  const handlePasswordReset = async () => {
    if (user?.email) {
      await resetPassword(user.email);
      toast.success("Password reset email sent", { description: user.email });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate({ to: "/login" as any });
  };

  return (
    <div className="mx-auto max-w-[1000px] space-y-8">
      <PageHeader
        eyebrow="Configuration"
        title="Settings & Workspace"
        description="Manage your account profile, store parameters, alert triggers, and preferences."
      />

      {/* Business Information */}
      <div className="surface p-6 sm:p-8">
        <SectionTitle
          title="Business Profile"
          hint="Your store identity and categorization used by Growth AI models"
        />
        <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold">Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold">Store Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold">Location / Base</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Austin, TX"
                className="w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="INR">INR (₹)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Btn type="submit" className="py-2 text-xs">
              Save Business Details
            </Btn>
          </div>
        </form>
      </div>

      {/* Notifications & AI Insights */}
      <div className="surface p-6 sm:p-8">
        <SectionTitle
          title="Notification Preferences"
          hint="Control real-time alerts for low inventory and sales spikes"
        />
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-ink">AI Insights & Growth Alerts</p>
              <p className="text-xs text-muted-foreground">
                Get notified when Growth AI identifies an actionable revenue opportunity
              </p>
            </div>
            <input
              type="checkbox"
              checked={aiNotifs}
              onChange={(e) => {
                setAiNotifs(e.target.checked);
                updateSettings({ aiInsightsNotifications: e.target.checked });
              }}
              className="size-4 accent-primary"
            />
          </div>

          <div className="flex items-center justify-between border-t border-border pt-4">
            <div>
              <p className="text-sm font-semibold text-ink">Low Inventory Warnings</p>
              <p className="text-xs text-muted-foreground">
                Receive warnings when any product stock dips below 5 units
              </p>
            </div>
            <input
              type="checkbox"
              checked={emailNotifs}
              onChange={(e) => {
                setEmailNotifs(e.target.checked);
                updateSettings({ emailNotifications: e.target.checked });
              }}
              className="size-4 accent-primary"
            />
          </div>

          <div className="flex items-center justify-between border-t border-border pt-4">
            <div>
              <p className="text-sm font-semibold text-ink">Marketing Campaign Milestones</p>
              <p className="text-xs text-muted-foreground">
                Alerts when campaigns hit revenue or reach milestones
              </p>
            </div>
            <input
              type="checkbox"
              checked={mktNotifs}
              onChange={(e) => {
                setMktNotifs(e.target.checked);
                updateSettings({ marketingNotifications: e.target.checked });
              }}
              className="size-4 accent-primary"
            />
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="surface p-6 sm:p-8">
        <SectionTitle title="Appearance" hint="Customize your visual theme" />
        <div className="flex gap-4 pt-2">
          <button
            type="button"
            onClick={() => toggleTheme("light")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-2xl border p-4 text-xs font-semibold transition-all ${
              theme === "light"
                ? "border-primary bg-primary/10 text-ink ring-1 ring-primary/30"
                : "border-border bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            <Sun className="size-4 text-warning" /> Light Mode
          </button>
          <button
            type="button"
            onClick={() => toggleTheme("dark")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-2xl border p-4 text-xs font-semibold transition-all ${
              theme === "dark"
                ? "border-primary bg-primary/10 text-ink ring-1 ring-primary/30"
                : "border-border bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            <Moon className="size-4 text-secondary" /> Dark Mode
          </button>
        </div>
      </div>

      {/* Security & Sign Out */}
      <div className="surface p-6 sm:p-8">
        <SectionTitle title="Account & Security" hint="Password reset and session management" />
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-ink">Account Email</p>
              <p className="text-xs text-muted-foreground">{user?.email || "Signed in as Demo"}</p>
            </div>
            <button
              onClick={handlePasswordReset}
              className="rounded-full border border-input bg-card px-4 py-2 text-xs font-semibold text-ink hover:bg-muted"
            >
              Request Password Reset
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-border pt-4">
            <div>
              <p className="text-sm font-semibold text-destructive">Sign Out</p>
              <p className="text-xs text-muted-foreground">End your current session on this device</p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center justify-center gap-1.5 rounded-full bg-destructive/10 px-4 py-2 text-xs font-bold text-destructive hover:bg-destructive/20"
            >
              <LogOut className="size-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
