
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Flag, AlertCircle, Clipboard } from 'lucide-react';

export interface Alert {
  id: string;
  type: string;
  description: string;
  source: string;
  timestamp: string;
  status: string;
  severity: string;
  isMock?: boolean;
}

interface AlertsTableProps {
  alerts: Alert[];
  title: string;
}

const AlertsTable = ({ alerts, title }: AlertsTableProps) => {
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge className="bg-safinet-red text-white">Critical</Badge>;
      case "high":
        return <Badge className="bg-safinet-orange text-white">High</Badge>;
      case "medium":
        return <Badge className="bg-yellow-500 text-white">Medium</Badge>;
      case "low":
        return <Badge className="bg-green-500 text-white">Low</Badge>;
      default:
        return <Badge>{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "New":
        return <Badge variant="outline" className="border-safinet-red text-safinet-red">New</Badge>;
      case "In Progress":
        return <Badge variant="outline" className="border-safinet-blue text-safinet-blue">In Progress</Badge>;
      case "Resolved":
        return <Badge variant="outline" className="border-green-500 text-green-500">Resolved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-medium">{title}</h2>
          {title.includes("Live") && (
            <Badge className="bg-safinet-red text-white">Live</Badge>
          )}
          {title.includes("Training") && (
            <Badge className="bg-safinet-blue text-white">Training</Badge>
          )}
        </div>
        <Button variant="outline" size="sm">View All</Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Time</TableHead>
              <TableHead className="w-[150px]">Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[100px]">Source</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[100px]">Severity</TableHead>
              <TableHead className="w-[100px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alerts.map((alert) => (
              <TableRow key={alert.id}>
                <TableCell>{alert.timestamp.split(" ")[1]}</TableCell>
                <TableCell>{alert.type}</TableCell>
                <TableCell>{alert.description}</TableCell>
                <TableCell>{alert.source}</TableCell>
                <TableCell>{getStatusBadge(alert.status)}</TableCell>
                <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <Flag className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AlertsTable;
