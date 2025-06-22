
import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { IntegrationsState } from '@/types/integrations';
import IntegrationCard from '@/components/integrations/IntegrationCard';
import integrationCardsConfig from '@/config/integrationCards';
import { getIntegrationName, validateIntegration } from '@/utils/integrationUtils';
import { secureIntegrationService } from '@/services/secureIntegrationService';
import { useSecureSession } from '@/hooks/useSecureSession';
import { rateLimiter, RATE_LIMITS } from '@/utils/rateLimiter';

const Integrations = () => {
  const { toast } = useToast();
  useSecureSession(); // Enable session timeout protection
  
  const [integrations, setIntegrations] = useState<IntegrationsState>({
    splunk: { enabled: false, apiKey: '', webhookUrl: '' },
    slack: { enabled: false, webhookUrl: '' },
    virusTotal: { enabled: false, apiKey: '' },
    cloudWatch: { enabled: false, apiKey: '' }
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  // Load existing configurations on mount
  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      const { data, error } = await secureIntegrationService.getIntegrationConfigs();
      if (error) {
        toast({
          title: "Error Loading Integrations",
          description: error,
          variant: "destructive",
        });
        return;
      }
      
      if (data) {
        setIntegrations(prevState => ({
          ...prevState,
          ...data
        }));
      }
    } catch (error) {
      console.error('Failed to load integrations:', error);
      toast({
        title: "Error",
        description: "Failed to load integration configurations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
    // Basic input validation and sanitization
    const sanitizedValue = value.trim().substring(0, 500); // Limit length
    
    setIntegrations(prev => ({
      ...prev,
      [integrationKey]: {
        ...prev[integrationKey],
        [field]: sanitizedValue
      }
    }));
  };

  const handleSaveClick = async (integrationKey: keyof IntegrationsState) => {
    const integration = integrations[integrationKey];
    
    // Check rate limiting
    const userId = 'current_user'; // Would get from auth context
    if (!rateLimiter.isAllowed(`${userId}:save`, RATE_LIMITS.INTEGRATION_SAVE)) {
      const waitTime = rateLimiter.getWaitTime(`${userId}:save`, RATE_LIMITS.INTEGRATION_SAVE);
      toast({
        title: "Rate Limit Exceeded",
        description: `Please wait ${Math.ceil(waitTime / 1000)} seconds before saving again.`,
        variant: "destructive",
      });
      return;
    }
    
    const isValid = validateIntegration(integrationKey, integration);
    
    if (!isValid) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields with valid data.",
        variant: "destructive",
      });
      return;
    }
    
    setSaving(integrationKey);
    
    try {
      const configData: any = { enabled: integration.enabled };
      
      if ('apiKey' in integration && integration.apiKey) {
        configData.apiKey = integration.apiKey;
      }
      if ('webhookUrl' in integration && integration.webhookUrl) {
        configData.webhookUrl = integration.webhookUrl;
      }
      
      const { data, error } = await secureIntegrationService.saveIntegrationConfig({
        integration_type: integrationKey,
        config_data: configData,
        is_enabled: integration.enabled
      });
      
      if (error) {
        toast({
          title: "Save Failed",
          description: error,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Settings Saved",
        description: "Your integration settings have been saved securely.",
        variant: "default",
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Save Failed",
        description: "An error occurred while saving your settings.",
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Integrations</h1>
        <div className="text-center py-8">
          <p>Loading integrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Integrations</h1>
        <p className="text-muted-foreground">Connect SafiNet with your security tools and services</p>
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-700">
            🔒 All API keys are encrypted and stored securely. Integration data is protected with enterprise-grade security.
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrationCardsConfig.map(({ key, title, description, icon, apiKeyLabel, webhookLabel, requiresApiKey, requiresWebhook }) => {
          const typedKey = key as keyof IntegrationsState;
          const isCurrentlySaving = saving === typedKey;
          
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
              disabled={isCurrentlySaving}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Integrations;
