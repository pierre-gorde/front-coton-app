import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import LoginPage from "@/pages/Login";
import { AuthVerify } from "@/pages/AuthVerify";
import DashboardPage from "@/pages/Dashboard";
import CheckListPage from "@/pages/admin/check/CheckList";
import CheckDetailPage from "@/pages/admin/check/CheckDetail";
import ClientDetailPage from "@/pages/admin/ClientDetail";
import FreelanceDetailPage from "@/pages/admin/FreelanceDetail";
import CandidatDetailPage from "@/pages/admin/CandidatDetail";
import ClientsPage from "@/pages/admin/ClientsPage";
import FreelancesPage from "@/pages/admin/FreelancesPage";
import CandidatsPage from "@/pages/admin/CandidatsPage";
import SettingsPage from "@/pages/Settings";
import NotFound from "@/pages/NotFound";

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

                {/* Admin routes */}
                <Route path="admin/check" element={<CheckListPage />} />
                <Route path="admin/check/:checkId" element={<CheckDetailPage />} />
                <Route path="admin/client/:clientId" element={<ClientDetailPage />} />
                <Route path="admin/freelance/:userId" element={<FreelanceDetailPage />} />
                <Route path="admin/candidat/:candidatId" element={<CandidatDetailPage />} />
                <Route path="admin/clients" element={<ClientsPage />} />
                <Route path="admin/freelances" element={<FreelancesPage />} />
                <Route path="admin/candidats" element={<CandidatsPage />} />

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
