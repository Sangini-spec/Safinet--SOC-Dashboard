
import { IncidentDetail } from '@/components/incidents/IncidentDetails';

// Extended mock incident data with location and playbook steps
export const mockIncidents: IncidentDetail[] = [
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

// This function will filter incidents based on severity and status
export const filterIncidents = (
  incidents: IncidentDetail[],
  severityFilter: string,
  statusFilter: string
) => {
  return incidents.filter(incident => {
    const matchesSeverity = severityFilter === 'all' || incident.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;
    return matchesSeverity && matchesStatus;
  });
};

// Service to update the playbook step status
export const updatePlaybookStep = (
  incidentId: string, 
  stepId: string, 
  completed: boolean
): IncidentDetail | null => {
  const incidentIndex = mockIncidents.findIndex(inc => inc.id === incidentId);
  if (incidentIndex === -1) return null;
  
  const updatedSteps = mockIncidents[incidentIndex].playbookSteps.map(step => 
    step.id === stepId ? { ...step, completed } : step
  );
  
  mockIncidents[incidentIndex] = {
    ...mockIncidents[incidentIndex],
    playbookSteps: updatedSteps
  };
  
  return mockIncidents[incidentIndex];
};
