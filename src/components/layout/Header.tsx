
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Search, Bell, Menu, X, Shield } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

const Header = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mode, setMode] = useState("test");

  const handleModeChange = (value: string) => {
    if (value === "") return;
    setMode(value);
    toast({
      title: `Switched to ${value.charAt(0).toUpperCase() + value.slice(1)} Mode`,
      description: value === "live" ? 
        "You are now working with real security data. All actions have real consequences." :
        "You are in test mode. Actions will not affect production systems.",
      variant: value === "live" ? "destructive" : "default",
    });
  };

  const navigateToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <header className="border-b border-border">
      <div className="flex items-center justify-between p-4">
        <div className="flex md:hidden items-center">
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
        
        <div 
          className="hidden md:flex items-center gap-2 cursor-pointer" 
          onClick={navigateToDashboard}
        >
          <Shield className="h-6 w-6 text-safinet-purple" />
          <h1 className="font-bold text-xl">SafiNet</h1>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <ToggleGroup type="single" value={mode} onValueChange={handleModeChange} className="hidden md:flex">
            <ToggleGroupItem value="test" className="text-xs md:text-sm">
              Test Mode
            </ToggleGroupItem>
            <ToggleGroupItem value="live" className="text-xs md:text-sm">
              Live Mode
            </ToggleGroupItem>
          </ToggleGroup>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs bg-safinet-red text-white">
                3
              </Badge>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="block md:hidden border-t border-border p-4">
          <div className="flex flex-col gap-4">
            <div 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={navigateToDashboard}
            >
              <Shield className="h-6 w-6 text-safinet-purple" />
              <h1 className="font-bold text-xl">SafiNet</h1>
            </div>
            <ToggleGroup type="single" value={mode} onValueChange={handleModeChange}>
              <ToggleGroupItem value="test">Test Mode</ToggleGroupItem>
              <ToggleGroupItem value="live">Live Mode</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
