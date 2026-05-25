import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Search, MoreHorizontal, Check, X, Ban, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { apiRequest } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

type UserRow = {
  _id: string;
  name: string;
  email: string;
  bloodGroup?: string;
  requiredBloodGroup?: string;
  role: "donor" | "recipient" | "admin";
  isActive: boolean;
  createdAt: string;
};

const statusStyles: Record<string, string> = {
  Active: "bg-success/10 text-success",
  Pending: "bg-warning/10 text-warning",
  Suspended: "bg-primary/10 text-primary",
};

const AdminUsers = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const load = async () => {
    const data = await apiRequest<{ items: UserRow[] }>("/api/admin/users");
    setUsers(data.items);
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  const filtered = useMemo(
    () =>
      users.filter((u) => {
        if (
          search &&
          !u.name.toLowerCase().includes(search.toLowerCase()) &&
          !u.email.toLowerCase().includes(search.toLowerCase())
        )
          return false;
        if (roleFilter !== "all" && u.role !== roleFilter) return false;
        return true;
      }),
    [users, search, roleFilter]
  );

  const approve = async (id: string) => {
    await apiRequest(`/api/admin/users/${id}/approve`, "PUT");
    await load();
  };
  const suspend = async (id: string) => {
    await apiRequest(`/api/admin/users/${id}/suspend`, "PUT");
    await load();
  };
  const remove = async (id: string) => {
    await apiRequest(`/api/admin/users/${id}`, "DELETE");
    await load();
  };

  const exportCsv = () => {
    const headers = ["Name", "Email", "Blood Group", "Role", "Status", "Registered"];
    const rows = filtered.map((u) => [
      u.name ?? "",
      u.email ?? "",
      (u.bloodGroup ?? u.requiredBloodGroup ?? "") as string,
      u.role,
      u.isActive ? "Active" : "Suspended",
      new Date(u.createdAt).toLocaleDateString(),
    ]);

    const escapeCell = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
    const csv = [headers, ...rows].map((r) => r.map(escapeCell).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast({ title: "CSV exported" });
  };

  return (
    <DashboardLayout role="admin">
      <h2 className="text-2xl font-extrabold text-foreground mb-6">User Management</h2>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search users..." className="pl-10 h-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-36 h-10"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="donor">Donors</SelectItem>
            <SelectItem value="recipient">Recipients</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="h-10" onClick={exportCsv}>Export CSV</Button>
      </div>

      <div className="rounded-2xl bg-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left">
                <th className="px-5 py-3 font-semibold text-muted-foreground">Name</th>
                <th className="px-5 py-3 font-semibold text-muted-foreground">Email</th>
                <th className="px-5 py-3 font-semibold text-muted-foreground">Blood Group</th>
                <th className="px-5 py-3 font-semibold text-muted-foreground">Role</th>
                <th className="px-5 py-3 font-semibold text-muted-foreground">Status</th>
                <th className="px-5 py-3 font-semibold text-muted-foreground">Registered</th>
                <th className="px-5 py-3 font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u._id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-foreground">{u.name}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{u.email}</td>
                  <td className="px-5 py-3.5">
                    {u.bloodGroup || u.requiredBloodGroup ? (
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                        {u.bloodGroup ?? u.requiredBloodGroup}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-foreground">{u.role[0].toUpperCase() + u.role.slice(1)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${u.isActive ? statusStyles.Active : statusStyles.Suspended}`}>
                      {u.isActive ? "Active" : "Suspended"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Eye className="w-3.5 h-3.5 mr-2" /> View Profile</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => approve(u._id)}><Check className="w-3.5 h-3.5 mr-2" /> Approve</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => suspend(u._id)}><Ban className="w-3.5 h-3.5 mr-2" /> Suspend</DropdownMenuItem>
                        <DropdownMenuItem className="text-primary" onClick={() => remove(u._id)}><X className="w-3.5 h-3.5 mr-2" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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

export default AdminUsers;
