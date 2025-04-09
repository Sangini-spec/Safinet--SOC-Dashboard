
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Search, Flag, Download, Filter, Clock } from "lucide-react";
import { getLogs } from '@/services/mockData';

interface Log {
  id: string;
  timestamp: string;
  level: string;
  source: string;
  message: string;
  raw: string;
  metadata: any;
}

const LogViewer = () => {
  const allLogs = getLogs();
  const [logs, setLogs] = useState<Log[]>(allLogs);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setLogs(allLogs);
      return;
    }
    
    const filtered = allLogs.filter(log => 
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.raw.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setLogs(filtered);
  };
  
  const getLevelBadge = (level: string) => {
    switch (level) {
      case "ERROR":
        return <Badge className="bg-safinet-red text-white">ERROR</Badge>;
      case "WARN":
        return <Badge className="bg-safinet-orange text-white">WARN</Badge>;
      case "INFO":
        return <Badge className="bg-safinet-blue text-white">INFO</Badge>;
      case "DEBUG":
        return <Badge variant="outline">DEBUG</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };
  
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Log Viewer</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Log filters and search */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Search Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="flex space-x-2">
                  <Input 
                    placeholder="Search logs..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button type="submit">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Log Level</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="cursor-pointer">ERROR</Badge>
                  <Badge variant="outline" className="cursor-pointer">WARN</Badge>
                  <Badge variant="outline" className="cursor-pointer">INFO</Badge>
                  <Badge variant="outline" className="cursor-pointer">DEBUG</Badge>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Source</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="cursor-pointer">auth-service</Badge>
                  <Badge variant="outline" className="cursor-pointer">firewall</Badge>
                  <Badge variant="outline" className="cursor-pointer">file-server</Badge>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Time Range</h3>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Clock className="h-4 w-4 mr-2" />
                  Last 24 hours
                </Button>
              </div>
              
              <Button className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Log table and details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Log Events</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead className="hidden md:table-cell">Message</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow 
                      key={log.id} 
                      className={`cursor-pointer hover:bg-muted/50 ${selectedLog?.id === log.id ? 'bg-muted' : ''}`}
                      onClick={() => setSelectedLog(log)}
                    >
                      <TableCell className="font-mono text-xs whitespace-nowrap">
                        {formatTimestamp(log.timestamp)}
                      </TableCell>
                      <TableCell>{getLevelBadge(log.level)}</TableCell>
                      <TableCell>{log.source}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="truncate max-w-[300px]">{log.message}</div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={(e) => {
                          e.stopPropagation();
                          // Flag log implementation
                        }}>
                          <Flag className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          {selectedLog && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Log Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="formatted">
                  <TabsList className="mb-4">
                    <TabsTrigger value="formatted">Formatted</TabsTrigger>
                    <TabsTrigger value="raw">Raw</TabsTrigger>
                    <TabsTrigger value="metadata">Metadata</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="formatted" className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium">Timestamp</h3>
                      <p className="text-muted-foreground">{formatTimestamp(selectedLog.timestamp)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Level</h3>
                      <div>{getLevelBadge(selectedLog.level)}</div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Source</h3>
                      <p className="text-muted-foreground">{selectedLog.source}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Message</h3>
                      <p className="text-muted-foreground">{selectedLog.message}</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="raw">
                    <Textarea 
                      value={selectedLog.raw}
                      readOnly
                      className="font-mono text-xs h-[200px]"
                    />
                    <Button variant="outline" size="sm" className="mt-2">
                      <Download className="h-4 w-4 mr-2" />
                      Download Raw Log
                    </Button>
                  </TabsContent>
                  
                  <TabsContent value="metadata">
                    <pre className="bg-muted p-4 rounded-md overflow-auto h-[200px] text-xs">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogViewer;
