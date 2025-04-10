
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, AlertCircle, Clock, Server, Activity, FileHeart } from 'lucide-react';

const AnomalyDetection = () => {
  const anomalies = [
    { 
      id: 1,
      title: "Unusual Login Attempt",
      description: "Multiple failed login attempts detected from IP 103.42.xx.xx",
      severity: "high",
      timestamp: "Today, 10:32 AM",
      status: "active",
      source: "User Authentication System"
    },
    { 
      id: 2,
      title: "Abnormal Network Traffic",
      description: "Unexpected data transfer pattern detected on port 8080",
      severity: "medium",
      timestamp: "Today, 09:15 AM",
      status: "investigating",
      source: "Network Monitor"
    },
    { 
      id: 3,
      title: "System Process Anomaly",
      description: "Unusual CPU usage pattern detected on server SVR-PROD-03",
      severity: "low",
      timestamp: "Yesterday, 11:45 PM",
      status: "resolved",
      source: "System Performance Monitor"
    },
    { 
      id: 4,
      title: "Database Query Pattern Change",
      description: "Unexpected increase in database read operations from application module",
      severity: "medium",
      timestamp: "Yesterday, 04:22 PM",
      status: "resolved",
      source: "Database Activity Monitor"
    },
    { 
      id: 5,
      title: "File System Activity",
      description: "Multiple sensitive files accessed in short succession",
      severity: "high",
      timestamp: "Apr 09, 02:10 PM",
      status: "resolved",
      source: "File Integrity Monitor"
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'high': return 'bg-safinet-red text-white';
      case 'medium': return 'bg-orange-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-safinet-red text-white';
      case 'investigating': return 'bg-amber-500 text-white';
      case 'resolved': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Anomaly Detection</h1>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-safinet-purple" />
            What is Anomaly Detection?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Anomaly Detection is the identification of rare items, events or observations which raise suspicions by differing significantly 
            from the majority of the data. In cybersecurity, it helps detect potential threats by identifying unusual patterns 
            that don't conform to expected behavior.
          </p>
          
          <h3 className="text-lg font-semibold mt-4">How SafiNet Detects Anomalies</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Behavioral Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Establishes baselines of normal behavior and identifies deviations that may indicate security threats.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Machine Learning Models</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Uses advanced algorithms to detect patterns and anomalies that traditional systems might miss.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Real-time Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Continuously observes systems and networks to detect and alert on anomalies as they occur.
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="all">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Detected Anomalies</h2>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="all" className="space-y-4">
          {anomalies.map(anomaly => (
            <Alert key={anomaly.id} className="border-l-4" style={{borderLeftColor: anomaly.severity === 'high' ? '#ea384c' : anomaly.severity === 'medium' ? '#f97316' : '#3b82f6'}}>
              <AlertCircle className={`h-4 w-4 ${anomaly.severity === 'high' ? 'text-safinet-red' : anomaly.severity === 'medium' ? 'text-orange-500' : 'text-blue-500'}`} />
              <div className="flex flex-col md:flex-row w-full justify-between gap-2">
                <div>
                  <AlertTitle className="flex items-center gap-2">
                    {anomaly.title}
                    <Badge className={getSeverityColor(anomaly.severity)}>{anomaly.severity}</Badge>
                    <Badge className={getStatusColor(anomaly.status)}>{anomaly.status}</Badge>
                  </AlertTitle>
                  <AlertDescription>{anomaly.description}</AlertDescription>
                </div>
                <div className="text-sm text-muted-foreground flex flex-col md:items-end gap-1">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {anomaly.timestamp}
                  </div>
                  <div className="flex items-center gap-1">
                    <Server className="h-3 w-3" />
                    {anomaly.source}
                  </div>
                </div>
              </div>
            </Alert>
          ))}
        </TabsContent>
        
        <TabsContent value="active" className="space-y-4">
          {anomalies.filter(a => a.status !== 'resolved').map(anomaly => (
            <Alert key={anomaly.id} className="border-l-4" style={{borderLeftColor: anomaly.severity === 'high' ? '#ea384c' : anomaly.severity === 'medium' ? '#f97316' : '#3b82f6'}}>
              <AlertCircle className={`h-4 w-4 ${anomaly.severity === 'high' ? 'text-safinet-red' : anomaly.severity === 'medium' ? 'text-orange-500' : 'text-blue-500'}`} />
              <div className="flex flex-col md:flex-row w-full justify-between gap-2">
                <div>
                  <AlertTitle className="flex items-center gap-2">
                    {anomaly.title}
                    <Badge className={getSeverityColor(anomaly.severity)}>{anomaly.severity}</Badge>
                    <Badge className={getStatusColor(anomaly.status)}>{anomaly.status}</Badge>
                  </AlertTitle>
                  <AlertDescription>{anomaly.description}</AlertDescription>
                </div>
                <div className="text-sm text-muted-foreground flex flex-col md:items-end gap-1">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {anomaly.timestamp}
                  </div>
                  <div className="flex items-center gap-1">
                    <Server className="h-3 w-3" />
                    {anomaly.source}
                  </div>
                </div>
              </div>
            </Alert>
          ))}
        </TabsContent>
        
        <TabsContent value="resolved" className="space-y-4">
          {anomalies.filter(a => a.status === 'resolved').map(anomaly => (
            <Alert key={anomaly.id} className="border-l-4" style={{borderLeftColor: anomaly.severity === 'high' ? '#ea384c' : anomaly.severity === 'medium' ? '#f97316' : '#3b82f6'}}>
              <AlertCircle className={`h-4 w-4 ${anomaly.severity === 'high' ? 'text-safinet-red' : anomaly.severity === 'medium' ? 'text-orange-500' : 'text-blue-500'}`} />
              <div className="flex flex-col md:flex-row w-full justify-between gap-2">
                <div>
                  <AlertTitle className="flex items-center gap-2">
                    {anomaly.title}
                    <Badge className={getSeverityColor(anomaly.severity)}>{anomaly.severity}</Badge>
                    <Badge className={getStatusColor(anomaly.status)}>{anomaly.status}</Badge>
                  </AlertTitle>
                  <AlertDescription>{anomaly.description}</AlertDescription>
                </div>
                <div className="text-sm text-muted-foreground flex flex-col md:items-end gap-1">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {anomaly.timestamp}
                  </div>
                  <div className="flex items-center gap-1">
                    <Server className="h-3 w-3" />
                    {anomaly.source}
                  </div>
                </div>
              </div>
            </Alert>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnomalyDetection;
