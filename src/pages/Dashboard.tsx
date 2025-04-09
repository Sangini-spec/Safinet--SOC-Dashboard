
import React from 'react';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  Clock, 
  AlertCircle, 
  Check
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip 
} from "recharts";
import StatCard from '@/components/dashboard/StatCard';
import AlertsTable from '@/components/dashboard/AlertsTable';
import { getMockAlerts, getLiveAlerts, getAnalyticsData } from '@/services/mockData';

const Dashboard = () => {
  const liveAlerts = getLiveAlerts();
  const mockAlerts = getMockAlerts();
  const analyticsData = getAnalyticsData();
  
  const COLORS = ['#6E59A5', '#0EA5E9', '#F97316', '#ea384c', '#10B981'];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Security Dashboard</h1>
      
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Security Posture" 
          value={`${analyticsData.securityPosture}%`}
          description="Overall security score"
          icon={<ShieldAlert className="h-4 w-4" />} 
          trend={{ value: 3, isPositive: true }}
        />
        <StatCard 
          title="Critical Alerts" 
          value={analyticsData.criticalAlerts}
          description="Unresolved critical security issues"
          icon={<AlertCircle className="h-4 w-4" />} 
          className="text-safinet-red"
          trend={{ value: 2, isPositive: false }}
        />
        <StatCard 
          title="Total Incidents" 
          value={analyticsData.totalIncidents}
          description="Tracked security incidents this month"
          icon={<LayoutDashboard className="h-4 w-4" />} 
          trend={{ value: 12, isPositive: false }}
        />
        <StatCard 
          title="Resolved Incidents" 
          value={analyticsData.resolvedIncidents}
          description="Successfully mitigated threats"
          icon={<Check className="h-4 w-4" />} 
          trend={{ value: 15, isPositive: true }}
        />
      </div>
      
      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incident types chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Incidents by Type</CardTitle>
            <CardDescription>Distribution of security incidents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.incidentsByType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {analyticsData.incidentsByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Response time chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Average Response Time</CardTitle>
            <CardDescription>In minutes, lower is better</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData.responseTimeByDay}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="time"
                    stroke="#6E59A5"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Live alerts */}
      <AlertsTable alerts={liveAlerts} title="Live Security Alerts" />
      
      {/* Mock alerts for training */}
      <AlertsTable alerts={mockAlerts} title="Training Simulations" />
    </div>
  );
};

export default Dashboard;
