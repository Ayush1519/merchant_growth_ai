import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Check,
  CircleDollarSign,
  Package,
  Rocket,
  Sparkles,
  Target,
} from "lucide-react";
import { useApp } from "@/lib/store/app-context";
import { Btn, SectionTitle } from "@/components/app/ui";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Business Onboarding — Merchant Growth AI" },
      { name: "description", content: "Set up your business metrics, catalog, and growth goals." },
    ],
  }),
  component: OnboardingPage,
});

const ALL_GOALS = [
  { id: "sales", label: "Increase sales & revenue", desc: "Accelerate month-over-month revenue growth" },
  { id: "customers", label: "Get more new customers", desc: "Scale acquisition through social & ads" },
  { id: "retention", label: "Retain existing customers", desc: "Prevent churn and re-engage lapsed buyers" },
  { id: "marketing", label: "Improve marketing ROI", desc: "Generate high-converting AI campaigns" },
  { id: "performance", label: "Understand performance", desc: "Track sales velocity, cohorts & margins" },
  { id: "profit", label: "Maximize profit margins", desc: "Optimize unit economics & COGS" },
  { id: "inventory", label: "Optimize product inventory", desc: "Prevent stockouts on high-demand items" },
];

const CATEGORIES = [
  "Specialty Retail & Goods",
  "Café / Coffee & Beverage",
  "Apparel & Fashion",
  "Health, Wellness & Beauty",
  "Food & Restaurant",
  "Home & Lifestyle",
  "Electronics & Tech",
  "Artisan & Handcrafted",
  "Other",
];

function OnboardingPage() {
  const navigate = useNavigate();
  const { user, business, completeOnboarding, addProduct } = useApp();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form states
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [businessName, setBusinessName] = useState(business?.businessName || "");
  const [category, setCategory] = useState(business?.category || CATEGORIES[0]);
  const [description, setDescription] = useState(business?.description || "");
  const [location, setLocation] = useState(business?.location || "");
  const [employees, setEmployees] = useState(business?.employees || "1-5");
  const [yearsInBusiness, setYearsInBusiness] = useState(business?.yearsInBusiness || "1-2 years");

  // Financial baselines
  const [monthlyRevenueGoal, setMonthlyRevenueGoal] = useState<number>(50000);
  const [avgMonthlyRevenue, setAvgMonthlyRevenue] = useState<number>(15000);
  const [avgOrderValue, setAvgOrderValue] = useState<number>(35);
  const [monthlyOrders, setMonthlyOrders] = useState<number>(300);

  // Initial products
  const [initialProdName, setInitialProdName] = useState("");
  const [initialProdPrice, setInitialProdPrice] = useState<number>(25);
  const [initialProdCost, setInitialProdCost] = useState<number>(10);
  const [initialProdStock, setInitialProdStock] = useState<number>(50);
  const [initialProdCategory, setInitialProdCategory] = useState("Best Seller");

  // Selected Goals
  const [selectedGoals, setSelectedGoals] = useState<string[]>([
    "Increase sales & revenue",
    "Retain existing customers",
    "Improve marketing ROI",
  ]);

  const toggleGoal = (goalLabel: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalLabel) ? prev.filter((g) => g !== goalLabel) : [...prev, goalLabel]
    );
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      // Complete profile
      await completeOnboarding({
        businessName: businessName || "My Business",
        category,
        description,
        location,
        employees,
        yearsInBusiness,
        monthlyRevenueGoal: Number(monthlyRevenueGoal) || 0,
        avgMonthlyRevenue: Number(avgMonthlyRevenue) || 0,
        avgOrderValue: Number(avgOrderValue) || 0,
        monthlyOrders: Number(monthlyOrders) || 0,
        goals: selectedGoals,
      });

      // If user provided a starter product, create it
      if (initialProdName.trim()) {
        await addProduct({
          name: initialProdName.trim(),
          sku: "SKU-001",
          category: initialProdCategory || "General",
          description: "Initial starter product added during onboarding.",
          sellingPrice: Number(initialProdPrice) || 20,
          costPrice: Number(initialProdCost) || 8,
          stock: Number(initialProdStock) || 20,
          status: "in_stock",
        });
      }

      toast.success("Onboarding Completed! 🚀", {
        description: `Welcome to Merchant Growth AI, ${businessName || "Merchant"}!`,
      });

      navigate({ to: "/" as any });
    } catch (err) {
      console.error(err);
      toast.error("Error completing onboarding");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl py-8">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <span>Step {step} of 4</span>
          <span>{Math.round((step / 4) * 100)}% Completed</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border">
          <div
            className="bg-score h-full rounded-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1: Business Profile */}
      {step === 1 && (
        <div className="surface p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <Briefcase className="size-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-ink">Business Profile</h2>
              <p className="text-xs text-muted-foreground">Tell us about your company and store</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold">Business / Store Name *</label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Apex Coffee & Crafts"
                className="w-full rounded-xl border border-input bg-background/50 px-4 py-2.5 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold">Business Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background/50 px-3 py-2.5 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold">Location / City</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Austin, TX or Online"
                  className="w-full rounded-xl border border-input bg-background/50 px-4 py-2.5 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold">Team Size</label>
                <select
                  value={employees}
                  onChange={(e) => setEmployees(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background/50 px-3 py-2.5 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="Just me (Solo)">Just me (Solo)</option>
                  <option value="2-5 people">2-5 people</option>
                  <option value="6-15 people">6-15 people</option>
                  <option value="15+ people">15+ people</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold">Years in Business</label>
                <select
                  value={yearsInBusiness}
                  onChange={(e) => setYearsInBusiness(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background/50 px-3 py-2.5 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="Brand New (< 6 months)">Brand New (&lt; 6 months)</option>
                  <option value="6 - 12 months">6 - 12 months</option>
                  <option value="1 - 3 years">1 - 3 years</option>
                  <option value="3+ years">3+ years</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold">Brief Store Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What products or services do you specialize in?"
                className="w-full rounded-xl border border-input bg-background/50 px-4 py-2.5 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Btn
              onClick={() => {
                if (!businessName.trim()) {
                  toast.error("Please enter your business name");
                  return;
                }
                setStep(2);
              }}
              className="py-2.5 text-sm"
            >
              Continue to Financials <ArrowRight className="size-4" />
            </Btn>
          </div>
        </div>
      )}

      {/* Step 2: Financial Baseline */}
      {step === 2 && (
        <div className="surface p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <CircleDollarSign className="size-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-ink">Financial Baseline & Goals</h2>
              <p className="text-xs text-muted-foreground">Helps Growth AI calculate accurate velocity and score targets</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold">Monthly Revenue Goal (₹)</label>
                <input
                  type="number"
                  value={monthlyRevenueGoal}
                  onChange={(e) => setMonthlyRevenueGoal(Number(e.target.value))}
                  className="w-full rounded-xl border border-input bg-background/50 px-4 py-2.5 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold">Current Monthly Revenue (₹)</label>
                <input
                  type="number"
                  value={avgMonthlyRevenue}
                  onChange={(e) => setAvgMonthlyRevenue(Number(e.target.value))}
                  className="w-full rounded-xl border border-input bg-background/50 px-4 py-2.5 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold">Average Order Value / Ticket (₹)</label>
                <input
                  type="number"
                  value={avgOrderValue}
                  onChange={(e) => setAvgOrderValue(Number(e.target.value))}
                  className="w-full rounded-xl border border-input bg-background/50 px-4 py-2.5 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold">Estimated Monthly Orders</label>
                <input
                  type="number"
                  value={monthlyOrders}
                  onChange={(e) => setMonthlyOrders(Number(e.target.value))}
                  className="w-full rounded-xl border border-input bg-background/50 px-4 py-2.5 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-ink"
            >
              <ArrowLeft className="size-4" /> Back
            </button>
            <Btn onClick={() => setStep(3)} className="py-2.5 text-sm">
              Continue to Catalog <ArrowRight className="size-4" />
            </Btn>
          </div>
        </div>
      )}

      {/* Step 3: Starter Product (Optional) */}
      {step === 3 && (
        <div className="surface p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <Package className="size-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-ink">Add Your First Product</h2>
              <p className="text-xs text-muted-foreground">Add a flagship item now or add more later from the catalog</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold">Product / Item Name</label>
              <input
                type="text"
                value={initialProdName}
                onChange={(e) => setInitialProdName(e.target.value)}
                placeholder="e.g. Signature Ceramic Mug (or leave blank for now)"
                className="w-full rounded-xl border border-input bg-background/50 px-4 py-2.5 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {initialProdName.trim() && (
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold">Selling Price (₹)</label>
                  <input
                    type="number"
                    value={initialProdPrice}
                    onChange={(e) => setInitialProdPrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold">Cost Price (₹)</label>
                  <input
                    type="number"
                    value={initialProdCost}
                    onChange={(e) => setInitialProdCost(Number(e.target.value))}
                    className="w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold">Initial Stock</label>
                  <input
                    type="number"
                    value={initialProdStock}
                    onChange={(e) => setInitialProdStock(Number(e.target.value))}
                    className="w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-ink"
            >
              <ArrowLeft className="size-4" /> Back
            </button>
            <Btn onClick={() => setStep(4)} className="py-2.5 text-sm">
              Continue to Goals <ArrowRight className="size-4" />
            </Btn>
          </div>
        </div>
      )}

      {/* Step 4: Growth Goals */}
      {step === 4 && (
        <div className="surface p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <Target className="size-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-ink">What are your primary goals?</h2>
              <p className="text-xs text-muted-foreground">Select what matters most to customize your AI recommendations</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {ALL_GOALS.map((goal) => {
              const active = selectedGoals.includes(goal.label);
              return (
                <button
                  type="button"
                  key={goal.id}
                  onClick={() => toggleGoal(goal.label)}
                  className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                    active
                      ? "border-primary bg-primary/10 ring-1 ring-primary/40"
                      : "border-border bg-card/60 hover:bg-muted"
                  }`}
                >
                  <div
                    className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border ${
                      active ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"
                    }`}
                  >
                    {active && <Check className="size-3" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">{goal.label}</p>
                    <p className="text-xs text-muted-foreground">{goal.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-ink"
            >
              <ArrowLeft className="size-4" /> Back
            </button>
            <Btn
              onClick={handleFinish}
              disabled={loading}
              className="py-2.5 text-sm font-semibold shadow-lg"
            >
              <Sparkles className="size-4" />
              {loading ? "Generating Dashboard…" : "Launch My Workspace"}
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
}
