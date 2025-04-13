
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Label } from '@/components/ui/label';
import { FileEdit, Download, AlertTriangle, Clock, User, BookOpen } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import IncidentDetails, { IncidentDetail } from '@/components/incidents/IncidentDetails';

// Extended mock incident data with location and playbook steps
const mockIncidents: IncidentDetail[] = [
  {
    id: 'INC-001',
    title: 'Potential Data Breach',
    severity: 'critical',
    status: 'active',
    detectionTime: new Date(2023, 3, 15, 14, 22),
    resolutionTime: null,
    assignedAnalyst: 'John Doe',
    linkedPlaybook: 'Data Breach Response',
    description: 'Unusual data access patterns detected from external IP in North America. Multiple database queries extracting large amounts of customer data were flagged by our monitoring system.',
    location: {
      name: 'New York, USA',
      latitude: 40.7128,
      longitude: -74.006
    },
    playbookSteps: [
      { id: '001-1', title: 'Isolate affected systems', completed: true },
      { id: '001-2', title: 'Document affected systems and determine blast radius', completed: true },
      { id: '001-3', title: 'Notify key stakeholders', completed: false },
      { id: '001-4', title: 'Follow backup restoration procedures', completed: false },
      { id: '001-5', title: 'Document lessons learned and update security measures', completed: false }
    ]
  },
  {
    id: 'INC-002',
    title: 'Suspicious Login Activity',
    severity: 'high',
    status: 'under-investigation',
    detectionTime: new Date(2023, 3, 16, 9, 11),
    resolutionTime: null,
    assignedAnalyst: 'Sarah Smith',
    linkedPlaybook: 'User Account Compromise',
    description: 'Multiple failed login attempts from different geographic locations detected for executive accounts. Successful login occurred from an unusual location.',
    location: {
      name: 'London, UK',
      latitude: 51.5074,
      longitude: -0.1278
    },
    playbookSteps: [
      { id: '002-1', title: 'Lock compromised accounts', completed: true },
      { id: '002-2', title: 'Reset credentials for affected users', completed: true },
      { id: '002-3', title: 'Investigate extent of compromise', completed: true },
      { id: '002-4', title: 'Analyze login patterns and system logs', completed: false },
      { id: '002-5', title: 'Implement additional authentication measures', completed: false }
    ]
  },
  {
    id: 'INC-003',
    title: 'Malware Detection',
    severity: 'medium',
    status: 'resolved',
    detectionTime: new Date(2023, 3, 10, 11, 45),
    resolutionTime: new Date(2023, 3, 11, 15, 30),
    assignedAnalyst: 'Mike Johnson',
    linkedPlaybook: 'Malware Remediation',
    description: 'Trojan detected on workstation ABC-123. The malware was identified as a known banking trojan attempting to steal credentials.',
    location: {
      name: 'Berlin, Germany',
      latitude: 52.5200,
      longitude: 13.4050
    },
    playbookSteps: [
      { id: '003-1', title: 'Isolate infected system', completed: true },
      { id: '003-2', title: 'Scan network for other infections', completed: true },
      { id: '003-3', title: 'Remove malware using security tools', completed: true },
      { id: '003-4', title: 'Restore from clean backups if needed', completed: true },
      { id: '003-5', title: 'Update security policies and scanning tools', completed: true }
    ]
  },
  {
    id: 'INC-004',
    title: 'Phishing Campaign',
    severity: 'high',
    status: 'resolved',
    detectionTime: new Date(2023, 3, 5, 8, 30),
    resolutionTime: new Date(2023, 3, 5, 16, 45),
    assignedAnalyst: 'Emily Chen',
    linkedPlaybook: 'Phishing Response',
    description: 'Targeted phishing emails sent to finance department. The campaign attempted to collect login credentials through a fake corporate portal.',
    location: {
      name: 'Singapore',
      latitude: 1.3521,
      longitude: 103.8198
    },
    playbookSteps: [
      { id: '004-1', title: 'Identify all recipients of phishing emails', completed: true },
      { id: '004-2', title: 'Block sender domains and URLs in email security gateway', completed: true },
      { id: '004-3', title: 'Reset passwords for any potentially compromised accounts', completed: true },
      { id: '004-4', title: 'Send organization-wide security alert', completed: true },
      { id: '004-5', title: 'Conduct focused security awareness training', completed: true }
    ]
  },
  {
    id: 'INC-005',
    title: 'DDoS Attack',
    severity: 'critical',
    status: 'active',
    detectionTime: new Date(2023, 3, 17, 3, 15),
    resolutionTime: null,
    assignedAnalyst: 'David Wilson',
    linkedPlaybook: 'DDoS Mitigation',
    description: 'Abnormally high traffic detected on public-facing servers causing service disruption. Traffic analysis suggests a coordinated botnet attack.',
    location: {
      name: 'Sydney, Australia',
      latitude: -33.8688,
      longitude: 151.2093
    },
    playbookSteps: [
      { id: '005-1', title: 'Activate DDoS protection services', completed: true },
      { id: '005-2', title: 'Implement traffic filtering rules', completed: true },
      { id: '005-3', title: 'Scale resources to handle increased load', completed: false },
      { id: '005-4', title: 'Contact ISP for additional mitigation support', completed: false },
      { id: '005-5', title: 'Document attack patterns and update defense strategies', completed: false }
    ]
  },
  {
    id: 'INC-006',
    title: 'Unauthorized Access Attempt',
    severity: 'medium',
    status: 'under-investigation',
    detectionTime: new Date(2023, 3, 14, 19, 50),
    resolutionTime: null,
    assignedAnalyst: 'Alex Rodriguez',
    linkedPlaybook: 'Access Control Violation',
    description: 'Multiple attempts to access restricted resources from an internal network address. Pattern suggests privilege escalation attempt.',
    location: {
      name: 'Toronto, Canada',
      latitude: 43.6532,
      longitude: -79.3832
    },
    playbookSteps: [
      { id: '006-1', title: 'Identify source of access attempts', completed: true },
      { id: '006-2', title: 'Review authentication logs for anomalies', completed: true },
      { id: '006-3', title: 'Interview personnel with access to source system', completed: false },
      { id: '006-4', title: 'Implement additional access controls', completed: false },
      { id: '006-5', title: 'Update access monitoring rules', completed: false }
    ]
  }
];

type SeverityType = 'critical' | 'high' | 'medium' | 'low' | 'all';
type StatusType = 'active' | 'under-investigation' | 'resolved' | 'all';

const Incidents = () => {
  const { toast } = useToast();
  const [severityFilter, setSeverityFilter] = useState<SeverityType>('all');
  const [statusFilter, setStatusFilter] = useState<StatusType>('all');
  const [selectedIncident, setSelectedIncident] = useState<IncidentDetail | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // Filter incidents based on current filters
  const filteredIncidents = mockIncidents.filter(incident => {
    const matchesSeverity = severityFilter === 'all' || incident.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;
    return matchesSeverity && matchesStatus;
  });
  
  // Function to format date
  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Function to get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };
  
  // Function to get status color and label
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return { 
          color: 'bg-red-100 text-red-800 border-red-300',
          label: 'Active'
        };
      case 'under-investigation':
        return { 
          color: 'bg-blue-100 text-blue-800 border-blue-300',
          label: 'Under Investigation'
        };
      case 'resolved':
        return { 
          color: 'bg-green-100 text-green-800 border-green-300',
          label: 'Resolved'
        };
      default:
        return { 
          color: 'bg-gray-100 text-gray-800 border-gray-300',
          label: 'Unknown'
        };
    }
  };
  
  const handleExportReport = (incidentId: string) => {
    toast({
      title: "Report Export Initiated",
      description: `Generating report for incident ${incidentId}...`,
    });
    
    // In a real application, this would trigger the report generation
    setTimeout(() => {
      toast({
        title: "Report Generated",
        description: `Report for incident ${incidentId} has been exported.`,
      });
    }, 2000);
  };

  const handleViewDetails = (incident: IncidentDetail) => {
    setSelectedIncident(incident);
    setIsDetailsOpen(true);
  };

  const handleToggleStep = (stepId: string) => {
    if (!selectedIncident) return;

    // Find the incident in our data
    const incidentIndex = mockIncidents.findIndex(inc => inc.id === selectedIncident.id);
    if (incidentIndex === -1) return;

    // Create a new array of steps with the toggled step
    const updatedSteps = mockIncidents[incidentIndex].playbookSteps.map(step => 
      step.id === stepId ? { ...step, completed: !step.completed } : step
    );

    // Update the selected incident with new steps
    const updatedIncident = { 
      ...selectedIncident, 
      playbookSteps: updatedSteps 
    };
    
    // Update the mockIncidents array (in a real app, this would be an API call)
    mockIncidents[incidentIndex] = updatedIncident;
    
    // Update the selected incident state
    setSelectedIncident(updatedIncident);
    
    // Show a toast notification
    const completedStep = updatedSteps.find(step => step.id === stepId);
    toast({
      title: completedStep?.completed ? "Step Completed" : "Step Marked Incomplete",
      description: completedStep?.title,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Security Incidents</h1>
          <p className="text-muted-foreground">Timeline of security incidents and their status</p>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="space-y-2">
            <Label htmlFor="severity-filter">Filter by Severity</Label>
            <ToggleGroup 
              type="single" 
              value={severityFilter} 
              onValueChange={(value) => setSeverityFilter(value as SeverityType || 'all')}
              className="justify-start"
            >
              <ToggleGroupItem value="all">All</ToggleGroupItem>
              <ToggleGroupItem value="critical">Critical</ToggleGroupItem>
              <ToggleGroupItem value="high">High</ToggleGroupItem>
              <ToggleGroupItem value="medium">Medium</ToggleGroupItem>
            </ToggleGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status-filter">Filter by Status</Label>
            <RadioGroup 
              defaultValue="all"
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as StatusType)}
              className="flex space-x-2"
            >
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="all" id="all-status" />
                <Label htmlFor="all-status">All</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="active" id="active-status" />
                <Label htmlFor="active-status">Active</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="under-investigation" id="under-investigation-status" />
                <Label htmlFor="under-investigation-status">Investigating</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="resolved" id="resolved-status" />
                <Label htmlFor="resolved-status">Resolved</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {filteredIncidents.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
                <h3 className="text-lg font-medium">No incidents match your filters</h3>
                <p className="text-muted-foreground mt-2">Try changing your filter criteria.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredIncidents.map(incident => (
            <Card key={incident.id} className="glass-card">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getSeverityColor(incident.severity)}`}>
                        {incident.severity.toUpperCase()} SEVERITY
                      </span>
                      <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusInfo(incident.status).color}`}>
                        {getStatusInfo(incident.status).label}
                      </span>
                    </div>
                    <CardTitle className="text-xl">{incident.title}</CardTitle>
                    <CardDescription className="mt-1">{incident.description}</CardDescription>
                  </div>
                  <div className="text-sm text-muted-foreground">ID: {incident.id}</div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div className="flex items-start gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium">Detection Time</div>
                      <div className="text-sm">{formatDate(incident.detectionTime)}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium">Resolution Time</div>
                      <div className="text-sm">{formatDate(incident.resolutionTime)}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <User className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium">Assigned Analyst</div>
                      <div className="text-sm">{incident.assignedAnalyst}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <BookOpen className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium">Linked Playbook</div>
                      <div className="text-sm">{incident.linkedPlaybook}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => handleExportReport(incident.id)}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Report
                </Button>
                <Button onClick={() => handleViewDetails(incident)}>
                  <FileEdit className="mr-2 h-4 w-4" />
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* Incident details dialog */}
      <IncidentDetails 
        incident={selectedIncident}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onToggleStep={handleToggleStep}
      />
    </div>
  );
};

export default Incidents;
