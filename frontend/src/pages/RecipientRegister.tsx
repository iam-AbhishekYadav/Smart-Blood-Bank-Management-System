import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Droplets, User, Mail, Phone, Lock, MapPin, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { getApiBaseUrl, getRoleHomePath } from "@/lib/auth";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const urgencyLevels = ["Low", "Medium", "High", "Critical"];

const RecipientRegister = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", hospital: "", bloodGroup: "", urgency: "", address: "" });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await fetch(`${getApiBaseUrl()}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "recipient",
          fullName: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          hospitalName: form.hospital,
          requiredBloodGroup: form.bloodGroup,
          urgencyLevel: form.urgency,
          address: form.address,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.message ?? "Registration failed.");
        return;
      }

      login(
        { user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken },
        true
      );
      toast.success("Recipient account created.");
      navigate(getRoleHomePath(data.user.role), { replace: true });
    } catch {
      toast.error("Could not connect to server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-muted">
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

        <h1 className="text-2xl font-extrabold text-foreground mb-1">Recipient Registration</h1>
        <p className="text-sm text-muted-foreground mb-8">Create your account to request blood donations.</p>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Full name" className="pl-10 h-11" value={form.name} onChange={(e) => update("name", e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input type="email" placeholder="you@example.com" className="pl-10 h-11" value={form.email} onChange={(e) => update("email", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="+91 98765 43210" className="pl-10 h-11" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Required Blood Group</Label>
              <Select onValueChange={(v) => update("bloodGroup", v)}>
                <SelectTrigger className="h-11"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {bloodGroups.map((bg) => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Hospital Name</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Hospital name" className="pl-10 h-11" value={form.hospital} onChange={(e) => update("hospital", e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Urgency Level</Label>
              <Select onValueChange={(v) => update("urgency", v)}>
                <SelectTrigger className="h-11"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {urgencyLevels.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Address</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Full address" className="pl-10 h-11" value={form.address} onChange={(e) => update("address", e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input type="password" placeholder="••••••••" className="pl-10 h-11" value={form.password} onChange={(e) => update("password", e.target.value)} />
            </div>
          </div>

          <Button variant="hero" className="w-full h-11" type="submit" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create Recipient Account"}
          </Button>
        </form>

        <p className="text-sm text-center text-muted-foreground mt-6">
          Already registered?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default RecipientRegister;
