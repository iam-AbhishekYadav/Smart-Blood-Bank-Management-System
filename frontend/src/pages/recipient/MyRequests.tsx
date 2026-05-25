import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/services/api";
import { useSocket } from "@/hooks/useSocket";
import { useToast } from "@/hooks/use-toast";

type RequestItem = {
  _id: string;
  bloodGroup: string;
  unitsRequired: number;
  urgencyLevel: "Low" | "Medium" | "High" | "Critical";
  status: "pending" | "matching" | "matched" | "in_progress" | "fulfilled" | "cancelled";
  createdAt: string;
  donor?: null | {
    id?: string;
    name?: string;
    phone?: string;
    address?: string;
    profilePhoto?: string;
    bloodGroup?: string;
    age?: number | null;
  };
};

const statusStyles: Record<string, string> = {
  Pending: "bg-warning/10 text-warning",
  Matching: "bg-primary/10 text-primary",
  "Donor Found": "bg-primary/10 text-primary",
  "In Progress": "bg-primary/10 text-primary",
  Fulfilled: "bg-success/10 text-success",
  Cancelled: "bg-muted text-muted-foreground",
};

const urgencyStyles: Record<string, string> = {
  Low: "bg-success/10 text-success",
  Medium: "bg-warning/10 text-warning",
  High: "bg-warning/10 text-warning",
  Critical: "bg-primary/10 text-primary",
};

const statusTimeline = ["Submitted", "Matching", "Donor Found", "In Progress", "Fulfilled"];

const MyRequests = () => {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const socket = useSocket();
  const { toast } = useToast();

  const fetchRequests = async () => {
    const data = await apiRequest<{ items: RequestItem[] }>("/api/recipients/requests");
    setRequests(data.items);
  };

  useEffect(() => {
    fetchRequests().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = () => fetchRequests().catch(() => undefined);
    socket.on("request:status-changed", handler);
    return () => {
      socket.off("request:status-changed", handler);
    };
  }, [socket]);

  const uiRequests = useMemo(
    () =>
      requests.map((r) => ({
        id: r._id.slice(-6).toUpperCase(),
        requestId: r._id,
        group: r.bloodGroup,
        units: r.unitsRequired,
        urgency: r.urgencyLevel,
        status:
          r.status === "pending"
            ? "Pending"
            : r.status === "matching"
              ? "Matching"
              : r.status === "matched"
                ? "Donor Found"
                : r.status === "in_progress"
                  ? "In Progress"
                  : r.status === "fulfilled"
                    ? "Fulfilled"
                    : "Cancelled",
        date: new Date(r.createdAt).toLocaleDateString(),
        donor: r.donor ?? null,
      })),
    [requests]
  );

  const cancelRequest = async (requestId: string) => {
    await apiRequest(`/api/recipients/request/${requestId}/cancel`, "PUT");
    await fetchRequests();
    window.dispatchEvent(new Event("notifications:updated"));
  };

  const markFulfilled = async (requestId: string) => {
    try {
      await apiRequest(`/api/recipients/request/${requestId}/fulfilled`, "PUT");
      toast({ title: "Marked as donated/fulfilled" });
      await fetchRequests();
      window.dispatchEvent(new Event("notifications:updated"));
    } catch (error) {
      toast({
        title: "Failed",
        description: error instanceof Error ? error.message : "Could not update request.",
        variant: "destructive",
      });
    }
  };
  return (
    <DashboardLayout role="recipient">
      <h2 className="text-2xl font-extrabold text-foreground mb-6">My Blood Requests</h2>

      <div className="space-y-4">
        {uiRequests.map((r) => {
          const currentStep =
            r.status === "Fulfilled"
              ? 4
              : r.status === "In Progress"
                ? 3
                : r.status === "Donor Found"
                  ? 2
                  : r.status === "Matching"
                    ? 1
                    : r.status === "Pending"
                      ? 0
                      : -1;
          return (
            <div key={r.id} className="p-6 rounded-2xl bg-card shadow-card hover:shadow-card-hover transition-shadow">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-foreground">{r.id}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusStyles[r.status]}`}>{r.status}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${urgencyStyles[r.urgency]}`}>{r.urgency}</span>
                </div>
                <span className="text-xs text-muted-foreground">{r.date}</span>
              </div>

              <div className="flex items-center gap-4 mb-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Blood Group: </span>
                  <span className="font-bold text-primary">{r.group}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Units: </span>
                  <span className="font-bold text-foreground">{r.units}</span>
                </div>
              </div>

              {(r.status === "In Progress" || r.status === "Fulfilled") && r.donor && (
                <div className="mb-4 rounded-xl border border-border bg-muted/20 p-4">
                  <div className="text-xs font-bold text-muted-foreground mb-2">Donor Details</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <div className="text-muted-foreground">Name</div>
                      <div className="font-semibold text-foreground">{r.donor.name || "—"}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Phone</div>
                      <div className="font-semibold text-foreground">{r.donor.phone || "—"}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Address</div>
                      <div className="font-semibold text-foreground">{r.donor.address || "—"}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Timeline */}
              {r.status !== "Cancelled" && (
                <div className="flex items-center gap-1">
                  {statusTimeline.map((step, i) => (
                    <div key={step} className="flex items-center gap-1 flex-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        i <= currentStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}>
                        {i <= currentStep ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
                      </div>
                      {i < statusTimeline.length - 1 && (
                        <div className={`h-0.5 flex-1 ${i < currentStep ? "bg-primary" : "bg-border"}`} />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {r.status === "Pending" && (
                <div className="mt-4">
                  <Button variant="outline" size="sm" className="text-xs text-primary" onClick={() => cancelRequest(r.requestId)}>
                    Cancel Request
                  </Button>
                </div>
              )}

              {r.status === "In Progress" && (
                <div className="mt-4 flex items-center gap-2">
                  <Button variant="hero" size="sm" className="text-xs" onClick={() => markFulfilled(r.requestId)}>
                    Blood Donated
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
};

export default MyRequests;
