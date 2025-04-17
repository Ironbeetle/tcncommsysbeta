"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Messenger from "@/components/staffpanel";
import { cn } from "@/lib/utils";
import { useSession } from "@/hooks/useSession";
import MessageLogs from "@/components/MessageLogs";

export default function Home() {
  let [activeTab, setActiveTab] = useState(1);
  const { user, handleLogout } = useSession();

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-deep-blue via-primary-blue to-secondary-blue">
      <div className="flex flex-row justify-evenly h-1/8 w-full border-b-2 border-white border-solid">
        <div className="grid grid-cols-7 w-full h-full">
          <div className="col-span-1 h-full">
            <div className="h-full flex flex-col justify-center items-center"> 
              <Image src="/tcnlogosm.png" alt="Window" width={80} height={80} style={{objectFit: 'cover'}} />
            </div>
          </div>
          <div className="col-span-2 apptext h-full flex flex-col justify-center items-center">
            Welcome {user ? `${user.first_name} ${user.last_name}` : 'Admin User'}
          </div>
          <div className="col-span-3 h-full flex flex-col justify-center items-center apptext"> 
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
        <div className="col-span-1 h-full border-r-1 border-white border-solid">
          <div className="flex flex-col h-full justify-evenly items-center">
            <Button 
              variant="secondary" 
              className={cn(
                activeTab === 1 ? 'bg-accent-blue text-white shadow-lg' : '',
                'w-1/2',
                'hover:scale-105 hover:shadow-xl',
                'transition-all duration-200',
                'border border-white/20',
                'relative',
                'after:absolute after:w-full after:h-full after:bg-white/5',
                'after:opacity-0 hover:after:opacity-100',
                'after:transition-opacity after:duration-200',
                'flex items-center gap-2'
              )}
              onClick={() => setActiveTab(1)}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Messenger Dashboard
            </Button>
            <Button 
              variant="secondary" 
              className={cn(
                activeTab === 2 ? 'bg-accent-blue text-white shadow-lg' : '',
                'w-1/2',
                'hover:scale-105 hover:shadow-xl',
                'transition-all duration-200',
                'border border-white/20',
                'relative',
                'after:absolute after:w-full after:h-full after:bg-white/5',
                'after:opacity-0 hover:after:opacity-100',
                'after:transition-opacity after:duration-200',
                'flex items-center gap-2'
              )}
              onClick={() => setActiveTab(2)}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <path d="M14 2v6h6"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <line x1="10" y1="9" x2="8" y2="9"/>
              </svg>
              Messages Log
            </Button>
          </div>
        </div>
        <div className="col-span-4 h-full">
          <div className="flex flex-col justify-center items-center h-full overflow-y-hidden">
            {activeTab === 1 && <Messenger/>}
            {activeTab === 2 && <MessageLogs/>}
          </div>
        </div>
      </div>
    </div>
  );
}
