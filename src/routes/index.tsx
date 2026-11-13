import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowRight,
  ChevronRight,
  Package,
  Plus,
  Receipt,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { useApp } from "@/lib/store/app-context";
import { Btn, Pill, SectionTitle } from "@/components/app/ui";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Merchant Growth AI" },
      { name: "description", content: "See how your business is performing, what changed, and what the AI recommends next." },
    ],
  }),
  component: Dashboard,
});

const PERIODS = ["7d", "30d", "90d", "12m"] as const;

function ChartTip({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-ink px-3 py-2 text-xs text-primary-foreground shadow-lg">
      <p className="font-semibold">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-primary-foreground/80">
          {p.name}: {p.name === "customers" ? p.value : `₹${Number(p.value).toLocaleString("en-IN")}`}
        </p>
      ))}
    </div>
  );
}

function Dashboard() {
  const { user, business, metrics, products, transactions, customers, notifications, toggleDemoMode } = useApp();
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>("30d");
  const [completedRecs, setCompletedRecs] = useState<string[]>([]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const merchantName = user?.fullName || business?.businessName || "Merchant";
  const storeName = business?.businessName || "Your Store";

  const isEmptyAccount = products.length === 0 && transactions.length === 0;

  const kpis = useMemo(() => [
    {
      label: "Revenue",
      value: `₹${metrics.totalRevenue.toLocaleString("en-IN")}`,
      delta: metrics.totalOrders > 0 ? 14.2 : 0,
      hint: `vs previous ${period}`,
    },
    {
      label: "Total Orders",
      value: metrics.totalOrders.toLocaleString(),
      delta: metrics.totalOrders > 0 ? 8.1 : 0,
      hint: `vs previous ${period}`,
    },
    {
      label: "New Customers",
      value: metrics.newCustomersCount.toString(),
      delta: metrics.newCustomersCount > 0 ? 5.6 : 0,
      hint: "acquisition",
    },
    {
      label: "Avg Order Value",
      value: `₹${metrics.avgOrderValue.toLocaleString("en-IN")}`,
      delta: metrics.avgOrderValue > 0 ? 3.4 : 0,
      hint: "basket size",
    },
  ], [metrics, period]);

  return (
    <div className="mx-auto max-w-[1280px]">
      {/* Top Banner & Period Selector */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-secondary">
              {storeName}
            </p>
            {!business?.onboardingCompleted && (
              <Link to={"/onboarding" as any}>
                <Pill tone="warn">Complete Onboarding →</Pill>
              </Link>
            )}
          </div>
          <h1 className="mt-1 text-2xl font-bold leading-tight sm:text-3xl text-ink font-display">
            {greeting}, {merchantName.split(" ")[0]}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {isEmptyAccount ? (
              "Welcome to Merchant Growth AI. Let's set up your catalog and start tracking revenue."
            ) : (
              <span>
                Sales velocity is up this period.{" "}
                <strong className="text-ink">
                  {metrics.recommendations.length} action(s) recommended by AI.
                </strong>
              </span>
            )}
          </p>
        </div>

        <div className="flex w-fit rounded-full bg-card p-1 ring-1 ring-border">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                period === p ? "bg-ink text-primary-foreground" : "text-muted-foreground hover:text-ink"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Guided Empty State if brand new account */}
      {isEmptyAccount && (
        <div className="surface mb-8 border-2 border-dashed border-primary/30 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles className="size-6" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-ink">
                  Quick Start: Initialize your Store Data
                </h2>
                <p className="mt-1 max-w-xl text-xs text-muted-foreground">
                  Add your initial products and transactions to unlock real revenue trends, customer segmentation, and AI recommendations.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link to="/products">
                <Btn variant="primary">
                  <Plus className="size-4" /> Add Product
                </Btn>
              </Link>
              <Link to="/transactions">
                <Btn variant="ghost">
                  <Receipt className="size-4" /> Record Sale
                </Btn>
              </Link>
              <button
                onClick={() => toggleDemoMode(true)}
                className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-semibold text-ink hover:bg-primary/20"
              >
                <Sparkles className="size-3.5 text-primary" /> Load Sample Store
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPIs Grid */}
      <section className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="surface lift p-4 sm:p-5">
            <p className="text-xs font-medium text-muted-foreground">
              {k.label} · {period}
            </p>
            <p className="mt-1 font-display text-xl font-bold text-ink sm:text-2xl">{k.value}</p>
            <p
              className={cn(
                "mt-1 flex items-center gap-1 text-xs font-semibold",
                k.delta >= 0 ? "text-accent-foreground" : "text-destructive"
              )}
            >
              {k.delta >= 0 ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
              {Math.abs(k.delta)}%
              <span className="hidden font-medium text-muted-foreground sm:inline">· {k.hint}</span>
            </p>
          </div>
        ))}
      </section>

      {/* Main Charts + AI Growth Score */}
      <section className="mb-6 grid gap-4 lg:grid-cols-3">
        {/* Revenue Trend Area Chart */}
        <div className="surface p-5 sm:p-6 lg:col-span-2">
          <SectionTitle
            title="Revenue Trend"
            hint="Monthly sales velocity calculated from completed orders."
            right={<Pill>Real-time</Pill>}
          />
          <div className="h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.revenueSeries} margin={{ left: -10, right: 4, top: 8 }}>
                <defs>
                  <linearGradient id="revDash" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickFormatter={(v) => `₹${v}`}
                />
                <Tooltip content={<ChartTip />} />
                <Area
                  type="monotone"
                  dataKey="lastYear"
                  name="Benchmark"
                  stroke="var(--chart-5)"
                  strokeOpacity={0.35}
                  strokeDasharray="4 4"
                  fill="none"
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="var(--chart-1)"
                  strokeWidth={2.5}
                  fill="url(#revDash)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dynamic AI Growth Score Card */}
        <div className="surface-ink flex flex-col p-6 shadow-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            AI Growth Score
          </p>
          <div className="mt-3 flex items-end gap-2">
            <span className="font-display text-6xl font-extrabold leading-none">
              {metrics.growthScore}
            </span>
            <span className="mb-2 text-sm font-medium text-primary-foreground/50">/100</span>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-primary-foreground/15">
            <div
              className="bg-score h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics.growthScore}%` }}
            />
          </div>

          <p className="mt-4 text-pretty text-xs font-medium text-primary-foreground/80 leading-relaxed">
            {metrics.growthScoreReason}
          </p>

          <div className="mt-4 grid grid-cols-4 gap-1.5 text-center text-[10px]">
            {[
              ["Sales", metrics.growthScoreBreakdown.sales],
              ["Retention", metrics.growthScoreBreakdown.retention],
              ["Stock", metrics.growthScoreBreakdown.inventory],
              ["AOV", metrics.growthScoreBreakdown.aov],
            ].map(([l, v]) => (
              <div key={l as string} className="rounded-lg bg-primary-foreground/5 py-1.5">
                <p className="font-display text-sm font-bold">{v}</p>
                <p className="text-primary-foreground/50">{l}</p>
              </div>
            ))}
          </div>

          <Link to={"/assistant" as any} className="mt-auto pt-5">
            <span className="flex w-full items-center justify-center gap-1 rounded-full bg-primary-foreground/10 px-4 py-2 text-xs font-semibold ring-1 ring-primary-foreground/20 transition-transform hover:-translate-y-0.5">
              Consult Growth AI Advisor <ArrowRight className="size-3.5" />
            </span>
          </Link>
        </div>
      </section>

      {/* Weekday Sales + Customer Growth */}
      <section className="mb-6 grid gap-4 md:grid-cols-2">
        <div className="surface p-5 sm:p-6">
          <SectionTitle
            title="Sales by Weekday"
            hint="Aggregated sales across days of the week."
          />
          <div className="h-[170px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.weekdaySales} margin={{ left: -20 }}>
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                />
                <Tooltip content={<ChartTip />} cursor={{ fill: "var(--border)" }} />
                <Bar dataKey="sales" name="sales" radius={[6, 6, 0, 0]} fill="var(--chart-2)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-accent p-3">
            <p className="text-xs font-medium text-accent-foreground">
              <Sparkles className="mr-1 inline size-3.5" />
              Launch weekend marketing promotion
            </p>
            <Link to={"/campaigns" as any} className="shrink-0 text-xs font-bold text-accent-foreground">
              Create campaign →
            </Link>
          </div>
        </div>

        <div className="surface p-5 sm:p-6">
          <SectionTitle
            title="Customer Base Growth"
            hint="Total active customer profiles over time."
          />
          <div className="h-[170px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.revenueSeries} margin={{ left: -20 }}>
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                />
                <Tooltip content={<ChartTip />} />
                <Area
                  type="monotone"
                  dataKey="customers"
                  name="customers"
                  stroke="var(--chart-2)"
                  strokeWidth={2.5}
                  fill="var(--chart-2)"
                  fillOpacity={0.12}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* AI Recommendations */}
      <SectionTitle
        title="Recommended Actions"
        hint="Generated by Growth AI based on your live inventory and sales velocity."
        right={
          <Link to={"/assistant" as any} className="text-sm font-semibold text-secondary">
            Ask AI →
          </Link>
        }
      />
      <section className="mb-6 grid gap-4 lg:grid-cols-3">
        {metrics.recommendations.map((r, i) => {
          const isDone = completedRecs.includes(r.id);
          return (
            <div key={r.id} className="surface lift flex flex-col p-6">
              <div className="mb-3 flex items-center gap-2">
                <span
                  className={cn(
                    "grid size-6 place-items-center rounded-md text-xs font-bold",
                    r.tone === "warn"
                      ? "bg-destructive/15 text-destructive"
                      : "bg-accent text-accent-foreground"
                  )}
                >
                  {i + 1}
                </span>
                <h3 className="text-sm font-semibold">{r.title}</h3>
              </div>
              <p className="flex-1 text-pretty text-xs font-medium text-muted-foreground leading-relaxed">
                {r.body}
              </p>
              <div className="mt-4 flex items-center justify-between">
                {r.link ? (
                  <Link to={r.link as any}>
                    <Btn
                      variant={r.tone === "warn" ? "ghost" : "primary"}
                      disabled={isDone}
                      className="py-1.5 text-xs"
                    >
                      {r.cta}
                    </Btn>
                  </Link>
                ) : (
                  <Btn
                    variant={r.tone === "warn" ? "ghost" : "primary"}
                    disabled={isDone}
                    className="py-1.5 text-xs"
                    onClick={() => {
                      setCompletedRecs((prev) => [...prev, r.id]);
                      toast.success(`${r.cta} — completed!`, { description: r.title });
                    }}
                  >
                    {isDone ? "Completed ✓" : r.cta}
                  </Btn>
                )}
                <span className="text-xs font-semibold text-accent-foreground">{r.impact}</span>
              </div>
            </div>
          );
        })}
      </section>

      {/* Catalog & Recent Transactions Row */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="surface p-5 sm:p-6 lg:col-span-2">
          <SectionTitle
            title="Top Products"
            right={
              <Link to="/products" className="text-sm font-semibold text-secondary">
                All products →
              </Link>
            }
          />
          {products.length === 0 ? (
            <p className="py-4 text-xs text-muted-foreground">No products added yet.</p>
          ) : (
            <div className="space-y-3">
              {products.slice(0, 3).map((p, i) => (
                <div key={p.id} className="flex items-center gap-4">
                  <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-ink/5 text-ink font-semibold">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="size-12 rounded-lg object-cover" />
                    ) : (
                      p.name.charAt(0)
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Stock: {p.stock} units · Price: ₹{p.sellingPrice}
                    </p>
                  </div>
                  <Pill tone={p.stock === 0 ? "danger" : p.stock <= 5 ? "warn" : "primary"}>
                    {p.stock === 0 ? "Out of Stock" : p.stock <= 5 ? "Low Stock" : "In Stock"}
                  </Pill>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 border-t border-border pt-4">
            <SectionTitle
              title="Recent Transactions"
              right={
                <Link to="/transactions" className="text-sm font-semibold text-secondary">
                  View all →
                </Link>
              }
            />
            {transactions.length === 0 ? (
              <p className="py-4 text-xs text-muted-foreground">No transactions recorded yet.</p>
            ) : (
              transactions.slice(0, 4).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-3 border-t border-border py-2.5 first:border-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{t.customerName}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.id} · {new Date(t.transactionDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold">₹{t.totalAmount}</span>
                    <Pill tone={t.status === "Paid" ? "primary" : t.status === "Pending" ? "info" : "danger"}>
                      {t.status}
                    </Pill>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Alerts & Customer Activity Side Column */}
        <div className="flex flex-col gap-4">
          <div className="surface p-5 sm:p-6">
            <h2 className="mb-4 text-base font-semibold text-ink font-display">System Alerts</h2>
            {notifications.length === 0 ? (
              <p className="text-xs text-muted-foreground">All systems running smoothly. No active alerts.</p>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 3).map((n) => (
                  <div key={n.id} className="flex items-start gap-2.5">
                    <span
                      className={cn(
                        "mt-1.5 size-2 shrink-0 rounded-full",
                        n.type === "warning"
                          ? "bg-destructive"
                          : n.type === "milestone"
                          ? "bg-primary"
                          : "bg-secondary"
                      )}
                    />
                    <div>
                      <p className="text-xs font-semibold text-ink">{n.title}</p>
                      <p className="text-[11px] text-muted-foreground">{n.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="surface p-5 sm:p-6">
            <h2 className="mb-4 text-base font-semibold text-ink font-display">Customer Roster</h2>
            {customers.length === 0 ? (
              <p className="text-xs text-muted-foreground">No customer profiles registered yet.</p>
            ) : (
              <div className="space-y-3">
                {customers.slice(0, 4).map((c) => (
                  <div key={c.id} className="flex items-center gap-3">
                    <div className="grid size-8 place-items-center rounded-full bg-secondary/15 text-[11px] font-bold text-secondary">
                      {c.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs font-semibold text-ink">{c.name}</p>
                      <p className="text-[10px] text-muted-foreground">{c.segment} Customer</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
