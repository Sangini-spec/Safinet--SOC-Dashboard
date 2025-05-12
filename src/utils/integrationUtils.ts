
import { IntegrationsState } from "@/types/integrations";

export const getIntegrationName = (integrationKey: keyof IntegrationsState): string => {
  const integrationNames = {
    splunk: 'Splunk',
    slack: 'Slack',
    virusTotal: 'VirusTotal',
    cloudWatch: 'AWS CloudWatch'
  };
  
  return integrationNames[integrationKey];
};

export const validateIntegration = (
  integrationKey: keyof IntegrationsState,
  integration: any
): boolean => {
  // Type-safe validation based on the integration type
  if (integrationKey === 'splunk') {
    return !!integration.apiKey && !!integration.webhookUrl;
  } else if (integrationKey === 'slack') {
    return !!integration.webhookUrl;
  } else if (integrationKey === 'virusTotal' || integrationKey === 'cloudWatch') {
    return !!integration.apiKey;
  }
  
  return false;
};
