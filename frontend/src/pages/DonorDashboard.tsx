import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Droplets, Calendar, CheckCircle, Clock } from "lucide-react";
import { apiRequest } from "@/services/api";

const DonorDashboard = () => {
  const [name, setName] = useState("Donor");
  const [history, setHistory] = useState<Array<{ donationDate: string; hospitalName: string; unitsDonated: number; bloodGroup: string }>>([]);
  const [eligibility, setEligibility] = useState<{ badge: string; daysLeft: number }>({ badge: "Pending", daysLeft: 0 });

  useEffect(() => {
    Promise.all([
      apiRequest<{ user: { name: string } }>("/api/donors/profile"),
      apiRequest<{ items: Array<{ donationDate: string; hospitalName: string; unitsDonated: number; bloodGroup: string }> }>("/api/donors/history"),
      apiRequest<{ badge: string; daysLeft: number }>("/api/donors/eligibility"),
    ])
      .then(([profileRes, historyRes, eligibilityRes]) => {
        setName(profileRes.user.name ?? "Donor");
        setHistory(historyRes.items ?? []);
        setEligibility(eligibilityRes);
      })
      .catch(() => undefined);
  }, []);

  const lastDonation = history.length > 0 ? new Date(history[0].donationDate).toLocaleDateString() : "N/A";
  const nextEligible =
    eligibility.daysLeft > 0 ? new Date(Date.now() + eligibility.daysLeft * 24 * 60 * 60 * 1000).toLocaleDateString() : "Now";

  const stats = useMemo(
    () => [
      { label: "Total Donations", value: String(history.length), icon: Droplets, color: "text-primary" },
      { label: "Last Donation", value: lastDonation, icon: Calendar, color: "text-muted-foreground" },
      { label: "Eligibility", value: eligibility.badge, icon: CheckCircle, color: "text-success" },
      { label: "Next Eligible", value: nextEligible, icon: Clock, color: "text-warning" },
    ],
    [history.length, lastDonation, eligibility.badge, nextEligible]
  );

  return (
    <DashboardLayout role="donor">
      <h2 className="text-2xl font-extrabold text-foreground mb-6">Welcome back, {name}! 👋</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="p-5 rounded-2xl bg-card shadow-card hover:shadow-card-hover transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className="text-2xl font-extrabold text-foreground tabular-nums">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-card shadow-card">
          <h3 className="text-lg font-bold text-foreground mb-4">Availability Status</h3>
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
            <span className="text-sm font-medium text-foreground">You are currently available for donation</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Nearby recipients can see your profile and send requests.</p>
        </div>

        <div className="p-6 rounded-2xl bg-card shadow-card">
          <h3 className="text-lg font-bold text-foreground mb-4">Recent Donations</h3>
          <div className="space-y-3">
            {history.slice(0, 5).map((d) => (
              <div key={d.donationDate} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{d.hospitalName}</p>
                  <p className="text-xs text-muted-foreground">{new Date(d.donationDate).toLocaleDateString()}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-accent text-accent-foreground text-xs font-bold">
                  {d.bloodGroup} · {d.unitsDonated}U
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DonorDashboard;
