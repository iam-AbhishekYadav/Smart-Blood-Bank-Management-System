import DashboardLayout from "@/components/layout/DashboardLayout";
import { Droplets, Download, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

const donations = [
  { id: 1, date: "Mar 2, 2026", hospital: "City General Hospital", group: "O+", units: 1, status: "Verified" },
  { id: 2, date: "Nov 28, 2025", hospital: "Apollo Hospital", group: "O+", units: 1, status: "Verified" },
  { id: 3, date: "Aug 15, 2025", hospital: "Fortis Healthcare", group: "O+", units: 2, status: "Verified" },
  { id: 4, date: "May 3, 2025", hospital: "Max Super Speciality", group: "O+", units: 1, status: "Verified" },
  { id: 5, date: "Jan 20, 2025", hospital: "AIIMS Delhi", group: "O+", units: 1, status: "Verified" },
  { id: 6, date: "Oct 8, 2024", hospital: "Medanta Hospital", group: "O+", units: 1, status: "Verified" },
  { id: 7, date: "Jun 25, 2024", hospital: "Narayana Health", group: "O+", units: 2, status: "Verified" },
  { id: 8, date: "Mar 12, 2024", hospital: "Manipal Hospital", group: "O+", units: 1, status: "Verified" },
];

const DonorHistory = () => {
  return (
    <DashboardLayout role="donor">
      <h2 className="text-2xl font-extrabold text-foreground mb-6">Donation History</h2>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-5 rounded-2xl bg-card shadow-card">
          <Droplets className="w-5 h-5 text-primary mb-3" />
          <p className="text-2xl font-extrabold text-foreground tabular-nums">{donations.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Donations</p>
        </div>
        <div className="p-5 rounded-2xl bg-card shadow-card">
          <Award className="w-5 h-5 text-warning mb-3" />
          <p className="text-2xl font-extrabold text-foreground tabular-nums">{donations.reduce((a, d) => a + d.units, 0)}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Units Donated</p>
        </div>
        <div className="p-5 rounded-2xl bg-card shadow-card">
          <Award className="w-5 h-5 text-success mb-3" />
          <p className="text-2xl font-extrabold text-foreground tabular-nums">5 🔥</p>
          <p className="text-xs text-muted-foreground mt-1">Donation Streak</p>
        </div>
      </div>

      {/* Table */}
      <div className="p-6 rounded-2xl bg-card shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-3 font-semibold text-muted-foreground">Date</th>
                <th className="pb-3 font-semibold text-muted-foreground">Hospital</th>
                <th className="pb-3 font-semibold text-muted-foreground">Blood Group</th>
                <th className="pb-3 font-semibold text-muted-foreground">Units</th>
                <th className="pb-3 font-semibold text-muted-foreground">Status</th>
                <th className="pb-3 font-semibold text-muted-foreground">Certificate</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((d) => (
                <tr key={d.id} className="border-b border-border last:border-0">
                  <td className="py-3 text-foreground">{d.date}</td>
                  <td className="py-3 text-foreground font-medium">{d.hospital}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">{d.group}</span>
                  </td>
                  <td className="py-3 text-foreground tabular-nums">{d.units}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-bold">{d.status}</span>
                  </td>
                  <td className="py-3">
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                      <Download className="w-3 h-3" /> PDF
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DonorHistory;
