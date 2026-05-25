import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Settings, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

const AdminSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    donationInterval: "90",
    minAge: "18",
    maxAge: "65",
    enableEmailNotifications: true,
    enableSmsNotifications: false,
    enablePushNotifications: true,
    autoApprove: false,
    lowStockThreshold: "5",
    expiryWarningDays: "7",
  });

  const updateSetting = (key: string, value: string | boolean) => {
    setSettings((s) => ({ ...s, [key]: value }));
  };

  return (
    <DashboardLayout role="admin">
      <h2 className="text-2xl font-extrabold text-foreground mb-6">System Settings</h2>

      <div className="max-w-2xl space-y-6">
        {/* Eligibility Rules */}
        <div className="p-6 rounded-2xl bg-card shadow-card">
          <h3 className="text-lg font-bold text-foreground mb-4">Eligibility Rules</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Donation Interval (days)</Label>
                <Input type="number" className="h-11" value={settings.donationInterval} onChange={(e) => updateSetting("donationInterval", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Min Age</Label>
                <Input type="number" className="h-11" value={settings.minAge} onChange={(e) => updateSetting("minAge", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Max Age</Label>
                <Input type="number" className="h-11" value={settings.maxAge} onChange={(e) => updateSetting("maxAge", e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Alerts */}
        <div className="p-6 rounded-2xl bg-card shadow-card">
          <h3 className="text-lg font-bold text-foreground mb-4">Inventory Alerts</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Low Stock Threshold (units)</Label>
              <Input type="number" className="h-11" value={settings.lowStockThreshold} onChange={(e) => updateSetting("lowStockThreshold", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Expiry Warning (days)</Label>
              <Input type="number" className="h-11" value={settings.expiryWarningDays} onChange={(e) => updateSetting("expiryWarningDays", e.target.value)} />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="p-6 rounded-2xl bg-card shadow-card">
          <h3 className="text-lg font-bold text-foreground mb-4">Notifications</h3>
          <div className="space-y-4">
            {[
              { key: "enableEmailNotifications", label: "Email Notifications", desc: "Send email alerts for requests and emergencies" },
              { key: "enableSmsNotifications", label: "SMS Notifications", desc: "Send SMS via Twilio (requires API key)" },
              { key: "enablePushNotifications", label: "Push Notifications", desc: "Browser push notifications for donors" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Switch
                  checked={settings[item.key as keyof typeof settings] as boolean}
                  onCheckedChange={(v) => updateSetting(item.key, v)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Auto-Approve */}
        <div className="p-6 rounded-2xl bg-card shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground">Auto-Approve Registrations</h3>
              <p className="text-sm text-muted-foreground mt-1">Automatically approve new donor and recipient registrations</p>
            </div>
            <Switch checked={settings.autoApprove} onCheckedChange={(v) => updateSetting("autoApprove", v)} />
          </div>
        </div>

        <Button variant="hero" className="w-full h-11 gap-1.5" onClick={() => toast({ title: "Settings saved!" })}>
          <Save className="w-4 h-4" /> Save All Settings
        </Button>
      </div>
    </DashboardLayout>
  );
};

export default AdminSettings;
