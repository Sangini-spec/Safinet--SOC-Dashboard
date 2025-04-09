
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import LogViewer from "./pages/LogViewer";
import Playbooks from "./pages/Playbooks";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Simple auth check - in a real app, would use a proper auth context
  const isAuthenticated = !!localStorage.getItem('safinetUser');
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
            
            {/* Protected routes */}
            <Route
              path="/"
              element={isAuthenticated ? 
                <AppLayout><Dashboard /></AppLayout> : 
                <Navigate to="/login" />
              }
            />
            <Route
              path="/logs"
              element={isAuthenticated ? 
                <AppLayout><LogViewer /></AppLayout> : 
                <Navigate to="/login" />
              }
            />
            <Route
              path="/playbooks"
              element={isAuthenticated ? 
                <AppLayout><Playbooks /></AppLayout> : 
                <Navigate to="/login" />
              }
            />
            
            {/* 404 Page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
