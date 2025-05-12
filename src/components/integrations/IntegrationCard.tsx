
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { IntegrationCardProps } from "@/types/integrations";

interface ExtendedIntegrationCardProps extends IntegrationCardProps {
  keyName: string;
  enabled: boolean;
  apiKeyValue?: string;
  webhookValue?: string;
  onToggleChange: () => void;
  onInputChange: (field: 'apiKey' | 'webhookUrl', value: string) => void;
  onSave: () => void;
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
  onSave
}) => {
  return (
    <Card className="glass-card">
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
          checked={enabled}
          onCheckedChange={onToggleChange}
        />
      </CardHeader>
      <CardContent className={`pt-6 ${!enabled ? 'opacity-50' : ''}`}>
        <div className="space-y-4">
          {requiresApiKey && (
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor={`${keyName}-api-key`}>{apiKeyLabel}</Label>
              <Input
                id={`${keyName}-api-key`}
                type="password"
                placeholder={`Enter ${apiKeyLabel}`}
                value={apiKeyValue}
                onChange={(e) => onInputChange('apiKey', e.target.value)}
                disabled={!enabled}
              />
            </div>
          )}
          {requiresWebhook && (
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor={`${keyName}-webhook`}>{webhookLabel}</Label>
              <Input
                id={`${keyName}-webhook`}
                type="text"
                placeholder={`Enter ${webhookLabel}`}
                value={webhookValue}
                onChange={(e) => onInputChange('webhookUrl', e.target.value)}
                disabled={!enabled}
              />
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          disabled={!enabled}
          onClick={onSave}
          className="w-full"
        >
          <Check className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </CardFooter>
    </Card>
  );
};

export default IntegrationCard;
