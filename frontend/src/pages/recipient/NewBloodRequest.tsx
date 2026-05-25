import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Droplets, Building2, MapPin, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/services/api";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const urgencyLevels = [
  { value: "Low", label: "Low", color: "text-success" },
  { value: "Medium", label: "Medium", color: "text-warning" },
  { value: "High", label: "High", color: "text-warning" },
  { value: "Critical", label: "Critical", color: "text-primary" },
];

const NewBloodRequest = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    bloodGroup: "", units: "", urgency: "", hospital: "", address: "", notes: "",
  });

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.bloodGroup || !form.units || !form.urgency || !form.hospital) {
      toast({ title: "Missing fields", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    try {
      setIsLoading(true);
      await apiRequest("/api/recipients/request", "POST", {
        bloodGroup: form.bloodGroup,
        unitsRequired: Number(form.units),
        urgencyLevel: form.urgency,
        hospitalName: form.hospital,
        hospitalAddress: form.address || form.hospital,
        doctorNote: form.notes,
      });
      toast({ title: "Blood request submitted!", description: "We're matching you with eligible donors nearby." });
      setForm({ bloodGroup: "", units: "", urgency: "", hospital: "", address: "", notes: "" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Request failed.";
      toast({ title: "Submission failed", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout role="recipient">
      <div className="max-w-xl">
        <h2 className="text-2xl font-extrabold text-foreground mb-1">New Blood Request</h2>
        <p className="text-sm text-muted-foreground mb-8">Fill in the details to find matching donors.</p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Blood Group Required *</Label>
              <Select onValueChange={(v) => update("bloodGroup", v)}>
                <SelectTrigger className="h-11"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {bloodGroups.map((bg) => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Units Required *</Label>
              <Input type="number" min={1} max={10} placeholder="e.g. 2" className="h-11" value={form.units} onChange={(e) => update("units", e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Urgency Level *</Label>
            <Select onValueChange={(v) => update("urgency", v)}>
              <SelectTrigger className="h-11"><SelectValue placeholder="Select urgency" /></SelectTrigger>
              <SelectContent>
                {urgencyLevels.map((u) => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Hospital Name *</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Hospital name" className="pl-10 h-11" value={form.hospital} onChange={(e) => update("hospital", e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Hospital Address</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Full address" className="pl-10 h-11" value={form.address} onChange={(e) => update("address", e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Doctor's Note / Description</Label>
            <Textarea placeholder="Any medical details or special requirements..." className="min-h-[80px]" value={form.notes} onChange={(e) => update("notes", e.target.value)} />
          </div>

          <Button variant="hero" className="w-full h-11" type="submit" disabled={isLoading}>
            <Droplets className="w-4 h-4 mr-2" />
            {isLoading ? "Submitting..." : "Submit Blood Request"}
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default NewBloodRequest;
