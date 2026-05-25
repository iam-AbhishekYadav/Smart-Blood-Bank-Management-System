import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DonorRegister from "./pages/DonorRegister";
import RecipientRegister from "./pages/RecipientRegister";
import DonorDashboard from "./pages/DonorDashboard";
import RecipientDashboard from "./pages/RecipientDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import EmergencyRequest from "./pages/EmergencyRequest";
import About from "./pages/About";
import FindBlood from "./pages/FindBlood";
import DonorProfile from "./pages/donor/DonorProfile";
import DonorAvailability from "./pages/donor/DonorAvailability";
import DonorHistory from "./pages/donor/DonorHistory";
import DonorNotifications from "./pages/donor/DonorNotifications";
import RecipientProfile from "./pages/recipient/RecipientProfile";
import NewBloodRequest from "./pages/recipient/NewBloodRequest";
import MyRequests from "./pages/recipient/MyRequests";
import FindDonors from "./pages/recipient/FindDonors";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminRequests from "./pages/admin/AdminRequests";
import AdminEmergency from "./pages/admin/AdminEmergency";
import AdminReports from "./pages/admin/AdminReports";
import AdminSettings from "./pages/admin/AdminSettings";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/donor" element={<DonorRegister />} />
          <Route path="/register/recipient" element={<RecipientRegister />} />
          <Route path="/emergency" element={<EmergencyRequest />} />
          <Route path="/about" element={<About />} />
          <Route path="/find-blood" element={<FindBlood />} />

          {/* Donor */}
          <Route path="/donor/dashboard" element={<ProtectedRoute allowedRoles={["donor"]}><DonorDashboard /></ProtectedRoute>} />
          <Route path="/donor/profile" element={<ProtectedRoute allowedRoles={["donor"]}><DonorProfile /></ProtectedRoute>} />
          <Route path="/donor/availability" element={<ProtectedRoute allowedRoles={["donor"]}><DonorAvailability /></ProtectedRoute>} />
          <Route path="/donor/history" element={<ProtectedRoute allowedRoles={["donor"]}><DonorHistory /></ProtectedRoute>} />
          <Route path="/donor/notifications" element={<ProtectedRoute allowedRoles={["donor"]}><DonorNotifications /></ProtectedRoute>} />

          {/* Recipient */}
          <Route path="/recipient/dashboard" element={<ProtectedRoute allowedRoles={["recipient"]}><RecipientDashboard /></ProtectedRoute>} />
          <Route path="/recipient/profile" element={<ProtectedRoute allowedRoles={["recipient"]}><RecipientProfile /></ProtectedRoute>} />
          <Route path="/recipient/request" element={<ProtectedRoute allowedRoles={["recipient"]}><NewBloodRequest /></ProtectedRoute>} />
          <Route path="/recipient/requests" element={<ProtectedRoute allowedRoles={["recipient"]}><MyRequests /></ProtectedRoute>} />
          <Route path="/recipient/find-donors" element={<ProtectedRoute allowedRoles={["recipient"]}><FindDonors /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/inventory" element={<ProtectedRoute allowedRoles={["admin"]}><AdminInventory /></ProtectedRoute>} />
          <Route path="/admin/requests" element={<ProtectedRoute allowedRoles={["admin"]}><AdminRequests /></ProtectedRoute>} />
          <Route path="/admin/emergency" element={<ProtectedRoute allowedRoles={["admin"]}><AdminEmergency /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={["admin"]}><AdminReports /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={["admin"]}><AdminSettings /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
