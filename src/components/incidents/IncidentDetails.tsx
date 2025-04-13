
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, Clock, MapPin, User, Shield, BookOpen, FileText } from "lucide-react";

// Define the step interface
interface PlaybookStep {
  id: string;
  title: string;
  completed: boolean;
}

// Define the incident interface with location data
export interface IncidentDetail {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'active' | 'under-investigation' | 'resolved';
  detectionTime: Date;
  resolutionTime: Date | null;
  assignedAnalyst: string;
  linkedPlaybook: string;
  description: string;
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  playbookSteps: PlaybookStep[];
}

interface IncidentDetailsProps {
  incident: IncidentDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleStep: (stepId: string) => void;
}

const IncidentDetails = ({
  incident,
  isOpen,
  onClose,
  onToggleStep
}: IncidentDetailsProps) => {
  if (!incident) return null;

  // Calculate playbook completion percentage
  const completedSteps = incident.playbookSteps.filter(step => step.completed).length;
  const completionPercentage = Math.round((completedSteps / incident.playbookSteps.length) * 100);

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

  // Format date
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{incident.title}</DialogTitle>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getSeverityColor(incident.severity)}`}>
                {incident.severity.toUpperCase()} SEVERITY
              </span>
              <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusInfo(incident.status).color}`}>
                {getStatusInfo(incident.status).label}
              </span>
            </div>
          </div>
        </DialogHeader>

        {/* Incident Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Incident Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <User className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">Assigned Analyst</div>
                    <div className="text-sm">{incident.assignedAnalyst}</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">Detection Time</div>
                    <div className="text-sm">{formatDate(incident.detectionTime)}</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">Location</div>
                    <div className="text-sm">{incident.location.name}</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">Incident Type</div>
                    <div className="text-sm">{incident.linkedPlaybook} Incident</div>
                  </div>
                </div>
                
                <div className="col-span-1 md:col-span-2">
                  <div className="flex items-start gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium">Description</div>
                      <div className="text-sm">{incident.description}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Geographic Location Map */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Geographic Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-72 rounded-md overflow-hidden border border-gray-200">
                <iframe 
                  className="w-full h-full"
                  src={`https://maps.google.com/maps?q=${incident.location.latitude},${incident.location.longitude}&z=6&output=embed`} 
                  frameBorder="0" 
                  scrolling="no" 
                  title="Incident Location Map"
                ></iframe>
              </div>
            </CardContent>
          </Card>

          {/* Playbook Steps */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Response Playbook</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{incident.linkedPlaybook}</span>
                </div>
                <Badge variant="outline" className="ml-2">
                  {completedSteps}/{incident.playbookSteps.length} Steps Completed
                </Badge>
              </div>
              
              <div>
                <span className="text-sm">
                  Progress: {completionPercentage}%
                </span>
                <Progress 
                  value={completionPercentage} 
                  className="h-2 mt-1" 
                />
              </div>
              
              <Separator />
              
              <div className="space-y-3 mt-2">
                {incident.playbookSteps.map((step) => (
                  <div 
                    key={step.id}
                    className={`flex items-start gap-3 p-3 rounded-md border ${
                      step.completed ? 'border-green-500/30 bg-green-500/5' : 'border-border'
                    }`}
                  >
                    <Checkbox 
                      id={`step-${step.id}`}
                      checked={step.completed}
                      onCheckedChange={() => onToggleStep(step.id)}
                    />
                    <div className="space-y-1">
                      <label 
                        htmlFor={`step-${step.id}`}
                        className={`font-medium ${step.completed ? 'line-through opacity-70' : ''}`}
                      >
                        {step.title}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <DialogFooter className="pt-2">
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default IncidentDetails;
