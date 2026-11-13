import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
  Menu,
  Search,
  Settings,
  Sparkles,
  User,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { allNav, navGroups } from "./nav";
import { useApp } from "@/lib/store/app-context";
import { cn } from "@/lib/utils";

function useActive() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (to: string) => (to === "/" ? path === "/" : path.startsWith(to));
}

function SideNav({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const isActive = useActive();
  return (
    <nav className="flex flex-col gap-5">
      {navGroups.map((g) => (
        <div key={g.label} className="flex flex-col gap-1">
          {!collapsed && (
            <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {g.label}
            </p>
          )}
          {g.items.map((it) => {
            const active = isActive(it.to);
            const link = (
              <Link
                to={it.to as any}
                onClick={onNavigate}
                className={cn(
                  "group relative flex h-10 items-center gap-3 rounded-[10px] text-sm font-medium transition-colors",
                  collapsed ? "w-10 justify-center" : "px-3",
                  active
                    ? "bg-accent text-accent-foreground ring-1 ring-primary/30"
                    : "text-card-foreground/60 hover:bg-ink/5 hover:text-ink"
                )}
              >
                <it.icon className="size-[18px] shrink-0" />
                {!collapsed && <span>{it.label}</span>}
              </Link>
            );
            return collapsed ? (
              <Tooltip key={it.to}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{it.label}</TooltipContent>
              </Tooltip>
            ) : (
              <div key={it.to}>{link}</div>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, business, products, customers, notifications, markNotificationRead, signOut, toggleDemoMode, isDemoMode } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const navigate = useNavigate();
  const isActive = useActive();

  const currentPath = useRouterState({ select: (s) => s.location.pathname });
  const isAuthPage = currentPath === "/login" || currentPath === "/signup";

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const go = (to: string) => {
    setCmdOpen(false);
    navigate({ to: to as any });
  };

  const businessName = business?.businessName || (user ? `${user.fullName}'s Store` : "Merchant Growth AI");
  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "MG";

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-background text-card-foreground">
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 h-[38rem] w-[38rem] -rotate-12 rounded-[40%] bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-52 -right-32 h-[42rem] w-[42rem] rotate-12 rounded-[45%] bg-secondary/20 blur-3xl" />
        </div>
        <main className="relative z-10">{children}</main>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={100}>
      <div className="min-h-screen bg-background text-card-foreground">
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 h-[38rem] w-[38rem] -rotate-12 rounded-[40%] bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-52 -right-32 h-[42rem] w-[42rem] rotate-12 rounded-[45%] bg-secondary/20 blur-3xl" />
        </div>

        {/* Demo Mode Notice Banner */}
        {isDemoMode && (
          <div className="relative z-50 flex items-center justify-between bg-secondary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm">
            <span className="flex items-center gap-1.5">
              <Sparkles className="size-3.5" />
              Demo Mode Active: You are exploring sample artisan coffee store data.
            </span>
            <button
              onClick={() => toggleDemoMode(false)}
              className="rounded bg-primary-foreground/20 px-2 py-0.5 text-[11px] hover:bg-primary-foreground/30"
            >
              Exit Demo Mode
            </button>
          </div>
        )}

        <div className="relative z-10 flex min-h-screen">
          {/* Desktop Sidebar */}
          <aside
            className={cn(
              "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-sidebar py-5 backdrop-blur-xl transition-[width] duration-300 lg:flex",
              collapsed ? "w-[76px] items-center px-3" : "w-[232px] px-4"
            )}
          >
            <Link to="/" className={cn("mb-6 flex items-center gap-2.5", !collapsed && "px-1")}>
              <img
                src="/logo.png"
                alt="Merchant Growth AI Logo"
                className="size-10 shrink-0 object-contain drop-shadow-sm"
              />
              {!collapsed && (
                <div className="leading-tight min-w-0">
                  <p className="font-display text-sm font-bold text-ink truncate">Merchant Growth</p>
                  <p className="text-[11px] text-muted-foreground truncate">{businessName}</p>
                </div>
              )}
            </Link>

            <SideNav collapsed={collapsed} />

            <div className="mt-auto flex flex-col gap-2">
              {!collapsed && (
                <Link to={"/assistant" as any} className="surface-ink lift p-4 shadow-md">
                  <Sparkles className="size-4 text-primary" />
                  <p className="mt-2 text-sm font-semibold">Growth AI Advisor</p>
                  <p className="text-xs text-primary-foreground/70">Ask actionable questions</p>
                </Link>
              )}
              <button
                onClick={() => setCollapsed((c) => !c)}
                aria-label="Toggle sidebar"
                className={cn(
                  "flex h-9 items-center gap-2 rounded-[10px] text-xs font-medium text-muted-foreground hover:bg-ink/5",
                  collapsed ? "w-10 justify-center" : "px-3"
                )}
              >
                {collapsed ? <ChevronsRight className="size-4" /> : <><ChevronsLeft className="size-4" /> Collapse</>}
              </button>
            </div>
          </aside>

          {/* Main Workspace Header & Content */}
          <div className="flex min-w-0 flex-1 flex-col">
            <header className="flex items-center gap-3 px-4 pt-5 sm:px-8 lg:px-10 lg:pt-8">
              <button
                className="grid size-10 place-items-center rounded-full bg-card ring-1 ring-border lg:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </button>
              <Link to="/" className="flex items-center gap-2 lg:hidden">
                <img
                  src="/logo.png"
                  alt="Merchant Growth AI"
                  className="size-8 object-contain"
                />
                <span className="font-display text-sm font-bold text-ink">Merchant Growth</span>
              </Link>

              <div className="ml-auto flex items-center gap-2 sm:gap-3">
                {/* Search / Command Trigger */}
                <button
                  onClick={() => setCmdOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-2 text-sm font-medium ring-1 ring-border sm:px-4 hover:bg-muted transition-colors"
                >
                  <Search className="size-4 text-secondary" />
                  <span className="hidden sm:inline">Search catalog, actions…</span>
                  <kbd className="ml-3 hidden rounded bg-ink/5 px-1.5 text-[11px] text-muted-foreground md:inline">
                    ⌘K
                  </kbd>
                </button>

                {/* Notifications Popover */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className="relative grid size-10 place-items-center rounded-full bg-card ring-1 ring-border hover:bg-muted"
                      aria-label="Notifications"
                    >
                      <Bell className="size-4" />
                      {unreadCount > 0 && (
                        <span className="absolute right-2 top-2 grid size-2.5 place-items-center rounded-full bg-destructive ring-2 ring-background" />
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-80 p-0 shadow-xl">
                    <div className="flex items-center justify-between border-b border-border px-4 py-3">
                      <p className="font-display text-sm font-bold text-ink">Notifications</p>
                      {unreadCount > 0 && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-border">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-center text-xs text-muted-foreground">
                          No notifications right now.
                        </p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => markNotificationRead(n.id)}
                            className={cn(
                              "flex gap-3 px-4 py-3 transition-colors cursor-pointer hover:bg-muted",
                              !n.read ? "bg-primary/5" : ""
                            )}
                          >
                            <span
                              className={cn(
                                "mt-1.5 size-2 shrink-0 rounded-full",
                                n.type === "warning"
                                  ? "bg-destructive"
                                  : n.type === "milestone"
                                  ? "bg-primary"
                                  : "bg-secondary"
                              )}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-ink leading-snug">{n.title}</p>
                              <p className="text-[11px] text-muted-foreground">{n.message}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </PopoverContent>
                </Popover>

                <Link
                  to={"/assistant" as any}
                  className="hidden rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 sm:inline-flex"
                >
                  <Sparkles className="mr-1.5 size-4" /> Ask Growth AI
                </Link>

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="grid size-10 place-items-center rounded-full bg-ink font-display text-xs font-bold text-primary-foreground shadow ring-2 ring-primary/30">
                      {initials}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <p className="font-semibold text-sm text-ink">{user?.fullName || "Merchant"}</p>
                      <p className="text-xs font-normal text-muted-foreground truncate">{user?.email || "demo@store.com"}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate({ to: "/settings" as any })}>
                      <Settings className="mr-2 size-4" /> Workspace Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate({ to: "/onboarding" as any })}>
                      <User className="mr-2 size-4" /> Onboarding Setup
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleDemoMode(!isDemoMode)}>
                      <Sparkles className="mr-2 size-4 text-primary" />
                      {isDemoMode ? "Exit Demo Mode" : "Switch to Demo Mode"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()} className="text-destructive font-semibold">
                      <LogOut className="mr-2 size-4" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>

            <main
              key={useRouterState({ select: (s) => s.location.pathname })}
              className="rise flex-1 px-4 pb-28 pt-6 sm:px-8 lg:px-10 lg:pb-10"
            >
              {children}
            </main>
          </div>
        </div>

        {/* Mobile bottom nav */}
        <nav className="fixed inset-x-3 bottom-3 z-40 flex justify-around rounded-2xl bg-popover/90 p-1.5 shadow-lg ring-1 ring-border backdrop-blur-xl lg:hidden">
          {[allNav[0], allNav[1], allNav[3], allNav[6], allNav[9]].map((it) => (
            <Link
              key={it.to}
              to={it.to as any}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 text-[11px] font-medium",
                isActive(it.to) ? "bg-accent text-accent-foreground font-semibold" : "text-muted-foreground"
              )}
            >
              <it.icon className="size-5" />
              {it.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Side Sheet */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-72 p-5">
            <div className="mb-6 flex items-center gap-2.5">
              <img
                src="/logo.png"
                alt="Merchant Growth AI"
                className="size-8 shrink-0 object-contain"
              />
              <SheetTitle className="font-display font-bold">Merchant Growth AI</SheetTitle>
            </div>
            <SideNav collapsed={false} onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Command Palette (⌘K) */}
        <CommandDialog open={cmdOpen} onOpenChange={setCmdOpen}>
          <CommandInput placeholder="Search pages, products, customers, AI tools…" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Navigation Pages">
              {allNav.map((it) => (
                <CommandItem key={it.to} onSelect={() => go(it.to)}>
                  <it.icon className="mr-2 size-4" />
                  {it.label}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="AI Tools & Actions">
              <CommandItem onSelect={() => go("/assistant")}>
                <Sparkles className="mr-2 size-4 text-primary" />
                Ask Growth AI Advisor
              </CommandItem>
              <CommandItem onSelect={() => go("/campaigns")}>
                <Sparkles className="mr-2 size-4 text-primary" />
                Generate AI Social & Email Campaign
              </CommandItem>
            </CommandGroup>
            {products.length > 0 && (
              <CommandGroup heading="Products">
                {products.slice(0, 5).map((p) => (
                  <CommandItem key={p.id} onSelect={() => go("/products")}>
                    {p.name} (₹{p.sellingPrice})
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {customers.length > 0 && (
              <CommandGroup heading="Customers">
                {customers.slice(0, 5).map((c) => (
                  <CommandItem key={c.id} onSelect={() => go("/customers")}>
                    {c.name} ({c.segment})
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </CommandDialog>
      </div>
    </TooltipProvider>
  );
}
