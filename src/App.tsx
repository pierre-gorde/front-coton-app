import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AppShell } from "@/components/layout/AppShell";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthVerify } from "@/pages/AuthVerify";
import CandidatDetailPage from "@/pages/admin/CandidatDetail";
import CandidatsPage from "@/pages/admin/CandidatsPage";
import CheckDetailPage from "@/pages/admin/check/CheckDetail";
import CheckListPage from "@/pages/admin/check/CheckList";
import ClientDetailPage from "@/pages/admin/ClientDetail";
import ClientsPage from "@/pages/admin/ClientsPage";
import CriteriaManagementPage from "@/pages/admin/check/CriteriaManagement";
import DashboardPage from "@/pages/Dashboard";
import FreelanceDetailPage from "@/pages/admin/FreelanceDetail";
import FreelancesPage from "@/pages/admin/FreelancesPage";
// Pages
import LoginPage from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import SettingsPage from "@/pages/Settings";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/auth/verify" element={<AuthVerify />} />

              {/* Protected dashboard routes with AppShell layout */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <AppShell />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardPage />} />

                {/* Check routes */}
                <Route path="admin/check/mission" element={<CheckListPage />} />
                <Route path="admin/check/mission/:checkId" element={<CheckDetailPage />} />
                <Route path="admin/check/criteria" element={<CriteriaManagementPage />} />
                <Route path="admin/check/candidate/:candidateId" element={<CandidatDetailPage />} />
                <Route path="admin/check/candidate" element={<CandidatsPage />} />

                {/* Client routes */}
                <Route path="admin/client" element={<ClientsPage />} />
                <Route path="admin/client/:clientId" element={<ClientDetailPage />} />

                {/* Freelance routes */}
                <Route path="admin/freelance/:userId" element={<FreelanceDetailPage />} />
                <Route path="admin/freelance" element={<FreelancesPage />} />

                {/* Settings */}
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              {/* Redirect root to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
