import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  CircleDollarSign,
  Layers,
  Percent,
  TrendingUp,
  Users,
} from "lucide-react";
import { useApp } from "@/lib/store/app-context";
import { PageHeader, Pill, SectionTitle } from "@/components/app/ui";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics & Intelligence — Merchant Growth AI" },
      { name: "description", content: "Deep business analytics, revenue forecasting, category breakdowns, and unit economics." },
    ],
  }),
  component: AnalyticsPage,
});

const PERIODS = ["7d", "30d", "90d", "12m"] as const;
const COLORS = ["#14b8a6", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6", "#10b981"];

function AnalyticsPage() {
  const { metrics, products, transactions } = useApp();
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>("30d");

  // Category breakdown calculation
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const tx of transactions) {
      if (tx.status === "Paid") {
        for (const item of tx.items) {
          const prod = products.find((p) => p.id === item.productId);
          const cat = prod?.category || "General";
          map[cat] = (map[cat] || 0) + item.unitPrice * item.quantity;
        }
      }
    }

    const res = Object.entries(map).map(([name, value]) => ({ name, value }));
    return res.length > 0 ? res : [{ name: "General Retail", value: 100 }];
  }, [transactions, products]);

  return (
    <div className="mx-auto max-w-[1280px]">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-secondary">
            Performance & Forecasting
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold leading-tight sm:text-3xl text-ink">
            Business Analytics
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Multi-dimensional analysis of sales velocity, margin efficiency, customer retention, and product shares.
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex w-fit rounded-full bg-card p-1 ring-1 ring-border">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                period === p ? "bg-ink text-primary-foreground" : "text-muted-foreground hover:text-ink"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Top 4 Metric Cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div className="surface p-5">
          <p className="text-xs font-semibold text-muted-foreground">Total Revenue · {period}</p>
          <p className="mt-1 font-display text-2xl font-bold text-ink">
            ₹{metrics.totalRevenue.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-accent-foreground">
            <ArrowUpRight className="size-3.5" /> +14.2% vs previous {period}
          </p>
        </div>

        <div className="surface p-5">
          <p className="text-xs font-semibold text-muted-foreground">Gross Profit</p>
          <p className="mt-1 font-display text-2xl font-bold text-ink">
            ₹{metrics.grossProfit.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-secondary">
            <Percent className="size-3.5" /> {metrics.grossMarginPercent}% profit margin
          </p>
        </div>

        <div className="surface p-5">
          <p className="text-xs font-semibold text-muted-foreground">Average Order Value (AOV)</p>
          <p className="mt-1 font-display text-2xl font-bold text-ink">
            ₹{metrics.avgOrderValue.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-muted-foreground">
            across {metrics.totalOrders} recorded orders
          </p>
        </div>

        <div className="surface p-5">
          <p className="text-xs font-semibold text-muted-foreground">Customer Retention</p>
          <p className="mt-1 font-display text-2xl font-bold text-ink">
            {metrics.totalCustomersCount > 0
              ? Math.round((metrics.returningCustomersCount / metrics.totalCustomersCount) * 100)
              : 0}
            %
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-accent-foreground">
            {metrics.returningCustomersCount} repeat buyers
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        {/* Revenue Trend Area Chart */}
        <div className="surface p-6 lg:col-span-2">
          <SectionTitle
            title="Revenue Velocity & Projections"
            hint="Monthly revenue comparison against past benchmarks"
            right={<Pill tone="primary">+14% Growth</Pill>}
          />
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.revenueSeries} margin={{ left: -10, right: 4, top: 8 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickFormatter={(v) => `₹${Number(v).toLocaleString("en-IN")}`} />
                <Tooltip
                  formatter={(val: number) => [`₹${val.toLocaleString("en-IN")}`, "Revenue"]}
                  contentStyle={{ backgroundColor: "#1e293b", borderRadius: "0.75rem", color: "#fff", border: "none" }}
                />
                <Area type="monotone" dataKey="lastYear" name="Benchmark" stroke="#94a3b8" strokeDasharray="3 3" fill="none" />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#14b8a6" strokeWidth={2.5} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Category Pie Chart */}
        <div className="surface p-6 flex flex-col">
          <SectionTitle title="Revenue by Category" hint="Product category share" />
          <div className="h-[200px] flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [`₹${val.toLocaleString("en-IN")}`, "Revenue"]}
                  contentStyle={{ backgroundColor: "#1e293b", borderRadius: "0.75rem", color: "#fff", border: "none" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-3 text-xs">
            {categoryData.map((c, i) => (
              <div key={c.name} className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-muted-foreground">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekday & Customer Growth Rows */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="surface p-6">
          <SectionTitle title="Sales by Day of Week" hint="Identify peak revenue windows to schedule campaigns" />
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.weekdaySales} margin={{ left: -20 }}>
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <Tooltip
                  formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Sales"]}
                  cursor={{ fill: "var(--border)" }}
                  contentStyle={{ backgroundColor: "#1e293b", borderRadius: "0.75rem", color: "#fff", border: "none" }}
                />
                <Bar dataKey="sales" radius={[6, 6, 0, 0]} fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface p-6">
          <SectionTitle title="Customer Growth Trajectory" hint="Cumulative active customer relationships" />
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.revenueSeries} margin={{ left: -20 }}>
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <Tooltip
                  formatter={(v: number) => [v, "Customers"]}
                  contentStyle={{ backgroundColor: "#1e293b", borderRadius: "0.75rem", color: "#fff", border: "none" }}
                />
                <Area type="monotone" dataKey="customers" stroke="#f59e0b" strokeWidth={2.5} fill="#f59e0b" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
