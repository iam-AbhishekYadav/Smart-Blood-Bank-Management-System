import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { motion } from "framer-motion";
import { MapPin, ToggleLeft, ToggleRight, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/services/api";

const DonorAvailability = () => {
  const { toast } = useToast();
  const [available, setAvailable] = useState(false);
  const [locationSharing, setLocationSharing] = useState(false);
  const [eligibility, setEligibility] = useState({
    status: "eligible" as "eligible" | "not_eligible" | "countdown",
    lastDonation: "N/A",
    nextEligible: "N/A",
    daysRemaining: 0,
  });

  const load = async () => {
    const [profileRes, eligibilityRes] = await Promise.all([
      apiRequest<{ donor?: { isAvailable?: boolean; lastDonationDate?: string } }>("/api/donors/profile"),
      apiRequest<{ status: "eligible" | "not_eligible"; daysLeft: number }>("/api/donors/eligibility"),
    ]);
    const daysLeft = eligibilityRes.daysLeft ?? 0;
    const lastDonationDate = profileRes.donor?.lastDonationDate
      ? new Date(profileRes.donor.lastDonationDate).toLocaleDateString()
      : "N/A";
    const nextEligibleDate =
      daysLeft > 0
        ? new Date(Date.now() + daysLeft * 24 * 60 * 60 * 1000).toLocaleDateString()
        : "Now";

    setAvailable(Boolean(profileRes.donor?.isAvailable));
    setEligibility({
      status: daysLeft > 0 ? "countdown" : "eligible",
      lastDonation: lastDonationDate,
      nextEligible: nextEligibleDate,
      daysRemaining: daysLeft,
    });
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  const toggleAvailability = async () => {
    const next = !available;
    await apiRequest("/api/donors/availability", "PUT", { isAvailable: next });
    setAvailable(next);
    toast({
      title: next ? "You're now available" : "You're now unavailable",
      description: next ? "Nearby recipients can see your profile." : "You won't receive new requests.",
    });
  };

  const toggleLocation = async () => {
    if (!locationSharing) {
      navigator.geolocation?.getCurrentPosition(
        async (position) => {
          await apiRequest("/api/donors/location", "PUT", {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationSharing(true);
          toast({ title: "Location sharing enabled" });
        },
        () => { toast({ title: "Location access denied", variant: "destructive" }); }
      );
    } else {
      setLocationSharing(false);
      toast({ title: "Location sharing disabled" });
    }
  };

  return (
    <DashboardLayout role="donor">
      <h2 className="text-2xl font-extrabold text-foreground mb-6">Availability & Location</h2>

      <div className="max-w-xl space-y-6">
        {/* Eligibility */}
        <div className="p-6 rounded-2xl bg-card shadow-card">
          <h3 className="text-lg font-bold text-foreground mb-4">Eligibility Status</h3>
          <div className="flex items-center gap-3 mb-4">
            {eligibility.status === "eligible" ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10">
                <CheckCircle className="w-4 h-4 text-success" />
                <span className="text-sm font-bold text-success">Eligible to Donate</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-warning/10">
                <Clock className="w-4 h-4 text-warning" />
                <span className="text-sm font-bold text-warning">Eligible in {eligibility.daysRemaining} days</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Last Donation</span>
              <p className="font-medium text-foreground">{eligibility.lastDonation}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Next Eligible Date</span>
              <p className="font-medium text-foreground">{eligibility.nextEligible}</p>
            </div>
          </div>
        </div>

        {/* Availability Toggle */}
        <div className="p-6 rounded-2xl bg-card shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground">Donation Availability</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {available ? "You're currently visible to recipients" : "You're hidden from recipient searches"}
              </p>
            </div>
            <Switch checked={available} onCheckedChange={toggleAvailability} />
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${available ? "bg-success animate-pulse" : "bg-muted-foreground"}`} />
            <span className={`text-sm font-medium ${available ? "text-success" : "text-muted-foreground"}`}>
              {available ? "Available" : "Unavailable"}
            </span>
          </div>
        </div>

        {/* Location Sharing */}
        <div className="p-6 rounded-2xl bg-card shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground">Live Location Sharing</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Share your location so recipients can find nearby donors
              </p>
            </div>
            <Switch checked={locationSharing} onCheckedChange={toggleLocation} disabled={!available} />
          </div>
          {locationSharing && (
            <motion.div
              className="mt-4 p-4 rounded-xl bg-muted"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
            >
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-foreground font-medium">Location active — updates every 5 minutes</span>
              </div>
              <div className="mt-3 w-full h-40 rounded-lg bg-border flex items-center justify-center text-muted-foreground text-sm">
                Map preview (requires Google Maps API key)
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DonorAvailability;
