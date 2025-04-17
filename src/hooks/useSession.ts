import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
}

export function useSession(inactivityTimeout = 1800000) { // 30 minutes default
  const [user, setUser] = useState<User | null>(null);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const router = useRouter();

  const checkSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();

      if (!data.user) {
        setUser(null);
        router.push('/');
        return false;
      }

      setUser(data.user);
      return true;
    } catch (error) {
      console.error('Session check failed:', error);
      return false;
    }
  }, [router]);

  const handleLogout = useCallback(async () => {
    setUser(null);
    router.push('/');
  }, [router]);

  // Throttled activity update
  const updateActivity = useCallback(() => {
    const now = Date.now();
    if (now - lastActivity >= 300000) { // Only update if 5 minutes have passed
      setLastActivity(now);
    }
  }, [lastActivity]);

  useEffect(() => {
    // Initial session check
    checkSession();

    // Set up activity listeners with a debounced handler
    let activityTimeout: NodeJS.Timeout;
    const handleActivity = () => {
      clearTimeout(activityTimeout);
      activityTimeout = setTimeout(updateActivity, 1000); // Debounce for 1 second
    };

    const events = ['mousedown', 'keydown', 'scroll', 'mousemove', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Check session every 5 minutes
    const sessionInterval = setInterval(() => {
      const now = Date.now();
      if (now - lastActivity >= inactivityTimeout) {
        handleLogout();
        toast.info('Session expired due to inactivity');
      } else {
        checkSession();
      }
    }, 300000); // Check every 5 minutes

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      clearInterval(sessionInterval);
      clearTimeout(activityTimeout);
    };
  }, [checkSession, handleLogout, updateActivity, lastActivity, inactivityTimeout]);

  return { user, handleLogout };
}
