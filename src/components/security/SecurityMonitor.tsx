
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, AlertTriangle, Activity, Clock, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface LoginAttempt {
  id: string;
  email: string;
  attempted_at: string;
  success: boolean;
}

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  created_at: string;
  details: any;
}

const SecurityMonitor = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Only admins can access security monitoring
  if (profile?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Access Denied</h3>
          <p className="text-muted-foreground">Only administrators can access security monitoring.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);

      // Fetch recent login attempts
      const { data: attempts, error: attemptsError } = await supabase
        .from('login_attempts')
        .select('*')
        .order('attempted_at', { ascending: false })
        .limit(50);

      if (attemptsError) {
        console.error('Error fetching login attempts:', attemptsError);
      }

      // Fetch recent audit logs
      const { data: logs, error: logsError } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (logsError) {
        console.error('Error fetching audit logs:', logsError);
      }

      setLoginAttempts(attempts || []);
      setAuditLogs(logs || []);
    } catch (error) {
      console.error('Error fetching security data:', error);
      toast({
        title: "Error",
        description: "Failed to load security data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchSecurityData();
  };

  const cleanupOldAttempts = async () => {
    try {
      const { error } = await supabase.rpc('cleanup_old_login_attempts');
      if (error) throw error;

      toast({
        title: "Success",
        description: "Old login attempts cleaned up",
      });

      fetchSecurityData();
    } catch (error) {
      console.error('Error cleaning up attempts:', error);
      toast({
        title: "Error",
        description: "Failed to cleanup old attempts",
        variant: "destructive",
      });
    }
  };

  const cleanupOldAuditLogs = async () => {
    try {
      const { error } = await supabase.rpc('cleanup_old_audit_logs');
      if (error) throw error;

      toast({
        title: "Success",
        description: "Old audit logs cleaned up",
      });

      fetchSecurityData();
    } catch (error) {
      console.error('Error cleaning up audit logs:', error);
      toast({
        title: "Error",
        description: "Failed to cleanup old audit logs",
        variant: "destructive",
      });
    }
  };

  const getFailedAttemptsByEmail = () => {
    const attempts = new Map<string, number>();
    loginAttempts
      .filter(attempt => !attempt.success)
      .forEach(attempt => {
        attempts.set(attempt.email, (attempts.get(attempt.email) || 0) + 1);
      });
    return Array.from(attempts.entries()).sort((a, b) => b[1] - a[1]);
  };

  const getRecentActivity = () => {
    return auditLogs.slice(0, 20);
  };

  const getSuspiciousActivity = () => {
    return auditLogs.filter(log => 
      log.action.includes('delete') || 
      log.action.includes('admin') ||
      log.details?.title?.includes('test') ||
      log.details?.title?.includes('script')
    ).slice(0, 10);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const failedAttempts = getFailedAttemptsByEmail();
  const recentActivity = getRecentActivity();
  const suspiciousActivity = getSuspiciousActivity();
  const totalFailedAttempts = loginAttempts.filter(attempt => !attempt.success).length;
  const totalSuccessfulLogins = loginAttempts.filter(attempt => attempt.success).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Security Monitor</h2>
        <div className="flex gap-2">
          <Button onClick={refreshData} variant="outline" disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={cleanupOldAttempts} variant="outline">
            <Clock className="h-4 w-4 mr-2" />
            Cleanup Attempts
          </Button>
          <Button onClick={cleanupOldAuditLogs} variant="outline">
            <Activity className="h-4 w-4 mr-2" />
            Cleanup Logs
          </Button>
        </div>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Login Attempts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalFailedAttempts}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Logins</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalSuccessfulLogins}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Events</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{auditLogs.length}</div>
            <p className="text-xs text-muted-foreground">Recent activities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspicious Activities</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{suspiciousActivity.length}</div>
            <p className="text-xs text-muted-foreground">Needs review</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Failed Attempts by Email */}
        {failedAttempts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Failed Login Attempts by Email</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-2 pr-4">
                  {failedAttempts.slice(0, 10).map(([email, count]) => (
                    <div key={email} className="flex items-center justify-between p-2 border rounded">
                      <span className="font-mono text-sm truncate">{email}</span>
                      <Badge variant={count > 5 ? "destructive" : "secondary"}>
                        {count} attempts
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Suspicious Activity */}
        {suspiciousActivity.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Suspicious Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-2 pr-4">
                  {suspiciousActivity.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1">
                        <span className="font-medium text-orange-600">{log.action}</span>
                        <span className="text-muted-foreground ml-2">on {log.resource_type}</span>
                        {log.details?.title && (
                          <div className="text-sm text-muted-foreground truncate">
                            Title: {log.details.title}
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Security Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-2 pr-4">
              {recentActivity.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex-1">
                    <span className="font-medium">{log.action}</span>
                    <span className="text-muted-foreground ml-2">on {log.resource_type}</span>
                    {log.details && (
                      <div className="text-sm text-muted-foreground">
                        {JSON.stringify(log.details).substring(0, 50)}...
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(log.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityMonitor;
