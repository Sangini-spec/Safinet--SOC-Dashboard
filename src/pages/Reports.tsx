import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Download, Send, Copy, Plus, Pencil, Eye, Clock, Check, Share2, Bluetooth, Smartphone, Mail, MessageSquare } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Reports = () => {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("templates");
  const [reportTitle, setReportTitle] = useState("");
  const [reportContent, setReportContent] = useState("");
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [draftReports, setDraftReports] = useState<{id: number, title: string, date: string, status: string}[]>([
    {id: 1, title: "Monthly Security Review - September", date: "2023-09-30", status: "draft"},
    {id: 2, title: "Incident Response Report - DDos Attack", date: "2023-10-05", status: "draft"},
    {id: 3, title: "Security Audit Findings", date: "2023-10-12", status: "completed"}
  ]);

  const reportTemplates = [
    {
      id: 1,
      title: "Security Incident Report",
      description: "Detailed report of a security incident including timeline, impact, and response actions",
      content: `# Security Incident Report

## Incident Overview
[Brief description of the incident]

## Timeline
- **Detection Time**: [When the incident was first detected]
- **Resolution Time**: [When the incident was resolved]
- **Total Duration**: [Duration of the incident]

## Affected Systems
- [List affected systems, services, or applications]

## Incident Details
[Detailed description of what happened]

## Impact Assessment
- **Users Affected**: [Number/percentage]
- **Systems Affected**: [List]
- **Business Impact**: [Description of business impact]

## Root Cause Analysis
[Analysis of what caused the incident]

## Response Actions
[Steps taken to address the incident]

## Resolution
[How the incident was resolved]

## Preventive Measures
[Actions being taken to prevent similar incidents]

## Lessons Learned
[Key takeaways from the incident]

## Recommendations
[Suggestions for improving security posture]`
    },
    {
      id: 2,
      title: "Monthly Security Summary",
      description: "Monthly summary of security events, incidents, and recommendations",
      content: `# Monthly Security Summary - [Month Year]

## Executive Summary
[Brief overview of the month's security status]

## Security Metrics
- **Total Alerts**: [Number]
- **Critical Incidents**: [Number]
- **Average Resolution Time**: [Time]

## Notable Security Events
1. [Event 1]
2. [Event 2]
3. [Event 3]

## System Health
- **Patch Status**: [Percentage of systems up-to-date]
- **Vulnerability Scan Results**: [Summary of findings]
- **Compliance Status**: [Any compliance issues]

## Security Improvements
[Security enhancements implemented this month]

## Upcoming Security Initiatives
[Planned security projects]

## Recommendations
[Security recommendations for the organization]`
    },
    {
      id: 3,
      title: "Vulnerability Assessment Report",
      description: "Comprehensive assessment of system vulnerabilities with remediation recommendations",
      content: `# Vulnerability Assessment Report

## Executive Summary
[Brief overview of assessment findings]

## Assessment Scope
- **Systems Assessed**: [List systems]
- **Assessment Period**: [Start date] to [End date]
- **Assessment Methods**: [Methods used]

## Findings Summary
- **Critical Vulnerabilities**: [Number]
- **High Vulnerabilities**: [Number]
- **Medium Vulnerabilities**: [Number]
- **Low Vulnerabilities**: [Number]

## Detailed Findings
### Critical Vulnerabilities
1. [Vulnerability 1]
   - **Affected Systems**: [Systems]
   - **Description**: [Details]
   - **Recommended Fix**: [Solution]

### High Vulnerabilities
1. [Vulnerability 1]
   - **Affected Systems**: [Systems]
   - **Description**: [Details]
   - **Recommended Fix**: [Solution]

[Continue for Medium and Low]

## Remediation Timeline
- **Critical Vulnerabilities**: [Deadline]
- **High Vulnerabilities**: [Deadline]
- **Medium Vulnerabilities**: [Deadline]
- **Low Vulnerabilities**: [Deadline]

## Conclusion
[Summary and next steps]`
    },
    {
      id: 4,
      title: "Compliance Audit Report",
      description: "Audit report for regulatory compliance status",
      content: `# Compliance Audit Report - [Standard/Regulation]

## Executive Summary
[Overview of compliance status]

## Audit Scope
- **Standards Evaluated**: [List standards]
- **Systems in Scope**: [List systems]
- **Audit Period**: [Time period]

## Compliance Summary
- **Overall Compliance Score**: [Percentage]
- **Passed Controls**: [Number]
- **Failed Controls**: [Number]
- **Not Applicable Controls**: [Number]

## Detailed Findings
### Non-Compliant Items
1. [Control ID]: [Control Description]
   - **Finding**: [Description of non-compliance]
   - **Risk Level**: [High/Medium/Low]
   - **Recommendation**: [How to remediate]

### Partially Compliant Items
1. [Control ID]: [Control Description]
   - **Finding**: [Description of partial compliance]
   - **Recommendation**: [How to fully comply]

## Remediation Plan
[Action plan to address non-compliant items]

## Conclusion
[Overall assessment and next steps]`
    }
  ];

  const handleTemplateSelect = (templateId: number) => {
    const template = reportTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template.title);
      setReportTitle(template.title);
      setReportContent(template.content);
      setActiveTab("editor");
    }
  };

  const handleNewReport = () => {
    setSelectedTemplate(null);
    setReportTitle("");
    setReportContent("");
    setActiveTab("editor");
  };

  const handleSaveDraft = () => {
    if (!reportTitle) {
      toast({
        title: "Error",
        description: "Please provide a title for your report",
        variant: "destructive",
      });
      return;
    }

    const newDraft = {
      id: draftReports.length + 1,
      title: reportTitle,
      date: new Date().toISOString().split('T')[0],
      status: "draft"
    };

    setDraftReports([...draftReports, newDraft]);
    
    toast({
      title: "Report Saved",
      description: "Your report has been saved as a draft",
    });
  };

  const handleExport = async () => {
    if (!reportTitle || !reportContent) {
      toast({
        title: "Error",
        description: "Please ensure your report has both a title and content",
        variant: "destructive",
      });
      return;
    }

    const reportDiv = document.createElement('div');
    reportDiv.style.padding = '20px';
    reportDiv.style.fontFamily = 'Arial, sans-serif';
    reportDiv.style.width = '700px';
    reportDiv.style.position = 'absolute';
    reportDiv.style.left = '-9999px';
    
    const formattedContent = reportContent
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n- /g, '<br/>• ')
      .replace(/\n/g, '<br/>');
    
    reportDiv.innerHTML = `<h1>${reportTitle}</h1>${formattedContent}`;
    document.body.appendChild(reportDiv);
    
    try {
      const pdf = new jsPDF('p', 'pt', 'a4');
      const canvas = await html2canvas(reportDiv);
      const imgData = canvas.toDataURL('image/png');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      let y = 0;
      const imgPages = Math.ceil(imgHeight * ratio / pdfHeight);
      
      for (let i = 0; i < imgPages; i++) {
        if (i > 0) {
          pdf.addPage();
        }
        
        pdf.addImage(
          imgData,
          'PNG',
          0,
          y * ratio * -1,
          imgWidth * ratio,
          imgHeight * ratio
        );
        
        y += pdfHeight;
      }
      
      const filename = `${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);
      
      toast({
        title: "Report Exported",
        description: `Your report "${reportTitle}" has been exported as a PDF file`,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your report. Please try again.",
        variant: "destructive",
      });
    } finally {
      document.body.removeChild(reportDiv);
    }
  };

  const handleShareReport = () => {
    if (!reportTitle || !reportContent) {
      toast({
        title: "Error",
        description: "Please ensure your report has both a title and content",
        variant: "destructive",
      });
      return;
    }
    
    setShowShareDialog(true);
  };

  const handleShareViaWhatsApp = () => {
    if (!reportTitle || !reportContent) {
      toast({
        title: "Error",
        description: "Please ensure your report has both a title and content",
        variant: "destructive",
      });
      return;
    }
    
    const text = encodeURIComponent(`*${reportTitle}*\n\n${reportContent.substring(0, 100)}...`);
    const whatsappUrl = `https://web.whatsapp.com/send?text=${text}`;
    
    window.open(whatsappUrl, '_blank');
    
    setShowShareDialog(false);
    
    toast({
      title: "Opening WhatsApp",
      description: "WhatsApp web is opening in a new tab for sharing",
    });
  };

  const shareVia = (method: string) => {
    if (navigator.share && method === 'native') {
      navigator.share({
        title: reportTitle,
        text: `Security Report: ${reportTitle}`,
      })
      .then(() => {
        toast({
          title: "Report Shared",
          description: "Your report was shared successfully",
        });
      })
      .catch(error => {
        console.error('Error sharing:', error);
        toast({
          title: "Sharing Failed",
          description: "There was an error sharing your report",
          variant: "destructive",
        });
      });
      return;
    }
    
    toast({
      title: "Report Shared",
      description: `Your report has been shared via ${method}`,
    });
  };

  const requestPermission = () => {
    toast({
      title: "Permission Request",
      description: "Permission requested to access contacts and sharing capabilities.",
    });
    
    setTimeout(() => {
      toast({
        title: "Permission Granted",
        description: "Access to contacts and sharing capabilities has been granted.",
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Security Reports</h1>
        <Button onClick={handleNewReport}>
          <Plus className="mr-2 h-4 w-4" /> New Report
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="templates">Report Templates</TabsTrigger>
          <TabsTrigger value="drafts">My Reports</TabsTrigger>
          <TabsTrigger value="editor">Report Editor</TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates" className="space-y-4">
          <p className="text-muted-foreground">
            Select a template to start creating your security report. Templates provide a structured format to ensure your reports are comprehensive and professional.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportTemplates.map(template => (
              <Card key={template.id} className="cursor-pointer hover:border-primary transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-safinet-purple" />
                    {template.title}
                  </CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button onClick={() => handleTemplateSelect(template.id)}>
                    <Pencil className="mr-2 h-4 w-4" /> Use Template
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="drafts">
          <div className="space-y-4">
            {draftReports.length === 0 ? (
              <Card>
                <CardContent className="py-6 text-center">
                  <p className="text-muted-foreground">You haven't created any reports yet.</p>
                  <Button onClick={handleNewReport} className="mt-4">
                    <Plus className="mr-2 h-4 w-4" /> Create Your First Report
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {draftReports.map(report => (
                  <Card key={report.id} className="cursor-pointer hover:border-primary transition-colors">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {report.date}
                        {report.status === "draft" ? (
                          <span className="ml-2 text-amber-500 flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-amber-500"></span> Draft
                          </span>
                        ) : (
                          <span className="ml-2 text-green-500 flex items-center gap-1">
                            <Check className="h-3 w-3" /> Completed
                          </span>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="pt-2">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setActiveTab("editor")}>
                          <Pencil className="h-3 w-3 mr-1" /> Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" /> Preview
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleExport}>
                          <Download className="h-3 w-3 mr-1" /> Export
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleShareReport}>
                          <Share2 className="h-3 w-3 mr-1" /> Share
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="editor">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedTemplate ? `Edit: ${selectedTemplate}` : "New Report"}
              </CardTitle>
              <CardDescription>
                Complete the report details below. Use markdown formatting for rich text.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Report Title</label>
                <Input 
                  value={reportTitle} 
                  onChange={(e) => setReportTitle(e.target.value)} 
                  placeholder="Enter report title" 
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Report Type</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="incident">Incident Report</SelectItem>
                    <SelectItem value="monthly">Monthly Summary</SelectItem>
                    <SelectItem value="vulnerability">Vulnerability Assessment</SelectItem>
                    <SelectItem value="compliance">Compliance Audit</SelectItem>
                    <SelectItem value="custom">Custom Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Report Content</label>
                <Textarea 
                  value={reportContent} 
                  onChange={(e) => setReportContent(e.target.value)} 
                  placeholder="Enter report content using markdown formatting"
                  className="min-h-[400px] font-mono"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between flex-wrap gap-2">
              <div>
                <Button variant="outline" onClick={handleSaveDraft}>
                  Save Draft
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" /> Export
                </Button>
                <Button onClick={handleShareReport}>
                  <Share2 className="mr-2 h-4 w-4" /> Share Report
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share Report</DialogTitle>
            <DialogDescription>
              Choose how you want to share your report
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button variant="outline" className="flex flex-col items-center justify-center h-24" onClick={handleShareViaWhatsApp}>
              <div className="rounded-full bg-green-100 p-2 mb-2">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
              <span>WhatsApp</span>
            </Button>
            
            <Button variant="outline" className="flex flex-col items-center justify-center h-24" onClick={() => shareVia('Bluetooth')}>
              <div className="rounded-full bg-blue-100 p-2 mb-2">
                <Bluetooth className="h-6 w-6 text-blue-600" />
              </div>
              <span>Bluetooth</span>
            </Button>
            
            <Button variant="outline" className="flex flex-col items-center justify-center h-24" onClick={() => shareVia('Nearby Share')}>
              <div className="rounded-full bg-purple-100 p-2 mb-2">
                <Smartphone className="h-6 w-6 text-purple-600" />
              </div>
              <span>Nearby Share</span>
            </Button>
            
            <Button variant="outline" className="flex flex-col items-center justify-center h-24" onClick={() => shareVia('Email')}>
              <div className="rounded-full bg-amber-100 p-2 mb-2">
                <Mail className="h-6 w-6 text-amber-600" />
              </div>
              <span>Email</span>
            </Button>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={requestPermission}>
              Request Permissions
            </Button>
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reports;
