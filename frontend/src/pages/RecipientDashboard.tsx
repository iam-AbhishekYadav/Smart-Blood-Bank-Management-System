import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ClipboardList, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { apiRequest } from "@/services/api";
import { useSocket } from "@/hooks/useSocket";

type RequestItem = {
  _id: string;
  bloodGroup: string;
  unitsRequired: number;
  urgencyLevel: "Low" | "Medium" | "High" | "Critical";
  status: "pending" | "matching" | "matched" | "in_progress" | "fulfilled" | "cancelled";
  createdAt: string;
};

const RecipientDashboard = () => {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const socket = useSocket();

  const load = async () => {
    const data = await apiRequest<{ items: RequestItem[] }>("/api/recipients/requests");
    setRequests(data.items);
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = () => load().catch(() => undefined);
    socket.on("request:status-changed", handler);
    return () => {
      socket.off("request:status-changed", handler);
    };
  }, [socket]);

  const stats = useMemo(
    () => [
      { label: "Active Requests", value: String(requests.filter((r) => ["pending", "matching", "matched", "in_progress"].includes(r.status)).length), icon: ClipboardList, color: "text-primary" },
      { label: "Pending", value: String(requests.filter((r) => r.status === "pending").length), icon: Clock, color: "text-warning" },
      { label: "Fulfilled", value: String(requests.filter((r) => r.status === "fulfilled").length), icon: CheckCircle, color: "text-success" },
      { label: "Urgent", value: String(requests.filter((r) => r.urgencyLevel === "Critical" && r.status !== "fulfilled").length), icon: AlertTriangle, color: "text-primary" },
    ],
    [requests]
  );

  return (
    <DashboardLayout role="recipient">
      <h2 className="text-2xl font-extrabold text-foreground mb-6">Recipient Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="p-5 rounded-2xl bg-card shadow-card hover:shadow-card-hover transition-shadow">
            <s.icon className={`w-5 h-5 ${s.color} mb-3`} />
            <p className="text-2xl font-extrabold text-foreground tabular-nums">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="p-6 rounded-2xl bg-card shadow-card">
        <h3 className="text-lg font-bold text-foreground mb-4">Recent Blood Requests</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-3 font-semibold text-muted-foreground">Blood Group</th>
                <th className="pb-3 font-semibold text-muted-foreground">Units</th>
                <th className="pb-3 font-semibold text-muted-foreground">Urgency</th>
                <th className="pb-3 font-semibold text-muted-foreground">Status</th>
                <th className="pb-3 font-semibold text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {requests.slice(0, 6).map((r) => (
                <tr key={r._id} className="border-b border-border last:border-0">
                  <td className="py-3 font-bold text-foreground">{r.bloodGroup}</td>
                  <td className="py-3 text-foreground">{r.unitsRequired}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      r.urgencyLevel === "Critical" ? "bg-primary/10 text-primary" :
                      r.urgencyLevel === "High" ? "bg-warning/10 text-warning" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {r.urgencyLevel}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      r.status === "fulfilled" ? "bg-success/10 text-success" :
                      r.status === "matching" ? "bg-primary/10 text-primary" :
                      "bg-warning/10 text-warning"
                    }`}>
                      {r.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-3 text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RecipientDashboard;
