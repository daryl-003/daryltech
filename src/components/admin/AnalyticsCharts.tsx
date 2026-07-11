import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, PieChart as PieChartIcon } from "lucide-react";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(210, 70%, 55%)",
  "hsl(150, 60%, 45%)",
  "hsl(45, 80%, 55%)",
  "hsl(340, 65%, 55%)",
  "hsl(270, 55%, 55%)",
  "hsl(20, 70%, 55%)",
  "hsl(180, 50%, 45%)",
];

interface AnalyticsChartsProps {
  courseDistribution: { name: string; count: number }[];
  taskStatusData: { name: string; value: number }[];
  enrollmentTrend: { month: string; count: number }[];
}

const AnalyticsCharts = ({ courseDistribution, taskStatusData, enrollmentTrend }: AnalyticsChartsProps) => {
  return (
    <div className="mb-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Course Distribution Pie */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <PieChartIcon size={14} /> Course Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          {courseDistribution.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">No data</p>
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={courseDistribution}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    innerRadius={35}
                    strokeWidth={2}
                    stroke="hsl(var(--background))"
                  >
                    {courseDistribution.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            {courseDistribution.slice(0, 4).map((c, i) => (
              <div key={c.name} className="flex items-center gap-1.5 text-[10px]">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="truncate max-w-[80px]">{c.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Task Status Pie */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <PieChartIcon size={14} /> Task Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {taskStatusData.every(d => d.value === 0) ? (
            <p className="py-8 text-center text-xs text-muted-foreground">No data</p>
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskStatusData.filter(d => d.value > 0)}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    innerRadius={35}
                    strokeWidth={2}
                    stroke="hsl(var(--background))"
                  >
                    {taskStatusData.filter(d => d.value > 0).map((entry, i) => {
                      const colorMap: Record<string, string> = {
                        Pending: "hsl(45, 80%, 55%)",
                        Approved: "hsl(150, 60%, 45%)",
                        Rejected: "hsl(0, 65%, 55%)",
                        Assigned: "hsl(210, 70%, 55%)",
                      };
                      return <Cell key={i} fill={colorMap[entry.name] || COLORS[i]} />;
                    })}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="mt-2 flex flex-wrap gap-3">
            {taskStatusData.map((d) => {
              const colorMap: Record<string, string> = {
                Pending: "hsl(45, 80%, 55%)",
                Approved: "hsl(150, 60%, 45%)",
                Rejected: "hsl(0, 65%, 55%)",
                Assigned: "hsl(210, 70%, 55%)",
              };
              return (
                <div key={d.name} className="flex items-center gap-1.5 text-[10px]">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: colorMap[d.name] }} />
                  <span>{d.name}: {d.value}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Enrollment Trend Bar */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <BarChart3 size={14} /> Enrollment Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          {enrollmentTrend.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">No data</p>
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={enrollmentTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsCharts;
