export type UserRole = "merchant" | "admin";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessProfile {
  id: string;
  userId: string;
  businessName: string;
  category: string;
  description: string;
  currency: string;
  location: string;
  employees: string;
  yearsInBusiness: string;
  monthlyRevenueGoal: number;
  avgMonthlyRevenue: number;
  avgOrderValue: number;
  monthlyOrders: number;
  goals: string[];
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  userId: string;
  name: string;
  sku: string;
  category: string;
  description: string;
  sellingPrice: number;
  costPrice: number;
  stock: number;
  status: "in_stock" | "low_stock" | "out_of_stock";
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type CustomerSegment = "New" | "Returning" | "Loyal" | "High Value" | "At Risk";

export interface Customer {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  segment: CustomerSegment;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Computed client-side fields
  totalSpent?: number;
  ordersCount?: number;
  lastOrderDate?: string;
  avgOrderValue?: number;
}

export type TransactionStatus = "Paid" | "Pending" | "Refunded";
export type PaymentMethod = "Card" | "Cash" | "UPI" | "Bank Transfer" | "Stripe" | "Other";

export interface TransactionItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Transaction {
  id: string;
  userId: string;
  customerId: string;
  customerName: string;
  items: TransactionItem[];
  itemsCount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  transactionDate: string;
  createdAt: string;
}

export type CampaignChannel = "Instagram" | "WhatsApp" | "Email" | "SMS" | "Multi-channel";
export type CampaignStatus = "Draft" | "Scheduled" | "Active" | "Completed";

export interface Campaign {
  id: string;
  userId: string;
  name: string;
  channel: CampaignChannel;
  goal: string;
  targetAudience: string;
  productId?: string;
  offer?: string;
  tone: string;
  content: string;
  status: CampaignStatus;
  reach: number;
  revenue: number;
  progress: number;
  createdAt: string;
}

export type TaskPriority = "High" | "Medium" | "Low";
export type TaskCategory = "Sales" | "Marketing" | "Operations" | "Retention";
export type TaskStatus = "Pending" | "In Progress" | "Completed";

export interface GrowthTask {
  id: string;
  userId: string;
  title: string;
  description: string;
  priority: TaskPriority;
  category: TaskCategory;
  impact: string;
  difficulty: "Easy" | "Medium" | "Hard";
  status: TaskStatus;
  createdAt: string;
}

export type NotificationType = "warning" | "success" | "info" | "milestone";

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  suggestedActions?: { label: string; action: string; payload?: Record<string, unknown> }[];
}

export interface AIConversation {
  id: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface BusinessSettings {
  id: string;
  userId: string;
  taxRate: number;
  emailNotifications: boolean;
  aiInsightsNotifications: boolean;
  marketingNotifications: boolean;
  theme: "light" | "dark" | "system";
  createdAt: string;
  updatedAt: string;
}
