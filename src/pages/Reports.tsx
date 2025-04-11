import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { FileText, Download, Plus, Pencil, Eye, Clock, Check } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Reports = () => {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("templates");
  const [reportTitle, setReportTitle] = useState("");
  const [reportContent, setReportContent] = useState("");
  const [reportType, setReportType] = useState("");
  const [draftReports, setDraftReports] = useState<{id: number, title: string, date: string, status: string, content: string, type: string}[]>([
    {id: 1, title: "Monthly Security Review - September", date: "2023-09-30", status: "draft", content: "", type: "monthly"},
    {id: 2, title: "Incident Response Report - DDos Attack", date: "2023-10-05", status: "draft", content: "", type: "incident"},
    {id: 3, title: "Security Audit Findings", date: "2023-10-12", status: "completed", content: "", type: "compliance"}
  ]);
  const [currentDraftId, setCurrentDraftId] = useState<number | null>(null);

  useEffect(() => {
    const savedDrafts = localStorage.getItem('securityReportDrafts');
    if (savedDrafts) {
      try {
        setDraftReports(JSON.parse(savedDrafts));
      } catch (e) {
        console.error("Error parsing saved drafts:", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('securityReportDrafts', JSON.stringify(draftReports));
  }, [draftReports]);

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
[Suggestions for improving security posture]`,
      type: "incident"
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
[Security recommendations for the organization]`,
      type: "monthly"
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
[Summary and next steps]`,
      type: "vulnerability"
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
[Overall assessment and next steps]`,
      type: "compliance"
    }
  ];

  const handleTemplateSelect = (templateId: number) => {
    const template = reportTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template.title);
      setReportTitle(template.title);
      setReportContent(template.content);
      setReportType(template.type);
      setCurrentDraftId(null);
      setActiveTab("editor");
    }
  };

  const handleNewReport = () => {
    setSelectedTemplate(null);
    setReportTitle("");
    setReportContent("");
    setReportType("");
    setCurrentDraftId(null);
    setActiveTab("editor");
  };

  const handleEditDraft = (reportId: number) => {
    const draft = draftReports.find(r => r.id === reportId);
    if (draft) {
      setReportTitle(draft.title);
      setReportContent(draft.content || "");
      setReportType(draft.type || "");
      setCurrentDraftId(draft.id);
      setActiveTab("editor");
    }
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

    const currentDate = new Date().toISOString().split('T')[0];
    
    if (currentDraftId) {
      const updatedDrafts = draftReports.map(draft => 
        draft.id === currentDraftId 
          ? { ...draft, title: reportTitle, content: reportContent, type: reportType, date: currentDate }
          : draft
      );
      setDraftReports(updatedDrafts);
    } else {
      const newDraft = {
        id: Date.now(),
        title: reportTitle,
        content: reportContent,
        type: reportType,
        date: currentDate,
        status: "draft"
      };
      setDraftReports([...draftReports, newDraft]);
      setCurrentDraftId(newDraft.id);
    }
    
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
    reportDiv.className = 'report-content';
    reportDiv.style.padding = '40px';
    reportDiv.style.fontFamily = 'Arial, sans-serif';
    reportDiv.style.width = '800px';
    reportDiv.style.position = 'absolute';
    reportDiv.style.left = '-9999px';
    
    const formattedContent = reportContent
      .replace(/^# (.*$)/gm, '<h1 style="font-size: 24px; font-weight: bold; margin-top: 24px; margin-bottom: 16px; color: #000;">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 style="font-size: 20px; font-weight: bold; margin-top: 20px; margin-bottom: 14px; color: #222;">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 style="font-size: 18px; font-weight: bold; margin-top: 18px; margin-bottom: 12px; color: #333;">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n- (.*)/g, '<br/>• $1')
      .replace(/\n/g, '<br/>');
    
    reportDiv.innerHTML = `
      <h1 style="font-size: 28px; font-weight: bold; margin-bottom: 20px; text-align: center; color: #000;">${reportTitle}</h1>
      <div style="margin-top: 30px;">
        ${formattedContent}
      </div>
    `;
    
    document.body.appendChild(reportDiv);
    
    try {
      const pdf = new jsPDF('p', 'pt', 'a4');
      const contentWidth = reportDiv.offsetWidth;
      const contentHeight = reportDiv.offsetHeight;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const pdfHeight = pageHeight - 40;
      
      const canvas = await html2canvas(reportDiv, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - 40;
      const imgHeight = (imgWidth / contentWidth) * contentHeight;
      
      let position = 20;
      pdf.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight);
      
      let remainingHeight = imgHeight - pdfHeight;
      let currentPosition = pdfHeight;
      
      while (remainingHeight > 0) {
        position = position - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight);
        remainingHeight -= pdfHeight;
        currentPosition += pdfHeight;
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
                        <Button size="sm" variant="outline" onClick={() => handleEditDraft(report.id)}>
                          <Pencil className="h-3 w-3 mr-1" /> Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" /> Preview
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleExport}>
                          <Download className="h-3 w-3 mr-1" /> Export
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
                {currentDraftId ? `Edit: ${reportTitle}` : (selectedTemplate ? `Edit: ${selectedTemplate}` : "New Report")}
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
                <Select value={reportType} onValueChange={setReportType}>
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
                <Button onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" /> Export Report
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
