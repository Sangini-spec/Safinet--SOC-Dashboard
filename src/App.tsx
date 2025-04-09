
import React from "react";
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
import Index from "./pages/Index";
import Settings from "./pages/Settings";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  // Simple auth check - in a real app, would use a proper auth context
  const isAuthenticated = !!localStorage.getItem('safinetUser');
  
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Root path redirects to Index component which handles auth-based routing */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
              
              {/* Protected routes */}
              <Route
                path="/dashboard"
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
              <Route
                path="/settings"
                element={isAuthenticated ? 
                  <AppLayout><Settings /></AppLayout> : 
                  <Navigate to="/login" />
                }
              />
              
              {/* 404 Page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
