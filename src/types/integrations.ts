
// Define proper types for our integrations
export interface IntegrationBase {
  enabled: boolean;
}

export interface ApiKeyIntegration extends IntegrationBase {
  apiKey: string;
}

export interface WebhookIntegration extends IntegrationBase {
  webhookUrl: string;
}

export interface FullIntegration extends ApiKeyIntegration, WebhookIntegration {}

export interface IntegrationsState {
  splunk: FullIntegration;
  slack: WebhookIntegration;
  virusTotal: ApiKeyIntegration;
  cloudWatch: ApiKeyIntegration;
}

export interface IntegrationCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  apiKeyLabel?: string;
  webhookLabel?: string;
  requiresApiKey?: boolean;
  requiresWebhook?: boolean;
}
