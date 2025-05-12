
import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { IntegrationsState } from '@/types/integrations';
import IntegrationCard from '@/components/integrations/IntegrationCard';
import integrationCardsConfig from '@/config/integrationCards';
import { getIntegrationName, validateIntegration } from '@/utils/integrationUtils';

const Integrations = () => {
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState<IntegrationsState>({
    splunk: { enabled: false, apiKey: '', webhookUrl: '' },
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
    
    const integrationName = getIntegrationName(integrationKey);
    
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
    
    const isValid = validateIntegration(integrationKey, integration);
    
    if (!isValid) {
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Integrations</h1>
      <p className="text-muted-foreground">Connect SafiNet with your security tools and services</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrationCardsConfig.map(({ key, title, description, icon, apiKeyLabel, webhookLabel, requiresApiKey, requiresWebhook }) => {
          const typedKey = key as keyof IntegrationsState;
          return (
            <IntegrationCard
              key={key}
              keyName={key}
              title={title}
              description={description}
              icon={icon}
              apiKeyLabel={apiKeyLabel}
              webhookLabel={webhookLabel}
              requiresApiKey={requiresApiKey}
              requiresWebhook={requiresWebhook}
              enabled={integrations[typedKey].enabled}
              apiKeyValue={
                requiresApiKey ? 
                  'apiKey' in integrations[typedKey] ? integrations[typedKey].apiKey as string : '' 
                : undefined
              }
              webhookValue={
                requiresWebhook ?
                  'webhookUrl' in integrations[typedKey] ? integrations[typedKey].webhookUrl as string : ''
                : undefined
              }
              onToggleChange={() => handleToggleChange(typedKey)}
              onInputChange={(field, value) => handleInputChange(typedKey, field, value)}
              onSave={() => handleSaveClick(typedKey)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Integrations;
