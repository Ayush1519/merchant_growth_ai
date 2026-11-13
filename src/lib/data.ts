import dripper from "@/assets/p-dripper.jpg";
import kettle from "@/assets/p-kettle.jpg";
import tumbler from "@/assets/p-tumbler.jpg";
import canister from "@/assets/p-canister.jpg";

export const business = { owner: "Dana", fullName: "Dana Torres", initials: "DT", name: "Slow Pour Co." };

export const revenueSeries = [
  { label: "Jan", revenue: 31200, lastYear: 27400, customers: 980 },
  { label: "Feb", revenue: 33800, lastYear: 28100, customers: 1040 },
  { label: "Mar", revenue: 32100, lastYear: 29900, customers: 1110 },
  { label: "Apr", revenue: 38900, lastYear: 31200, customers: 1190 },
  { label: "May", revenue: 36400, lastYear: 32800, customers: 1260 },
  { label: "Jun", revenue: 42900, lastYear: 34000, customers: 1345 },
  { label: "Jul", revenue: 41200, lastYear: 35100, customers: 1402 },
  { label: "Aug", revenue: 45600, lastYear: 36500, customers: 1488 },
  { label: "Sep", revenue: 44100, lastYear: 37900, customers: 1551 },
  { label: "Oct", revenue: 48210, lastYear: 38800, customers: 1623 },
];

export const weekdaySales = [
  { day: "Mon", sales: 1180 }, { day: "Tue", sales: 1240 }, { day: "Wed", sales: 1320 },
  { day: "Thu", sales: 1410 }, { day: "Fri", sales: 1790 }, { day: "Sat", sales: 2010 }, { day: "Sun", sales: 1860 },
];

export type Product = { id: string; name: string; image: string; price: number; sold: number; stock: number; trend: number; category: string };
export const products: Product[] = [
  { id: "p1", name: "Ceramic Pour-Over Dripper", image: dripper, price: 20, sold: 312, stock: 140, trend: 18, category: "Brewing" },
  { id: "p2", name: "Gooseneck Steel Kettle", image: kettle, price: 26, sold: 204, stock: 62, trend: 9, category: "Brewing" },
  { id: "p3", name: "Warm Clay Tumbler", image: tumbler, price: 20, sold: 188, stock: 34, trend: 27, category: "Drinkware" },
  { id: "p4", name: "Speckled Bean Canister", image: canister, price: 32, sold: 96, stock: 0, trend: -6, category: "Storage" },
];

export type TxStatus = "Paid" | "Pending" | "Refunded";
export const transactions = [
  { id: "#4821", customer: "Amara Okafor", items: 3, total: 86, status: "Paid" as TxStatus, time: "Today, 14:02" },
  { id: "#4820", customer: "Leo Brandt", items: 1, total: 26, status: "Paid" as TxStatus, time: "Today, 13:47" },
  { id: "#4819", customer: "Marcus Vale", items: 2, total: 52, status: "Refunded" as TxStatus, time: "Today, 12:15" },
  { id: "#4818", customer: "Priya Shah", items: 4, total: 128, status: "Paid" as TxStatus, time: "Today, 11:30" },
  { id: "#4817", customer: "Sofia Reyes", items: 2, total: 40, status: "Pending" as TxStatus, time: "Today, 10:58" },
  { id: "#4816", customer: "Jonah Kim", items: 1, total: 32, status: "Paid" as TxStatus, time: "Yesterday, 19:20" },
  { id: "#4815", customer: "Ella Martin", items: 5, total: 146, status: "Paid" as TxStatus, time: "Yesterday, 17:05" },
  { id: "#4814", customer: "Noah Becker", items: 2, total: 46, status: "Pending" as TxStatus, time: "Yesterday, 15:41" },
  { id: "#4813", customer: "Hana Ito", items: 1, total: 20, status: "Paid" as TxStatus, time: "Yesterday, 12:12" },
  { id: "#4812", customer: "Omar Haddad", items: 3, total: 72, status: "Paid" as TxStatus, time: "Yesterday, 09:33" },
  { id: "#4811", customer: "Grace Liu", items: 2, total: 58, status: "Refunded" as TxStatus, time: "2 days ago" },
  { id: "#4810", customer: "Tomás Silva", items: 1, total: 26, status: "Paid" as TxStatus, time: "2 days ago" },
];

export type Segment = "Loyal" | "New" | "At risk";
export const customers = [
  { name: "Priya Shah", email: "priya@mail.com", orders: 14, spent: 842, last: "Today", segment: "Loyal" as Segment },
  { name: "Amara Okafor", email: "amara@mail.com", orders: 9, spent: 516, last: "Today", segment: "Loyal" as Segment },
  { name: "Leo Brandt", email: "leo@mail.com", orders: 1, spent: 26, last: "Today", segment: "New" as Segment },
  { name: "Sofia Reyes", email: "sofia@mail.com", orders: 2, spent: 78, last: "Today", segment: "New" as Segment },
  { name: "Grace Liu", email: "grace@mail.com", orders: 6, spent: 310, last: "52 days ago", segment: "At risk" as Segment },
  { name: "Omar Haddad", email: "omar@mail.com", orders: 7, spent: 402, last: "Yesterday", segment: "Loyal" as Segment },
  { name: "Ella Martin", email: "ella@mail.com", orders: 4, spent: 233, last: "48 days ago", segment: "At risk" as Segment },
  { name: "Jonah Kim", email: "jonah@mail.com", orders: 1, spent: 32, last: "Yesterday", segment: "New" as Segment },
];

export const recommendations = [
  { id: "r1", tone: "growth" as const, title: "Bundle the top two items", body: "Customers who buy the Ceramic Pour-Over often add the Kettle — a bundle could lift average order value ~₹6.", cta: "Create bundle", impact: "+₹1.9k / mo" },
  { id: "r2", tone: "growth" as const, title: "Re-engage 240 lapsed buyers", body: "A short win-back email to 240 customers who paused 45 days ago is projected to recover ₹3.1k.", cta: "Launch campaign", impact: "+₹3.1k" },
  { id: "r3", tone: "warn" as const, title: "Restock the Warm Clay Tumbler", body: "Selling ~18/day with 34 left — you'll run dry in under two days at the current pace.", cta: "Reorder now", impact: "Avoid ₹720 lost" },
];

export const campaigns = [
  { name: "Weekend Brew Sale", channel: "Email + Instagram", status: "Active", reach: 3200, revenue: 4120, progress: 64 },
  { name: "Win-back: 45 days", channel: "Email", status: "Scheduled", reach: 240, revenue: 0, progress: 10 },
  { name: "Summer Cold Brew", channel: "Instagram", status: "Completed", reach: 5400, revenue: 6890, progress: 100 },
];

export const money = (n: number) => "₹" + n.toLocaleString("en-IN");
