import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

// Type definitions and interfaces
type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

interface RestError {
  code: string
  details?: string
  hint?: string
  message: string
}

interface RestSuccess<T> {
  body: T
  error: null
}

interface RestFailure {
  body: null
  error: RestError
}

type RestResult<T> = RestSuccess<T> | RestFailure

type Tables<
  PublicTableNameOrOptions extends
  | keyof (Database["public"]["Tables"] & { _: never })
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] & { _: never })
  : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] & { _: never })[TableName]["Row"]
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] & { _: never })
  ? (Database["public"]["Tables"] & { _: never })[PublicTableNameOrOptions]["Row"]
  : never

type Views<
  PublicTableNameOrOptions extends
  | keyof (Database["public"]["Views"] & { _: never })
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof (Database[PublicTableNameOrOptions["schema"]]["Views"] & { _: never })
  : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Views"] & { _: never })[TableName]["Row"]
  : PublicTableNameOrOptions extends keyof (Database["public"]["Views"] & { _: never })
  ? (Database["public"]["Views"] & { _: never })[PublicTableNameOrOptions]["Row"]
  : never

type Functions<
  PublicFunctionNameOrOptions extends
  | keyof (Database["public"]["Functions"] & { _: never })
  | { schema: keyof Database },
  FunctionName extends PublicFunctionNameOrOptions extends { schema: keyof Database }
  ? keyof (Database[PublicFunctionNameOrOptions["schema"]]["Functions"] & { _: never })
  : never = never
> = PublicFunctionNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicFunctionNameOrOptions["schema"]]["Functions"] & { _: never })[FunctionName] extends {
    Args: any
  }
  ? Omit<
    (Database[PublicFunctionNameOrOptions["schema"]]["Functions"] & { _: never })[FunctionName],
    "RowFiltering"
  >
  : (Database[PublicFunctionNameOrOptions["schema"]]["Functions"] & { _: never })[FunctionName]
  : PublicFunctionNameOrOptions extends keyof (Database["public"]["Functions"] & { _: never })
  ? (Database["public"]["Functions"] & { _: never })[PublicFunctionNameOrOptions] extends {
    Args: any
  }
  ? Omit<
    (Database["public"]["Functions"] & { _: never })[PublicFunctionNameOrOptions],
    "RowFiltering"
  >
  : (Database["public"]["Functions"] & { _: never })[PublicFunctionNameOrOptions]
  : never

type Enums<
  EnumName extends keyof (Database["public"]["Enums"] & { _: never })
> = (Database["public"]["Enums"] & { _: never })[EnumName]

type TablesInsert<
  PublicTableNameOrOptions extends
  | keyof Database["public"]["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName]["Insert"]
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions]["Insert"]
  : never

type TablesUpdate<
  PublicTableNameOrOptions extends
  | keyof Database["public"]["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName]["Update"]
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions]["Update"]
  : never

type TablesRow<
  PublicTableNameOrOptions extends
  | keyof Database["public"]["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName]["Row"]
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions]["Row"]
  : never

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

// Input validation and sanitization
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
};

const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, "");
};

// Authorization checks
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

    // Role-based access control
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

// Audit logging
const logActivity = async (action: string, resourceId?: string, details?: any): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action,
      resource_type: "incident",
      resource_id: resourceId,
      details,
      ip_address: "127.0.0.1", // In production, get real IP
      user_agent: navigator.userAgent
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

// Secure incident service functions
export const secureIncidentService = {
  async createIncident(data: CreateIncidentData): Promise<Incident> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Authentication required");
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
      await logActivity("create", incident.id, { title: incident.title });

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
      await logActivity("update", id, sanitizedUpdates);

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
      await logActivity("delete", id);
    } catch (error) {
      console.error("Delete incident error:", error);
      throw error;
    }
  }
};
