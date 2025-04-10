
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { getPlaybooks } from '@/services/mockData';
import { BookOpen, ArrowRight, UserCircle, Download } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface Step {
  title: string;
  completed: boolean;
}

interface Playbook {
  id: string;
  title: string;
  steps: Step[];
  assignee: string;
  severity: string;
}

const Playbooks = () => {
  const [playbooks, setPlaybooks] = useState(getPlaybooks());
  const [activePlaybook, setActivePlaybook] = useState<Playbook | null>(null);

  const handleSelectPlaybook = (playbook: Playbook) => {
    setActivePlaybook(playbook);
  };

  const handleToggleStep = (stepIndex: number) => {
    if (!activePlaybook) return;
    
    const updatedPlaybook = {
      ...activePlaybook,
      steps: activePlaybook.steps.map((step, index) => 
        index === stepIndex ? { ...step, completed: !step.completed } : step
      )
    };
    
    setActivePlaybook(updatedPlaybook);
    
    const updatedPlaybooks = playbooks.map((playbook) => 
      playbook.id === activePlaybook.id ? updatedPlaybook : playbook
    );
    
    setPlaybooks(updatedPlaybooks);
  };

  const handleMarkAllComplete = () => {
    if (!activePlaybook) return;

    const updatedPlaybook = {
      ...activePlaybook,
      steps: activePlaybook.steps.map(step => ({ ...step, completed: true }))
    };

    setActivePlaybook(updatedPlaybook);
    
    const updatedPlaybooks = playbooks.map((playbook) => 
      playbook.id === activePlaybook.id ? updatedPlaybook : playbook
    );
    
    setPlaybooks(updatedPlaybooks);
  };

  const handleExportSteps = async () => {
    if (!activePlaybook) return;

    try {
      // Create a temporary wrapper with white background and good spacing
      const tempWrapper = document.createElement('div');
      tempWrapper.style.padding = '20px';
      tempWrapper.style.background = 'white';
      tempWrapper.style.width = '700px';
      tempWrapper.style.fontFamily = 'Arial, sans-serif';
      tempWrapper.innerHTML = `
        <h1 style="font-size: 24px; margin-bottom: 15px; color: #333;">${activePlaybook.title} Playbook</h1>
        <p style="margin-bottom: 10px; color: #666;">Assigned to: ${activePlaybook.assignee}</p>
        <p style="margin-bottom: 15px; color: #666;">Severity: ${activePlaybook.severity}</p>
        <hr style="margin: 15px 0; border: 0; border-top: 1px solid #ddd;" />
        <h2 style="font-size: 18px; margin: 15px 0; color: #333;">Response Steps:</h2>
      `;

      // Create a list of steps with checkboxes and ensure headings are properly styled
      const stepsList = document.createElement('div');
      activePlaybook.steps.forEach((step, index) => {
        const stepElement = document.createElement('div');
        stepElement.style.padding = '10px';
        stepElement.style.marginBottom = '10px';
        stepElement.style.border = '1px solid #eee';
        stepElement.style.borderRadius = '4px';
        
        // Ensure the step title is styled as a heading and stands out
        stepElement.innerHTML = `
          <div style="display: flex; align-items: flex-start; gap: 10px;">
            <div style="width: 20px; height: 20px; border: 1px solid #999; border-radius: 4px; display: flex; align-items: center; justify-content: center; background: ${step.completed ? '#4c6ef5' : 'white'}; margin-top: 3px;">
              ${step.completed ? '✓' : ''}
            </div>
            <div style="width: 100%;">
              <h3 style="font-weight: 600; margin: 0 0 8px 0; font-size: 16px; color: #333;">${step.title}</h3>
              <p style="color: #666; font-size: 14px; margin: 5px 0 0 0; line-height: 1.4;">
                ${index === 0 ? "Immediately isolate affected systems to prevent further spread of the threat." : 
                  index === 1 ? "Document all affected systems and determine the blast radius of the incident." :
                  index === 2 ? "Notify key stakeholders including management, legal, and PR teams." :
                  index === 3 ? "Follow your backup restoration procedures to recover clean systems." :
                  "Document lessons learned and update security measures to prevent recurrence."}
              </p>
            </div>
          </div>
        `;
        stepsList.appendChild(stepElement);
      });

      tempWrapper.appendChild(stepsList);

      // Add completion status
      const completionStatus = document.createElement('div');
      completionStatus.style.marginTop = '20px';
      completionStatus.style.padding = '10px';
      completionStatus.style.backgroundColor = '#f5f5f5';
      completionStatus.style.borderRadius = '4px';

      const completedSteps = activePlaybook.steps.filter(step => step.completed).length;
      const progressPercentage = Math.round((completedSteps / activePlaybook.steps.length) * 100);
      
      completionStatus.innerHTML = `
        <p style="margin: 0; font-weight: 500;">Completion Status: ${progressPercentage}%</p>
      `;
      
      tempWrapper.appendChild(completionStatus);

      // Add the temp wrapper to the DOM temporarily
      document.body.appendChild(tempWrapper);

      // Generate canvas from the temp wrapper
      const canvas = await html2canvas(tempWrapper, {
        scale: 2, // Higher scale for better quality
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: true, // Allow content from other domains
        removeContainer: true // Clean up the temporarily created container
      });

      // Remove the temporary element
      document.body.removeChild(tempWrapper);

      // Create PDF with A4 dimensions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Calculate the height and width to maintain aspect ratio
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add the image to the PDF
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Download the PDF
      pdf.save(`${activePlaybook.title.replace(/\s+/g, '_')}_playbook.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const getCompletionPercentage = (steps: Step[]) => {
    const completed = steps.filter((step) => step.completed).length;
    return (completed / steps.length) * 100;
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge className="bg-safinet-red text-white">Critical</Badge>;
      case "high":
        return <Badge className="bg-safinet-orange text-white">High</Badge>;
      case "medium":
        return <Badge className="bg-yellow-500 text-white">Medium</Badge>;
      case "low":
        return <Badge className="bg-green-500 text-white">Low</Badge>;
      default:
        return <Badge>{severity}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Response Playbooks</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Playbook list */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Available Playbooks</h2>
          
          {playbooks.map((playbook) => (
            <Card 
              key={playbook.id}
              className={`
                cursor-pointer hover:border-primary/50 transition-all
                ${activePlaybook?.id === playbook.id ? 'border-primary' : ''}
              `}
              onClick={() => handleSelectPlaybook(playbook)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-safinet-purple" />
                      <h3 className="font-medium">{playbook.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {playbook.assignee}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getSeverityBadge(playbook.severity)}
                      <span className="text-xs text-muted-foreground">
                        {playbook.steps.length} steps
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="mt-3">
                  <Progress value={getCompletionPercentage(playbook.steps)} className="h-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Playbook details */}
        <div className="lg:col-span-2">
          {activePlaybook ? (
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{activePlaybook.title}</CardTitle>
                  {getSeverityBadge(activePlaybook.severity)}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Overview</h3>
                  <p className="text-muted-foreground text-sm">
                    This playbook provides a step-by-step response plan for {activePlaybook.title.toLowerCase()} incidents.
                    Follow these procedures to effectively contain and resolve the security threat.
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <UserCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Assigned to: {activePlaybook.assignee}</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-sm">
                      Progress: {Math.round(getCompletionPercentage(activePlaybook.steps))}%
                    </span>
                    <Progress 
                      value={getCompletionPercentage(activePlaybook.steps)} 
                      className="h-2 mt-1" 
                    />
                  </div>
                </div>
                
                <div id="playbook-export-content">
                  <h3 className="text-sm font-medium mb-2">Response Steps</h3>
                  <div className="space-y-3">
                    {activePlaybook.steps.map((step, index) => (
                      <div 
                        key={index}
                        className={`flex items-start gap-3 p-3 rounded-md border ${
                          step.completed ? 'border-green-500/30 bg-green-500/5' : 'border-border'
                        }`}
                      >
                        <Checkbox 
                          id={`step-${index}`}
                          checked={step.completed}
                          onCheckedChange={() => handleToggleStep(index)}
                        />
                        <div className="space-y-1">
                          <label 
                            htmlFor={`step-${index}`}
                            className={`font-medium ${step.completed ? 'line-through opacity-70' : ''}`}
                          >
                            {step.title}
                          </label>
                          <p className="text-xs text-muted-foreground">
                            {index === 0 ? "Immediately isolate affected systems to prevent further spread of the threat." : 
                             index === 1 ? "Document all affected systems and determine the blast radius of the incident." :
                             index === 2 ? "Notify key stakeholders including management, legal, and PR teams." :
                             index === 3 ? "Follow your backup restoration procedures to recover clean systems." :
                             "Document lessons learned and update security measures to prevent recurrence."}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button onClick={handleMarkAllComplete}>Mark Complete</Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Mark all steps as complete</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" onClick={handleExportSteps}>
                          <Download className="h-4 w-4 mr-2" />
                          Export Steps
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Download steps as PDF</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <BookOpen className="h-16 w-16 text-muted mx-auto mb-4" />
                <h3 className="text-lg font-medium">Select a Playbook</h3>
                <p className="text-muted-foreground mt-1">
                  Choose a playbook from the list to view its details and steps
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Playbooks;
