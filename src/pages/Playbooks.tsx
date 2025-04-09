
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
import { BookOpen, ArrowRight, UserCircle } from 'lucide-react';

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
                
                <div>
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
                  <Button>Mark Complete</Button>
                  <Button variant="outline">Export Steps</Button>
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
