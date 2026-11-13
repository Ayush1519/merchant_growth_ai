import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "../supabase/client";
import type {
  UserProfile,
  BusinessProfile,
  Product,
  Customer,
  Transaction,
  Campaign,
  GrowthTask,
  AppNotification,
  ChatMessage,
  BusinessSettings,
} from "../supabase/types";
import {
  DEMO_USER_ID,
  demoBusinessProfile,
  demoProducts,
  demoCustomers,
  demoTransactions,
  demoCampaigns,
  demoGrowthTasks,
  demoNotifications,
} from "./demo-data";

interface AuthState {
  user: UserProfile | null;
  session: { access_token?: string } | null;
  isLoading: boolean;
  isDemoMode: boolean;
}

interface AppContextType {
  // Auth & Session
  user: UserProfile | null;
  business: BusinessProfile | null;
  settings: BusinessSettings | null;
  isLoading: boolean;
  isDemoMode: boolean;

  // Entity Collections
  products: Product[];
  customers: Customer[];
  transactions: Transaction[];
  campaigns: Campaign[];
  growthTasks: GrowthTask[];
  notifications: AppNotification[];
  chatMessages: ChatMessage[];

  // Computed Business Metrics
  metrics: {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    totalCustomersCount: number;
    newCustomersCount: number;
    returningCustomersCount: number;
    atRiskCustomersCount: number;
    topProduct: { name: string; revenue: number; unitsSold: number } | null;
    growthScore: number;
    growthScoreBreakdown: { sales: number; retention: number; inventory: number; aov: number };
    growthScoreReason: string;
    revenueGrowthRate: number;
    grossProfit: number;
    grossMarginPercent: number;
    weekdaySales: { day: string; sales: number }[];
    revenueSeries: { label: string; revenue: number; lastYear: number; customers: number }[];
    recommendations: {
      id: string;
      tone: "growth" | "warn";
      title: string;
      body: string;
      cta: string;
      link?: string;
      impact: string;
    }[];
  };

  // Auth Operations
  signUp: (email: string, password: string, fullName: string, phone?: string, businessName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  toggleDemoMode: (enable?: boolean) => void;

  // Onboarding & Business Profile Operations
  completeOnboarding: (data: Partial<BusinessProfile>) => Promise<void>;
  updateBusinessProfile: (data: Partial<BusinessProfile>) => Promise<void>;
  updateSettings: (data: Partial<BusinessSettings>) => Promise<void>;

  // Products CRUD
  addProduct: (product: Omit<Product, "id" | "userId" | "createdAt" | "updatedAt">) => Promise<Product>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  // Customers CRUD
  addCustomer: (customer: Omit<Customer, "id" | "userId" | "createdAt" | "updatedAt">) => Promise<Customer>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;

  // Transactions CRUD
  addTransaction: (tx: Omit<Transaction, "id" | "userId" | "createdAt">) => Promise<Transaction>;
  updateTransaction: (id: string, tx: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // Campaigns CRUD
  addCampaign: (campaign: Omit<Campaign, "id" | "userId" | "createdAt">) => Promise<Campaign>;
  updateCampaign: (id: string, campaign: Partial<Campaign>) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;

  // Growth Tasks
  addGrowthTask: (task: Omit<GrowthTask, "id" | "userId" | "createdAt">) => Promise<GrowthTask>;
  updateGrowthTask: (id: string, task: Partial<GrowthTask>) => Promise<void>;

  // Notifications
  addNotification: (notif: Omit<AppNotification, "id" | "userId" | "createdAt">) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  clearNotifications: () => Promise<void>;

  // AI Assistant Chat
  sendChatMessage: (userMessage: string) => Promise<void>;
  clearChat: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

// Storage Keys
const LOCAL_SESSION_KEY = "mga_auth_session";
const LOCAL_DB_PREFIX = "mga_db_";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isDemoMode: false,
  });

  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [growthTasks, setGrowthTasks] = useState<GrowthTask[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const activeUserId = authState.isDemoMode ? DEMO_USER_ID : authState.user?.id || null;

  // -------------------------------------------------------------
  // Load Local Fallback Data per User
  // -------------------------------------------------------------
  const loadLocalUserData = useCallback((userId: string) => {
    try {
      const rawBiz = localStorage.getItem(`${LOCAL_DB_PREFIX}biz_${userId}`);
      const rawProducts = localStorage.getItem(`${LOCAL_DB_PREFIX}prod_${userId}`);
      const rawCustomers = localStorage.getItem(`${LOCAL_DB_PREFIX}cust_${userId}`);
      const rawTx = localStorage.getItem(`${LOCAL_DB_PREFIX}tx_${userId}`);
      const rawCamp = localStorage.getItem(`${LOCAL_DB_PREFIX}camp_${userId}`);
      const rawTasks = localStorage.getItem(`${LOCAL_DB_PREFIX}tasks_${userId}`);
      const rawNotifs = localStorage.getItem(`${LOCAL_DB_PREFIX}notifs_${userId}`);
      const rawChat = localStorage.getItem(`${LOCAL_DB_PREFIX}chat_${userId}`);
      const rawSettings = localStorage.getItem(`${LOCAL_DB_PREFIX}set_${userId}`);

      if (rawBiz) setBusiness({ ...JSON.parse(rawBiz), currency: "INR" });
      setProducts(rawProducts ? JSON.parse(rawProducts) : []);
      setCustomers(rawCustomers ? JSON.parse(rawCustomers) : []);
      setTransactions(rawTx ? JSON.parse(rawTx) : []);
      setCampaigns(rawCamp ? JSON.parse(rawCamp) : []);
      setGrowthTasks(rawTasks ? JSON.parse(rawTasks) : []);
      setNotifications(rawNotifs ? JSON.parse(rawNotifs) : []);
      setChatMessages(rawChat ? JSON.parse(rawChat) : []);
      setSettings(rawSettings ? JSON.parse(rawSettings) : {
        id: `set-${userId}`,
        userId,
        taxRate: 0,
        emailNotifications: true,
        aiInsightsNotifications: true,
        marketingNotifications: true,
        theme: "light",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Failed loading local user state:", err);
    }
  }, []);

  // -------------------------------------------------------------
  // Initialize Auth & Supabase Session Listener
  // -------------------------------------------------------------
  useEffect(() => {
    let mounted = true;

    async function initSession() {
      if (isSupabaseConfigured) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && mounted) {
            const userProfile: UserProfile = {
              id: session.user.id,
              email: session.user.email || "",
              fullName: session.user.user_metadata?.full_name || "Merchant",
              phone: session.user.user_metadata?.phone,
              role: "merchant",
              createdAt: session.user.created_at,
              updatedAt: new Date().toISOString(),
            };
            setAuthState({
              user: userProfile,
              session: { access_token: session.access_token },
              isLoading: false,
              isDemoMode: false,
            });
            await loadSupabaseData(session.user.id);
            return;
          }
        } catch (err) {
          console.warn("Supabase session error, checking local session:", err);
        }
      }

      // Check saved offline / local session
      try {
        const savedSession = localStorage.getItem(LOCAL_SESSION_KEY);
        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          if (parsed.isDemo) {
            setAuthState({
              user: {
                id: DEMO_USER_ID,
                email: "demo@merchantgrowth.ai",
                fullName: "Demo Merchant",
                role: "merchant",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              session: { access_token: "demo-token" },
              isLoading: false,
              isDemoMode: true,
            });
            // Load isolated demo data
            setBusiness(demoBusinessProfile);
            setProducts(demoProducts);
            setCustomers(demoCustomers);
            setTransactions(demoTransactions);
            setCampaigns(demoCampaigns);
            setGrowthTasks(demoGrowthTasks);
            setNotifications(demoNotifications);
            return;
          } else if (parsed.user) {
            setAuthState({
              user: parsed.user,
              session: { access_token: parsed.token || "local-token" },
              isLoading: false,
              isDemoMode: false,
            });
            loadLocalUserData(parsed.user.id);
            return;
          }
        }
      } catch (err) {
        console.error("Error reading saved session:", err);
      }

      if (mounted) {
        setAuthState({ user: null, session: null, isLoading: false, isDemoMode: false });
      }
    }

    initSession();

    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!mounted) return;
        if (session?.user) {
          const userProfile: UserProfile = {
            id: session.user.id,
            email: session.user.email || "",
            fullName: session.user.user_metadata?.full_name || "Merchant",
            phone: session.user.user_metadata?.phone,
            role: "merchant",
            createdAt: session.user.created_at,
            updatedAt: new Date().toISOString(),
          };
          setAuthState({
            user: userProfile,
            session: { access_token: session.access_token },
            isLoading: false,
            isDemoMode: false,
          });
          await loadSupabaseData(session.user.id);
        } else {
          setAuthState({ user: null, session: null, isLoading: false, isDemoMode: false });
          setBusiness(null);
          setProducts([]);
          setCustomers([]);
          setTransactions([]);
          setCampaigns([]);
          setGrowthTasks([]);
          setNotifications([]);
        }
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      mounted = false;
    };
  }, [loadLocalUserData]);

  // -------------------------------------------------------------
  // Load Real Supabase PostgreSQL Data
  // -------------------------------------------------------------
  const loadSupabaseData = async (userId: string) => {
    try {
      // 1. Fetch Business Profile
      const { data: bizData } = await supabase
        .from("merchants")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (bizData) {
        setBusiness({
          id: bizData.id,
          userId: bizData.user_id,
          businessName: bizData.business_name,
          category: bizData.category || "Retail",
          description: bizData.description || "",
          currency: "INR",
          location: bizData.location || "",
          employees: bizData.employees || "1-5",
          yearsInBusiness: bizData.years_in_business || "1",
          monthlyRevenueGoal: Number(bizData.monthly_revenue_goal || 0),
          avgMonthlyRevenue: Number(bizData.avg_monthly_revenue || 0),
          avgOrderValue: Number(bizData.avg_order_value || 0),
          monthlyOrders: Number(bizData.monthly_orders || 0),
          goals: bizData.goals || [],
          onboardingCompleted: Boolean(bizData.onboarding_completed),
          createdAt: bizData.created_at,
          updatedAt: bizData.updated_at,
        });
      } else {
        // Create initial un-onboarded profile
        setBusiness({
          id: `biz-${userId}`,
          userId,
          businessName: "My Business",
          category: "Retail",
          description: "",
          currency: "INR",
          location: "",
          employees: "1-5",
          yearsInBusiness: "0",
          monthlyRevenueGoal: 0,
          avgMonthlyRevenue: 0,
          avgOrderValue: 0,
          monthlyOrders: 0,
          goals: [],
          onboardingCompleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      // 2. Fetch Products
      const { data: prodData } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (prodData) {
        setProducts(
          prodData.map((p) => ({
            id: p.id,
            userId: p.user_id,
            name: p.name,
            sku: p.sku || "",
            category: p.category || "General",
            description: p.description || "",
            sellingPrice: Number(p.selling_price || 0),
            costPrice: Number(p.cost_price || 0),
            stock: Number(p.stock || 0),
            status: p.status || "in_stock",
            imageUrl: p.image_url,
            createdAt: p.created_at,
            updatedAt: p.updated_at,
          }))
        );
      }

      // 3. Fetch Customers
      const { data: custData } = await supabase
        .from("customers")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (custData) {
        setCustomers(
          custData.map((c) => ({
            id: c.id,
            userId: c.user_id,
            name: c.name,
            email: c.email,
            phone: c.phone || "",
            segment: c.segment || "New",
            notes: c.notes,
            createdAt: c.created_at,
            updatedAt: c.updated_at,
          }))
        );
      }

      // 4. Fetch Transactions
      const { data: txData } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("transaction_date", { ascending: false });

      if (txData) {
        setTransactions(
          txData.map((t) => ({
            id: t.id,
            userId: t.user_id,
            customerId: t.customer_id,
            customerName: t.customer_name,
            items: t.items || [],
            itemsCount: Number(t.items_count || 1),
            totalAmount: Number(t.total_amount || 0),
            paymentMethod: t.payment_method || "Card",
            status: t.status || "Paid",
            transactionDate: t.transaction_date,
            createdAt: t.created_at,
          }))
        );
      }

      // 5. Fetch Campaigns
      const { data: campData } = await supabase
        .from("campaigns")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (campData) {
        setCampaigns(
          campData.map((c) => ({
            id: c.id,
            userId: c.user_id,
            name: c.name,
            channel: c.channel,
            goal: c.goal,
            targetAudience: c.target_audience,
            productId: c.product_id,
            offer: c.offer,
            tone: c.tone || "Friendly",
            content: c.content,
            status: c.status || "Active",
            reach: Number(c.reach || 0),
            revenue: Number(c.revenue || 0),
            progress: Number(c.progress || 0),
            createdAt: c.created_at,
          }))
        );
      }

      // 6. Fetch Growth Tasks
      const { data: taskData } = await supabase
        .from("growth_tasks")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (taskData) {
        setGrowthTasks(
          taskData.map((t) => ({
            id: t.id,
            userId: t.user_id,
            title: t.title,
            description: t.description,
            priority: t.priority || "Medium",
            category: t.category || "Sales",
            impact: t.impact,
            difficulty: t.difficulty || "Medium",
            status: t.status || "Pending",
            createdAt: t.created_at,
          }))
        );
      }

      // 7. Fetch Notifications
      const { data: notifData } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (notifData) {
        setNotifications(
          notifData.map((n) => ({
            id: n.id,
            userId: n.user_id,
            title: n.title,
            message: n.message,
            type: n.type || "info",
            read: Boolean(n.read),
            link: n.link,
            createdAt: n.created_at,
          }))
        );
      }

      // 8. Fetch AI Conversations
      const { data: aiData } = await supabase
        .from("ai_conversations")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (aiData?.messages) {
        setChatMessages(aiData.messages);
      }
    } catch (err) {
      console.error("Error fetching Supabase data:", err);
      loadLocalUserData(userId);
    }
  };

  // Helper to persist state to local store fallback
  const persistLocally = (key: string, data: unknown) => {
    if (!activeUserId) return;
    try {
      localStorage.setItem(`${LOCAL_DB_PREFIX}${key}_${activeUserId}`, JSON.stringify(data));
    } catch (e) {
      console.warn("Storage full or error:", e);
    }
  };

  // -------------------------------------------------------------
  // Dynamic Business Metrics & Aggregations
  // -------------------------------------------------------------
  const metrics = useMemo(() => {
    const paidTx = transactions.filter((t) => t.status === "Paid");
    const totalRevenue = paidTx.reduce((sum, t) => sum + t.totalAmount, 0);
    const totalOrders = paidTx.length;
    const avgOrderValue = totalOrders > 0 ? Math.round((totalRevenue / totalOrders) * 100) / 100 : 0;

    // Customer segments calculation
    const totalCustomersCount = customers.length;
    const newCustomersCount = customers.filter((c) => c.segment === "New").length;
    const returningCustomersCount = customers.filter((c) => c.segment === "Returning" || c.segment === "Loyal").length;
    const atRiskCustomersCount = customers.filter((c) => c.segment === "At Risk").length;

    // Product performance computed from transactions
    const productSalesMap: Record<string, { name: string; revenue: number; unitsSold: number }> = {};
    for (const prod of products) {
      productSalesMap[prod.id] = { name: prod.name, revenue: 0, unitsSold: 0 };
    }

    for (const tx of paidTx) {
      for (const item of tx.items) {
        if (item.productId) {
          if (!productSalesMap[item.productId]) {
            productSalesMap[item.productId] = { name: item.productName || "Product", revenue: 0, unitsSold: 0 };
          }
          productSalesMap[item.productId].revenue += item.unitPrice * item.quantity;
          productSalesMap[item.productId].unitsSold += item.quantity;
        }
      }
    }

    const sortedProducts = Object.values(productSalesMap).sort((a, b) => b.revenue - a.revenue);
    const topProduct = sortedProducts.length > 0 && sortedProducts[0].revenue > 0 ? sortedProducts[0] : null;

    // Weekday sales distribution
    const weekdayMap = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    const dayNames: (keyof typeof weekdayMap)[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (const tx of paidTx) {
      const date = new Date(tx.transactionDate);
      const dayName = dayNames[date.getDay()];
      weekdayMap[dayName] += tx.totalAmount;
    }

    const weekdaySales = [
      { day: "Mon", sales: weekdayMap.Mon },
      { day: "Tue", sales: weekdayMap.Tue },
      { day: "Wed", sales: weekdayMap.Wed },
      { day: "Thu", sales: weekdayMap.Thu },
      { day: "Fri", sales: weekdayMap.Fri },
      { day: "Sat", sales: weekdayMap.Sat },
      { day: "Sun", sales: weekdayMap.Sun },
    ];

    // Monthly revenue series (last 6-10 months)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const monthsSeriesMap: Record<string, { revenue: number; customers: Set<string> }> = {};

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = monthNames[d.getMonth()];
      monthsSeriesMap[label] = { revenue: 0, customers: new Set() };
    }

    for (const tx of paidTx) {
      const d = new Date(tx.transactionDate);
      const label = monthNames[d.getMonth()];
      if (monthsSeriesMap[label]) {
        monthsSeriesMap[label].revenue += tx.totalAmount;
        if (tx.customerId) monthsSeriesMap[label].customers.add(tx.customerId);
      }
    }

    const revenueSeries = Object.entries(monthsSeriesMap).map(([label, data]) => ({
      label,
      revenue: data.revenue,
      lastYear: Math.round(data.revenue * 0.85),
      customers: data.customers.size,
    }));

    // Gross profit estimation
    let totalCost = 0;
    for (const tx of paidTx) {
      for (const item of tx.items) {
        const prod = products.find((p) => p.id === item.productId);
        const cost = prod?.costPrice || (item.unitPrice * 0.4);
        totalCost += cost * item.quantity;
      }
    }
    const grossProfit = totalRevenue - totalCost;
    const grossMarginPercent = totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 100) : 0;

    // Dynamic AI Growth Score (0 - 100)
    let scoreSales = 70;
    let scoreRetention = 65;
    let scoreInventory = 80;
    let scoreAov = 70;

    if (totalOrders > 0) {
      scoreSales = Math.min(95, Math.max(40, 50 + Math.floor(totalRevenue / 1000) * 5));
    }
    if (totalCustomersCount > 0) {
      const repeatRatio = returningCustomersCount / totalCustomersCount;
      scoreRetention = Math.min(95, Math.max(30, Math.floor(repeatRatio * 100)));
    }
    const outOfStockCount = products.filter((p) => p.stock === 0).length;
    if (products.length > 0) {
      scoreInventory = Math.max(20, 100 - outOfStockCount * 25);
    }
    if (avgOrderValue > 0) {
      scoreAov = Math.min(95, Math.max(40, Math.floor((avgOrderValue / 50) * 80)));
    }

    const growthScore = Math.round((scoreSales * 0.35) + (scoreRetention * 0.25) + (scoreInventory * 0.2) + (scoreAov * 0.2));

    let growthScoreReason = "Start adding transactions and products to unlock AI growth tracking.";
    if (totalOrders > 0) {
      if (outOfStockCount > 0) {
        growthScoreReason = `Revenue is steady, but ${outOfStockCount} product(s) are out of stock affecting your score.`;
      } else if (atRiskCustomersCount > 0) {
        growthScoreReason = `Strong sales momentum, but ${atRiskCustomersCount} customer(s) are at risk of churning.`;
      } else {
        growthScoreReason = "High momentum! Your sales velocity and customer retention are performing strongly.";
      }
    }

    // Dynamic Recommendations
    const dynamicRecs = [];
    if (outOfStockCount > 0) {
      const outProd = products.find((p) => p.stock === 0);
      dynamicRecs.push({
        id: "rec-stockout",
        tone: "warn" as const,
        title: `Restock ${outProd?.name || "Inventory"}`,
        body: `${outProd?.name || "A top item"} is currently out of stock. Replenishing inventory will recover missed daily sales.`,
        cta: "Update stock",
        link: "/products",
        impact: "+₹1,200 estimated",
      });
    }

    if (atRiskCustomersCount > 0) {
      dynamicRecs.push({
        id: "rec-winback",
        tone: "growth" as const,
        title: `Re-engage ${atRiskCustomersCount} lapsed customers`,
        body: `We detected ${atRiskCustomersCount} customer(s) who haven't ordered recently. A targeted WhatsApp/Email win-back discount can re-activate them.`,
        cta: "Create win-back campaign",
        link: "/campaigns",
        impact: `+₹${Math.round(atRiskCustomersCount * avgOrderValue * 0.4)} projected`,
      });
    }

    if (topProduct && products.length >= 2) {
      const secondProd = sortedProducts[1];
      dynamicRecs.push({
        id: "rec-bundle",
        tone: "growth" as const,
        title: `Bundle "${topProduct.name}" with "${secondProd?.name || "complementary gear"}"`,
        body: `Customers frequently view both items. Offering a combined bundle with a 10% perk will increase your Average Order Value.`,
        cta: "Create bundle promo",
        link: "/campaigns",
        impact: `+₹${Math.round(avgOrderValue * 0.25)} AOV lift`,
      });
    }

    if (dynamicRecs.length === 0) {
      dynamicRecs.push({
        id: "rec-default",
        tone: "growth" as const,
        title: "Launch a Weekend Special Promotion",
        body: "Weekend footfall and online sessions are peak conversion periods. Schedule an Instagram and WhatsApp announcement.",
        cta: "Create campaign",
        link: "/campaigns",
        impact: "+15% weekend lift",
      });
    }

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      totalCustomersCount,
      newCustomersCount,
      returningCustomersCount,
      atRiskCustomersCount,
      topProduct,
      growthScore,
      growthScoreBreakdown: { sales: scoreSales, retention: scoreRetention, inventory: scoreInventory, aov: scoreAov },
      growthScoreReason,
      revenueGrowthRate: 14.2,
      grossProfit,
      grossMarginPercent,
      weekdaySales,
      revenueSeries,
      recommendations: dynamicRecs,
    };
  }, [transactions, products, customers]);

  // -------------------------------------------------------------
  // Auth Actions
  // -------------------------------------------------------------
  const signUp = async (email: string, password: string, fullName: string, phone?: string, businessName?: string) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone || "",
            business_name: businessName || "My Business",
          },
        },
      });

      if (error) return { error };

      if (data.user) {
        const userProfile: UserProfile = {
          id: data.user.id,
          email: data.user.email || email,
          fullName,
          phone,
          role: "merchant",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setAuthState({
          user: userProfile,
          session: { access_token: data.session?.access_token },
          isLoading: false,
          isDemoMode: false,
        });

        // Initialize fresh empty merchant profile
        const freshBiz: BusinessProfile = {
          id: `biz-${data.user.id}`,
          userId: data.user.id,
          businessName: businessName || "My Business",
          category: "Retail",
          description: "",
          currency: "INR",
          location: "",
          employees: "1-5",
          yearsInBusiness: "0",
          monthlyRevenueGoal: 0,
          avgMonthlyRevenue: 0,
          avgOrderValue: 0,
          monthlyOrders: 0,
          goals: [],
          onboardingCompleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setBusiness(freshBiz);
        setProducts([]);
        setCustomers([]);
        setTransactions([]);
        setCampaigns([]);
        setGrowthTasks([]);
        setNotifications([]);
      }
      return { error: null };
    }

    // Offline / Local auth mode
    const userId = "usr_" + Math.random().toString(36).substring(2, 9);
    const userProfile: UserProfile = {
      id: userId,
      email,
      fullName,
      phone,
      role: "merchant",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify({ user: userProfile, token: "local-" + userId, isDemo: false }));

    const freshBiz: BusinessProfile = {
      id: `biz-${userId}`,
      userId,
      businessName: businessName || "My Business",
      category: "Retail",
      description: "",
      currency: "INR",
      location: "",
      employees: "1-5",
      yearsInBusiness: "0",
      monthlyRevenueGoal: 0,
      avgMonthlyRevenue: 0,
      avgOrderValue: 0,
      monthlyOrders: 0,
      goals: [],
      onboardingCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setAuthState({ user: userProfile, session: { access_token: "token" }, isLoading: false, isDemoMode: false });
    setBusiness(freshBiz);
    setProducts([]);
    setCustomers([]);
    setTransactions([]);
    setCampaigns([]);
    setGrowthTasks([]);
    setNotifications([]);

    persistLocally("biz", freshBiz);
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error };
      if (data.user) {
        await loadSupabaseData(data.user.id);
      }
      return { error: null };
    }

    // Local fallback signin
    const userId = "usr_" + Math.random().toString(36).substring(2, 9);
    const userProfile: UserProfile = {
      id: userId,
      email,
      fullName: email.split("@")[0],
      role: "merchant",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify({ user: userProfile, token: "token", isDemo: false }));
    setAuthState({ user: userProfile, session: { access_token: "token" }, isLoading: false, isDemoMode: false });
    loadLocalUserData(userId);
    return { error: null };
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn("Supabase signout error:", e);
      }
    }
    localStorage.removeItem(LOCAL_SESSION_KEY);
    setAuthState({ user: null, session: null, isLoading: false, isDemoMode: false });
    setBusiness(null);
    setProducts([]);
    setCustomers([]);
    setTransactions([]);
    setCampaigns([]);
    setGrowthTasks([]);
    setNotifications([]);
  };

  const resetPassword = async (email: string) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return { error };
    }
    return { error: null };
  };

  const toggleDemoMode = (enable = true) => {
    if (enable) {
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify({ isDemo: true }));
      setAuthState({
        user: {
          id: DEMO_USER_ID,
          email: "demo@merchantgrowth.ai",
          fullName: "Demo Merchant",
          role: "merchant",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        session: { access_token: "demo-token" },
        isLoading: false,
        isDemoMode: true,
      });
      setBusiness(demoBusinessProfile);
      setProducts(demoProducts);
      setCustomers(demoCustomers);
      setTransactions(demoTransactions);
      setCampaigns(demoCampaigns);
      setGrowthTasks(demoGrowthTasks);
      setNotifications(demoNotifications);
    } else {
      signOut();
    }
  };

  // -------------------------------------------------------------
  // Onboarding & Business Updates
  // -------------------------------------------------------------
  const completeOnboarding = async (data: Partial<BusinessProfile>) => {
    if (!activeUserId) return;
    const updatedBiz: BusinessProfile = {
      ...(business || {
        id: `biz-${activeUserId}`,
        userId: activeUserId,
        businessName: data.businessName || "My Business",
        category: data.category || "Retail",
        description: "",
        currency: "INR",
        location: "",
        employees: "1-5",
        yearsInBusiness: "1",
        monthlyRevenueGoal: 0,
        avgMonthlyRevenue: 0,
        avgOrderValue: 0,
        monthlyOrders: 0,
        goals: [],
        onboardingCompleted: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
      ...data,
      onboardingCompleted: true,
      updatedAt: new Date().toISOString(),
    };

    setBusiness(updatedBiz);

    // Initial welcome task & notification
    const welcomeTask: GrowthTask = {
      id: "gt-" + Math.random().toString(36).substring(2, 9),
      userId: activeUserId,
      title: "Add your first 3 products & customer catalog",
      description: "Populate your product catalog and cost prices to enable profit margin tracking and AI recommendations.",
      priority: "High",
      category: "Operations",
      impact: "+25% Growth Score",
      difficulty: "Easy",
      status: "Pending",
      createdAt: new Date().toISOString(),
    };

    const welcomeNotif: AppNotification = {
      id: "notif-" + Math.random().toString(36).substring(2, 9),
      userId: activeUserId,
      title: "Welcome to Merchant Growth AI! 🎉",
      message: `${updatedBiz.businessName} workspace is initialized and ready for real growth tracking.`,
      type: "milestone",
      read: false,
      link: "/",
      createdAt: new Date().toISOString(),
    };

    setGrowthTasks((prev) => [welcomeTask, ...prev]);
    setNotifications((prev) => [welcomeNotif, ...prev]);

    if (isSupabaseConfigured && !authState.isDemoMode) {
      await supabase.from("merchants").upsert({
        user_id: activeUserId,
        business_name: updatedBiz.businessName,
        category: updatedBiz.category,
        description: updatedBiz.description,
        currency: updatedBiz.currency,
        location: updatedBiz.location,
        employees: updatedBiz.employees,
        years_in_business: updatedBiz.yearsInBusiness,
        monthly_revenue_goal: updatedBiz.monthlyRevenueGoal,
        avg_monthly_revenue: updatedBiz.avgMonthlyRevenue,
        avg_order_value: updatedBiz.avgOrderValue,
        monthly_orders: updatedBiz.monthlyOrders,
        goals: updatedBiz.goals,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      });

      await supabase.from("growth_tasks").insert({
        user_id: activeUserId,
        title: welcomeTask.title,
        description: welcomeTask.description,
        priority: welcomeTask.priority,
        category: welcomeTask.category,
        impact: welcomeTask.impact,
        difficulty: welcomeTask.difficulty,
        status: welcomeTask.status,
      });

      await supabase.from("notifications").insert({
        user_id: activeUserId,
        title: welcomeNotif.title,
        message: welcomeNotif.message,
        type: welcomeNotif.type,
        read: false,
        link: welcomeNotif.link,
      });
    } else {
      persistLocally("biz", updatedBiz);
      persistLocally("tasks", [welcomeTask, ...growthTasks]);
      persistLocally("notifs", [welcomeNotif, ...notifications]);
    }
  };

  const updateBusinessProfile = async (data: Partial<BusinessProfile>) => {
    if (!business || !activeUserId) return;
    const updated = { ...business, ...data, updatedAt: new Date().toISOString() };
    setBusiness(updated);

    if (isSupabaseConfigured && !authState.isDemoMode) {
      await supabase.from("merchants").update({
        business_name: updated.businessName,
        category: updated.category,
        description: updated.description,
        currency: updated.currency,
        location: updated.location,
        employees: updated.employees,
        years_in_business: updated.yearsInBusiness,
        monthly_revenue_goal: updated.monthlyRevenueGoal,
        goals: updated.goals,
        updated_at: updated.updatedAt,
      }).eq("user_id", activeUserId);
    } else {
      persistLocally("biz", updated);
    }
  };

  const updateSettings = async (data: Partial<BusinessSettings>) => {
    if (!activeUserId) return;
    const updated = {
      ...(settings || {
        id: `set-${activeUserId}`,
        userId: activeUserId,
        taxRate: 0,
        emailNotifications: true,
        aiInsightsNotifications: true,
        marketingNotifications: true,
        theme: "light",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
      ...data,
      updatedAt: new Date().toISOString(),
    };
    setSettings(updated);

    if (isSupabaseConfigured && !authState.isDemoMode) {
      await supabase.from("business_settings").upsert({
        user_id: activeUserId,
        tax_rate: updated.taxRate,
        email_notifications: updated.emailNotifications,
        ai_insights_notifications: updated.aiInsightsNotifications,
        marketing_notifications: updated.marketingNotifications,
        theme: updated.theme,
        updated_at: updated.updatedAt,
      });
    } else {
      persistLocally("set", updated);
    }
  };

  // -------------------------------------------------------------
  // Products CRUD
  // -------------------------------------------------------------
  const addProduct = async (productData: Omit<Product, "id" | "userId" | "createdAt" | "updatedAt">): Promise<Product> => {
    const newId = "prod-" + Math.random().toString(36).substring(2, 9);
    const newProduct: Product = {
      ...productData,
      id: newId,
      userId: activeUserId || "usr-anon",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProducts((prev) => {
      const next = [newProduct, ...prev];
      persistLocally("prod", next);
      return next;
    });

    if (isSupabaseConfigured && !authState.isDemoMode && activeUserId) {
      const { data } = await supabase.from("products").insert({
        user_id: activeUserId,
        name: newProduct.name,
        sku: newProduct.sku,
        category: newProduct.category,
        description: newProduct.description,
        selling_price: newProduct.sellingPrice,
        cost_price: newProduct.costPrice,
        stock: newProduct.stock,
        status: newProduct.status,
        image_url: newProduct.imageUrl,
      }).select().single();

      if (data) {
        newProduct.id = data.id;
      }
    }

    // Check low stock trigger
    if (newProduct.stock > 0 && newProduct.stock <= 5) {
      addNotification({
        title: "Low Stock Warning",
        message: `${newProduct.name} is running low on stock (${newProduct.stock} units remaining).`,
        type: "warning",
        read: false,
        link: "/products",
      });
    }

    return newProduct;
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p));
      persistLocally("prod", next);
      return next;
    });

    if (isSupabaseConfigured && !authState.isDemoMode && activeUserId) {
      await supabase.from("products").update({
        name: updates.name,
        sku: updates.sku,
        category: updates.category,
        description: updates.description,
        selling_price: updates.sellingPrice,
        cost_price: updates.costPrice,
        stock: updates.stock,
        status: updates.status,
        image_url: updates.imageUrl,
        updated_at: new Date().toISOString(),
      }).eq("id", id).eq("user_id", activeUserId);
    }
  };

  const deleteProduct = async (id: string) => {
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      persistLocally("prod", next);
      return next;
    });

    if (isSupabaseConfigured && !authState.isDemoMode && activeUserId) {
      await supabase.from("products").delete().eq("id", id).eq("user_id", activeUserId);
    }
  };

  // -------------------------------------------------------------
  // Customers CRUD
  // -------------------------------------------------------------
  const addCustomer = async (custData: Omit<Customer, "id" | "userId" | "createdAt" | "updatedAt">): Promise<Customer> => {
    const newId = "cust-" + Math.random().toString(36).substring(2, 9);
    const newCustomer: Customer = {
      ...custData,
      id: newId,
      userId: activeUserId || "usr-anon",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCustomers((prev) => {
      const next = [newCustomer, ...prev];
      persistLocally("cust", next);
      return next;
    });

    if (isSupabaseConfigured && !authState.isDemoMode && activeUserId) {
      const { data } = await supabase.from("customers").insert({
        user_id: activeUserId,
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        segment: newCustomer.segment,
        notes: newCustomer.notes,
      }).select().single();

      if (data) {
        newCustomer.id = data.id;
      }
    }

    return newCustomer;
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c));
      persistLocally("cust", next);
      return next;
    });

    if (isSupabaseConfigured && !authState.isDemoMode && activeUserId) {
      await supabase.from("customers").update({
        name: updates.name,
        email: updates.email,
        phone: updates.phone,
        segment: updates.segment,
        notes: updates.notes,
        updated_at: new Date().toISOString(),
      }).eq("id", id).eq("user_id", activeUserId);
    }
  };

  const deleteCustomer = async (id: string) => {
    setCustomers((prev) => {
      const next = prev.filter((c) => c.id !== id);
      persistLocally("cust", next);
      return next;
    });

    if (isSupabaseConfigured && !authState.isDemoMode && activeUserId) {
      await supabase.from("customers").delete().eq("id", id).eq("user_id", activeUserId);
    }
  };

  // -------------------------------------------------------------
  // Transactions CRUD
  // -------------------------------------------------------------
  const addTransaction = async (txData: Omit<Transaction, "id" | "userId" | "createdAt">): Promise<Transaction> => {
    const newId = "tx-" + Math.random().toString(36).substring(2, 9);
    const newTx: Transaction = {
      ...txData,
      id: newId,
      userId: activeUserId || "usr-anon",
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => {
      const next = [newTx, ...prev];
      persistLocally("tx", next);
      return next;
    });

    // Auto-update customer segment & order count
    if (newTx.customerId) {
      const relatedCustomer = customers.find((c) => c.id === newTx.customerId);
      if (relatedCustomer) {
        const nextSegment = relatedCustomer.segment === "New" ? "Returning" : relatedCustomer.segment;
        updateCustomer(relatedCustomer.id, { segment: nextSegment });
      }
    }

    // Auto-decrement product stock
    for (const item of newTx.items) {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        const nextStock = Math.max(0, prod.stock - item.quantity);
        const nextStatus = nextStock === 0 ? "out_of_stock" : nextStock <= 5 ? "low_stock" : "in_stock";
        updateProduct(prod.id, { stock: nextStock, status: nextStatus });
      }
    }

    if (isSupabaseConfigured && !authState.isDemoMode && activeUserId) {
      const { data } = await supabase.from("transactions").insert({
        user_id: activeUserId,
        customer_id: newTx.customerId || null,
        customer_name: newTx.customerName,
        items: newTx.items,
        items_count: newTx.itemsCount,
        total_amount: newTx.totalAmount,
        payment_method: newTx.paymentMethod,
        status: newTx.status,
        transaction_date: newTx.transactionDate,
      }).select().single();

      if (data) {
        newTx.id = data.id;
      }
    }

    return newTx;
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, ...updates } : t));
      persistLocally("tx", next);
      return next;
    });

    if (isSupabaseConfigured && !authState.isDemoMode && activeUserId) {
      await supabase.from("transactions").update({
        customer_name: updates.customerName,
        items: updates.items,
        items_count: updates.itemsCount,
        total_amount: updates.totalAmount,
        payment_method: updates.paymentMethod,
        status: updates.status,
        transaction_date: updates.transactionDate,
      }).eq("id", id).eq("user_id", activeUserId);
    }
  };

  const deleteTransaction = async (id: string) => {
    setTransactions((prev) => {
      const next = prev.filter((t) => t.id !== id);
      persistLocally("tx", next);
      return next;
    });

    if (isSupabaseConfigured && !authState.isDemoMode && activeUserId) {
      await supabase.from("transactions").delete().eq("id", id).eq("user_id", activeUserId);
    }
  };

  // -------------------------------------------------------------
  // Campaigns CRUD
  // -------------------------------------------------------------
  const addCampaign = async (campData: Omit<Campaign, "id" | "userId" | "createdAt">): Promise<Campaign> => {
    const newId = "camp-" + Math.random().toString(36).substring(2, 9);
    const newCampaign: Campaign = {
      ...campData,
      id: newId,
      userId: activeUserId || "usr-anon",
      createdAt: new Date().toISOString(),
    };

    setCampaigns((prev) => {
      const next = [newCampaign, ...prev];
      persistLocally("camp", next);
      return next;
    });

    if (isSupabaseConfigured && !authState.isDemoMode && activeUserId) {
      const { data } = await supabase.from("campaigns").insert({
        user_id: activeUserId,
        name: newCampaign.name,
        channel: newCampaign.channel,
        goal: newCampaign.goal,
        target_audience: newCampaign.targetAudience,
        product_id: newCampaign.productId || null,
        offer: newCampaign.offer,
        tone: newCampaign.tone,
        content: newCampaign.content,
        status: newCampaign.status,
        reach: newCampaign.reach,
        revenue: newCampaign.revenue,
        progress: newCampaign.progress,
      }).select().single();

      if (data) {
        newCampaign.id = data.id;
      }
    }

    return newCampaign;
  };

  const updateCampaign = async (id: string, updates: Partial<Campaign>) => {
    setCampaigns((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, ...updates } : c));
      persistLocally("camp", next);
      return next;
    });

    if (isSupabaseConfigured && !authState.isDemoMode && activeUserId) {
      await supabase.from("campaigns").update({
        name: updates.name,
        channel: updates.channel,
        goal: updates.goal,
        target_audience: updates.targetAudience,
        product_id: updates.productId || null,
        offer: updates.offer,
        tone: updates.tone,
        content: updates.content,
        status: updates.status,
        reach: updates.reach,
        revenue: updates.revenue,
        progress: updates.progress,
      }).eq("id", id).eq("user_id", activeUserId);
    }
  };

  const deleteCampaign = async (id: string) => {
    setCampaigns((prev) => {
      const next = prev.filter((c) => c.id !== id);
      persistLocally("camp", next);
      return next;
    });

    if (isSupabaseConfigured && !authState.isDemoMode && activeUserId) {
      await supabase.from("campaigns").delete().eq("id", id).eq("user_id", activeUserId);
    }
  };

  // -------------------------------------------------------------
  // Growth Tasks & Notifications
  // -------------------------------------------------------------
  const addGrowthTask = async (taskData: Omit<GrowthTask, "id" | "userId" | "createdAt">): Promise<GrowthTask> => {
    const newTask: GrowthTask = {
      ...taskData,
      id: "gt-" + Math.random().toString(36).substring(2, 9),
      userId: activeUserId || "usr-anon",
      createdAt: new Date().toISOString(),
    };

    setGrowthTasks((prev) => {
      const next = [newTask, ...prev];
      persistLocally("tasks", next);
      return next;
    });

    if (isSupabaseConfigured && !authState.isDemoMode && activeUserId) {
      await supabase.from("growth_tasks").insert({
        user_id: activeUserId,
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        category: newTask.category,
        impact: newTask.impact,
        difficulty: newTask.difficulty,
        status: newTask.status,
      });
    }
    return newTask;
  };

  const updateGrowthTask = async (id: string, updates: Partial<GrowthTask>) => {
    setGrowthTasks((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, ...updates } : t));
      persistLocally("tasks", next);
      return next;
    });

    if (isSupabaseConfigured && !authState.isDemoMode && activeUserId) {
      await supabase.from("growth_tasks").update({
        status: updates.status,
        priority: updates.priority,
      }).eq("id", id).eq("user_id", activeUserId);
    }
  };

  const addNotification = async (notifData: Omit<AppNotification, "id" | "userId" | "createdAt">) => {
    const newNotif: AppNotification = {
      ...notifData,
      id: "notif-" + Math.random().toString(36).substring(2, 9),
      userId: activeUserId || "usr-anon",
      createdAt: new Date().toISOString(),
    };

    setNotifications((prev) => {
      const next = [newNotif, ...prev];
      persistLocally("notifs", next);
      return next;
    });

    if (isSupabaseConfigured && !authState.isDemoMode && activeUserId) {
      await supabase.from("notifications").insert({
        user_id: activeUserId,
        title: newNotif.title,
        message: newNotif.message,
        type: newNotif.type,
        read: newNotif.read,
        link: newNotif.link,
      });
    }
  };

  const markNotificationRead = async (id: string) => {
    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      persistLocally("notifs", next);
      return next;
    });

    if (isSupabaseConfigured && !authState.isDemoMode && activeUserId) {
      await supabase.from("notifications").update({ read: true }).eq("id", id).eq("user_id", activeUserId);
    }
  };

  const clearNotifications = async () => {
    setNotifications([]);
    persistLocally("notifs", []);
    if (isSupabaseConfigured && !authState.isDemoMode && activeUserId) {
      await supabase.from("notifications").delete().eq("user_id", activeUserId);
    }
  };

  // -------------------------------------------------------------
  // AI Growth Assistant Engine
  // -------------------------------------------------------------
  const sendChatMessage = async (userText: string) => {
    const userMsg: ChatMessage = {
      id: "msg-" + Math.random().toString(36).substring(2, 9),
      role: "user",
      content: userText,
      timestamp: new Date().toISOString(),
    };

    const nextMessages = [...chatMessages, userMsg];
    setChatMessages(nextMessages);

    // Business intelligence context compilation
    const storeName = business?.businessName || "your store";
    const topProd = metrics.topProduct;
    const rev = metrics.totalRevenue;
    const aov = metrics.avgOrderValue;
    const atRiskCount = metrics.atRiskCustomersCount;
    const outStockCount = products.filter((p) => p.stock === 0).length;

    let aiReply = "";
    const lower = userText.toLowerCase();

    if (lower.includes("sales") || lower.includes("revenue") || lower.includes("increase")) {
      aiReply = `Based on your recent transaction data for **${storeName}**:\n\n1. **Current Revenue**: ₹${rev.toLocaleString("en-IN")} across ${metrics.totalOrders} completed orders (Average order value: ₹${aov}).\n2. **Immediate Opportunity**: ${topProd ? `Your best-performing item is **${topProd.name}** (₹${topProd.revenue.toLocaleString("en-IN")} earned). Bundle it with a complementary item to push your average basket higher.` : "Add your primary products and record transactions to find your hero product."}\n3. **Recommended Step**: Launch a Friday-Sunday promotion on WhatsApp or Instagram targeting returning customers.`;
    } else if (lower.includes("best") || lower.includes("product") || lower.includes("performing")) {
      if (topProd) {
        aiReply = `Your #1 best-selling product is **${topProd.name}** with **${topProd.unitsSold} units sold** generating **₹${topProd.revenue.toLocaleString("en-IN")}**.\n\n💡 **Growth AI Tip**: Create a dedicated VIP restock campaign or social media spotlight for this item to compound momentum.`;
      } else {
        aiReply = `You haven't recorded any product sales yet. Head over to **Products** and **Transactions** to add catalog items and register your sales.`;
      }
    } else if (lower.includes("customer") || lower.includes("target") || lower.includes("inactive") || lower.includes("risk")) {
      aiReply = `Looking at your customer distribution for **${storeName}**:\n\n• Total Customers: **${metrics.totalCustomersCount}**\n• New Customers: **${metrics.newCustomersCount}**\n• Loyal / Returning: **${metrics.returningCustomersCount}**\n• At-Risk Buyers: **${atRiskCount}**\n\n🎯 **Actionable Target**: We recommend launching an automated win-back offer on WhatsApp with code \`WE-MISSED-YOU\` to re-engage your ${atRiskCount} at-risk buyers.`;
    } else if (lower.includes("campaign") || lower.includes("marketing") || lower.includes("promo")) {
      aiReply = `Here is a high-converting promotional campaign idea for **${storeName}**:\n\n📢 **Campaign**: Weekend VIP Flash Sale\n🎯 **Audience**: All customers\n🎁 **Offer**: 15% off orders with code \`GROWTH15\`\n📱 **Channels**: WhatsApp + Instagram\n\nYou can generate and schedule this directly in the **Campaigns** tab!`;
    } else if (lower.includes("why") || lower.includes("decrease") || lower.includes("score")) {
      aiReply = `Your **AI Growth Score is currently ${metrics.growthScore}/100**.\n\nKey drivers:\n• Sales Velocity: ${metrics.growthScoreBreakdown.sales}/100\n• Customer Retention: ${metrics.growthScoreBreakdown.retention}/100\n• Inventory Health: ${metrics.growthScoreBreakdown.inventory}/100\n• Basket Optimization: ${metrics.growthScoreBreakdown.aov}/100\n\n${metrics.growthScoreReason}`;
    } else {
      aiReply = `I'm analyzing **${storeName}** in real time. We currently have **₹${rev.toLocaleString("en-IN")} in revenue**, **${products.length} products**, and **${customers.length} customer records**.\n\nHow can I help you grow today? You can ask me about increasing sales, customer segmentation, inventory alerts, or campaign copy generation.`;
    }

    const assistantMsg: ChatMessage = {
      id: "msg-" + Math.random().toString(36).substring(2, 9),
      role: "assistant",
      content: aiReply,
      timestamp: new Date().toISOString(),
    };

    const finalChat = [...nextMessages, assistantMsg];
    setChatMessages(finalChat);
    persistLocally("chat", finalChat);

    if (isSupabaseConfigured && !authState.isDemoMode && activeUserId) {
      await supabase.from("ai_conversations").upsert({
        user_id: activeUserId,
        messages: finalChat,
        updated_at: new Date().toISOString(),
      });
    }
  };

  const clearChat = async () => {
    setChatMessages([]);
    persistLocally("chat", []);
    if (isSupabaseConfigured && !authState.isDemoMode && activeUserId) {
      await supabase.from("ai_conversations").delete().eq("user_id", activeUserId);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user: authState.user,
        business,
        settings,
        isLoading: authState.isLoading,
        isDemoMode: authState.isDemoMode,
        products,
        customers,
        transactions,
        campaigns,
        growthTasks,
        notifications,
        chatMessages,
        metrics,
        signUp,
        signIn,
        signOut,
        resetPassword,
        toggleDemoMode,
        completeOnboarding,
        updateBusinessProfile,
        updateSettings,
        addProduct,
        updateProduct,
        deleteProduct,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addCampaign,
        updateCampaign,
        deleteCampaign,
        addGrowthTask,
        updateGrowthTask,
        addNotification,
        markNotificationRead,
        clearNotifications,
        sendChatMessage,
        clearChat,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
