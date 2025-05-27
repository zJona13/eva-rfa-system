
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./contexts/AuthContext";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Dashboard from "./pages/Dashboard";
import SelfEvaluation from "./pages/SelfEvaluation/Index";
import StudentEvaluation from "./pages/StudentEvaluation/Index";
import Incidents from "./pages/Incidents/Index";
import ChecklistEvaluation from "./pages/ChecklistEvaluation/Index";
import Roles from "./pages/Roles/Index";
import Reports from "./pages/Reports/Index";

// Layout and Protection
import MainLayout from "./components/Layout/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected routes */}
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                
                {/* Autoevaluación - Solo admin y evaluados */}
                <Route 
                  path="/self-evaluation" 
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'evaluated']}>
                      <SelfEvaluation />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Evaluación estudiante - Solo admin y estudiantes */}
                <Route 
                  path="/student-evaluation" 
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'student']}>
                      <StudentEvaluation />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Supervisión - Solo admin y evaluadores */}
                <Route 
                  path="/checklist-evaluation" 
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'evaluator']}>
                      <ChecklistEvaluation />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Incidencias - Todos los usuarios autenticados */}
                <Route 
                  path="/incidents" 
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'evaluator', 'evaluated', 'student', 'validator']}>
                      <Incidents />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Reportes - Solo admin y evaluadores */}
                <Route 
                  path="/reports" 
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'evaluator']}>
                      <Reports />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Mantenimientos - Solo admin */}
                <Route 
                  path="/roles" 
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <Roles />
                    </ProtectedRoute>
                  } 
                />
              </Route>
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
