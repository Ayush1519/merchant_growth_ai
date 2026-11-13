import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Calendar,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Layers,
  Printer,
  TrendingUp,
} from "lucide-react";
import { useApp } from "@/lib/store/app-context";
import { Btn, PageHeader, Pill } from "@/components/app/ui";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Business Reports & Export — Merchant Growth AI" },
      { name: "description", content: "Generate and export sales ledgers, customer summaries, and growth audits." },
    ],
  }),
  component: ReportsPage,
});

type ReportType = "sales" | "products" | "customers" | "growth";

function ReportsPage() {
  const { business, transactions, products, customers, metrics } = useApp();
  const [reportType, setReportType] = useState<ReportType>("sales");
  const [timeRange, setTimeRange] = useState("all");

  const exportCSV = () => {
    let csvContent = "";
    let fileName = `report_${reportType}_${new Date().toISOString().slice(0, 10)}.csv`;

    if (reportType === "sales") {
      csvContent = "Transaction ID,Date,Customer,Items Count,Total Amount,Payment Method,Status\n";
      transactions.forEach((t) => {
        csvContent += `"${t.id}","${t.transactionDate}","${t.customerName}","${t.itemsCount}","${t.totalAmount}","${t.paymentMethod}","${t.status}"\n`;
      });
    } else if (reportType === "products") {
      csvContent = "SKU,Product Name,Category,Selling Price,Cost Price,Stock,Status\n";
      products.forEach((p) => {
        csvContent += `"${p.sku || ""}","${p.name}","${p.category}","${p.sellingPrice}","${p.costPrice}","${p.stock}","${p.status}"\n`;
      });
    } else if (reportType === "customers") {
      csvContent = "Customer Name,Email,Phone,Segment,Notes\n";
      customers.forEach((c) => {
        csvContent += `"${c.name}","${c.email}","${c.phone || ""}","${c.segment}","${c.notes || ""}"\n`;
      });
    } else {
      csvContent = "Metric,Value\n";
      csvContent += `"Total Revenue","₹${metrics.totalRevenue}"\n`;
      csvContent += `"Total Orders","${metrics.totalOrders}"\n`;
      csvContent += `"Average Order Value","₹${metrics.avgOrderValue}"\n`;
      csvContent += `"Total Customers","${metrics.totalCustomersCount}"\n`;
      csvContent += `"Growth Score","${metrics.growthScore}/100"\n`;
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("CSV Report downloaded! 📄", { description: fileName });
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="mx-auto max-w-[1280px]">
      <PageHeader
        eyebrow="Auditing & Records"
        title="Business Reports"
        description="Comprehensive statements, revenue summaries, and CSV data exports."
        actions={
          <div className="flex gap-2">
            <button
              onClick={printReport}
              className="flex items-center gap-1.5 rounded-full border border-input bg-card px-4 py-2 text-xs font-semibold text-ink hover:bg-muted"
            >
              <Printer className="size-4" /> Print
            </button>
            <Btn onClick={exportCSV}>
              <Download className="size-4" /> Export CSV
            </Btn>
          </div>
        }
      />

      {/* Report Type Selector */}
      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { id: "sales", label: "Sales & Transactions Ledger", count: transactions.length },
          { id: "products", label: "Product & Inventory Valuation", count: products.length },
          { id: "customers", label: "Customer Lifetime Value", count: customers.length },
          { id: "growth", label: "AI Growth Score Audit", count: null },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setReportType(tab.id as ReportType)}
            className={`rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors ${
              reportType === tab.id
                ? "bg-ink text-primary-foreground shadow"
                : "bg-card text-muted-foreground hover:text-ink ring-1 ring-border"
            }`}
          >
            {tab.label} {tab.count !== null && `(${tab.count})`}
          </button>
        ))}
      </div>

      {/* Render Active Report Table */}
      <div className="surface p-6">
        <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="font-display text-base font-bold text-ink">
              {business?.businessName || "Store"} —{" "}
              {reportType === "sales"
                ? "Sales Ledger"
                : reportType === "products"
                ? "Product Inventory Valuation"
                : reportType === "customers"
                ? "Customer Directory & Cohorts"
                : "Growth Score Audit"}
            </h2>
            <p className="text-xs text-muted-foreground">Generated on {new Date().toLocaleDateString()}</p>
          </div>
          <Pill tone="primary">Live Data</Pill>
        </div>

        {reportType === "sales" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border text-[11px] font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="py-2.5">ID</th>
                  <th className="py-2.5">Date</th>
                  <th className="py-2.5">Customer</th>
                  <th className="py-2.5">Items</th>
                  <th className="py-2.5">Method</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-muted-foreground">
                      No transactions recorded.
                    </td>
                  </tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t.id}>
                      <td className="py-2.5 font-mono">{t.id}</td>
                      <td className="py-2.5 text-muted-foreground">
                        {new Date(t.transactionDate).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 font-medium">{t.customerName}</td>
                      <td className="py-2.5">{t.itemsCount}</td>
                      <td className="py-2.5">{t.paymentMethod}</td>
                      <td className="py-2.5">
                        <Pill tone={t.status === "Paid" ? "primary" : "warn"}>{t.status}</Pill>
                      </td>
                      <td className="py-2.5 text-right font-bold">₹{t.totalAmount}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {reportType === "products" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border text-[11px] font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="py-2.5">SKU</th>
                  <th className="py-2.5">Product</th>
                  <th className="py-2.5">Category</th>
                  <th className="py-2.5">Selling Price</th>
                  <th className="py-2.5">Cost Price</th>
                  <th className="py-2.5">Stock</th>
                  <th className="py-2.5">Total Inventory Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-muted-foreground">
                      No products in catalog.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr key={p.id}>
                      <td className="py-2.5 font-mono">{p.sku || "—"}</td>
                      <td className="py-2.5 font-medium">{p.name}</td>
                      <td className="py-2.5">{p.category}</td>
                      <td className="py-2.5">₹{p.sellingPrice}</td>
                      <td className="py-2.5">₹{p.costPrice}</td>
                      <td className="py-2.5">{p.stock} units</td>
                      <td className="py-2.5 font-bold">₹{(p.stock * p.sellingPrice).toLocaleString("en-IN")}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {reportType === "customers" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border text-[11px] font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="py-2.5">Name</th>
                  <th className="py-2.5">Email</th>
                  <th className="py-2.5">Phone</th>
                  <th className="py-2.5">Segment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-muted-foreground">
                      No customer records.
                    </td>
                  </tr>
                ) : (
                  customers.map((c) => (
                    <tr key={c.id}>
                      <td className="py-2.5 font-medium">{c.name}</td>
                      <td className="py-2.5">{c.email}</td>
                      <td className="py-2.5">{c.phone || "—"}</td>
                      <td className="py-2.5">
                        <Pill tone={c.segment === "Loyal" ? "primary" : c.segment === "At Risk" ? "danger" : "info"}>
                          {c.segment}
                        </Pill>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {reportType === "growth" && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-xl bg-ink/5 p-4">
                <p className="text-muted-foreground">Growth Score</p>
                <p className="mt-1 font-display text-2xl font-bold text-ink">{metrics.growthScore}/100</p>
              </div>
              <div className="rounded-xl bg-ink/5 p-4">
                <p className="text-muted-foreground">Sales Velocity</p>
                <p className="mt-1 font-display text-2xl font-bold text-ink">
                  {metrics.growthScoreBreakdown.sales}/100
                </p>
              </div>
              <div className="rounded-xl bg-ink/5 p-4">
                <p className="text-muted-foreground">Retention Rate</p>
                <p className="mt-1 font-display text-2xl font-bold text-ink">
                  {metrics.growthScoreBreakdown.retention}/100
                </p>
              </div>
              <div className="rounded-xl bg-ink/5 p-4">
                <p className="text-muted-foreground">Basket / AOV</p>
                <p className="mt-1 font-display text-2xl font-bold text-ink">
                  {metrics.growthScoreBreakdown.aov}/100
                </p>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              <strong>Assessment</strong>: {metrics.growthScoreReason}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
