
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import Validation from "./pages/Validation/Index";
import Results from "./pages/Results/Index";

// Layout
import MainLayout from "./components/Layout/MainLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
              <Route path="/self-evaluation" element={<SelfEvaluation />} />
              <Route path="/student-evaluation" element={<StudentEvaluation />} />
              <Route path="/incidents" element={<Incidents />} />
              <Route path="/checklist-evaluation" element={<ChecklistEvaluation />} />
              <Route path="/roles" element={<Roles />} />
              <Route path="/validation" element={<Validation />} />
              <Route path="/results" element={<Results />} />
            </Route>
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
