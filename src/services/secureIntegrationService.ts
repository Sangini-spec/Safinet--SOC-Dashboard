
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import { encryptionService } from './encryptionService';
import { rateLimiter, RATE_LIMITS } from '@/utils/rateLimiter';
import { sanitizeJSON } from '@/utils/securityUtils';

// Enhanced validation schemas with stricter rules
const IntegrationConfigSchema = z.object({
  integration_type: z.enum(['splunk', 'slack', 'virusTotal', 'cloudWatch']),
  config_data: z.object({
    apiKey: z.string().min(1).max(500).optional(),
    webhookUrl: z.string().url().max(2000).optional(),
    enabled: z.boolean().default(false)
  }).refine(data => {
    return data.apiKey || data.webhookUrl;
  }, {
    message: "Either apiKey or webhookUrl must be provided"
  }),
  is_enabled: z.boolean().default(false)
});

export type IntegrationConfig = z.infer<typeof IntegrationConfigSchema>;

class SecureIntegrationService {
  private async logAuditEvent(action: string, integrationType: string, details?: any) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.warn('Unable to log audit event - user not authenticated');
        return;
      }

      const { error } = await supabase.from('audit_logs').insert({
        user_id: user.id,
        action,
        resource_type: 'integration',
        resource_id: integrationType,
        details: sanitizeJSON(details),
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 500) : null
      });

      if (error) {
        console.error('Failed to log audit event:', error);
      }
    } catch (error) {
      console.error('Audit logging error:', error);
    }
  }

  private async checkRateLimit(userId: string, action: string): Promise<boolean> {
    const key = `${userId}:${action}`;
    return rateLimiter.isAllowed(key, RATE_LIMITS.INTEGRATION_SAVE);
  }

  async saveIntegrationConfig(config: IntegrationConfig) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        throw new Error(`Authentication error: ${userError.message}`);
      }
      if (!user) {
        throw new Error('User not authenticated');
      }

      const canProceed = await this.checkRateLimit(user.id, 'save_integration');
      if (!canProceed) {
        const waitTime = rateLimiter.getWaitTime(`${user.id}:save_integration`, RATE_LIMITS.INTEGRATION_SAVE);
        throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`);
      }

      const validated = IntegrationConfigSchema.parse(config);
      
      let configData = { ...validated.config_data };
      if (configData.apiKey) {
        configData.apiKey = await encryptionService.encryptApiKey(configData.apiKey);
      }

      if (configData.webhookUrl) {
        const url = new URL(configData.webhookUrl);
        if (!['http:', 'https:'].includes(url.protocol)) {
          throw new Error('Invalid webhook URL protocol');
        }
        configData.webhookUrl = url.toString();
      }

      const { data, error } = await supabase
        .from('integration_configs')
        .upsert({
          user_id: user.id,
          integration_type: validated.integration_type,
          config_data: configData,
          is_enabled: validated.is_enabled
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      await this.logAuditEvent('integration_configured', validated.integration_type, {
        enabled: validated.is_enabled,
        hasApiKey: !!validated.config_data.apiKey,
        hasWebhook: !!validated.config_data.webhookUrl
      });

      return { data, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save integration config';
      console.error('Error saving integration config:', errorMessage);
      return { 
        data: null, 
        error: errorMessage
      };
    }
  }

  async getIntegrationConfigs() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        throw new Error(`Authentication error: ${userError.message}`);
      }
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('integration_configs')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      const configs: Record<string, any> = {};
      if (data && Array.isArray(data)) {
        for (const config of data) {
          const configData = config.config_data && typeof config.config_data === 'object' 
            ? config.config_data as Record<string, any>
            : {};
          
          if (configData.apiKey) {
            try {
              configData.apiKey = await encryptionService.decryptApiKey(configData.apiKey);
            } catch (error) {
              console.error('Failed to decrypt API key:', error);
              configData.apiKey = '';
            }
          }
          
          configs[config.integration_type] = {
            enabled: config.is_enabled,
            ...configData
          };
        }
      }

      return { data: configs, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch integration configs';
      console.error('Error fetching integration configs:', errorMessage);
      return { 
        data: null, 
        error: errorMessage
      };
    }
  }

  async getIntegrationConfig(integrationType: string) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        throw new Error(`Authentication error: ${userError.message}`);
      }
      if (!user) {
        throw new Error('User not authenticated');
      }

      if (!['splunk', 'slack', 'virusTotal', 'cloudWatch'].includes(integrationType)) {
        throw new Error('Invalid integration type');
      }

      const { data, error } = await supabase
        .from('integration_configs')
        .select('*')
        .eq('user_id', user.id)
        .eq('integration_type', integrationType)
        .maybeSingle();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data) {
        return { 
          data: { enabled: false }, 
          error: null 
        };
      }

      const configData = data.config_data && typeof data.config_data === 'object' 
        ? data.config_data as Record<string, any>
        : {};

      if (configData.apiKey) {
        try {
          configData.apiKey = await encryptionService.decryptApiKey(configData.apiKey);
        } catch (error) {
          console.error('Failed to decrypt API key:', error);
          configData.apiKey = '';
        }
      }

      const config = {
        enabled: data.is_enabled,
        ...configData
      };

      return { data: config, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch integration config';
      console.error('Error fetching integration config:', errorMessage);
      return { 
        data: null, 
        error: errorMessage
      };
    }
  }

  async testIntegration(integrationType: string) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        throw new Error(`Authentication error: ${userError.message}`);
      }
      if (!user) {
        throw new Error('User not authenticated');
      }

      const canProceed = await this.checkRateLimit(user.id, 'test_integration');
      if (!canProceed) {
        throw new Error('Rate limit exceeded for integration testing');
      }

      const { data, error } = await supabase.functions.invoke('secure-integration-proxy', {
        body: {
          integrationType,
          action: 'test',
          data: {}
        }
      });

      if (error) {
        throw new Error(`Function invocation error: ${error.message}`);
      }
      
      await this.logAuditEvent('integration_tested', integrationType, {
        success: data?.success || false
      });
      
      return { 
        success: data?.success || false, 
        message: data?.message || 'Integration test completed',
        error: null 
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Test failed';
      console.error('Error testing integration:', errorMessage);
      return { 
        success: false,
        message: 'Integration test failed',
        error: errorMessage
      };
    }
  }
}

export const secureIntegrationService = new SecureIntegrationService();
