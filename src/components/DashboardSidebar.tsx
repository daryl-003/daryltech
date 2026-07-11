import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, ChevronLeft, ChevronRight, Sun, Moon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/components/ThemeProvider";
import logoAsset from "@/assets/daryl-tech-logo.png.asset.json";
const logo = logoAsset.url;

export interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string | number;
  onClick?: () => void;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

interface DashboardSidebarProps {
  groups?: NavGroup[];
  items?: NavItem[]; // legacy flat list — rendered as a single "Menu" group
  children: React.ReactNode;
}

const DashboardSidebar = ({ groups, items, children }: DashboardSidebarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();

  const resolvedGroups: NavGroup[] = groups ?? (items ? [{ label: "Menu", items }] : []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const sidebarContent = (
    <div className="flex h-full flex-col bg-sidebar-background">
      {/* Logo */}
      <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-4">
        <Link to="/" className={`flex items-center gap-2 ${collapsed ? "justify-center w-full" : ""}`} aria-label="Home">
          <span className="inline-flex h-9 items-center rounded-md bg-neutral-900 px-2 dark:bg-transparent dark:px-0">
            <img src={logo} alt="Daryl Tech & Educational Network" className="h-8 w-auto object-contain" />
          </span>
        </Link>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="hidden lg:flex h-7 w-7 items-center justify-center rounded-md text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Groups */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {resolvedGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                {group.label}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = location.pathname === item.path;
                const content = (
                  <>
                    <span className="shrink-0">{item.icon}</span>
                    {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                    {!collapsed && item.badge != null && (
                      <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1.5 text-[10px] font-semibold text-white">
                        {item.badge}
                      </span>
                    )}
                  </>
                );
                const className = `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                } ${collapsed ? "justify-center" : ""}`;
                return item.onClick ? (
                  <button key={item.label} onClick={() => { item.onClick?.(); setMobileOpen(false); }} className={`${className} w-full text-left`}>
                    {content}
                  </button>
                ) : (
                  <Link key={item.label} to={item.path} onClick={() => setMobileOpen(false)} className={className} title={collapsed ? item.label : undefined}>
                    {content}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer actions */}
      <div className="space-y-1 border-t border-sidebar-border p-3">
        <button
          onClick={toggle}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground transition-colors ${collapsed ? "justify-center" : ""}`}
          aria-label="Toggle theme"
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          {!collapsed && (theme === "light" ? "Dark mode" : "Light mode")}
        </button>
        <button
          onClick={handleLogout}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-destructive transition-colors ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut size={18} />
          {!collapsed && "Sign Out"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className={`hidden shrink-0 border-r border-sidebar-border lg:block transition-[width] duration-200 ${collapsed ? "w-[76px]" : "w-[250px]"}`}>
        <div className="sticky top-0 h-screen overflow-hidden">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-lg border border-border bg-card p-2 shadow-sm lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={20} className="text-foreground" />
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 z-50 h-full w-[260px] border-r border-sidebar-border lg:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute right-3 top-5 z-10 text-sidebar-foreground/70 hover:text-sidebar-foreground"
              >
                <X size={20} />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
};

export default DashboardSidebar;
