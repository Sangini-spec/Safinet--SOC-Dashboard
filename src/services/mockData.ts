
import { Alert } from '@/components/dashboard/AlertsTable';

// Mock alerts data
export const getMockAlerts = (): Alert[] => [
  {
    id: "alert-001",
    type: "Brute Force Attack",
    description: "Multiple failed login attempts detected from IP 192.168.1.34",
    source: "Firewall",
    timestamp: "2025-04-09 15:32:45",
    status: "New",
    severity: "critical",
    isMock: true
  },
  {
    id: "alert-002",
    type: "Malware Detected",
    description: "Suspicious file detected in user download folder",
    source: "AntiVirus",
    timestamp: "2025-04-09 14:26:12",
    status: "In Progress",
    severity: "high",
    isMock: true
  },
  {
    id: "alert-003",
    type: "Suspicious Network Traffic",
    description: "Unusual outbound traffic to known malicious IP",
    source: "IDS",
    timestamp: "2025-04-09 13:15:33",
    status: "New", 
    severity: "high",
    isMock: true
  },
  {
    id: "alert-004",
    type: "Unauthorized Access Attempt",
    description: "Attempt to access restricted file server from unregistered device",
    source: "File Server",
    timestamp: "2025-04-09 12:58:05",
    status: "New",
    severity: "medium",
    isMock: true
  },
  {
    id: "alert-005",
    type: "Configuration Change",
    description: "Firewall rules modified outside of change window",
    source: "Change Management",
    timestamp: "2025-04-09 11:42:19",
    status: "In Progress",
    severity: "low",
    isMock: true
  }
];

// Mock live alerts data
export const getLiveAlerts = (): Alert[] => [
  {
    id: "live-001",
    type: "Credential Stuffing Attack",
    description: "Authentication API receiving high volume of login attempts with different credentials",
    source: "API Gateway",
    timestamp: "2025-04-09 15:47:21",
    status: "New",
    severity: "critical"
  },
  {
    id: "live-002",
    type: "SQL Injection Attempt",
    description: "Malformed SQL queries detected in web application requests",
    source: "WAF",
    timestamp: "2025-04-09 15:35:08",
    status: "New",
    severity: "high"
  },
  {
    id: "live-003",
    type: "Data Exfiltration",
    description: "Large volume of data being transferred to external endpoint",
    source: "DLP",
    timestamp: "2025-04-09 15:12:56", 
    status: "In Progress",
    severity: "high"
  }
];

// Mock analytics data
export const getAnalyticsData = () => {
  return {
    incidentsByType: [
      { name: "Malware", value: 35 },
      { name: "Phishing", value: 25 },
      { name: "Unauthorized Access", value: 20 },
      { name: "Data Breach", value: 10 },
      { name: "DDoS", value: 10 }
    ],
    responseTimeByDay: [
      { name: "Mon", time: 45 },
      { name: "Tue", time: 32 },
      { name: "Wed", time: 38 },
      { name: "Thu", time: 25 },
      { name: "Fri", time: 29 },
      { name: "Sat", time: 42 },
      { name: "Sun", time: 47 }
    ],
    securityPosture: 78,
    criticalAlerts: 3,
    totalIncidents: 142,
    resolvedIncidents: 124
  };
};

// Mock playbooks data
export const getPlaybooks = () => [
  {
    id: "playbook-001",
    title: "Ransomware Response",
    steps: [
      { title: "Identify and isolate infected systems", completed: false },
      { title: "Assess the scope and impact", completed: false },
      { title: "Notify relevant stakeholders", completed: false },
      { title: "Restore from clean backups", completed: false },
      { title: "Conduct post-incident analysis", completed: false }
    ],
    assignee: "Security Team",
    severity: "critical"
  },
  {
    id: "playbook-002",
    title: "Phishing Attack Response",
    steps: [
      { title: "Analyze the phishing email", completed: false },
      { title: "Identify affected users", completed: false },
      { title: "Reset credentials for compromised accounts", completed: false },
      { title: "Block the sender domain", completed: false },
      { title: "Educate users on phishing awareness", completed: false }
    ],
    assignee: "SOC Team",
    severity: "high"
  },
  {
    id: "playbook-003",
    title: "Data Breach Response",
    steps: [
      { title: "Identify the source and extent of the breach", completed: false },
      { title: "Contain the breach", completed: false },
      { title: "Document all breached data", completed: false },
      { title: "Notify required authorities", completed: false },
      { title: "Communicate with affected customers", completed: false },
      { title: "Implement remediation measures", completed: false }
    ],
    assignee: "Incident Response Team",
    severity: "critical"
  }
];

// Mock logs data
export const getLogs = () => [
  {
    id: "log-001",
    timestamp: "2025-04-09T15:32:45.231Z",
    level: "ERROR",
    source: "auth-service",
    message: "Failed login attempt for user admin from IP 192.168.1.34",
    raw: "Apr 9 15:32:45 auth-service[1234]: ERROR: Failed login attempt for user admin from IP 192.168.1.34 - Reason: Invalid password (attempt 5 of 5)",
    metadata: {
      user: "admin",
      ipAddress: "192.168.1.34",
      attempts: 5
    }
  },
  {
    id: "log-002",
    timestamp: "2025-04-09T15:32:44.187Z",
    level: "ERROR",
    source: "auth-service",
    message: "Failed login attempt for user admin from IP 192.168.1.34",
    raw: "Apr 9 15:32:44 auth-service[1234]: ERROR: Failed login attempt for user admin from IP 192.168.1.34 - Reason: Invalid password (attempt 4 of 5)",
    metadata: {
      user: "admin",
      ipAddress: "192.168.1.34",
      attempts: 4
    }
  },
  {
    id: "log-003",
    timestamp: "2025-04-09T15:32:42.892Z",
    level: "ERROR",
    source: "auth-service",
    message: "Failed login attempt for user admin from IP 192.168.1.34",
    raw: "Apr 9 15:32:42 auth-service[1234]: ERROR: Failed login attempt for user admin from IP 192.168.1.34 - Reason: Invalid password (attempt 3 of 5)",
    metadata: {
      user: "admin",
      ipAddress: "192.168.1.34",
      attempts: 3
    }
  },
  {
    id: "log-004",
    timestamp: "2025-04-09T15:32:40.554Z",
    level: "ERROR",
    source: "auth-service",
    message: "Failed login attempt for user admin from IP 192.168.1.34",
    raw: "Apr 9 15:32:40 auth-service[1234]: ERROR: Failed login attempt for user admin from IP 192.168.1.34 - Reason: Invalid password (attempt 2 of 5)",
    metadata: {
      user: "admin",
      ipAddress: "192.168.1.34",
      attempts: 2
    }
  },
  {
    id: "log-005",
    timestamp: "2025-04-09T15:32:38.123Z",
    level: "ERROR",
    source: "auth-service",
    message: "Failed login attempt for user admin from IP 192.168.1.34",
    raw: "Apr 9 15:32:38 auth-service[1234]: ERROR: Failed login attempt for user admin from IP 192.168.1.34 - Reason: Invalid password (attempt 1 of 5)",
    metadata: {
      user: "admin",
      ipAddress: "192.168.1.34",
      attempts: 1
    }
  },
  {
    id: "log-006",
    timestamp: "2025-04-09T15:30:12.435Z",
    level: "INFO",
    source: "file-server",
    message: "File server backup completed successfully",
    raw: "Apr 9 15:30:12 file-server[5678]: INFO: Backup job completed successfully - 1245 files (2.3GB) backed up in 00:05:23",
    metadata: {
      fileCount: 1245,
      size: "2.3GB",
      duration: "00:05:23"
    }
  }
];
