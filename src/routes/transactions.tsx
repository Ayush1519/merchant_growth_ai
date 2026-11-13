import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Calendar,
  CreditCard,
  Edit2,
  Filter,
  Plus,
  Receipt,
  Search,
  Trash2,
  User,
} from "lucide-react";
import { useApp } from "@/lib/store/app-context";
import { Btn, PageHeader, Pill } from "@/components/app/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PaymentMethod, Transaction, TransactionStatus } from "@/lib/supabase/types";

export const Route = createFileRoute("/transactions")({
  head: () => ({
    meta: [
      { title: "Transactions & Orders — Merchant Growth AI" },
      { name: "description", content: "Review and record customer orders, payment methods, and revenue receipts." },
    ],
  }),
  component: TransactionsPage,
});

function TransactionsPage() {
  const { transactions, products, customers, addTransaction, updateTransaction, deleteTransaction } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedMethod, setSelectedMethod] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Form State
  const [customerId, setCustomerId] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<number>(20);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Card");
  const [status, setStatus] = useState<TransactionStatus>("Paid");

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch =
        t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = selectedStatus === "all" || t.status === selectedStatus;
      const matchMethod = selectedMethod === "all" || t.paymentMethod === selectedMethod;
      return matchSearch && matchStatus && matchMethod;
    });
  }, [transactions, searchTerm, selectedStatus, selectedMethod]);

  const openAddModal = () => {
    setEditingTx(null);
    if (customers.length > 0) {
      setCustomerId(customers[0].id);
      setCustomerName(customers[0].name);
    } else {
      setCustomerId("");
      setCustomerName("Guest Customer");
    }

    if (products.length > 0) {
      setSelectedProductId(products[0].id);
      setUnitPrice(products[0].sellingPrice);
    } else {
      setSelectedProductId("");
      setUnitPrice(30);
    }

    setQuantity(1);
    setPaymentMethod("Card");
    setStatus("Paid");
    setDialogOpen(true);
  };

  const openEditModal = (t: Transaction) => {
    setEditingTx(t);
    setCustomerId(t.customerId || "");
    setCustomerName(t.customerName);
    if (t.items.length > 0) {
      setSelectedProductId(t.items[0].productId);
      setQuantity(t.items[0].quantity);
      setUnitPrice(t.items[0].unitPrice);
    }
    setPaymentMethod(t.paymentMethod);
    setStatus(t.status);
    setDialogOpen(true);
  };

  const handleProductChange = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      setUnitPrice(prod.sellingPrice);
    }
  };

  const handleCustomerChange = (custId: string) => {
    setCustomerId(custId);
    const cust = customers.find((c) => c.id === custId);
    if (cust) {
      setCustomerName(cust.name);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      toast.error("Customer name is required");
      return;
    }

    const prod = products.find((p) => p.id === selectedProductId);
    const prodName = prod?.name || "Standard Item";
    const total = Number(quantity) * Number(unitPrice);

    if (editingTx) {
      await updateTransaction(editingTx.id, {
        customerId: customerId || undefined,
        customerName,
        items: [{ productId: selectedProductId, productName: prodName, quantity, unitPrice }],
        itemsCount: quantity,
        totalAmount: total,
        paymentMethod,
        status,
      });
      toast.success("Transaction updated", { description: `Order ${editingTx.id}` });
    } else {
      await addTransaction({
        customerId: customerId || "cust-guest",
        customerName,
        items: [{ productId: selectedProductId, productName: prodName, quantity, unitPrice }],
        itemsCount: quantity,
        totalAmount: total,
        paymentMethod,
        status,
        transactionDate: new Date().toISOString(),
      });
      toast.success("Transaction recorded! 💰", {
        description: `₹${total.toLocaleString("en-IN")} from ${customerName}`,
      });
    }

    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm(`Delete transaction ${id}?`)) {
      await deleteTransaction(id);
      toast.success("Transaction removed");
    }
  };

  return (
    <div className="mx-auto max-w-[1280px]">
      <PageHeader
        eyebrow="Sales & Receipts"
        title="Transactions"
        description="Every order, invoice, payment method, and refund synchronized in real time."
        actions={
          <Btn onClick={openAddModal}>
            <Plus className="size-4" /> Add Transaction
          </Btn>
        }
      />

      {/* Filters and Search */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by customer name or transaction ID…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-full border border-input bg-card/70 py-2 pl-10 pr-4 text-sm font-medium transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-full border border-input bg-card/70 px-3.5 py-1.5 text-xs font-semibold focus:border-primary focus:outline-none"
          >
            <option value="all">All Statuses ({transactions.length})</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Refunded">Refunded</option>
          </select>

          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="rounded-full border border-input bg-card/70 px-3.5 py-1.5 text-xs font-semibold focus:border-primary focus:outline-none"
          >
            <option value="all">All Payment Methods</option>
            <option value="Card">Card</option>
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Stripe">Stripe</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      {transactions.length === 0 ? (
        <div className="surface flex flex-col items-center justify-center p-12 text-center">
          <div className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Receipt className="size-6" />
          </div>
          <h3 className="mt-4 font-display text-lg font-semibold text-ink">No transactions recorded yet</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Record your sales to generate revenue charts, basket analytics, and Growth AI recommendations.
          </p>
          <Btn onClick={openAddModal} className="mt-6">
            <Plus className="size-4" /> Record First Transaction
          </Btn>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="surface p-8 text-center text-sm text-muted-foreground">
          No transactions matched your search or filters.
        </div>
      ) : (
        <div className="surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-ink/5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-6 py-3.5">Transaction ID</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Items</th>
                  <th className="px-6 py-3.5">Method</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Date & Time</th>
                  <th className="px-6 py-3.5">Total Amount</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTransactions.map((t) => {
                  const dateStr = new Date(t.transactionDate).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr key={t.id} className="transition-colors hover:bg-muted/40">
                      <td className="px-6 py-4 font-mono font-semibold text-ink">{t.id}</td>
                      <td className="px-6 py-4 font-medium text-ink">{t.customerName}</td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {t.items.length > 0 ? (
                          <span>
                            {t.items[0].productName}{" "}
                            {t.items.length > 1 && `+${t.items.length - 1} more`}
                          </span>
                        ) : (
                          `${t.itemsCount} items`
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-card-foreground">
                          <CreditCard className="size-3.5 text-muted-foreground" /> {t.paymentMethod}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Pill
                          tone={
                            t.status === "Paid"
                              ? "primary"
                              : t.status === "Pending"
                              ? "info"
                              : "danger"
                          }
                        >
                          {t.status}
                        </Pill>
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">{dateStr}</td>
                      <td className="px-6 py-4 font-display font-bold text-ink">₹{t.totalAmount.toLocaleString("en-IN")}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(t)}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-ink/5 hover:text-ink"
                            title="Edit"
                          >
                            <Edit2 className="size-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(t.id)}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            title="Delete"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Transaction Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTx ? "Edit Transaction" : "Record New Sale"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div>
              <label className="mb-1 block text-xs font-semibold">Select Customer</label>
              {customers.length > 0 ? (
                <select
                  value={customerId}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Guest Customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Walk-in Customer"
                  className="w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold">Product Line Item</label>
              {products.length > 0 ? (
                <select
                  value={selectedProductId}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ₹{p.sellingPrice.toLocaleString("en-IN")} (Stock: {p.stock})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="Product name"
                  value="Standard Item"
                  disabled
                  className="w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm font-medium"
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold">Quantity</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold">Unit Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(Number(e.target.value))}
                  className="w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="Card">Credit/Debit Card</option>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Stripe">Stripe</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold">Payment Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TransactionStatus)}
                  className="w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>
            </div>

            <div className="surface p-3 text-xs flex justify-between items-center font-semibold">
              <span>Total Calculated:</span>
              <span className="text-base text-ink font-display">₹{(quantity * unitPrice).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="rounded-full border border-input px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <Btn type="submit" className="py-2 text-xs">
                {editingTx ? "Save Changes" : "Record Transaction"}
              </Btn>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
