
import React from 'react';
import { Database, MessageSquareText, Bug, Cloud } from "lucide-react";
import { IntegrationCardProps } from "@/types/integrations";

const integrationCardsConfig: Array<IntegrationCardProps & { key: string }> = [
  {
    key: 'splunk',
    title: 'Splunk',
    description: 'Connect to your Splunk instance for advanced security analytics',
    icon: <Database className="h-6 w-6" />,
    apiKeyLabel: 'Splunk API Key',
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

export default integrationCardsConfig;
