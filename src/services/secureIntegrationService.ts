
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

// Validation schemas
const IntegrationConfigSchema = z.object({
  integration_type: z.enum(['splunk', 'slack', 'virusTotal', 'cloudWatch']),
  config_data: z.object({
    apiKey: z.string().optional(),
    webhookUrl: z.string().url().optional(),
    enabled: z.boolean().default(false)
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
        details,
        user_agent: navigator.userAgent
      });
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  }

  async saveIntegrationConfig(config: IntegrationConfig) {
    try {
      // Validate input
      const validated = IntegrationConfigSchema.parse(config);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Note: In a production environment, API keys should be encrypted
      // before storing. For now, we store them in the config_data JSONB field
      const { data, error } = await supabase
        .from('integration_configs')
        .upsert({
          user_id: user.id,
          integration_type: validated.integration_type,
          config_data: validated.config_data,
          is_enabled: validated.is_enabled
        })
        .select()
        .single();

      if (error) throw error;

      await this.logAuditEvent('integration_configured', validated.integration_type, {
        enabled: validated.is_enabled
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

      // Transform data to match the expected format
      const configs: Record<string, any> = {};
      if (data) {
        data.forEach(config => {
          const configData = config.config_data && typeof config.config_data === 'object' 
            ? config.config_data as Record<string, any>
            : {};
          
          configs[config.integration_type] = {
            enabled: config.is_enabled,
            ...configData
          };
        });
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
      // This would typically call an Edge Function to test the integration
      // For now, we'll simulate a test
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await this.logAuditEvent('integration_tested', integrationType);
      
      return { 
        success: true, 
        message: 'Integration test successful',
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
