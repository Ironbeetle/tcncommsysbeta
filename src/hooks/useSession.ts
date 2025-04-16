import { useState, useEffect } from 'react';
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

  const updateActivity = () => {
    setLastActivity(Date.now());
  };

  const checkSession = async () => {
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
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Logout failed');
      }

      setUser(null);
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Failed to logout');
    }
  };

  useEffect(() => {
    // Check session on mount
    checkSession();

    // Set up activity listeners
    const events = ['mousedown', 'keydown', 'scroll', 'mousemove', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity);
    });

    // Set up interval to check session
    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity;

      if (timeSinceLastActivity >= inactivityTimeout) {
        handleLogout();
        toast.info('Session expired due to inactivity');
      } else {
        checkSession();
      }
    }, 60000); // Check every minute

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
      clearInterval(interval);
    };
  }, [lastActivity, inactivityTimeout]);

  return { user, handleLogout };
}