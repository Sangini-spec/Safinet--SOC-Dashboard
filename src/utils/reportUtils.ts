
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { IncidentDetail } from '@/components/incidents/IncidentDetails';

const formatDate = (date: Date | null): string => {
  if (!date) return 'N/A';
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const generateIncidentPDF = async (incident: IncidentDetail): Promise<void> => {
  // Create a temporary div to render our report content
  const reportDiv = document.createElement('div');
  reportDiv.className = 'report-content';
  reportDiv.style.padding = '40px';
  reportDiv.style.fontFamily = 'Arial, sans-serif';
  reportDiv.style.width = '800px';
  reportDiv.style.position = 'absolute';
  reportDiv.style.left = '-9999px';
  reportDiv.style.backgroundColor = '#ffffff';
  reportDiv.style.color = '#000000';
  
  // Get severity and status display info
  const getSeverityDisplay = (severity: string) => {
    switch (severity) {
      case 'critical': return 'CRITICAL';
      case 'high': return 'HIGH';
      case 'medium': return 'MEDIUM';
      case 'low': return 'LOW';
      default: return severity.toUpperCase();
    }
  };
  
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'under-investigation': return 'Under Investigation';
      case 'resolved': return 'Resolved';
      default: return status;
    }
  };
  
  // Calculate playbook completion
  const completedSteps = incident.playbookSteps.filter(step => step.completed).length;
  const completionPercentage = Math.round((completedSteps / incident.playbookSteps.length) * 100);
  
  // Generate HTML content for the report
  reportDiv.innerHTML = `
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="font-size: 24px; color: #000;">${incident.title}</h1>
      <p style="color: #666;">Incident ID: ${incident.id}</p>
    </div>
    
    <div style="margin-bottom: 30px;">
      <h2 style="font-size: 18px; margin-bottom: 15px; color: #000;">Incident Summary</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; width: 30%;"><strong>Severity</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${getSeverityDisplay(incident.severity)}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Status</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${getStatusDisplay(incident.status)}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Detection Time</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${formatDate(incident.detectionTime)}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Resolution Time</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${formatDate(incident.resolutionTime)}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Assigned Analyst</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${incident.assignedAnalyst}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Location</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${incident.location.name}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Incident Type</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${incident.linkedPlaybook} Incident</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Description</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${incident.description}</td>
        </tr>
      </table>
    </div>
    
    <div style="margin-bottom: 30px;">
      <h2 style="font-size: 18px; margin-bottom: 15px; color: #000;">Response Playbook: ${incident.linkedPlaybook}</h2>
      <p>Completion: ${completionPercentage}% (${completedSteps}/${incident.playbookSteps.length} steps completed)</p>
      <ul style="padding-left: 20px;">
        ${incident.playbookSteps.map(step => `
          <li style="margin-bottom: 8px; ${step.completed ? 'text-decoration: line-through; color: #666;' : ''}">
            ${step.title} ${step.completed ? '✓' : ''}
          </li>
        `).join('')}
      </ul>
    </div>
    
    <div style="margin-bottom: 30px;">
      <h2 style="font-size: 18px; margin-bottom: 15px; color: #000;">Geographic Location</h2>
      <p>Location: ${incident.location.name}</p>
      <p>Coordinates: ${incident.location.latitude}, ${incident.location.longitude}</p>
    </div>
    
    <div style="margin-top: 40px; font-size: 10px; color: #666; text-align: center;">
      <p>Generated on ${new Date().toLocaleString()} by SafiNet Security System</p>
    </div>
  `;
  
  document.body.appendChild(reportDiv);
  
  try {
    const pdf = new jsPDF('p', 'pt', 'a4');
    const canvas = await html2canvas(reportDiv, {
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = pageWidth - 40;
    const imgHeight = (imgWidth / canvas.width) * canvas.height;
    
    // Add content to PDF
    let heightLeft = imgHeight;
    let position = 20;
    
    // First page
    pdf.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight);
    heightLeft -= pdf.internal.pageSize.getHeight() - 40;
    
    // Add more pages if needed
    while (heightLeft > 0) {
      position = pdf.internal.pageSize.getHeight() - imgHeight + position;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight);
      heightLeft -= pdf.internal.pageSize.getHeight() - 40;
    }
    
    // Save the PDF
    const filename = `Incident_Report_${incident.id}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF report");
  } finally {
    document.body.removeChild(reportDiv);
  }
};
