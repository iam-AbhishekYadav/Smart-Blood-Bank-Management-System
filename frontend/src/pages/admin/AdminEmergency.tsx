import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { AlertTriangle, Send, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const broadcastHistory = [
  { id: 1, group: "O-", hospital: "City General", message: "Urgent O- needed for surgery", sent: 245, responded: 18, fulfilled: 3, date: "Mar 20, 2026" },
  { id: 2, group: "AB+", hospital: "Apollo Hospital", message: "AB+ blood needed for transfusion", sent: 120, responded: 8, fulfilled: 2, date: "Mar 18, 2026" },
  { id: 3, group: "B+", hospital: "Fortis Hospital", message: "Emergency B+ required", sent: 180, responded: 12, fulfilled: 4, date: "Mar 15, 2026" },
];

const AdminEmergency = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ bloodGroup: "", hospital: "", message: "", radius: "", target: "" });
  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Emergency broadcast sent!", description: `Alert sent to donors within ${form.radius || "10"} km radius.` });
  };

  return (
    <DashboardLayout role="admin">
      <h2 className="text-2xl font-extrabold text-foreground mb-6">Emergency Broadcast</h2>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="p-6 rounded-2xl bg-card shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">Create Emergency Alert</h3>
          </div>

          <form className="space-y-4" onSubmit={handleBroadcast}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Blood Group *</Label>
                <Select onValueChange={(v) => update("bloodGroup", v)}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {bloodGroups.map((bg) => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Radius (km)</Label>
                <Input type="number" placeholder="10" className="h-11" value={form.radius} onChange={(e) => update("radius", e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Hospital *</Label>
              <Input placeholder="Hospital name" className="h-11" value={form.hospital} onChange={(e) => update("hospital", e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Send To</Label>
              <Select onValueChange={(v) => update("target", v)}>
                <SelectTrigger className="h-11"><SelectValue placeholder="Select audience" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Donors</SelectItem>
                  <SelectItem value="eligible">Only Eligible Donors</SelectItem>
                  <SelectItem value="nearby">Donors within Radius</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Emergency Message *</Label>
              <Textarea placeholder="Describe the emergency..." className="min-h-[80px]" value={form.message} onChange={(e) => update("message", e.target.value)} />
            </div>

            <Button variant="hero" className="w-full h-11 gap-1.5" type="submit">
              <Radio className="w-4 h-4" /> Send Emergency Broadcast
            </Button>
          </form>
        </div>

        {/* History */}
        <div className="p-6 rounded-2xl bg-card shadow-card">
          <h3 className="text-lg font-bold text-foreground mb-4">Broadcast History</h3>
          <div className="space-y-4">
            {broadcastHistory.map((b) => (
              <div key={b.id} className="p-4 rounded-xl bg-muted/50 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">{b.group}</span>
                  <span className="text-xs text-muted-foreground">{b.date}</span>
                </div>
                <p className="text-sm font-medium text-foreground mb-1">{b.hospital}</p>
                <p className="text-xs text-muted-foreground mb-3">{b.message}</p>
                <div className="flex gap-4 text-xs">
                  <div><span className="text-muted-foreground">Sent: </span><span className="font-bold text-foreground tabular-nums">{b.sent}</span></div>
                  <div><span className="text-muted-foreground">Responded: </span><span className="font-bold text-foreground tabular-nums">{b.responded}</span></div>
                  <div><span className="text-muted-foreground">Fulfilled: </span><span className="font-bold text-success tabular-nums">{b.fulfilled}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminEmergency;
