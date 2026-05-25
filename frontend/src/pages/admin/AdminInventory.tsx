import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { AlertTriangle, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useSocket } from "@/hooks/useSocket";

type InventoryItem = {
  _id: string;
  bloodGroup: string;
  unitsAvailable: number;
  unitsReserved: number;
  expiryDate: string;
  location: string;
  createdAt: string;
};

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const AdminInventory = () => {
  const { toast } = useToast();
  const socket = useSocket();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    bloodGroup: "O+",
    unitsAvailable: "1",
    unitsReserved: "0",
    expiryDate: "",
    location: "",
  });

  const load = async () => {
    const data = await apiRequest<{ items: InventoryItem[] }>("/api/admin/inventory");
    setItems(data.items);
  };

  useEffect(() => {
    load().catch(() => setItems([]));
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = () => load().catch(() => undefined);
    socket.on("inventory:updated", handler);
    return () => socket.off("inventory:updated", handler);
  }, [socket]);

  const summary = useMemo(() => {
    const byGroup = new Map<
      string,
      { group: string; available: number; reserved: number; expiringSoon: number; max: number; lastUpdatedAt: number | null }
    >();
    const now = Date.now();
    const in7d = now + 7 * 24 * 60 * 60 * 1000;

    for (const g of bloodGroups) {
      byGroup.set(g, { group: g, available: 0, reserved: 0, expiringSoon: 0, max: 500, lastUpdatedAt: null });
    }

    for (const it of items) {
      const row = byGroup.get(it.bloodGroup) ?? { group: it.bloodGroup, available: 0, reserved: 0, expiringSoon: 0, max: 500, lastUpdatedAt: null };
      row.available += Number(it.unitsAvailable ?? 0);
      row.reserved += Number(it.unitsReserved ?? 0);
      const expTs = new Date(it.expiryDate).getTime();
      if (Number.isFinite(expTs) && expTs <= in7d && expTs >= now) row.expiringSoon += Number(it.unitsAvailable ?? 0);
      const createdTs = new Date(it.createdAt).getTime();
      row.lastUpdatedAt = row.lastUpdatedAt ? Math.max(row.lastUpdatedAt, createdTs) : createdTs;
      byGroup.set(it.bloodGroup, row);
    }

    const toAgo = (ts: number | null) => {
      if (!ts) return "—";
      const diff = Math.max(0, Date.now() - ts);
      const mins = Math.floor(diff / 60000);
      if (mins < 60) return `${mins} min ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs} hours ago`;
      const days = Math.floor(hrs / 24);
      return `${days} days ago`;
    };

    return Array.from(byGroup.values()).map((r) => ({ ...r, lastUpdated: toAgo(r.lastUpdatedAt) }));
  }, [items]);

  const onAddStock = async () => {
    try {
      setSaving(true);
      await apiRequest("/api/admin/inventory/add", "POST", {
        bloodGroup: form.bloodGroup,
        unitsAvailable: Number(form.unitsAvailable),
        unitsReserved: Number(form.unitsReserved),
        expiryDate: form.expiryDate,
        location: form.location,
      });
      toast({ title: "Stock added" });
      setOpen(false);
      setForm((p) => ({ ...p, unitsAvailable: "1", unitsReserved: "0", expiryDate: "", location: "" }));
      await load();
    } catch (error) {
      toast({
        title: "Add stock failed",
        description: error instanceof Error ? error.message : "Could not add stock.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-extrabold text-foreground">Blood Inventory</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" className="gap-1.5">
              <Plus className="w-4 h-4" /> Add Stock
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add inventory stock</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Blood Group</Label>
                <Select value={form.bloodGroup} onValueChange={(v) => setForm((p) => ({ ...p, bloodGroup: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {bloodGroups.map((bg) => (
                      <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} placeholder="e.g. Main Blood Bank" />
              </div>

              <div className="space-y-2">
                <Label>Units Available</Label>
                <Input type="number" min={0} value={form.unitsAvailable} onChange={(e) => setForm((p) => ({ ...p, unitsAvailable: e.target.value }))} />
              </div>

              <div className="space-y-2">
                <Label>Units Reserved</Label>
                <Input type="number" min={0} value={form.unitsReserved} onChange={(e) => setForm((p) => ({ ...p, unitsReserved: e.target.value }))} />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>Expiry Date</Label>
                <Input type="date" value={form.expiryDate} onChange={(e) => setForm((p) => ({ ...p, expiryDate: e.target.value }))} />
                <p className="text-xs text-muted-foreground">Required. Used to calculate “Expiring (7d)”.</p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
              <Button variant="hero" onClick={onAddStock} disabled={saving || !form.location || !form.expiryDate}>
                {saving ? "Saving..." : "Add Stock"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summary.map((item) => {
          const isLow = item.available < 5;
          const hasExpiring = item.expiringSoon > 0;
          const percent = (item.available / item.max) * 100;

          return (
            <div key={item.group} className={`p-5 rounded-2xl bg-card shadow-card hover:shadow-card-hover transition-shadow ${isLow ? "ring-2 ring-primary/30" : ""}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-extrabold text-foreground">{item.group}</span>
                <div className="flex gap-1">
                  {isLow && (
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> LOW
                    </span>
                  )}
                  {hasExpiring && (
                    <span className="px-2 py-0.5 rounded-full bg-warning/10 text-warning text-[10px] font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {item.expiringSoon}
                    </span>
                  )}
                </div>
              </div>

              <Progress value={percent} className={`h-2 mb-3 ${isLow ? "[&>div]:bg-primary" : ""}`} />

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Available</span>
                  <span className={`font-bold tabular-nums ${isLow ? "text-primary" : "text-foreground"}`}>{item.available} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reserved</span>
                  <span className="font-bold text-foreground tabular-nums">{item.reserved} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expiring (7d)</span>
                  <span className={`font-bold tabular-nums ${hasExpiring ? "text-warning" : "text-foreground"}`}>{item.expiringSoon} units</span>
                </div>
              </div>

              <p className="text-[10px] text-muted-foreground mt-3">Updated {item.lastUpdated}</p>
            </div>
          );
        })}
      </div>

      {items.length === 0 && (
        <div className="mt-6 text-sm text-muted-foreground">No inventory entries found yet. Use “Add Stock” to create the first one.</div>
      )}
    </DashboardLayout>
  );
};

export default AdminInventory;
