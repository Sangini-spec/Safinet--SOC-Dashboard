
import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import IncidentDetails from '@/components/incidents/IncidentDetails';
import IncidentCard from '@/components/incidents/IncidentCard';
import IncidentFilters, { SeverityType, StatusType } from '@/components/incidents/IncidentFilters';
import EmptyState from '@/components/incidents/EmptyState';
import { mockIncidents, filterIncidents, updatePlaybookStep } from '@/services/incidentService';
import { IncidentDetail } from '@/components/incidents/IncidentDetails';

const Incidents = () => {
  const { toast } = useToast();
  const [severityFilter, setSeverityFilter] = useState<SeverityType>('all');
  const [statusFilter, setStatusFilter] = useState<StatusType>('all');
  const [selectedIncident, setSelectedIncident] = useState<IncidentDetail | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // Filter incidents based on current filters
  const filteredIncidents = filterIncidents(mockIncidents, severityFilter, statusFilter);
  
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

    // Update the step in our data service
    const updatedIncident = updatePlaybookStep(
      selectedIncident.id, 
      stepId, 
      !selectedIncident.playbookSteps.find(step => step.id === stepId)?.completed
    );
    
    if (updatedIncident) {
      // Update the selected incident state
      setSelectedIncident(updatedIncident);
      
      // Show a toast notification
      const completedStep = updatedIncident.playbookSteps.find(step => step.id === stepId);
      toast({
        title: completedStep?.completed ? "Step Completed" : "Step Marked Incomplete",
        description: completedStep?.title,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Security Incidents</h1>
          <p className="text-muted-foreground">Timeline of security incidents and their status</p>
        </div>
        
        <IncidentFilters
          severityFilter={severityFilter}
          setSeverityFilter={setSeverityFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
      </div>
      
      <div className="space-y-4">
        {filteredIncidents.length === 0 ? (
          <EmptyState />
        ) : (
          filteredIncidents.map(incident => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              onViewDetails={handleViewDetails}
              onExportReport={handleExportReport}
            />
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
