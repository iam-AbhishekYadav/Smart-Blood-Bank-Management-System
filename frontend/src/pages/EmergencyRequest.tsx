import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertTriangle, Droplets, User, Phone, MapPin, Building2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const EmergencyRequest = () => {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "", phone: "", bloodGroup: "", hospital: "", address: "", notes: "",
  });

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.bloodGroup || !form.hospital) {
      toast({ title: "Missing fields", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    setSubmitted(true);
    toast({ title: "Emergency request submitted!", description: "Nearby donors are being notified." });
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-muted">
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
            <Droplets className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground mb-3">Request Submitted</h1>
          <p className="text-muted-foreground mb-6">
            Your emergency blood request has been broadcast to nearby donors. You'll receive a call when a donor responds.
          </p>
          <Button variant="hero" asChild>
            <Link to="/">Return Home</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <div className="bg-gradient-blood py-4 px-6">
        <div className="container flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-primary-foreground animate-pulse" />
          <span className="text-sm font-bold text-primary-foreground uppercase tracking-wider">
            Emergency Blood Request — No Account Required
          </span>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <motion.div
          className="w-full max-w-lg"
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-lg bg-gradient-blood flex items-center justify-center">
              <Droplets className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">BloodBank</span>
          </Link>

          <h1 className="text-2xl font-extrabold text-foreground mb-1">Emergency Blood Request</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Submit this form and we'll immediately alert nearby eligible donors.
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Contact Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Your name" className="pl-10 h-11" value={form.name} onChange={(e) => update("name", e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Phone Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="+91 98765 43210" className="pl-10 h-11" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Blood Group Needed *</Label>
                <Select onValueChange={(v) => update("bloodGroup", v)}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {bloodGroups.map((bg) => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
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
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Hospital Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Full hospital address" className="pl-10 h-11" value={form.address} onChange={(e) => update("address", e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Additional Notes</Label>
              <Textarea placeholder="Any additional medical details or urgency description..." className="min-h-[80px]" value={form.notes} onChange={(e) => update("notes", e.target.value)} />
            </div>

            <Button variant="hero" className="w-full h-12 text-base" type="submit">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Submit Emergency Request
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default EmergencyRequest;
