import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/services/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
type RequestRow = {
  _id: string;
  bloodGroup: string;
  unitsRequired: number;
  urgencyLevel: "Low" | "Medium" | "High" | "Critical";
  status: "pending" | "matching" | "matched" | "in_progress" | "fulfilled" | "cancelled";
  hospitalName: string;
  createdAt: string;
};

type RequestDetails = {
  request: {
    _id: string;
    bloodGroup: string;
    unitsRequired: number;
    urgencyLevel: "Low" | "Medium" | "High" | "Critical";
    hospitalName: string;
    hospitalAddress: string;
    doctorNote: string;
    status: string;
    createdAt: string;
    fulfilledAt: string | null;
  };
  recipient: null | { name: string; email: string; phone: string; address: string; hospitalName: string };
  donor: null | { name: string; email: string; phone: string; address: string; profilePhoto: string };
};

const statusStyles: Record<string, string> = {
  Pending: "bg-warning/10 text-warning",
  Matching: "bg-primary/10 text-primary",
  Matched: "bg-primary/10 text-primary",
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

const AdminRequests = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<RequestDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    apiRequest<{ items: RequestRow[] }>("/api/admin/requests")
      .then((res) => setRequests(res.items))
      .catch(() => setRequests([]));
  }, []);

  const toLabel = (status: RequestRow["status"]) =>
    status === "pending"
      ? "Pending"
      : status === "matching"
        ? "Matching"
        : status === "matched"
          ? "Matched"
          : status === "in_progress"
            ? "In Progress"
            : status === "fulfilled"
              ? "Fulfilled"
              : "Cancelled";

  return (
    <DashboardLayout role="admin">
      <h2 className="text-2xl font-extrabold text-foreground mb-6">All Blood Requests</h2>

      <div className="rounded-2xl bg-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left">
                <th className="px-5 py-3 font-semibold text-muted-foreground">ID</th>
                <th className="px-5 py-3 font-semibold text-muted-foreground">Recipient</th>
                <th className="px-5 py-3 font-semibold text-muted-foreground">Blood Group</th>
                <th className="px-5 py-3 font-semibold text-muted-foreground">Units</th>
                <th className="px-5 py-3 font-semibold text-muted-foreground">Urgency</th>
                <th className="px-5 py-3 font-semibold text-muted-foreground">Status</th>
                <th className="px-5 py-3 font-semibold text-muted-foreground">Date</th>
                <th className="px-5 py-3 font-semibold text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r._id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-foreground">{r._id.slice(-6).toUpperCase()}</td>
                  <td className="px-5 py-3.5 text-foreground">{r.hospitalName}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">{r.bloodGroup}</span>
                  </td>
                  <td className="px-5 py-3.5 text-foreground tabular-nums">{r.unitsRequired}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${urgencyStyles[r.urgencyLevel]}`}>{r.urgencyLevel}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusStyles[toLabel(r.status)]}`}>
                      {toLabel(r.status)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1"
                      onClick={() => {
                        setOpen(true);
                        setSelected(null);
                        setLoadingDetails(true);
                        apiRequest<RequestDetails>(`/api/admin/requests/${r._id}`)
                          .then((data) => setSelected(data))
                          .catch((e) => {
                            toast({ title: "Failed to load request", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
                            setOpen(false);
                          })
                          .finally(() => setLoadingDetails(false));
                      }}
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
          </DialogHeader>
          {loadingDetails && <div className="text-sm text-muted-foreground">Loading…</div>}
          {!loadingDetails && selected && (
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="p-4 rounded-xl bg-muted/30">
                <div className="font-bold text-foreground mb-2">Request</div>
                <div className="text-muted-foreground">ID: <span className="text-foreground">{selected.request._id}</span></div>
                <div className="text-muted-foreground mt-1">
                  Blood: <span className="text-foreground font-semibold">{selected.request.bloodGroup}</span> •{" "}
                  Units: <span className="text-foreground font-semibold">{selected.request.unitsRequired}</span>
                </div>
                <div className="text-muted-foreground mt-1">
                  Urgency: <span className="text-foreground">{selected.request.urgencyLevel}</span>
                </div>
                <div className="text-muted-foreground mt-1">
                  Status: <span className="text-foreground">{selected.request.status}</span>
                </div>
                <div className="text-muted-foreground mt-1">
                  Hospital: <span className="text-foreground">{selected.request.hospitalName}</span>
                </div>
                <div className="text-muted-foreground mt-1">
                  Address: <span className="text-foreground">{selected.request.hospitalAddress}</span>
                </div>
                {selected.request.doctorNote ? (
                  <div className="text-muted-foreground mt-1">
                    Note: <span className="text-foreground">{selected.request.doctorNote}</span>
                  </div>
                ) : null}
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-muted/30">
                  <div className="font-bold text-foreground mb-2">Recipient</div>
                  {selected.recipient ? (
                    <>
                      <div className="text-muted-foreground">Name: <span className="text-foreground">{selected.recipient.name}</span></div>
                      <div className="text-muted-foreground mt-1">Phone: <span className="text-foreground">{selected.recipient.phone}</span></div>
                      <div className="text-muted-foreground mt-1">Email: <span className="text-foreground">{selected.recipient.email}</span></div>
                      <div className="text-muted-foreground mt-1">Address: <span className="text-foreground">{selected.recipient.address}</span></div>
                    </>
                  ) : (
                    <div className="text-muted-foreground">—</div>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-muted/30">
                  <div className="font-bold text-foreground mb-2">Donor</div>
                  {selected.donor ? (
                    <>
                      <div className="text-muted-foreground">Name: <span className="text-foreground">{selected.donor.name}</span></div>
                      <div className="text-muted-foreground mt-1">Phone: <span className="text-foreground">{selected.donor.phone}</span></div>
                      <div className="text-muted-foreground mt-1">Email: <span className="text-foreground">{selected.donor.email}</span></div>
                      <div className="text-muted-foreground mt-1">Address: <span className="text-foreground">{selected.donor.address}</span></div>
                    </>
                  ) : (
                    <div className="text-muted-foreground">No donor assigned yet.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminRequests;
