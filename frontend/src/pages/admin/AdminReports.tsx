import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { FileText, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const weeklyData = [
  { week: "W1", donations: 85, requests: 62, fulfilled: 58 },
  { week: "W2", donations: 92, requests: 71, fulfilled: 65 },
  { week: "W3", donations: 78, requests: 55, fulfilled: 52 },
  { week: "W4", donations: 105, requests: 80, fulfilled: 73 },
  { week: "W5", donations: 98, requests: 68, fulfilled: 64 },
  { week: "W6", donations: 112, requests: 75, fulfilled: 70 },
  { week: "W7", donations: 95, requests: 82, fulfilled: 78 },
  { week: "W8", donations: 120, requests: 88, fulfilled: 82 },
];

const AdminReports = () => {
  const [reportType, setReportType] = useState("donations");
  const [period, setPeriod] = useState("monthly");

  return (
    <DashboardLayout role="admin">
      <h2 className="text-2xl font-extrabold text-foreground mb-6">Reports & Analytics</h2>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger className="w-48 h-10"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="donations">Donation Report</SelectItem>
            <SelectItem value="requests">Request Report</SelectItem>
            <SelectItem value="inventory">Inventory Report</SelectItem>
            <SelectItem value="users">User Activity Report</SelectItem>
          </SelectContent>
        </Select>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-36 h-10"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>
        {period === "custom" && (
          <>
            <Input type="date" className="w-40 h-10" />
            <Input type="date" className="w-40 h-10" />
          </>
        )}
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" className="h-10 gap-1.5">
            <Download className="w-3.5 h-3.5" /> Export PDF
          </Button>
          <Button variant="outline" size="sm" className="h-10 gap-1.5">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" className="h-10 gap-1.5">
            <Printer className="w-3.5 h-3.5" /> Print
          </Button>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-card shadow-card">
          <h3 className="text-lg font-bold text-foreground mb-4">Weekly Donation Trends</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="week" tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }} />
              <Tooltip />
              <Line type="monotone" dataKey="donations" stroke="hsl(0, 84%, 50%)" strokeWidth={2} dot={{ fill: "hsl(0, 84%, 50%)" }} />
              <Line type="monotone" dataKey="requests" stroke="hsl(38, 92%, 50%)" strokeWidth={2} dot={{ fill: "hsl(38, 92%, 50%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="p-6 rounded-2xl bg-card shadow-card">
          <h3 className="text-lg font-bold text-foreground mb-4">Request Fulfillment Rate</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="week" tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }} />
              <Tooltip />
              <Area type="monotone" dataKey="fulfilled" stroke="hsl(142, 72%, 29%)" fill="hsl(142, 72%, 29% / 0.1)" strokeWidth={2} />
              <Area type="monotone" dataKey="requests" stroke="hsl(0, 84%, 50%)" fill="hsl(0, 84%, 50% / 0.1)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminReports;
