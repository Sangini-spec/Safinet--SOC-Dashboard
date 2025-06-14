
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Globe, Shield, Eye, Database, Target, Clock } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

interface SearchEngine {
  name: string;
  icon: React.ReactNode;
  baseUrl: string;
  description: string;
}

const searchEngines: SearchEngine[] = [
  {
    name: "Google",
    icon: <Globe className="h-4 w-4" />,
    baseUrl: "https://www.google.com/search?q=",
    description: "General web search"
  },
  {
    name: "Bing",
    icon: <Globe className="h-4 w-4" />,
    baseUrl: "https://www.bing.com/search?q=",
    description: "Microsoft search engine"
  },
  {
    name: "Shodan",
    icon: <Shield className="h-4 w-4" />,
    baseUrl: "https://www.shodan.io/search?query=",
    description: "IoT device discovery"
  },
  {
    name: "Hunter.io",
    icon: <Target className="h-4 w-4" />,
    baseUrl: "https://hunter.io/search/",
    description: "Email finder & verifier"
  },
  {
    name: "Censys",
    icon: <Eye className="h-4 w-4" />,
    baseUrl: "https://search.censys.io/search?resource=hosts&sort=RELEVANCE&per_page=25&virtual_hosts=EXCLUDE&q=",
    description: "Internet-wide scanning"
  },
  {
    name: "Wayback Machine",
    icon: <Clock className="h-4 w-4" />,
    baseUrl: "https://web.archive.org/web/*/",
    description: "Historical website snapshots"
  }
];

const SearchDropdown = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleSearch = (engine: SearchEngine) => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search Query Required",
        description: "Please enter a search term before selecting a search engine.",
        variant: "destructive",
      });
      return;
    }

    const searchUrl = engine.baseUrl + encodeURIComponent(searchQuery.trim());
    window.open(searchUrl, '_blank', 'noopener,noreferrer');
    
    toast({
      title: `Searching with ${engine.name}`,
      description: `Opening search results in a new tab for: "${searchQuery}"`,
    });

    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Search className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-4" align="end">
        <DropdownMenuLabel className="text-sm font-semibold">
          Reconnaissance Search
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="space-y-3">
          <Input
            placeholder="Enter search query..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                handleSearch(searchEngines[0]); // Default to Google on Enter
              }
            }}
            className="w-full"
          />
          
          <div className="space-y-1">
            {searchEngines.map((engine) => (
              <DropdownMenuItem
                key={engine.name}
                onClick={() => handleSearch(engine)}
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-accent rounded-md"
              >
                <div className="flex items-center gap-2 flex-1">
                  {engine.icon}
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{engine.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {engine.description}
                    </span>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SearchDropdown;
