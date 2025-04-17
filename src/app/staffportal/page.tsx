"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import StaffMessenger from "@/components/staffmessenger";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import MessageLogs from "@/components/MessageLogs";

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
}

export default function StaffPortal() {
  let [activeTab, setActiveTab] = useState(1);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

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
    async function fetchUser() {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        
        if (!data.user) {
          router.push('/');
          return;
        }
        
        if (data.user.department === 'admin') {
          router.push('/staffhome');
          return;
        }
        
        setUser(data.user);
      } catch (error) {
        console.error('Failed to fetch user session:', error);
        router.push('/');
      }
    }

    fetchUser();
  }, [router]);

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-deep-blue via-primary-blue to-secondary-blue">
      <div className="flex flex-row justify-evenly h-1/8 w-full border-b-2 border-white border-solid">
        <div className="grid grid-cols-7 w-full h-full">
          <div className="col-span-1 h-full">
            <div className="h-full flex flex-col justify-center items-center"> 
              <Image src="/tcnlogosm.png" alt="Window" width={80} height={80} style={{objectFit: 'cover'}} />
            </div>
          </div>
          <div className="col-span-3 apptext h-full flex flex-col justify-center items-center">
            Welcome {user ? `${(user as { first_name: string; last_name: string }).first_name} ${(user as { first_name: string; last_name: string }).last_name}` : 'Admin User'}
          </div>
          <div className="col-span-2 h-full flex flex-col justify-center items-center apptext"> 
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </div>
          <div className="col-span-1 h-full flex flex-col justify-center items-center">
            <Button 
              variant="destructive"
              onClick={handleLogout}
              className="w-3/4"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-5 w-full h-7/8">
        <div className="col-span-1 h-full border-r-2 border-white border-solid">
        <div className="flex flex-col h-full justify-evenly items-center">
            <Button 
              variant="secondary" 
              className={cn(
                activeTab === 1 ? 'active' : '',
                'w-1/2'
              )}
              onClick={() => setActiveTab(1)}
            >
              Messenger Dashboard
            </Button>
            <Button 
              variant="secondary" 
              className={cn(
                activeTab === 2 ? 'active' : '',
                'w-1/2'
              )}
              onClick={() => setActiveTab(2)}
            >
              Messages Log
            </Button>
          </div>
        </div>
        <div className="col-span-4 h-full">
          <div className="flex flex-col justify-center items-center h-full overflow-y-hidden">
            {activeTab === 1 && <StaffMessenger/>}
            {activeTab === 2 && <MessageLogs/>}
          </div>
        </div>
      </div>
    </div>
  );
}
