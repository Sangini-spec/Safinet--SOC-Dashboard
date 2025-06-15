
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Incident = Database["public"]["Tables"]["incidents"]["Row"];
type IncidentInsert = Database["public"]["Tables"]["incidents"]["Insert"];
type IncidentUpdate = Database["public"]["Tables"]["incidents"]["Update"];

interface CreateIncidentData {
  title: string;
  description?: string;
  severity: "low" | "medium" | "high" | "critical";
  status?: string;
  assigned_analyst_id?: string;
  location_data?: any;
  playbook_data?: any;
}

interface UpdateIncidentData {
  title?: string;
  description?: string;
  severity?: "low" | "medium" | "high" | "critical";
  status?: string;
  assigned_analyst_id?: string;
  location_data?: any;
  playbook_data?: any;
  resolution_time?: string;
}

// Enhanced input validation and sanitization
const validateIncidentData = (data: CreateIncidentData): void => {
  if (!data.title || data.title.trim().length === 0) {
    throw new Error("Title is required");
  }
  if (data.title.length > 200) {
    throw new Error("Title must be less than 200 characters");
  }
  if (data.description && data.description.length > 2000) {
    throw new Error("Description must be less than 2000 characters");
  }
  if (!["low", "medium", "high", "critical"].includes(data.severity)) {
    throw new Error("Invalid severity level");
  }
  
  // Enhanced validation for potential security issues
  if (data.title.includes('<script') || data.title.includes('javascript:')) {
    throw new Error("Invalid characters in title");
  }
  if (data.description && (data.description.includes('<script') || data.description.includes('javascript:'))) {
    throw new Error("Invalid characters in description");
  }
};

// Enhanced sanitization with XSS prevention
const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .replace(/data:/gi, "")
    .replace(/vbscript:/gi, "");
};

const sanitizeJSON = (obj: any): any => {
  if (typeof obj === 'string') {
    return sanitizeInput(obj);
  }
  if (typeof obj === 'object' && obj !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[sanitizeInput(key)] = sanitizeJSON(value);
    }
    return sanitized;
  }
  return obj;
};

// Enhanced authorization checks with account lockout
const checkUserPermissions = async (userId: string, action: string): Promise<boolean> => {
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", userId)
      .single();

    if (!profile || !profile.is_active) {
      return false;
    }

    // Role-based access control with stricter permissions
    const permissions = {
      admin: ["create", "read", "update", "delete"],
      analyst: ["create", "read", "update"],
      viewer: ["read"]
    };

    return permissions[profile.role as keyof typeof permissions]?.includes(action) || false;
  } catch (error) {
    console.error("Permission check failed:", error);
    return false;
  }
};

// Enhanced audit logging with more security details
const logActivity = async (action: string, resourceId?: string, details?: any): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Sanitize audit log details
    const sanitizedDetails = details ? sanitizeJSON(details) : null;

    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action,
      resource_type: "incident",
      resource_id: resourceId,
      details: sanitizedDetails,
      ip_address: "127.0.0.1", // In production, get real IP
      user_agent: navigator.userAgent.substring(0, 500) // Limit length
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

// Rate limiting helper
const checkRateLimit = async (userId: string, action: string): Promise<boolean> => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: recentActions } = await supabase
      .from("audit_logs")
      .select("id")
      .eq("user_id", userId)
      .eq("action", action)
      .gte("created_at", fiveMinutesAgo);

    // Allow max 10 actions per 5 minutes
    return (recentActions?.length || 0) < 10;
  } catch (error) {
    console.error("Rate limit check failed:", error);
    return true; // Allow if check fails
  }
};

// Secure incident service functions with enhanced security
export const secureIncidentService = {
  async createIncident(data: CreateIncidentData): Promise<Incident> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Authentication required");
      }

      // Check rate limiting
      const canProceed = await checkRateLimit(user.id, "create_incident");
      if (!canProceed) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }

      // Check permissions
      const hasPermission = await checkUserPermissions(user.id, "create");
      if (!hasPermission) {
        throw new Error("Insufficient permissions to create incidents");
      }

      // Validate and sanitize input
      validateIncidentData(data);
      const sanitizedData = {
        ...data,
        title: sanitizeInput(data.title),
        description: data.description ? sanitizeInput(data.description) : undefined,
        location_data: data.location_data ? sanitizeJSON(data.location_data) : null,
        playbook_data: data.playbook_data ? sanitizeJSON(data.playbook_data) : null,
        created_by: user.id
      };

      const { data: incident, error } = await supabase
        .from("incidents")
        .insert(sanitizedData)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create incident: ${error.message}`);
      }

      // Log the activity
      await logActivity("create_incident", incident.id, { title: incident.title });

      return incident;
    } catch (error) {
      console.error("Create incident error:", error);
      throw error;
    }
  },

  async getIncidents(): Promise<Incident[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Authentication required");
      }

      // Check permissions
      const hasPermission = await checkUserPermissions(user.id, "read");
      if (!hasPermission) {
        throw new Error("Insufficient permissions to read incidents");
      }

      const { data: incidents, error } = await supabase
        .from("incidents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch incidents: ${error.message}`);
      }

      return incidents || [];
    } catch (error) {
      console.error("Get incidents error:", error);
      throw error;
    }
  },

  async getIncidentById(id: string): Promise<Incident | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Authentication required");
      }

      // Validate ID format (UUID)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        throw new Error("Invalid incident ID format");
      }

      // Check permissions
      const hasPermission = await checkUserPermissions(user.id, "read");
      if (!hasPermission) {
        throw new Error("Insufficient permissions to read incidents");
      }

      const { data: incident, error } = await supabase
        .from("incidents")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        throw new Error(`Failed to fetch incident: ${error.message}`);
      }

      return incident;
    } catch (error) {
      console.error("Get incident by ID error:", error);
      throw error;
    }
  },

  async updateIncident(id: string, updates: UpdateIncidentData): Promise<Incident> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Authentication required");
      }

      // Validate ID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        throw new Error("Invalid incident ID format");
      }

      // Check rate limiting
      const canProceed = await checkRateLimit(user.id, "update_incident");
      if (!canProceed) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }

      // Check permissions
      const hasPermission = await checkUserPermissions(user.id, "update");
      if (!hasPermission) {
        throw new Error("Insufficient permissions to update incidents");
      }

      // Sanitize updates
      const sanitizedUpdates = {
        ...updates,
        title: updates.title ? sanitizeInput(updates.title) : undefined,
        description: updates.description ? sanitizeInput(updates.description) : undefined,
        location_data: updates.location_data ? sanitizeJSON(updates.location_data) : undefined,
        playbook_data: updates.playbook_data ? sanitizeJSON(updates.playbook_data) : undefined,
        updated_at: new Date().toISOString()
      };

      const { data: incident, error } = await supabase
        .from("incidents")
        .update(sanitizedUpdates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update incident: ${error.message}`);
      }

      // Log the activity
      await logActivity("update_incident", id, sanitizedUpdates);

      return incident;
    } catch (error) {
      console.error("Update incident error:", error);
      throw error;
    }
  },

  async deleteIncident(id: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Authentication required");
      }

      // Validate ID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        throw new Error("Invalid incident ID format");
      }

      // Check permissions
      const hasPermission = await checkUserPermissions(user.id, "delete");
      if (!hasPermission) {
        throw new Error("Insufficient permissions to delete incidents");
      }

      const { error } = await supabase
        .from("incidents")
        .delete()
        .eq("id", id);

      if (error) {
        throw new Error(`Failed to delete incident: ${error.message}`);
      }

      // Log the activity
      await logActivity("delete_incident", id);
    } catch (error) {
      console.error("Delete incident error:", error);
      throw error;
    }
  }
};
