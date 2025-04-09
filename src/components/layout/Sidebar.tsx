
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  LineChart, 
  Settings, 
  LogOut, 
  Brain, 
  AlertTriangle,
  Cpu
} from 'lucide-react';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  notifications?: number;
  isMobile?: boolean;
  onClick?: () => void;
}

const NavItem = ({ to, icon, label, notifications, isMobile, onClick }: NavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link 
      to={to}
      onClick={onClick}
      className={cn(
        "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "hover:bg-muted hover:text-foreground"
      )}
    >
      {icon}
      {!isMobile && <span className="ml-3">{label}</span>}
      {notifications && (
        <span className="ml-auto bg-safinet-red text-white rounded-full px-1.5 py-0.5 text-xs">
          {notifications}
        </span>
      )}
    </Link>
  );
};

const Sidebar = () => {
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('safinetUser');
    
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of SafiNet",
    });
    
    // Navigate to login page
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" />, label: 'Dashboard', notifications: 3 },
    { to: '/incidents', icon: <AlertTriangle className="h-5 w-5" />, label: 'Incidents' },
    { to: '/playbooks', icon: <BookOpen className="h-5 w-5" />, label: 'Playbooks' },
    { to: '/logs', icon: <FileText className="h-5 w-5" />, label: 'Log Viewer' },
    { to: '/detection', icon: <Brain className="h-5 w-5" />, label: 'Anomaly Detection' },
    { to: '/integrations', icon: <Cpu className="h-5 w-5" />, label: 'Integrations' },
    { to: '/analytics', icon: <LineChart className="h-5 w-5" />, label: 'Analytics' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col h-screen w-64 border-r border-border">
        <div className="flex items-center gap-2 px-4 h-16 border-b border-border">
          <div className="flex items-center justify-center h-10 w-10 rounded-md bg-primary">
            <span className="text-primary-foreground font-bold text-xl">S</span>
          </div>
          <div>
            <h1 className="font-bold text-lg">SafiNet</h1>
            <p className="text-xs text-muted-foreground">Cyber Sentinel Hub</p>
          </div>
        </div>
        
        <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              notifications={item.notifications}
            />
          ))}
        </div>
        
        <div className="p-2 border-t border-border">
          <NavItem to="/settings" icon={<Settings className="h-5 w-5" />} label="Settings" />
          <Button 
            variant="ghost" 
            className="w-full justify-start px-3 py-2 rounded-md text-sm font-medium mt-1"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            <span className="ml-3">Logout</span>
          </Button>
        </div>
      </div>
      
      {/* Mobile Sidebar */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-background border-t border-border z-10">
        <div className="flex justify-around p-1">
          {navItems.slice(0, 5).map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              isMobile
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
