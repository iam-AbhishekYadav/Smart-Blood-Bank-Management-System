import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Droplets, LayoutDashboard, User, Clock, Bell, ToggleLeft,
  ClipboardList, Map, Users, Package, AlertTriangle, BarChart3,
  Settings, FileText, Menu, X, LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/services/api";
import { useSocket } from "@/hooks/useSocket";

type Role = "donor" | "recipient" | "admin";

const sidebarLinks: Record<Role, { label: string; href: string; icon: typeof LayoutDashboard }[]> = {
  donor: [
    { label: "Dashboard", href: "/donor/dashboard", icon: LayoutDashboard },
    { label: "Profile", href: "/donor/profile", icon: User },
    { label: "Availability", href: "/donor/availability", icon: ToggleLeft },
    { label: "Donation History", href: "/donor/history", icon: Clock },
    { label: "Notifications", href: "/donor/notifications", icon: Bell },
  ],
  recipient: [
    { label: "Dashboard", href: "/recipient/dashboard", icon: LayoutDashboard },
    { label: "Profile", href: "/recipient/profile", icon: User },
    { label: "New Request", href: "/recipient/request", icon: ClipboardList },
    { label: "My Requests", href: "/recipient/requests", icon: FileText },
    { label: "Find Donors", href: "/recipient/find-donors", icon: Map },
  ],
  admin: [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Inventory", href: "/admin/inventory", icon: Package },
    { label: "Requests", href: "/admin/requests", icon: ClipboardList },
    { label: "Emergency", href: "/admin/emergency", icon: AlertTriangle },
    { label: "Reports", href: "/admin/reports", icon: BarChart3 },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ],
};

const roleTitles: Record<Role, string> = {
  donor: "Donor",
  recipient: "Recipient",
  admin: "Admin",
};

const DashboardLayout = ({ role, children }: { role: Role; children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const socket = useSocket();
  const [unreadCount, setUnreadCount] = useState(0);
  const links = sidebarLinks[role];
  const profileHref = role === "donor" ? "/donor/profile" : role === "recipient" ? "/recipient/profile" : "/admin/settings";
  const notificationsHref =
    role === "donor" ? "/donor/notifications" : role === "recipient" ? "/recipient/requests" : "/admin/requests";
  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "U";

  const loadUnreadCount = async () => {
    if (role === "donor") {
      const data = await apiRequest<{ unreadCount?: number; items?: unknown[] }>("/api/donors/notifications");
      setUnreadCount(Number(data.unreadCount ?? 0));
      return;
    }
    if (role === "recipient") {
      const data = await apiRequest<{ unreadCount?: number; items?: unknown[] }>("/api/recipients/notifications");
      setUnreadCount(Number(data.unreadCount ?? 0));
      return;
    }
    setUnreadCount(0);
  };

  useEffect(() => {
    loadUnreadCount().catch(() => setUnreadCount(0));
  }, [role, location.pathname]);

  useEffect(() => {
    if (!socket) return;
    const onNew = () => loadUnreadCount().catch(() => undefined);
    socket.on("notification:new", onNew);
    if (role === "donor") socket.on("emergency:broadcast", onNew);
    return () => {
      socket.off("notification:new", onNew);
      if (role === "donor") socket.off("emergency:broadcast", onNew);
    };
  }, [socket, role]);

  useEffect(() => {
    const handler = () => loadUnreadCount().catch(() => undefined);
    window.addEventListener("notifications:updated", handler as EventListener);
    return () => window.removeEventListener("notifications:updated", handler as EventListener);
  }, [role]);

  return (
    <div className="min-h-screen flex bg-muted">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground 
          flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2 px-5 h-16 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-blood flex items-center justify-center">
              <Droplets className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-base font-bold">BloodBank</span>
          </Link>
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-sidebar-accent text-sidebar-accent-foreground font-medium">
            {roleTitles[role]}
          </span>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {links.map((link) => {
            const active = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={logout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-30 h-16 bg-background/80 backdrop-blur-lg border-b border-border flex items-center px-6">
          <button className="lg:hidden mr-4 p-2 active:scale-95 transition-transform" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-foreground">{roleTitles[role]} Portal</h1>
          <div className="ml-auto flex items-center gap-3">
            <Link to={notificationsHref} className="relative p-2 rounded-lg hover:bg-muted transition-colors active:scale-95">
              <Bell className="w-5 h-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 rounded-full bg-primary 
                text-primary-foreground text-[11px] font-extrabold flex items-center justify-center shadow-card">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
            <Link to={profileHref} className="w-8 h-8 rounded-full bg-gradient-blood flex items-center justify-center 
            text-primary-foreground text-sm font-bold overflow-hidden">
              {user?.profilePhoto ? (
                <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </Link>
          </div>
        </header>

        <main className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
