
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Check, Shield, Eye, EyeOff } from "lucide-react";
import { IntegrationCardProps } from "@/types/integrations";

interface ExtendedIntegrationCardProps extends IntegrationCardProps {
  keyName: string;
  enabled: boolean;
  apiKeyValue?: string;
  webhookValue?: string;
  onToggleChange: () => void;
  onInputChange: (field: 'apiKey' | 'webhookUrl', value: string) => void;
  onSave: () => void;
  disabled?: boolean;
}

const IntegrationCard: React.FC<ExtendedIntegrationCardProps> = ({
  keyName,
  title,
  description,
  icon,
  apiKeyLabel,
  webhookLabel,
  requiresApiKey,
  requiresWebhook,
  enabled,
  apiKeyValue = '',
  webhookValue = '',
  onToggleChange,
  onInputChange,
  onSave,
  disabled = false
}) => {
  const [showApiKey, setShowApiKey] = React.useState(false);
  const [localApiKey, setLocalApiKey] = React.useState(apiKeyValue);
  const [localWebhook, setLocalWebhook] = React.useState(webhookValue);

  // Update local state when props change
  React.useEffect(() => {
    setLocalApiKey(apiKeyValue);
    setLocalWebhook(webhookValue);
  }, [apiKeyValue, webhookValue]);

  const handleApiKeyChange = (value: string) => {
    // Basic sanitization - remove potentially dangerous characters
    const sanitized = value.replace(/[<>'"]/g, '').trim();
    setLocalApiKey(sanitized);
    onInputChange('apiKey', sanitized);
  };

  const handleWebhookChange = (value: string) => {
    // Basic URL validation and sanitization
    const sanitized = value.trim();
    setLocalWebhook(sanitized);
    onInputChange('webhookUrl', sanitized);
  };

  const validateUrl = (url: string): boolean => {
    if (!url) return false;
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  };

  const isWebhookValid = !requiresWebhook || !localWebhook || validateUrl(localWebhook);
  const isApiKeyValid = !requiresApiKey || !localApiKey || localApiKey.length >= 10;

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-primary/10 rounded-md">
            {icon}
          </div>
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              {title}
              <Shield className="h-4 w-4 text-green-600" />
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={onToggleChange}
          disabled={disabled}
        />
      </CardHeader>
      <CardContent className={`pt-6 ${!enabled ? 'opacity-50' : ''}`}>
        <div className="space-y-4">
          {requiresApiKey && (
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor={`${keyName}-api-key`} className="flex items-center gap-2">
                {apiKeyLabel}
                <Shield className="h-3 w-3 text-green-600" />
              </Label>
              <div className="relative">
                <Input
                  id={`${keyName}-api-key`}
                  type={showApiKey ? "text" : "password"}
                  placeholder={`Enter ${apiKeyLabel}`}
                  value={localApiKey}
                  onChange={(e) => handleApiKeyChange(e.target.value)}
                  disabled={!enabled || disabled}
                  className={!isApiKeyValid ? 'border-red-300' : ''}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-7 w-7 p-0"
                  onClick={() => setShowApiKey(!showApiKey)}
                  disabled={!enabled || disabled}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {!isApiKeyValid && localApiKey && (
                <p className="text-xs text-red-600">API key must be at least 10 characters</p>
              )}
            </div>
          )}
          {requiresWebhook && (
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor={`${keyName}-webhook`}>{webhookLabel}</Label>
              <Input
                id={`${keyName}-webhook`}
                type="url"
                placeholder={`Enter ${webhookLabel}`}
                value={localWebhook}
                onChange={(e) => handleWebhookChange(e.target.value)}
                disabled={!enabled || disabled}
                className={!isWebhookValid ? 'border-red-300' : ''}
              />
              {!isWebhookValid && localWebhook && (
                <p className="text-xs text-red-600">Please enter a valid HTTPS URL</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          disabled={!enabled || disabled || !isApiKeyValid || !isWebhookValid}
          onClick={onSave}
          className="w-full"
        >
          <Check className="mr-2 h-4 w-4" />
          {disabled ? 'Saving...' : 'Save Settings'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default IntegrationCard;
