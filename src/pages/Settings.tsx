
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle, InfoIcon, Phone } from 'lucide-react';
import { Separator } from "@/components/ui/separator";

const Settings = () => {
  const securityTips = [
    {
      title: "Use Strong, Unique Passwords",
      description: "Create complex passwords with a mix of letters, numbers, and symbols. Use a password manager to generate and store them securely.",
      icon: <Shield className="h-5 w-5 text-safinet-purple" />
    },
    {
      title: "Enable Multi-Factor Authentication (MFA)",
      description: "Add an extra layer of security to your accounts by requiring a second form of verification beyond just your password.",
      icon: <Shield className="h-5 w-5 text-safinet-purple" />
    },
    {
      title: "Keep Software Updated",
      description: "Regularly update your operating system, applications, and antivirus software to protect against known vulnerabilities.",
      icon: <Shield className="h-5 w-5 text-safinet-purple" />
    },
    {
      title: "Be Wary of Phishing Attempts",
      description: "Don't click on suspicious links or download attachments from unknown sources. Verify the sender's identity before responding to requests for sensitive information.",
      icon: <AlertTriangle className="h-5 w-5 text-safinet-red" />
    },
    {
      title: "Secure Your Network",
      description: "Use a strong password for your Wi-Fi network, enable encryption (WPA3 if available), and consider using a VPN when on public networks.",
      icon: <Shield className="h-5 w-5 text-safinet-purple" />
    },
    {
      title: "Back Up Your Data",
      description: "Regularly back up important data to secure locations, following the 3-2-1 rule: 3 copies, 2 different media types, 1 off-site copy.",
      icon: <InfoIcon className="h-5 w-5 text-blue-500" />
    }
  ];

  const helplines = [
    {
      name: "National Cyber Crime Reporting Portal",
      number: "1930",
      website: "cybercrime.gov.in",
      description: "To report cyber crimes online"
    },
    {
      name: "Women Helpline (All India)",
      number: "1091",
      description: "For women-specific cyber crimes"
    },
    {
      name: "Central Bureau of Investigation (CBI)",
      number: "011-24368638",
      website: "cbi.gov.in",
      description: "For interstate cyber crimes"
    },
    {
      name: "Indian Cyber Crime Coordination Centre (I4C)",
      website: "i4c.mha.gov.in",
      description: "Coordination center for cyber crime concerns"
    },
    {
      name: "CERT-In (Indian Computer Emergency Response Team)",
      number: "1800-11-4949",
      website: "cert-in.org.in",
      description: "For reporting cybersecurity incidents"
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings & Security Resources</h1>
      
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            <span>Cybersecurity Best Practices</span>
          </CardTitle>
          <CardDescription>
            Follow these guidelines to protect yourself against cyber threats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityTips.map((tip, index) => (
              <div key={index} className="flex gap-3">
                <div className="mt-0.5">{tip.icon}</div>
                <div>
                  <h3 className="font-medium">{tip.title}</h3>
                  <p className="text-sm text-muted-foreground">{tip.description}</p>
                  {index < securityTips.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-6 w-6" />
            <span>Indian Cybersecurity Helplines</span>
          </CardTitle>
          <CardDescription>
            Official contact information for reporting cyber incidents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {helplines.map((helpline, index) => (
              <div key={index} className="flex flex-col">
                <h3 className="font-medium">{helpline.name}</h3>
                {helpline.number && (
                  <p className="text-sm">
                    <span className="font-medium">Phone:</span> {helpline.number}
                  </p>
                )}
                {helpline.website && (
                  <p className="text-sm">
                    <span className="font-medium">Website:</span> {helpline.website}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">{helpline.description}</p>
                {index < helplines.length - 1 && (
                  <Separator className="my-3" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
