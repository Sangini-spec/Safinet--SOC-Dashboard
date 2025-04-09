
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { EyeIcon, CheckCircle, AlertTriangle } from "lucide-react";

export interface Alert {
  id: string;
  type: string;
  description: string;
  source: string;
  timestamp: string;
  status: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  isMock?: boolean;
}

interface AlertsTableProps {
  alerts: Alert[];
  title: string;
}

const getSeverityStyles = (severity: Alert['severity']) => {
  switch (severity) {
    case 'critical':
      return { badgeClass: 'bg-safinet-red text-white', statusClass: 'status-critical' };
    case 'high':
      return { badgeClass: 'bg-safinet-orange text-white', statusClass: 'status-high' };
    case 'medium':
      return { badgeClass: 'bg-yellow-500 text-white', statusClass: 'status-medium' };
    case 'low':
      return { badgeClass: 'bg-green-500 text-white', statusClass: 'status-low' };
    case 'info':
      return { badgeClass: 'bg-safinet-blue text-white', statusClass: 'status-info' };
  }
};

const AlertsTable = ({ alerts, title }: AlertsTableProps) => {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="hidden md:table-cell">Source</TableHead>
              <TableHead className="hidden md:table-cell">Timestamp</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alerts.map((alert) => {
              const { badgeClass, statusClass } = getSeverityStyles(alert.severity);
              
              return (
                <TableRow key={alert.id} className="group hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={statusClass}></span>
                      <Badge className={badgeClass}>{alert.severity}</Badge>
                      {alert.isMock && (
                        <Badge variant="outline" className="ml-1 border-safinet-purple text-xs">MOCK</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{alert.type}</div>
                      <div className="text-xs text-muted-foreground hidden md:block">{alert.description}</div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{alert.source}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-xs">{alert.timestamp}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      alert.status === "New" 
                        ? "border-safinet-red text-safinet-red" 
                        : "border-green-500 text-green-500"
                    }>
                      {alert.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AlertsTable;
