import { motion } from "framer-motion";
import { Search, BellRing, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ReactNode, useState } from "react";

interface KPI {
  label: string;
  value: number | string;
  icon: any;
  trend?: string;
  color?: string;
}

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  avatarUrl?: string;
  avatarFallback?: ReactNode;
  kpis?: KPI[];
  notifications?: Array<{ id: string; title: string; message: string; created_at: string; read?: boolean }>;
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
  onSearch?: (q: string) => void;
  searchPlaceholder?: string;
  rightSlot?: ReactNode;
}

export default function DashboardHeader({
  title,
  subtitle,
  avatarUrl,
  avatarFallback,
  kpis = [],
  notifications = [],
  onMarkRead,
  onMarkAllRead,
  onSearch,
  searchPlaceholder = "Search...",
  rightSlot,
}: DashboardHeaderProps) {
  const [showNotifs, setShowNotifs] = useState(false);
  const [q, setQ] = useState("");
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 pl-12 lg:pl-0">
          <h1 className="text-lg font-bold tracking-tight text-foreground sm:text-2xl lg:text-[28px]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {onSearch && (
            <div className="relative flex-1 sm:flex-none sm:w-64">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => { setQ(e.target.value); onSearch(e.target.value); }}
                placeholder={searchPlaceholder}
                className="h-10 rounded-full border-border bg-card pl-9 text-sm"
              />
            </div>
          )}
          {rightSlot}
          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              className="relative h-10 w-10 rounded-full"
              onClick={() => setShowNotifs((v) => !v)}
              aria-label="Notifications"
            >
              <BellRing size={16} />
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                  {unread}
                </span>
              )}
            </Button>
            {showNotifs && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 top-12 z-50 w-[min(20rem,calc(100vw-2rem))] rounded-xl border border-border bg-card shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <span className="text-sm font-semibold">Notifications</span>
                  {onMarkAllRead && (
                    <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={onMarkAllRead}>
                      Mark all read
                    </Button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">No notifications</p>
                  ) : notifications.map((n) => (
                    <div key={n.id} className={`flex items-start gap-3 border-b border-border/50 px-4 py-3 ${!n.read ? "bg-primary/5" : ""}`}>
                      <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${!n.read ? "bg-primary" : "bg-muted"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{n.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                        <p className="mt-1 text-[10px] text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
                      </div>
                      {!n.read && onMarkRead && (
                        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => onMarkRead(n.id)}>
                          <Check size={12} />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
          <Avatar className="h-10 w-10 border border-primary/30">
            {avatarUrl && <AvatarImage src={avatarUrl} />}
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {avatarFallback || title[0]}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* KPI grid */}
      {kpis.length > 0 && (
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          {kpis.map((k, i) => (
            <motion.div
              key={k.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{k.label}</p>
                  <p className="mt-1 text-xl font-bold sm:text-2xl">{k.value}</p>
                  {k.trend && <p className="mt-0.5 text-[10px] text-primary">{k.trend}</p>}
                </div>
                <div className={`rounded-lg bg-primary/10 p-2 ${k.color || "text-primary"}`}>
                  <k.icon size={16} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
