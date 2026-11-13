import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowUpDown,
  Edit2,
  Filter,
  Layers,
  Package,
  Plus,
  Search,
  Tag,
  Trash2,
} from "lucide-react";
import { useApp } from "@/lib/store/app-context";
import { Btn, PageHeader, Pill, SectionTitle } from "@/components/app/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Product } from "@/lib/supabase/types";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Products & Inventory — Merchant Growth AI" },
      { name: "description", content: "Track product stock, margins, sales velocity, and catalog items." },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct, transactions } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("Brewing");
  const [description, setDescription] = useState("");
  const [sellingPrice, setSellingPrice] = useState<number>(20);
  const [costPrice, setCostPrice] = useState<number>(8);
  const [stock, setStock] = useState<number>(50);

  // Calculate product sales & units sold from transactions
  const productStats = useMemo(() => {
    const stats: Record<string, { unitsSold: number; revenue: number }> = {};
    for (const p of products) {
      stats[p.id] = { unitsSold: 0, revenue: 0 };
    }

    for (const tx of transactions) {
      if (tx.status === "Paid") {
        for (const it of tx.items) {
          if (it.productId && stats[it.productId]) {
            stats[it.productId].unitsSold += it.quantity;
            stats[it.productId].revenue += it.quantity * it.unitPrice;
          }
        }
      }
    }
    return stats;
  }, [products, transactions]);

  // Unique categories
  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category).filter(Boolean));
    return Array.from(cats);
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCategory === "all" || p.category === selectedCategory;
      const matchStatus = selectedStatus === "all" || p.status === selectedStatus;
      return matchSearch && matchCat && matchStatus;
    });
  }, [products, searchTerm, selectedCategory, selectedStatus]);

  const openAddModal = () => {
    setEditingProduct(null);
    setName("");
    setSku(`SKU-${Math.floor(100 + Math.random() * 900)}`);
    setCategory(categories[0] || "General");
    setDescription("");
    setSellingPrice(25);
    setCostPrice(10);
    setStock(30);
    setDialogOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setSku(p.sku);
    setCategory(p.category);
    setDescription(p.description);
    setSellingPrice(p.sellingPrice);
    setCostPrice(p.costPrice);
    setStock(p.stock);
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a product name");
      return;
    }

    const sPrice = Number(sellingPrice) || 0;
    const cPrice = Number(costPrice) || 0;
    const st = Number(stock) || 0;
    const status = st === 0 ? "out_of_stock" : st <= 5 ? "low_stock" : "in_stock";

    if (editingProduct) {
      await updateProduct(editingProduct.id, {
        name,
        sku,
        category,
        description,
        sellingPrice: sPrice,
        costPrice: cPrice,
        stock: st,
        status,
      });
      toast.success("Product updated", { description: name });
    } else {
      await addProduct({
        name,
        sku,
        category,
        description,
        sellingPrice: sPrice,
        costPrice: cPrice,
        stock: st,
        status,
      });
      toast.success("Product added to catalog", { description: name });
    }

    setDialogOpen(false);
  };

  const handleDelete = async (id: string, prodName: string) => {
    if (confirm(`Are you sure you want to delete "${prodName}"?`)) {
      await deleteProduct(id);
      toast.success("Product deleted", { description: prodName });
    }
  };

  return (
    <div className="mx-auto max-w-[1280px]">
      <PageHeader
        eyebrow="Catalog & Inventory"
        title="Products"
        description="Manage your product catalog, real-time stock levels, cost pricing, and sales performance."
        actions={
          <Btn onClick={openAddModal}>
            <Plus className="size-4" /> Add Product
          </Btn>
        }
      />

      {/* Filter and Search Bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by product name, SKU, or category…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-full border border-input bg-card/70 py-2 pl-10 pr-4 text-sm font-medium transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-full border border-input bg-card/70 px-3.5 py-1.5 text-xs font-semibold focus:border-primary focus:outline-none"
          >
            <option value="all">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-full border border-input bg-card/70 px-3.5 py-1.5 text-xs font-semibold focus:border-primary focus:outline-none"
          >
            <option value="all">All Stock Status</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock (≤ 5)</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      {products.length === 0 ? (
        <div className="surface flex flex-col items-center justify-center p-12 text-center">
          <div className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Package className="size-6" />
          </div>
          <h3 className="mt-4 font-display text-lg font-semibold text-ink">No products added yet</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Add your first item to begin tracking stock, gross profit margins, and AI sales velocity.
          </p>
          <Btn onClick={openAddModal} className="mt-6">
            <Plus className="size-4" /> Add Your First Product
          </Btn>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="surface p-8 text-center text-sm text-muted-foreground">
          No products matched your search or filters.
        </div>
      ) : (
        <div className="surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-ink/5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-6 py-3.5">Product</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Price / Cost</th>
                  <th className="px-6 py-3.5">Margin</th>
                  <th className="px-6 py-3.5">Stock</th>
                  <th className="px-6 py-3.5">Units Sold</th>
                  <th className="px-6 py-3.5">Total Revenue</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProducts.map((p) => {
                  const stat = productStats[p.id] || { unitsSold: 0, revenue: 0 };
                  const margin = p.sellingPrice > 0 ? Math.round(((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100) : 0;
                  return (
                    <tr key={p.id} className="transition-colors hover:bg-muted/40">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-ink/5 text-ink font-semibold">
                            {p.imageUrl ? (
                              <img src={p.imageUrl} alt={p.name} className="size-10 rounded-lg object-cover" />
                            ) : (
                              p.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-ink">{p.name}</p>
                            <p className="text-xs text-muted-foreground">{p.sku || "No SKU"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-md bg-ink/5 px-2.5 py-1 text-xs font-medium text-ink">
                          {p.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-ink">₹{p.sellingPrice.toLocaleString("en-IN")}</p>
                        <p className="text-xs text-muted-foreground">Cost: ₹{p.costPrice.toLocaleString("en-IN")}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-accent-foreground">{margin}%</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-ink">{p.stock} units</span>
                          {p.stock === 0 ? (
                            <Pill tone="danger">Out of Stock</Pill>
                          ) : p.stock <= 5 ? (
                            <Pill tone="warn">Low Stock</Pill>
                          ) : (
                            <Pill tone="primary">In Stock</Pill>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-ink">{stat.unitsSold}</td>
                      <td className="px-6 py-4 font-semibold text-ink">₹{stat.revenue.toLocaleString("en-IN")}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(p)}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-ink/5 hover:text-ink"
                            title="Edit Product"
                          >
                            <Edit2 className="size-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            title="Delete Product"
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

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div>
              <label className="mb-1 block text-xs font-semibold">Product Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Handmade Ceramic Dripper"
                className="w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Brewing"
                  className="w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold">SKU / Code</label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="e.g. DRP-01"
                  className="w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold">Selling Price (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(Number(e.target.value))}
                  className="w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold">Cost Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={costPrice}
                  onChange={(e) => setCostPrice(Number(e.target.value))}
                  className="w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold">Inventory Stock *</label>
                <input
                  type="number"
                  required
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  className="w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Product highlights, materials, or features…"
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
                {editingProduct ? "Save Changes" : "Create Product"}
              </Btn>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
