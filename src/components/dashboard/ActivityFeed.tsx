import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export interface ActivityItem {
  id: string;
  title: string;
  description?: string;
  timestamp: string | Date;
  icon?: any;
  tone?: "primary" | "success" | "warning" | "muted";
}

const toneClass = {
  primary: "bg-primary/15 text-primary",
  success: "bg-emerald-500/15 text-emerald-500",
  warning: "bg-amber-500/15 text-amber-500",
  muted: "bg-muted text-muted-foreground",
};

export default function ActivityFeed({
  title = "Recent Activity",
  items,
  emptyText = "Nothing here yet.",
  className = "",
}: {
  title?: string;
  items: ActivityItem[];
  emptyText?: string;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-border bg-card ${className}`}>
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <Activity size={15} className="text-primary" />
          <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          Live
        </span>
      </div>
      <div className="max-h-[480px] overflow-y-auto p-3">
        {items.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">{emptyText}</p>
        ) : (
          <ul className="space-y-1">
            {items.map((it, i) => {
              const Icon = it.icon;
              const tone = it.tone ?? "primary";
              return (
                <motion.li
                  key={it.id}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-start gap-3 rounded-lg px-3 py-3 hover:bg-muted/40 transition-colors"
                >
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${toneClass[tone]}`}>
                    {Icon ? <Icon size={14} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-tight">{it.title}</p>
                    {it.description && (
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{it.description}</p>
                    )}
                    <p className="mt-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      {(() => {
                        try {
                          return formatDistanceToNow(new Date(it.timestamp), { addSuffix: true });
                        } catch {
                          return "";
                        }
                      })()}
                    </p>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
