import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Bell, AlertTriangle, CheckCircle, Clock, Info, Check, X as XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/services/api";
import { useSocket } from "@/hooks/useSocket";
import { useToast } from "@/hooks/use-toast";

type NotificationType = "emergency" | "request" | "reminder" | "info";

interface Notification {
  _id: string;
  type: "alert" | "emergency" | "info" | "reminder";
  message: string;
  requestId?: string | null;
  readStatus: boolean;
  createdAt: string;
}

type RequestDetails = {
  request: {
    _id: string;
    bloodGroup: string;
    unitsRequired: number;
    urgencyLevel: "Low" | "Medium" | "High" | "Critical";
    hospitalName: string;
    hospitalAddress: string;
    status: string;
  };
  recipient: {
    name: string;
    phone: string;
    hospitalName: string;
    address: string;
  };
};

const typeConfig: Record<NotificationType, { icon: typeof Bell; color: string; bg: string }> = {
  emergency: { icon: AlertTriangle, color: "text-primary", bg: "bg-primary/10" },
  request: { icon: CheckCircle, color: "text-success", bg: "bg-success/10" },
  reminder: { icon: Clock, color: "text-warning", bg: "bg-warning/10" },
  info: { icon: Info, color: "text-muted-foreground", bg: "bg-muted" },
};

const DonorNotifications = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const socket = useSocket();
  const [busy, setBusy] = useState<Record<string, "accept" | "reject" | "delete" | undefined>>({});
  const [detailsByRequestId, setDetailsByRequestId] = useState<Record<string, RequestDetails | undefined>>({});

  const load = async () => {
    const data = await apiRequest<{ items: Notification[] }>("/api/donors/notifications");
    setNotifications(data.items);
    window.dispatchEvent(new Event("notifications:updated"));
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!socket) return;
    const onNew = () => load().catch(() => undefined);
    socket.on("notification:new", onNew);
    socket.on("emergency:broadcast", onNew);
    return () => {
      socket.off("notification:new", onNew);
      socket.off("emergency:broadcast", onNew);
    };
  }, [socket]);

  useEffect(() => {
    const requestIds = Array.from(
      new Set(
        notifications
          .map((n) => n.requestId)
          .filter((id): id is string => Boolean(id))
      )
    );
    const missing = requestIds.filter((id) => detailsByRequestId[id] === undefined);
    if (missing.length === 0) return;

    Promise.all(
      missing.map(async (id) => {
        try {
          const data = await apiRequest<RequestDetails>(`/api/donors/requests/${id}`);
          return { id, data };
        } catch {
          return { id, data: undefined };
        }
      })
    ).then((rows) => {
      setDetailsByRequestId((prev) => {
        const next = { ...prev };
        rows.forEach((r) => {
          if (r.data) next[r.id] = r.data;
        });
        return next;
      });
    });
  }, [notifications, detailsByRequestId]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.readStatus).length, [notifications]);

  const markRead = async (id: string) => {
    await apiRequest(`/api/donors/notifications/${id}/read`, "PUT");
    await load();
  };
  const markAllRead = async () => {
    await Promise.all(
      notifications.filter((n) => !n.readStatus).map((n) => apiRequest(`/api/donors/notifications/${n._id}/read`, "PUT"))
    );
    await load();
  };

  const acceptRequest = async (requestId: string) => {
    await apiRequest(`/api/donors/requests/${requestId}/accept`, "PUT");
    await load();
  };

  const rejectRequest = async (requestId: string) => {
    await apiRequest(`/api/donors/requests/${requestId}/reject`, "PUT");
    await load();
  };

  const deleteNotification = async (notificationId: string) => {
    await apiRequest(`/api/donors/notifications/${notificationId}`, "DELETE");
    await load();
  };

  return (
    <DashboardLayout role="donor">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground">Notifications</h2>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground mt-1">{unreadCount} unread notification{unreadCount > 1 ? "s" : ""}</p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} className="gap-1.5">
            <Check className="w-3.5 h-3.5" /> Mark all read
          </Button>
        )}
      </div>

      <div className="space-y-3 max-w-2xl">
        {notifications.map((n) => {
          const mappedType: NotificationType =
            n.type === "emergency" ? "emergency" : n.type === "reminder" ? "reminder" : n.type === "alert" ? "request" : "info";
          const config = typeConfig[mappedType];
          const canAccept = mappedType === "request" && Boolean(n.requestId);
          const details = n.requestId ? detailsByRequestId[String(n.requestId)] : undefined;
          const urgency = details?.request.urgencyLevel;
          return (
            <div
              key={n._id}
              className={`p-4 rounded-2xl bg-card shadow-card transition-all cursor-pointer hover:shadow-card-hover active:scale-[0.99] ${!n.readStatus ? "border-l-4 border-primary" : ""}`}
              onClick={() => markRead(n._id)}
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <config.icon className={`w-4 h-4 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className={`text-sm font-bold text-foreground ${!n.readStatus ? "" : "opacity-70"}`}>
                        {mappedType === "emergency"
                          ? "Emergency Alert"
                          : mappedType === "request"
                            ? "Request Update"
                            : mappedType === "reminder"
                              ? "Reminder"
                              : "System Info"}
                      </h4>
                      <span className="text-xs text-muted-foreground whitespace-nowrap block mt-1">
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const notificationId = n._id;
                        setBusy((b) => ({ ...b, [notificationId]: "delete" }));
                        (async () => {
                          try {
                            await deleteNotification(notificationId);
                            toast({ title: "Notification removed" });
                          } catch (error) {
                            toast({
                              title: "Remove failed",
                              description: error instanceof Error ? error.message : "Could not remove notification.",
                              variant: "destructive",
                            });
                          } finally {
                            setBusy((b) => ({ ...b, [notificationId]: undefined }));
                          }
                        })();
                      }}
                      aria-label="Remove notification"
                      disabled={busy[n._id] !== undefined}
                    >
                      <XIcon className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className={`text-sm mt-1 ${!n.readStatus ? "text-foreground" : "text-muted-foreground"}`}>{n.message}</p>

                  {details && (
                    <div className="mt-3 grid sm:grid-cols-2 gap-3 text-sm">
                      <div className="p-3 rounded-xl bg-muted/40">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-foreground">Request Details</p>
                          {urgency && (
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                urgency === "Critical"
                                  ? "bg-primary/10 text-primary"
                                  : urgency === "High"
                                    ? "bg-warning/10 text-warning"
                                    : urgency === "Medium"
                                      ? "bg-muted text-foreground"
                                      : "bg-success/10 text-success"
                              }`}
                            >
                              {urgency}
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground mt-1">
                          <span className="font-medium text-foreground">{details.request.bloodGroup}</span> •{" "}
                          {details.request.unitsRequired} unit(s)
                        </p>
                        <p className="text-muted-foreground mt-1">
                          Hospital: <span className="text-foreground">{details.request.hospitalName}</span>
                        </p>
                        <p className="text-muted-foreground mt-1">
                          Address: <span className="text-foreground">{details.request.hospitalAddress}</span>
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-muted/40">
                        <p className="font-semibold text-foreground">Recipient Details</p>
                        <p className="text-muted-foreground mt-1">
                          Name: <span className="text-foreground">{details.recipient.name || "—"}</span>
                        </p>
                        <p className="text-muted-foreground mt-1">
                          Phone: <span className="text-foreground">{details.recipient.phone || "—"}</span>
                        </p>
                        <p className="text-muted-foreground mt-1">
                          Hospital: <span className="text-foreground">{details.recipient.hospitalName || "—"}</span>
                        </p>
                        <p className="text-muted-foreground mt-1">
                          Address: <span className="text-foreground">{details.recipient.address || "—"}</span>
                        </p>
                      </div>
                    </div>
                  )}

                  {canAccept && (
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 border-success/60 text-success bg-success/10 hover:bg-success/20 hover:border-success/80 transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const notificationId = n._id;
                            const requestId = String(n.requestId);
                            setBusy((b) => ({ ...b, [notificationId]: "accept" }));
                            (async () => {
                              try {
                                await acceptRequest(requestId);
                                toast({ title: "Request accepted", description: "The recipient has been notified." });
                                await deleteNotification(notificationId);
                              } catch (error) {
                                toast({
                                  title: "Accept failed",
                                  description: error instanceof Error ? error.message : "Could not accept request.",
                                  variant: "destructive",
                                });
                              } finally {
                                setBusy((b) => ({ ...b, [notificationId]: undefined }));
                              }
                            })();
                          }}
                          disabled={busy[n._id] !== undefined}
                        >
                          Accept request
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 border-destructive text-destructive bg-destructive/10 hover:bg-destructive/20 hover:border-destructive/80 transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const notificationId = n._id;
                            const requestId = String(n.requestId);
                            setBusy((b) => ({ ...b, [notificationId]: "reject" }));
                            (async () => {
                              try {
                                await rejectRequest(requestId);
                                toast({ title: "Request rejected", description: "We’ll try matching the next donor." });
                                await deleteNotification(notificationId);
                              } catch (error) {
                                toast({
                                  title: "Reject failed",
                                  description: error instanceof Error ? error.message : "Could not reject request.",
                                  variant: "destructive",
                                });
                              } finally {
                                setBusy((b) => ({ ...b, [notificationId]: undefined }));
                              }
                            })();
                          }}
                          disabled={busy[n._id] !== undefined}
                        >
                          Reject request
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                {!n.readStatus && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
};

export default DonorNotifications;
