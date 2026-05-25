import { useEffect, useRef, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { User, Mail, Phone, MapPin, HeartPulse, Camera, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/services/api";
import { jsPDF } from "jspdf";
import { useAuth } from "@/context/AuthContext";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const DonorProfile = () => {
  const { toast } = useToast();
  const { updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [profile, setProfile] = useState({
    name: "", email: "", phone: "",
    bloodGroup: "O+", age: "", address: "",
    healthConditions: "None",
  });
  const [profilePhoto, setProfilePhoto] = useState("");
  const [profilePhotoDataUrl, setProfilePhotoDataUrl] = useState("");
  const [donorId, setDonorId] = useState("");
  const [loading, setLoading] = useState(false);

  const completionPercent = Object.values(profile).filter(Boolean).length / Object.keys(profile).length * 100;

  const update = (field: string, value: string) => setProfile((p) => ({ ...p, [field]: value }));
  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const loadProfile = async () => {
    const data = await apiRequest<{
      user: { name: string; email: string; phone?: string; bloodGroup?: string; age?: number; address?: string; profilePhoto?: string };
      donor: { _id?: string; healthConditions?: string };
    }>("/api/donors/profile");

    setProfile({
      name: data.user.name ?? "",
      email: data.user.email ?? "",
      phone: data.user.phone ?? "",
      bloodGroup: data.user.bloodGroup ?? "O+",
      age: data.user.age ? String(data.user.age) : "",
      address: data.user.address ?? "",
      healthConditions: data.donor?.healthConditions ?? "",
    });
    setProfilePhoto(data.user.profilePhoto ?? "");
    setDonorId(data.donor?._id ?? "");
    updateUser({ name: data.user.name ?? "", profilePhoto: data.user.profilePhoto ?? "" });
  };

  useEffect(() => {
    loadProfile().catch(() => undefined);
  }, []);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await apiRequest("/api/donors/profile", "PUT", {
        name: profile.name,
        phone: profile.phone,
        address: profile.address,
        bloodGroup: profile.bloodGroup,
        age: Number(profile.age),
        healthConditions: profile.healthConditions,
      });
      toast({ title: "Profile updated!" });
      await loadProfile();
    } catch (error) {
      toast({ title: "Update failed", description: error instanceof Error ? error.message : "Could not save.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const onUploadPhoto = async (file?: File) => {
    if (!file) return;
    try {
      const localDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      setProfilePhotoDataUrl(localDataUrl);

      const formData = new FormData();
      formData.append("photo", file);
      const data = await apiRequest<{ profilePhoto: string }>("/api/donors/profile/photo", "POST", formData);
      setProfilePhoto(data.profilePhoto);
      updateUser({ profilePhoto: data.profilePhoto, name: profile.name });
      toast({ title: "Profile photo updated!" });
    } catch (error) {
      toast({ title: "Upload failed", description: error instanceof Error ? error.message : "Could not upload.", variant: "destructive" });
    }
  };

  const getImageDataUrl = async (url: string) => {
    return await new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas context not available."));
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/jpeg", 0.92));
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  const toCircularImageDataUrl = async (src: string, size = 320) => {
    return await new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas context not available."));

        ctx.clearRect(0, 0, size, size);
        ctx.save();
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        const ratio = Math.max(size / img.naturalWidth, size / img.naturalHeight);
        const drawW = img.naturalWidth * ratio;
        const drawH = img.naturalHeight * ratio;
        const dx = (size - drawW) / 2;
        const dy = (size - drawH) / 2;
        ctx.drawImage(img, dx, dy, drawW, drawH);
        ctx.restore();

        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = reject;
      img.src = src;
    });
  };

  const downloadIdCardPdf = async () => {
    try {
      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      const cardId = donorId ? `DON-${donorId.slice(-8).toUpperCase()}` : `DON-${Date.now().toString().slice(-8)}`;

      const x = 62;
      const y = 20;
      const w = 86;
      const h = 138;

      pdf.setDrawColor(190, 190, 190);
      pdf.setFillColor(250, 250, 250);
      pdf.roundedRect(x, y, w, h, 3, 3, "FD");

      pdf.setFillColor(220, 38, 38);
      pdf.roundedRect(x, y, w, 34, 3, 3, "F");
      pdf.setFillColor(220, 38, 38);
      pdf.rect(x, y + 28, w, 6, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(11);
      pdf.text("Smart Blood Donors Club", x + w / 2, y + 10, { align: "center" });
      pdf.setFontSize(8);
      pdf.text("Save Lives, Donate Blood", x + w / 2, y + 16, { align: "center" });
      pdf.setFontSize(7);
      pdf.text(cardId, x + w / 2, y + 22, { align: "center" });

      pdf.setFillColor(255, 255, 255);
      pdf.circle(x + w / 2, y + 40, 13, "F");
      pdf.setDrawColor(120, 120, 120);
      pdf.circle(x + w / 2, y + 40, 13, "S");

      if (profilePhotoDataUrl || profilePhoto) {
        try {
          const sourceData = profilePhotoDataUrl || (await getImageDataUrl(profilePhoto));
          const circularImage = await toCircularImageDataUrl(sourceData, 320);
          pdf.addImage(circularImage, "PNG", x + w / 2 - 10, y + 30, 20, 20);
        } catch {
          pdf.setTextColor(90, 90, 90);
          pdf.setFontSize(7);
          pdf.text("PHOTO", x + w / 2, y + 41, { align: "center" });
        }
      } else {
        pdf.setTextColor(90, 90, 90);
        pdf.setFontSize(7);
        pdf.text("PHOTO", x + w / 2, y + 41, { align: "center" });
      }

      pdf.setFillColor(220, 38, 38);
      pdf.rect(x + 20, y + 55, w - 40, 7, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.text("DONOR MEMBER", x + w / 2, y + 59.8, { align: "center" });

      const fieldTop = y + 68;
      const labelX = x + 5;
      const valueX = x + 29;
      const rowH = 9;
      const valueW = w - 33;

      const rows = [
        { label: "Name", value: profile.name || "-" },
        { label: "Email", value: profile.email || "-" },
        { label: "Phone", value: profile.phone || "-" },
        { label: "Blood Group", value: profile.bloodGroup || "-" },
        { label: "Age", value: profile.age || "-" },
        { label: "Address", value: profile.address || "-" },
      ];

      pdf.setTextColor(35, 35, 35);
      pdf.setFontSize(8.2);
      rows.forEach((row, i) => {
        const rowY = fieldTop + i * rowH;
        pdf.text(`${row.label}:`, labelX, rowY + 5.8);
        pdf.setDrawColor(185, 185, 185);
        pdf.rect(valueX, rowY + 1.2, valueW, 6.5);
        pdf.text(String(row.value).slice(0, 34), valueX + 1.5, rowY + 5.8);
      });

      pdf.setFontSize(7.5);
      pdf.text(`Issued: ${new Date().toLocaleDateString()}`, x + 5, y + h - 8);
      pdf.text("Signature of authority", x + w - 5, y + h - 8, { align: "right" });
      pdf.save(`donor-id-${profile.name || "card"}.pdf`);
    } catch {
      toast({ title: "Download failed", description: "Could not generate ID card PDF.", variant: "destructive" });
    }
  };

  return (
    <DashboardLayout role="donor">
      <div className="max-w-2xl">
        <h2 className="text-2xl font-extrabold text-foreground mb-6">My Profile</h2>

        {/* Profile Completion */}
        <div className="p-5 rounded-2xl bg-card shadow-card mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Profile Completion</span>
            <span className="text-sm font-bold text-primary tabular-nums">{Math.round(completionPercent)}%</span>
          </div>
          <Progress value={completionPercent} className="h-2" />
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative">
            {profilePhoto ? (
              <img src={profilePhoto} alt="Profile" className="w-20 h-20 rounded-full object-cover border border-border" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-blood flex items-center justify-center text-primary-foreground text-2xl font-bold">
                {initials || "D"}
              </div>
            )}
            <button
              type="button"
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-card shadow-card flex items-center justify-center hover:bg-muted transition-colors active:scale-95"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="w-4 h-4 text-muted-foreground" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onUploadPhoto(e.target.files?.[0])}
            />
          </div>
          <div>
            <p className="font-bold text-foreground">{profile.name}</p>
            <p className="text-sm text-muted-foreground">{profile.bloodGroup} · Donor</p>
          </div>
          <Button variant="outline" size="sm" className="ml-auto gap-1.5" onClick={downloadIdCardPdf}>
            <Download className="w-3.5 h-3.5" />
            Donor ID Card
          </Button>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={onSave}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input className="pl-10 h-11" value={profile.name} onChange={(e) => update("name", e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Age</Label>
              <Input type="number" className="h-11" value={profile.age} onChange={(e) => update("age", e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input type="email" className="pl-10 h-11" value={profile.email} onChange={(e) => update("email", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input className="pl-10 h-11" value={profile.phone} onChange={(e) => update("phone", e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Blood Group</Label>
              <Select value={profile.bloodGroup} onValueChange={(v) => update("bloodGroup", v)}>
                <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {bloodGroups.map((bg) => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Address</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-10 h-11" value={profile.address} onChange={(e) => update("address", e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Health Conditions</Label>
            <div className="relative">
              <HeartPulse className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-10 h-11" value={profile.healthConditions} onChange={(e) => update("healthConditions", e.target.value)} />
            </div>
          </div>

          <Button variant="hero" className="w-full h-11" type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default DonorProfile;
