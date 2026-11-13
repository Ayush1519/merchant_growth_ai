import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  CheckSquare,
  FileSpreadsheet,
  LayoutDashboard,
  Megaphone,
  Package,
  Receipt,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";

export type NavTo =
  | "/"
  | "/assistant"
  | "/analytics"
  | "/products"
  | "/customers"
  | "/transactions"
  | "/campaigns"
  | "/growth-plan"
  | "/reports"
  | "/settings";

export type NavItem = { to: NavTo; label: string; icon: LucideIcon };

export const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard },
      { to: "/assistant", label: "Growth AI", icon: Sparkles },
      { to: "/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Operations",
    items: [
      { to: "/products", label: "Products", icon: Package },
      { to: "/customers", label: "Customers", icon: Users },
      { to: "/transactions", label: "Transactions", icon: Receipt },
    ],
  },
  {
    label: "Growth & Strategy",
    items: [
      { to: "/campaigns", label: "Campaigns", icon: Megaphone },
      { to: "/growth-plan", label: "Growth Plan", icon: CheckSquare },
      { to: "/reports", label: "Reports", icon: FileSpreadsheet },
    ],
  },
  {
    label: "Account",
    items: [
      { to: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export const allNav: NavItem[] = navGroups.flatMap((g) => g.items);
