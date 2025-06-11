import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

// Enhanced validation schemas with better security
const IncidentCreateSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title too long')
    .regex(/^[a-zA-Z0-9\s\-_.,!?]+$/, 'Title contains invalid characters'),
  description: z.string()
    .max(2000, 'Description too long')
    .regex(/^[a-zA-Z0-9\s\-_.,!?\n\r]+$/, 'Description contains invalid characters')
    .optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  status: z.enum(['active', 'under-investigation', 'resolved', 'closed']).default('active'),
  assigned_analyst_id: z.string().uuid().optional(),
  location_data: z.object({
    name: z.string().max(100),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180)
  }).optional(),
  playbook_data: z.array(z.object({
    id: z.string().uuid(),
    title: z.string().max(200),
    completed: z.boolean()
  })).optional()
});

const IncidentUpdateSchema = IncidentCreateSchema.partial().extend({
  id: z.string().uuid()
});

export type IncidentCreate = z.infer<typeof IncidentCreateSchema>;
export type IncidentUpdate = z.infer<typeof IncidentUpdateSchema>;

class SecureIncidentService {
  private async logAuditEvent(action: string, resourceId: string, details?: any) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action,
        resource_type: 'incident',
        resource_id: resourceId,
        details,
        user_agent: navigator.userAgent
      });
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  }

  private sanitizeIncidentData(data: any): any {
    return {
      ...data,
      title: this.sanitizeText(data.title),
      description: data.description ? this.sanitizeText(data.description) : undefined,
      location_data: data.location_data ? {
        name: this.sanitizeText(data.location_data.name),
        latitude: Number(data.location_data.latitude),
        longitude: Number(data.location_data.longitude)
      } : undefined
    };
  }

  private sanitizeText(text: string): string {
    return text
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  }

  async createIncident(incidentData: IncidentCreate) {
    try {
      // Validate input
      const validated = IncidentCreateSchema.parse(incidentData);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Sanitize the data
      const sanitized = this.sanitizeIncidentData(validated);

      // Prepare the data for database insertion
      const insertData = {
        title: sanitized.title,
        description: sanitized.description,
        severity: sanitized.severity,
        status: sanitized.status || 'active',
        assigned_analyst_id: sanitized.assigned_analyst_id,
        location_data: sanitized.location_data,
        playbook_data: sanitized.playbook_data,
        created_by: user.id
      };

      const { data, error } = await supabase
        .from('incidents')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      await this.logAuditEvent('incident_created', data.id, {
        title: data.title,
        severity: data.severity
      });

      return { data, error: null };
    } catch (error) {
      console.error('Error creating incident:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to create incident' 
      };
    }
  }

  async updateIncident(incidentData: IncidentUpdate) {
    try {
      // Validate input
      const validated = IncidentUpdateSchema.parse(incidentData);
      const { id, ...updateData } = validated;

      // Sanitize the data
      const sanitized = this.sanitizeIncidentData(updateData);

      const { data, error } = await supabase
        .from('incidents')
        .update(sanitized)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await this.logAuditEvent('incident_updated', id, sanitized);

      return { data, error: null };
    } catch (error) {
      console.error('Error updating incident:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to update incident' 
      };
    }
  }

  async sendNotification(incidentId: string, notificationType: 'email' | 'sms' | 'slack', recipients: string[], message: string) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('User not authenticated');
      }

      // Use the secure proxy for sending notifications
      const response = await fetch('/functions/v1/secure-integration-proxy', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          integrationType: notificationType,
          action: 'send',
          data: {
            recipients,
            message: this.sanitizeText(message),
            incidentId
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send notification');
      }

      const result = await response.json();
      
      await this.logAuditEvent('notification_sent', incidentId, {
        type: notificationType,
        recipients: recipients.length
      });

      return { success: true, data: result };
    } catch (error) {
      console.error('Error sending notification:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send notification' 
      };
    }
  }

  async getIncidents(filters?: {
    severity?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    try {
      let query = supabase
        .from('incidents')
        .select(`
          *,
          assigned_analyst:assigned_analyst_id(full_name),
          created_by_profile:created_by(id)
        `)
        .order('created_at', { ascending: false });

      if (filters?.severity && filters.severity !== 'all') {
        query = query.eq('severity', filters.severity);
      }

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching incidents:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch incidents' 
      };
    }
  }

  async getIncidentById(id: string) {
    try {
      const { data, error } = await supabase
        .from('incidents')
        .select(`
          *,
          assigned_analyst:assigned_analyst_id(full_name, email),
          created_by_profile:created_by(id)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching incident:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch incident' 
      };
    }
  }

  async deleteIncident(id: string) {
    try {
      const { error } = await supabase
        .from('incidents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await this.logAuditEvent('incident_deleted', id);

      return { error: null };
    } catch (error) {
      console.error('Error deleting incident:', error);
      return { 
        error: error instanceof Error ? error.message : 'Failed to delete incident' 
      };
    }
  }
}

export const secureIncidentService = new SecureIncidentService();

}
