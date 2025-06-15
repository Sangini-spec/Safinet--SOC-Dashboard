
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'analyst' | 'viewer';
  organization: string | null;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const logAuditEvent = async (action: string, resourceType: string, details?: any) => {
    if (!user) return;
    
    try {
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action,
        resource_type: resourceType,
        details: sanitizeJSON(details),
        ip_address: null, // Would need additional setup to capture real IP
        user_agent: navigator.userAgent.substring(0, 500)
      });
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  };

  const logLoginAttempt = async (email: string, success: boolean) => {
    try {
      await supabase.from('login_attempts').insert({
        email: sanitizeEmail(email),
        success,
        attempted_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log login attempt:', error);
    }
  };

  const checkLoginAttempts = async (email: string): Promise<boolean> => {
    try {
      const sanitizedEmail = sanitizeEmail(email);
      
      // Use the new security function
      const { data, error } = await supabase.rpc('check_account_lockout', {
        user_email: sanitizedEmail
      });

      if (error) {
        console.error('Error checking login attempts:', error);
        return true; // Allow login if we can't check
      }

      return data;
    } catch (error) {
      console.error('Error checking login attempts:', error);
      return true; // Allow login if we can't check
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      // Type assertion to ensure role is properly typed
      return {
        ...data,
        role: data.role as 'admin' | 'analyst' | 'viewer'
      } as Profile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Clear any existing timeout
        if (timeoutId) clearTimeout(timeoutId);

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Debounce profile fetching to prevent race conditions
          timeoutId = setTimeout(async () => {
            const profileData = await fetchProfile(session.user.id);
            setProfile(profileData);
            
            // Update last login
            if (profileData) {
              await supabase
                .from('profiles')
                .update({ last_login: new Date().toISOString() })
                .eq('id', session.user.id);
            }
            
            if (event === 'SIGNED_IN') {
              await logAuditEvent('user_login', 'auth');
            }
          }, 100);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        timeoutId = setTimeout(async () => {
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        }, 100);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const sanitizedEmail = sanitizeEmail(email);
      
      // Enhanced validation
      if (!isValidEmail(sanitizedEmail)) {
        return { error: 'Invalid email format' };
      }

      if (!password || password.length < 6) {
        return { error: 'Password must be at least 6 characters' };
      }

      // Check for account lockout
      const canAttempt = await checkLoginAttempts(sanitizedEmail);
      if (!canAttempt) {
        return { error: 'Account temporarily locked due to multiple failed attempts. Please try again later.' };
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password,
      });

      // Log the attempt
      await logLoginAttempt(sanitizedEmail, !error);

      if (error) {
        let errorMessage = 'Login failed';
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and click the confirmation link';
        } else if (error.message.includes('too many requests')) {
          errorMessage = 'Too many login attempts. Please try again later.';
        }
        return { error: errorMessage };
      }

      return {};
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: 'An unexpected error occurred' };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const sanitizedEmail = sanitizeEmail(email);
      const sanitizedName = sanitizeText(fullName || '');

      // Enhanced validation
      if (!isValidEmail(sanitizedEmail)) {
        return { error: 'Invalid email format' };
      }

      // Validate password strength
      if (!isPasswordStrong(password)) {
        return { error: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character' };
      }

      const { error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: sanitizedName,
          },
        },
      });

      if (error) {
        let errorMessage = 'Registration failed';
        if (error.message.includes('User already registered')) {
          errorMessage = 'An account with this email already exists';
        } else if (error.message.includes('Password should be')) {
          errorMessage = 'Password must be at least 6 characters long';
        } else if (error.message.includes('rate limit')) {
          errorMessage = 'Too many registration attempts. Please try again later.';
        }
        return { error: errorMessage };
      }

      return {};
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: 'An unexpected error occurred' };
    }
  };

  const signOut = async () => {
    try {
      await logAuditEvent('user_logout', 'auth');
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setSession(null);
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const sanitizedEmail = sanitizeEmail(email);
      
      if (!isValidEmail(sanitizedEmail)) {
        return { error: 'Invalid email format' };
      }
      
      const { error } = await supabase.auth.resetPasswordForEmail(sanitizedEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      console.error('Reset password error:', error);
      return { error: 'An unexpected error occurred' };
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Enhanced security utility functions
function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim().replace(/[^\w@.-]/g, '');
}

function sanitizeText(text: string): string {
  return text
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    .trim()
    .substring(0, 255);
}

function sanitizeJSON(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeText(obj);
  }
  if (typeof obj === 'object' && obj !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[sanitizeText(key)] = sanitizeJSON(value);
    }
    return sanitized;
  }
  return obj;
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
}

function isPasswordStrong(password: string): boolean {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
}
