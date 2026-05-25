import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { MapPin, Send, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/services/api";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

type NearbyDonor = {
  donorId: string;
  nameMasked: string;
  bloodGroup: string;
  distanceKm: number;
  isAvailable: boolean;
};

const FindDonors = () => {
  const [filter, setFilter] = useState({ bloodGroup: "", maxDistance: "" });
  const [coords, setCoords] = useState({ lat: 28.6139, lng: 77.209 });
  const [donors, setDonors] = useState<NearbyDonor[]>([]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => setCoords({ lat: position.coords.latitude, lng: position.coords.longitude }),
      () => undefined
    );
  }, []);

  const loadDonors = async () => {
    if (!filter.bloodGroup || filter.bloodGroup === "all") {
      setDonors([]);
      return;
    }

    const maxDistanceKm = Number(filter.maxDistance || 50);
    const query = `/api/recipients/donors/nearby?lat=${coords.lat}&lng=${coords.lng}&bloodGroup=${encodeURIComponent(
      filter.bloodGroup
    )}&maxDistanceKm=${maxDistanceKm}`;
    const data = await apiRequest<{ donors: NearbyDonor[] }>(query);
    setDonors(data.donors);
  };

  useEffect(() => {
    loadDonors().catch(() => undefined);
  }, [filter.bloodGroup, filter.maxDistance, coords.lat, coords.lng]);

  const filtered = useMemo(() => donors, [donors]);

  return (
    <DashboardLayout role="recipient">
      <h2 className="text-2xl font-extrabold text-foreground mb-6">Find Nearby Donors</h2>

      {/* Map Placeholder */}
      <div className="w-full h-64 rounded-2xl bg-muted border-2 border-dashed border-border flex items-center justify-center mb-6">
        <div className="text-center">
          <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Map view (requires Google Maps API key)</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Select onValueChange={(v) => setFilter((f) => ({ ...f, bloodGroup: v }))}>
          <SelectTrigger className="w-40 h-10"><SelectValue placeholder="Blood Group" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Groups</SelectItem>
            {bloodGroups.map((bg) => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select onValueChange={(v) => setFilter((f) => ({ ...f, maxDistance: v }))}>
          <SelectTrigger className="w-40 h-10"><SelectValue placeholder="Distance" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="5">Within 5 km</SelectItem>
            <SelectItem value="10">Within 10 km</SelectItem>
            <SelectItem value="25">Within 25 km</SelectItem>
            <SelectItem value="50">Within 50 km</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="hero" className="gap-1.5">
          <Radio className="w-4 h-4" /> Broadcast to All Nearby
        </Button>
      </div>

      {/* Donor List */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((d) => (
          <div key={d.donorId} className="p-5 rounded-2xl bg-card shadow-card hover:shadow-card-hover transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-blood flex items-center justify-center text-primary-foreground text-sm font-bold">
                {d.nameMasked.slice(0, 1)}
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{d.nameMasked}</p>
                <p className="text-xs text-muted-foreground">Nearby donor</p>
              </div>
              <div className={`ml-auto w-2.5 h-2.5 rounded-full ${d.isAvailable ? "bg-success" : "bg-muted-foreground"}`} />
            </div>
            <div className="flex items-center gap-3 mb-4 text-sm">
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">{d.bloodGroup}</span>
              <span className="text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {d.distanceKm} km
              </span>
            </div>
            <Button variant="outline" size="sm" className="w-full gap-1.5" disabled={!d.isAvailable}>
              <Send className="w-3.5 h-3.5" />
              {d.isAvailable ? "Send Request" : "Unavailable"}
            </Button>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default FindDonors;
