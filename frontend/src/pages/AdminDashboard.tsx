import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Users, UserCheck, ClipboardList, Droplets, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { apiRequest } from "@/services/api";
import { useSocket } from "@/hooks/useSocket";

type DashboardStats = {
  totalRegisteredDonors: number;
  totalActiveDonors: number;
  pendingBloodRequests: number;
  totalDonationsThisMonth: number;
  bloodUnitsInInventory: number;
  emergencyAlertsSentToday: number;
};

const monthlyData = [
  { month: "Jan", "O+": 120, "A+": 85, "B+": 65, "AB+": 30 },
  { month: "Feb", "O+": 145, "A+": 92, "B+": 71, "AB+": 28 },
  { month: "Mar", "O+": 132, "A+": 88, "B+": 78, "AB+": 35 },
  { month: "Apr", "O+": 158, "A+": 95, "B+": 62, "AB+": 32 },
  { month: "May", "O+": 141, "A+": 102, "B+": 69, "AB+": 29 },
  { month: "Jun", "O+": 167, "A+": 98, "B+": 74, "AB+": 38 },
];

const colors = ["hsl(0, 84%, 50%)", "hsl(0, 72%, 35%)", "hsl(220, 26%, 14%)", "hsl(220, 13%, 46%)", "hsl(0, 84%, 60%)", "hsl(0, 60%, 45%)", "hsl(220, 20%, 30%)", "hsl(220, 10%, 60%)"];

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [inventoryData, setInventoryData] = useState<Array<{ name: string; value: number; color: string }>>([]);
  const socket = useSocket();

  const load = async () => {
    const [statsRes, inventoryRes] = await Promise.all([
      apiRequest<DashboardStats>("/api/admin/dashboard/stats"),
      apiRequest<{ items: Array<{ bloodGroup: string; unitsAvailable: number }> }>("/api/admin/inventory"),
    ]);

    const grouped = new Map<string, number>();
    for (const item of inventoryRes.items) {
      grouped.set(item.bloodGroup, (grouped.get(item.bloodGroup) ?? 0) + item.unitsAvailable);
    }
    const chart = Array.from(grouped.entries()).map(([name, value], i) => ({
      name,
      value,
      color: colors[i % colors.length],
    }));
    setStats(statsRes);
    setInventoryData(chart);
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = () => load().catch(() => undefined);
    socket.on("inventory:updated", handler);
    socket.on("request:status-changed", handler);
    socket.on("emergency:broadcast", handler);
    socket.on("notification:new", handler);
    return () => {
      socket.off("inventory:updated", handler);
      socket.off("request:status-changed", handler);
      socket.off("emergency:broadcast", handler);
      socket.off("notification:new", handler);
    };
  }, [socket]);

  const overviewStats = useMemo(
    () => [
      { label: "Total Donors", value: String(stats?.totalRegisteredDonors ?? 0), icon: Users, trend: "+", up: true },
      { label: "Active Donors", value: String(stats?.totalActiveDonors ?? 0), icon: UserCheck, trend: "+", up: true },
      { label: "Pending Requests", value: String(stats?.pendingBloodRequests ?? 0), icon: ClipboardList, trend: "-", up: false },
      { label: "Blood Units", value: String(stats?.bloodUnitsInInventory ?? 0), icon: Droplets, trend: "+", up: true },
      { label: "Emergencies Today", value: String(stats?.emergencyAlertsSentToday ?? 0), icon: AlertTriangle, trend: "+", up: true },
    ],
    [stats]
  );

  return (
    <DashboardLayout role="admin">
      <h2 className="text-2xl font-extrabold text-foreground mb-6">Admin Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {overviewStats.map((s) => (
          <div key={s.label} className="p-5 rounded-2xl bg-card shadow-card hover:shadow-card-hover transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <s.icon className="w-5 h-5 text-primary" />
              <span className={`flex items-center gap-0.5 text-xs font-bold ${s.up ? "text-success" : "text-primary"}`}>
                {s.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {s.trend}
              </span>
            </div>
            <p className="text-2xl font-extrabold text-foreground tabular-nums">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-card shadow-card">
          <h3 className="text-lg font-bold text-foreground mb-4">Monthly Donations by Blood Group</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }} />
              <Tooltip />
              <Bar dataKey="O+" fill="hsl(0, 84%, 50%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="A+" fill="hsl(0, 72%, 35%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="B+" fill="hsl(220, 26%, 14%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="AB+" fill="hsl(220, 13%, 46%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-6 rounded-2xl bg-card shadow-card">
          <h3 className="text-lg font-bold text-foreground mb-4">Blood Inventory</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={inventoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={50}>
                {inventoryData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {inventoryData.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-muted-foreground">{d.name}</span>
                <span className="ml-auto font-bold text-foreground tabular-nums">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
