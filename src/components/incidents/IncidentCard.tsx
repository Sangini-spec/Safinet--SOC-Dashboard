
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileEdit, Download, Clock, User, BookOpen } from 'lucide-react';
import { IncidentDetail } from './IncidentDetails';

interface IncidentCardProps {
  incident: IncidentDetail;
  onViewDetails: (incident: IncidentDetail) => void;
  onExportReport: (incidentId: string) => void;
}

const IncidentCard = ({ incident, onViewDetails, onExportReport }: IncidentCardProps) => {
  
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

  return (
    <Card className="glass-card">
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
        <Button variant="outline" onClick={() => onExportReport(incident.id)}>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
        <Button onClick={() => onViewDetails(incident)}>
          <FileEdit className="mr-2 h-4 w-4" />
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default IncidentCard;
