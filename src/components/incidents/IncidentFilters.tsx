
import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

type SeverityType = 'critical' | 'high' | 'medium' | 'low' | 'all';
type StatusType = 'active' | 'under-investigation' | 'resolved' | 'all';

interface IncidentFiltersProps {
  severityFilter: SeverityType;
  setSeverityFilter: (value: SeverityType) => void;
  statusFilter: StatusType;
  setStatusFilter: (value: StatusType) => void;
}

const IncidentFilters = ({
  severityFilter,
  setSeverityFilter,
  statusFilter,
  setStatusFilter
}: IncidentFiltersProps) => {
  return (
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
  );
};

export type { SeverityType, StatusType };
export default IncidentFilters;
