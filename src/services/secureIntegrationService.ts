
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
    // Ensure at least one required field is present
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action,
        resource_type: 'integration',
        resource_id: integrationType,
        details: sanitizeJSON(details),
        user_agent: navigator.userAgent.substring(0, 500)
      });
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  }

  private async checkRateLimit(userId: string, action: string): Promise<boolean> {
    const key = `${userId}:${action}`;
    return rateLimiter.isAllowed(key, RATE_LIMITS.INTEGRATION_SAVE);
  }

  async saveIntegrationConfig(config: IntegrationConfig) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check rate limiting
      const canProceed = await this.checkRateLimit(user.id, 'save_integration');
      if (!canProceed) {
        const waitTime = rateLimiter.getWaitTime(`${user.id}:save_integration`, RATE_LIMITS.INTEGRATION_SAVE);
        throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`);
      }

      // Validate input with enhanced schema
      const validated = IntegrationConfigSchema.parse(config);
      
      // Encrypt API key if present
      let configData = { ...validated.config_data };
      if (configData.apiKey) {
        configData.apiKey = await encryptionService.encryptApiKey(configData.apiKey);
      }

      // Sanitize webhook URL
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

      if (error) throw error;

      await this.logAuditEvent('integration_configured', validated.integration_type, {
        enabled: validated.is_enabled,
        hasApiKey: !!validated.config_data.apiKey,
        hasWebhook: !!validated.config_data.webhookUrl
      });

      return { data, error: null };
    } catch (error) {
      console.error('Error saving integration config:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to save integration config' 
      };
    }
  }

  async getIntegrationConfigs() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('integration_configs')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      // Transform data and decrypt API keys
      const configs: Record<string, any> = {};
      if (data) {
        for (const config of data) {
          const configData = config.config_data && typeof config.config_data === 'object' 
            ? config.config_data as Record<string, any>
            : {};
          
          // Decrypt API key if present
          if (configData.apiKey) {
            try {
              configData.apiKey = await encryptionService.decryptApiKey(configData.apiKey);
            } catch (error) {
              console.error('Failed to decrypt API key:', error);
              configData.apiKey = ''; // Reset if decryption fails
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
      console.error('Error fetching integration configs:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch integration configs' 
      };
    }
  }

  async getIntegrationConfig(integrationType: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Validate integration type
      if (!['splunk', 'slack', 'virusTotal', 'cloudWatch'].includes(integrationType)) {
        throw new Error('Invalid integration type');
      }

      const { data, error } = await supabase
        .from('integration_configs')
        .select('*')
        .eq('user_id', user.id)
        .eq('integration_type', integrationType)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        return { 
          data: { enabled: false }, 
          error: null 
        };
      }

      const configData = data.config_data && typeof data.config_data === 'object' 
        ? data.config_data as Record<string, any>
        : {};

      // Decrypt API key if present
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
      console.error('Error fetching integration config:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch integration config' 
      };
    }
  }

  async testIntegration(integrationType: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check rate limiting for testing
      const canProceed = await this.checkRateLimit(user.id, 'test_integration');
      if (!canProceed) {
        throw new Error('Rate limit exceeded for integration testing');
      }

      // Call the secure integration proxy edge function
      const { data, error } = await supabase.functions.invoke('secure-integration-proxy', {
        body: {
          integrationType,
          action: 'test',
          data: {}
        }
      });

      if (error) throw error;
      
      await this.logAuditEvent('integration_tested', integrationType, {
        success: data.success
      });
      
      return { 
        success: data.success, 
        message: data.message || 'Integration test completed',
        error: null 
      };
    } catch (error) {
      console.error('Error testing integration:', error);
      return { 
        success: false,
        message: 'Integration test failed',
        error: error instanceof Error ? error.message : 'Test failed' 
      };
    }
  }
}

export const secureIntegrationService = new SecureIntegrationService();
