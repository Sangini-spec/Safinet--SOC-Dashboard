
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { AlertCircle, Check, Shield, MessageSquareText, Bug, Cloud } from "lucide-react";
import { useToast } from '@/components/ui/use-toast';

// Define proper types for our integrations
interface IntegrationBase {
  enabled: boolean;
}

interface ApiKeyIntegration extends IntegrationBase {
  apiKey: string;
}

interface WebhookIntegration extends IntegrationBase {
  webhookUrl: string;
}

interface FullIntegration extends ApiKeyIntegration, WebhookIntegration {}

interface IntegrationsState {
  siem: FullIntegration;
  slack: WebhookIntegration;
  virusTotal: ApiKeyIntegration;
  cloudWatch: ApiKeyIntegration;
}

interface IntegrationCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  apiKeyLabel?: string;
  webhookLabel?: string;
  requiresApiKey?: boolean;
  requiresWebhook?: boolean;
}

const Integrations = () => {
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState<IntegrationsState>({
    siem: { enabled: false, apiKey: '', webhookUrl: '' },
    slack: { enabled: false, webhookUrl: '' },
    virusTotal: { enabled: false, apiKey: '' },
    cloudWatch: { enabled: false, apiKey: '' }
  });

  const handleToggleChange = (integrationKey: keyof IntegrationsState) => {
    setIntegrations(prev => ({
      ...prev,
      [integrationKey]: {
        ...prev[integrationKey],
        enabled: !prev[integrationKey].enabled
      }
    }));
    
    const integrationName = {
      siem: 'SIEM Tools',
      slack: 'Slack',
      virusTotal: 'VirusTotal',
      cloudWatch: 'AWS CloudWatch'
    }[integrationKey];
    
    toast({
      title: `${integrationName} ${!integrations[integrationKey].enabled ? 'Enabled' : 'Disabled'}`,
      description: `${integrationName} integration has been ${!integrations[integrationKey].enabled ? 'enabled' : 'disabled'}.`,
      variant: !integrations[integrationKey].enabled ? "default" : "destructive",
    });
  };

  const handleInputChange = (
    integrationKey: keyof IntegrationsState,
    field: 'apiKey' | 'webhookUrl',
    value: string
  ) => {
    setIntegrations(prev => ({
      ...prev,
      [integrationKey]: {
        ...prev[integrationKey],
        [field]: value
      }
    }));
  };

  const handleSaveClick = (integrationKey: keyof IntegrationsState) => {
    const integration = integrations[integrationKey];
    
    // Type-safe validation based on the integration type
    let hasValidationError = false;
    
    if (integrationKey === 'siem') {
      const siemIntegration = integration as FullIntegration;
      if (!siemIntegration.apiKey || !siemIntegration.webhookUrl) {
        hasValidationError = true;
      }
    } else if (integrationKey === 'slack') {
      const slackIntegration = integration as WebhookIntegration;
      if (!slackIntegration.webhookUrl) {
        hasValidationError = true;
      }
    } else if (integrationKey === 'virusTotal' || integrationKey === 'cloudWatch') {
      const apiKeyIntegration = integration as ApiKeyIntegration;
      if (!apiKeyIntegration.apiKey) {
        hasValidationError = true;
      }
    }
    
    if (hasValidationError) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Settings Saved",
      description: "Your integration settings have been saved successfully.",
      variant: "default",
    });
  };

  const integrationCards: Array<IntegrationCardProps & { key: keyof IntegrationsState }> = [
    {
      key: 'siem',
      title: 'SIEM Tools',
      description: 'Connect to your Security Information and Event Management tools',
      icon: <Shield className="h-6 w-6" />,
      apiKeyLabel: 'SIEM API Key',
      webhookLabel: 'Webhook URL',
      requiresApiKey: true,
      requiresWebhook: true
    },
    {
      key: 'slack',
      title: 'Slack',
      description: 'Send security alerts to your Slack channels',
      icon: <MessageSquareText className="h-6 w-6" />,
      webhookLabel: 'Slack Webhook URL',
      requiresWebhook: true
    },
    {
      key: 'virusTotal',
      title: 'VirusTotal',
      description: 'Analyze suspicious files and URLs',
      icon: <Bug className="h-6 w-6" />,
      apiKeyLabel: 'VirusTotal API Key',
      requiresApiKey: true
    },
    {
      key: 'cloudWatch',
      title: 'AWS CloudWatch',
      description: 'Monitor and analyze logs from AWS services',
      icon: <Cloud className="h-6 w-6" />,
      apiKeyLabel: 'AWS Access Key',
      requiresApiKey: true
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Integrations</h1>
      <p className="text-muted-foreground">Connect SafiNet with your security tools and services</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrationCards.map(({ key, title, description, icon, apiKeyLabel, webhookLabel, requiresApiKey, requiresWebhook }) => (
          <Card key={key} className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-primary/10 rounded-md">
                  {icon}
                </div>
                <div>
                  <CardTitle className="text-xl">{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </div>
              </div>
              <Switch
                checked={integrations[key].enabled}
                onCheckedChange={() => handleToggleChange(key)}
              />
            </CardHeader>
            <CardContent className={`pt-6 ${!integrations[key].enabled ? 'opacity-50' : ''}`}>
              <div className="space-y-4">
                {requiresApiKey && (
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor={`${key}-api-key`}>{apiKeyLabel}</Label>
                    <Input
                      id={`${key}-api-key`}
                      type="password"
                      placeholder={`Enter ${apiKeyLabel}`}
                      value={key === 'siem' || key === 'virusTotal' || key === 'cloudWatch' 
                        ? (integrations[key] as ApiKeyIntegration | FullIntegration).apiKey 
                        : ''}
                      onChange={(e) => handleInputChange(key, 'apiKey', e.target.value)}
                      disabled={!integrations[key].enabled}
                    />
                  </div>
                )}
                {requiresWebhook && (
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor={`${key}-webhook`}>{webhookLabel}</Label>
                    <Input
                      id={`${key}-webhook`}
                      type="text"
                      placeholder={`Enter ${webhookLabel}`}
                      value={key === 'siem' || key === 'slack'
                        ? (integrations[key] as WebhookIntegration | FullIntegration).webhookUrl
                        : ''}
                      onChange={(e) => handleInputChange(key, 'webhookUrl', e.target.value)}
                      disabled={!integrations[key].enabled}
                    />
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                disabled={!integrations[key].enabled}
                onClick={() => handleSaveClick(key)}
                className="w-full"
              >
                <Check className="mr-2 h-4 w-4" />
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Integrations;
