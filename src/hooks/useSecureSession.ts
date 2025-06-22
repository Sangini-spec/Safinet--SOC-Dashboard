
import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { SESSION_TIMEOUT, scheduleSessionTimeout, clearSessionTimeout } from '@/utils/securityUtils';

export const useSecureSession = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningShownRef = useRef(false);

  const resetSessionTimeout = () => {
    if (timeoutRef.current) {
      clearSessionTimeout(timeoutRef.current);
    }
    
    warningShownRef.current = false;
    
    if (user) {
      // Set warning at 25 minutes (5 minutes before timeout)
      const warningTimeout = setTimeout(() => {
        if (!warningShownRef.current) {
          warningShownRef.current = true;
          toast({
            title: "Session Expiring",
            description: "Your session will expire in 5 minutes due to inactivity.",
            variant: "destructive",
          });
        }
      }, SESSION_TIMEOUT - 5 * 60 * 1000);

      // Set actual timeout at 30 minutes
      timeoutRef.current = scheduleSessionTimeout(async () => {
        toast({
          title: "Session Expired",
          description: "You have been logged out due to inactivity.",
          variant: "destructive",
        });
        await signOut();
      });
    }
  };

  useEffect(() => {
    if (user) {
      resetSessionTimeout();

      // Reset timeout on user activity
      const activities = ['mousedown', 'keydown', 'scroll', 'touchstart'];
      const resetHandler = () => resetSessionTimeout();

      activities.forEach(activity => {
        document.addEventListener(activity, resetHandler);
      });

      return () => {
        activities.forEach(activity => {
          document.removeEventListener(activity, resetHandler);
        });
        if (timeoutRef.current) {
          clearSessionTimeout(timeoutRef.current);
        }
      };
    }
  }, [user]);

  return { resetSessionTimeout };
};
