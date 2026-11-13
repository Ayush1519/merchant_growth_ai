import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Edit2,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Receipt,
  Search,
  Trash2,
  User,
  Users,
} from "lucide-react";
import { useApp } from "@/lib/store/app-context";
import { Btn, PageHeader, Pill } from "@/components/app/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Customer, CustomerSegment } from "@/lib/supabase/types";

export const Route = createFileRoute("/customers")({
  head: () => ({
    meta: [
      { title: "Customers — Merchant Growth AI" },
      { name: "description", content: "Manage customer profiles, order histories, cohorts, and AI segmentation." },
    ],
  }),
  component: CustomersPage,
});

function CustomersPage() {
  const { customers, addCustomer, updateCustomer, deleteCustomer, transactions } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSegment, setSelectedSegment] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<Customer | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [segment, setSegment] = useState<CustomerSegment>("New");
  const [notes, setNotes] = useState("");

  // Calculate dynamic stats for each customer from real transactions
  const customerMetrics = useMemo(() => {
    const stats: Record<
      string,
      { totalSpent: number; ordersCount: number; lastOrder: string; txList: typeof transactions }
    > = {};

    for (const c of customers) {
      stats[c.id] = { totalSpent: 0, ordersCount: 0, lastOrder: "No orders yet", txList: [] };
    }

    for (const tx of transactions) {
      if (tx.customerId && stats[tx.customerId]) {
        stats[tx.customerId].totalSpent += tx.totalAmount;
        stats[tx.customerId].ordersCount += 1;
        stats[tx.customerId].txList.push(tx);
        stats[tx.customerId].lastOrder = new Date(tx.transactionDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      }
    }

    return stats;
  }, [customers, transactions]);

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.phone && c.phone.includes(searchTerm));
      const matchSegment = selectedSegment === "all" || c.segment === selectedSegment;
      return matchSearch && matchSegment;
    });
  }, [customers, searchTerm, selectedSegment]);

  const openAddModal = () => {
    setEditingCustomer(null);
    setName("");
    setEmail("");
    setPhone("");
    setSegment("New");
    setNotes("");
    setDialogOpen(true);
  };

  const openEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setName(c.name);
    setEmail(c.email);
    setPhone(c.phone || "");
    setSegment(c.segment);
    setNotes(c.notes || "");
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Name and Email are required");
      return;
    }

    if (editingCustomer) {
      await updateCustomer(editingCustomer.id, { name, email, phone, segment, notes });
      toast.success("Customer profile updated", { description: name });
    } else {
      await addCustomer({ name, email, phone, segment, notes });
      toast.success("Customer added", { description: name });
    }

    setDialogOpen(false);
  };

  const handleDelete = async (id: string, custName: string) => {
    if (confirm(`Are you sure you want to delete customer "${custName}"?`)) {
      await deleteCustomer(id);
      if (selectedProfile?.id === id) setSelectedProfile(null);
      toast.success("Customer deleted", { description: custName });
    }
  };

  return (
    <div className="mx-auto max-w-[1280px]">
      <PageHeader
        eyebrow="Relationship & Retention"
        title="Customers"
        description="View customer lifetime value, automated segmentation, order history, and re-engagement triggers."
        actions={
          <Btn onClick={openAddModal}>
            <Plus className="size-4" /> Add Customer
          </Btn>
        }
      />

      {/* Filter and Search Bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by customer name, email, or phone…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-full border border-input bg-card/70 py-2 pl-10 pr-4 text-sm font-medium transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {["all", "New", "Returning", "Loyal", "High Value", "At Risk"].map((seg) => (
            <button
              key={seg}
              onClick={() => setSelectedSegment(seg)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                selectedSegment === seg
                  ? "bg-ink text-primary-foreground"
                  : "bg-card/70 text-muted-foreground hover:text-ink ring-1 ring-border"
              }`}
            >
              {seg === "all" ? `All (${customers.length})` : seg}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Table */}
      {customers.length === 0 ? (
        <div className="surface flex flex-col items-center justify-center p-12 text-center">
          <div className="grid size-12 place-items-center rounded-2xl bg-secondary/10 text-secondary">
            <Users className="size-6" />
          </div>
          <h3 className="mt-4 font-display text-lg font-semibold text-ink">No customers yet</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Add customers manually or register transactions to build your retention database.
          </p>
          <Btn onClick={openAddModal} className="mt-6">
            <Plus className="size-4" /> Add First Customer
          </Btn>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="surface p-8 text-center text-sm text-muted-foreground">
          No customers found matching your search.
        </div>
      ) : (
        <div className="surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-ink/5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Segment</th>
                  <th className="px-6 py-3.5">Orders</th>
                  <th className="px-6 py-3.5">Total Spent</th>
                  <th className="px-6 py-3.5">Last Order</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCustomers.map((c) => {
                  const stat = customerMetrics[c.id] || { totalSpent: 0, ordersCount: 0, lastOrder: "—", txList: [] };
                  const initials = c.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase();

                  const segmentTone =
                    c.segment === "Loyal" || c.segment === "High Value"
                      ? "primary"
                      : c.segment === "At Risk"
                      ? "danger"
                      : "info";

                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedProfile(c)}
                      className="cursor-pointer transition-colors hover:bg-muted/40"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary/10 text-xs font-bold text-secondary">
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-ink">{c.name}</p>
                            <p className="text-xs text-muted-foreground">{c.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Pill tone={segmentTone}>{c.segment}</Pill>
                      </td>
                      <td className="px-6 py-4 font-medium text-ink">{stat.ordersCount} orders</td>
                      <td className="px-6 py-4 font-semibold text-ink">₹{stat.totalSpent.toLocaleString("en-IN")}</td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">{stat.lastOrder}</td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(c)}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-ink/5 hover:text-ink"
                            title="Edit"
                          >
                            <Edit2 className="size-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id, c.name)}
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

      {/* Customer Profile & Purchase History Drawer */}
      <Sheet open={Boolean(selectedProfile)} onOpenChange={(open) => !open && setSelectedProfile(null)}>
        {selectedProfile && (
          <SheetContent side="right" className="w-full sm:max-w-md p-6 overflow-y-auto">
            <SheetHeader className="mb-6">
              <div className="flex items-center gap-3">
                <div className="grid size-12 place-items-center rounded-full bg-primary/10 font-display text-lg font-bold text-primary">
                  {selectedProfile.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <SheetTitle className="font-display text-xl">{selectedProfile.name}</SheetTitle>
                  <p className="text-xs text-muted-foreground">{selectedProfile.email}</p>
                </div>
              </div>
            </SheetHeader>

            <div className="space-y-6">
              {/* Quick Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="surface p-4">
                  <p className="text-xs font-semibold text-muted-foreground">Total Spent</p>
                  <p className="mt-1 font-display text-xl font-bold text-ink">
                    ₹{customerMetrics[selectedProfile.id]?.totalSpent.toLocaleString("en-IN") || 0}
                  </p>
                </div>
                <div className="surface p-4">
                  <p className="text-xs font-semibold text-muted-foreground">Orders Count</p>
                  <p className="mt-1 font-display text-xl font-bold text-ink">
                    {customerMetrics[selectedProfile.id]?.ordersCount || 0}
                  </p>
                </div>
              </div>

              {/* Contact info & Notes */}
              <div className="surface p-4 space-y-2 text-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Details</p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="size-4 text-ink" /> {selectedProfile.phone || "No phone provided"}
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="size-4 text-ink" /> {selectedProfile.email}
                </p>
                {selectedProfile.notes && (
                  <p className="mt-2 text-xs italic text-muted-foreground border-t border-border pt-2">
                    "{selectedProfile.notes}"
                  </p>
                )}
              </div>

              {/* Purchase History */}
              <div>
                <h3 className="mb-3 font-semibold text-ink text-sm">Recent Purchases</h3>
                {customerMetrics[selectedProfile.id]?.txList.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No purchases recorded for this customer yet.</p>
                ) : (
                  <div className="space-y-2">
                    {customerMetrics[selectedProfile.id]?.txList.map((t) => (
                      <div key={t.id} className="surface flex items-center justify-between p-3 text-xs">
                        <div>
                          <p className="font-semibold text-ink">Order {t.id}</p>
                          <p className="text-muted-foreground">
                            {new Date(t.transactionDate).toLocaleDateString()} · {t.itemsCount} items
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-ink">₹{t.totalAmount}</p>
                          <Pill tone={t.status === "Paid" ? "primary" : "warn"}>{t.status}</Pill>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </SheetContent>
        )}
      </Sheet>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCustomer ? "Edit Customer" : "Add New Customer"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div>
              <label className="mb-1 block text-xs font-semibold">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="priya@example.com"
                className="w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold">Segment</label>
                <select
                  value={segment}
                  onChange={(e) => setSegment(e.target.value as CustomerSegment)}
                  className="w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="New">New</option>
                  <option value="Returning">Returning</option>
                  <option value="Loyal">Loyal</option>
                  <option value="High Value">High Value</option>
                  <option value="At Risk">At Risk</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold">Notes / Preferences</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Preferred items, coffee roast level, order notes…"
                className="w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
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
                {editingCustomer ? "Save Changes" : "Add Customer"}
              </Btn>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
