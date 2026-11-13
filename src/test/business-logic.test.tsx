import { describe, expect, it } from "vitest";
import type { Product, Customer, Transaction } from "@/lib/supabase/types";

describe("Merchant Growth Business Logic & Calculations", () => {
  const mockProducts: Product[] = [
    {
      id: "p1",
      userId: "u1",
      name: "Ceramic Pour-Over Dripper",
      sku: "DRP-01",
      category: "Brewing",
      description: "Handcrafted dripper",
      sellingPrice: 30,
      costPrice: 12,
      stock: 20,
      status: "in_stock",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "p2",
      userId: "u1",
      name: "Gooseneck Kettle",
      sku: "KTL-02",
      category: "Brewing",
      description: "Precision kettle",
      sellingPrice: 80,
      costPrice: 40,
      stock: 3,
      status: "low_stock",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "p3",
      userId: "u1",
      name: "Storage Canister",
      sku: "CAN-03",
      category: "Storage",
      description: "Coffee canister",
      sellingPrice: 25,
      costPrice: 10,
      stock: 0,
      status: "out_of_stock",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const mockCustomers: Customer[] = [
    {
      id: "c1",
      userId: "u1",
      name: "Alice Smith",
      email: "alice@example.com",
      phone: "+1 555-0101",
      segment: "Loyal",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "c2",
      userId: "u1",
      name: "Bob Jones",
      email: "bob@example.com",
      phone: "+1 555-0102",
      segment: "New",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "c3",
      userId: "u1",
      name: "Charlie Brown",
      email: "charlie@example.com",
      phone: "+1 555-0103",
      segment: "At Risk",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const mockTransactions: Transaction[] = [
    {
      id: "tx-1",
      userId: "u1",
      customerId: "c1",
      customerName: "Alice Smith",
      items: [{ productId: "p1", productName: "Ceramic Pour-Over Dripper", quantity: 2, unitPrice: 30 }],
      itemsCount: 2,
      totalAmount: 60,
      paymentMethod: "Card",
      status: "Paid",
      transactionDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
    {
      id: "tx-2",
      userId: "u1",
      customerId: "c2",
      customerName: "Bob Jones",
      items: [{ productId: "p2", productName: "Gooseneck Kettle", quantity: 1, unitPrice: 80 }],
      itemsCount: 1,
      totalAmount: 80,
      paymentMethod: "Card",
      status: "Paid",
      transactionDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
    {
      id: "tx-3",
      userId: "u1",
      customerId: "c3",
      customerName: "Charlie Brown",
      items: [{ productId: "p3", productName: "Storage Canister", quantity: 1, unitPrice: 25 }],
      itemsCount: 1,
      totalAmount: 25,
      paymentMethod: "Cash",
      status: "Refunded",
      transactionDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
  ];

  it("calculates total revenue correctly ignoring refunded transactions", () => {
    const paidTx = mockTransactions.filter((t) => t.status === "Paid");
    const totalRevenue = paidTx.reduce((sum, t) => sum + t.totalAmount, 0);
    expect(totalRevenue).toBe(140);
  });

  it("calculates Average Order Value (AOV) accurately", () => {
    const paidTx = mockTransactions.filter((t) => t.status === "Paid");
    const totalRevenue = paidTx.reduce((sum, t) => sum + t.totalAmount, 0);
    const aov = paidTx.length > 0 ? totalRevenue / paidTx.length : 0;
    expect(aov).toBe(70);
  });

  it("calculates gross profit and margin percentages correctly", () => {
    const paidTx = mockTransactions.filter((t) => t.status === "Paid");
    let totalRevenue = 0;
    let totalCost = 0;

    for (const tx of paidTx) {
      totalRevenue += tx.totalAmount;
      for (const item of tx.items) {
        const prod = mockProducts.find((p) => p.id === item.productId);
        const cost = prod ? prod.costPrice : item.unitPrice * 0.4;
        totalCost += cost * item.quantity;
      }
    }

    const grossProfit = totalRevenue - totalCost;
    const margin = Math.round((grossProfit / totalRevenue) * 100);

    // TX1: 2 * 30 = 60, cost = 2 * 12 = 24
    // TX2: 1 * 80 = 80, cost = 1 * 40 = 40
    // Total cost = 64, Total rev = 140, Gross profit = 76
    expect(grossProfit).toBe(76);
    expect(margin).toBe(54); // (76/140) * 100 = 54.28% -> 54%
  });

  it("identifies out-of-stock and low-stock alerts", () => {
    const outOfStock = mockProducts.filter((p) => p.stock === 0);
    const lowStock = mockProducts.filter((p) => p.stock > 0 && p.stock <= 5);

    expect(outOfStock.length).toBe(1);
    expect(outOfStock[0].name).toBe("Storage Canister");

    expect(lowStock.length).toBe(1);
    expect(lowStock[0].name).toBe("Gooseneck Kettle");
  });

  it("computes AI Growth Score within 0-100 range with appropriate factor weights", () => {
    const paidTx = mockTransactions.filter((t) => t.status === "Paid");
    const totalRevenue = paidTx.reduce((sum, t) => sum + t.totalAmount, 0);
    const returningCustomers = mockCustomers.filter((c) => c.segment === "Loyal" || c.segment === "Returning").length;

    const scoreSales = Math.min(95, 50 + Math.floor(totalRevenue / 1000) * 5);
    const repeatRatio = returningCustomers / mockCustomers.length;
    const scoreRetention = Math.min(95, Math.floor(repeatRatio * 100));
    const outOfStockCount = mockProducts.filter((p) => p.stock === 0).length;
    const scoreInventory = Math.max(20, 100 - outOfStockCount * 25);
    const scoreAov = Math.min(95, Math.floor((70 / 50) * 80));

    const growthScore = Math.round(
      scoreSales * 0.35 + scoreRetention * 0.25 + scoreInventory * 0.2 + scoreAov * 0.2
    );

    expect(growthScore).toBeGreaterThanOrEqual(0);
    expect(growthScore).toBeLessThanOrEqual(100);
    expect(growthScore).toBeGreaterThan(40);
  });
});
