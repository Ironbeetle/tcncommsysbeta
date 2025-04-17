"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

interface LogEntry {
  id: string;
  created: Date;
  message: string;
  status: string;
  error?: string | null;
}

interface SmsLogEntry extends LogEntry {
  recipients: string[];
  messageIds: string[];
}

interface EmailLogEntry extends LogEntry {
  subject: string;
  recipients: string[];
  messageId?: string | null;
  attachments?: { files: string[] } | null;
}

interface WebApiLogEntry extends LogEntry {
  type: string;
  subject?: string | null;
}

export default function MessageLogs() {
  const [activeTab, setActiveTab] = useState("sms");

  const { data: smsLogs, isLoading: loadingSms } = useQuery({
    queryKey: ["smsLogs"],
    queryFn: async () => {
      const response = await fetch("/api/logs/sms");
      return response.json();
    },
  });

  const { data: emailLogs, isLoading: loadingEmail } = useQuery({
    queryKey: ["emailLogs"],
    queryFn: async () => {
      const response = await fetch("/api/logs/email");
      return response.json();
    },
  });

  const { data: webApiLogs, isLoading: loadingWebApi } = useQuery({
    queryKey: ["webApiLogs"],
    queryFn: async () => {
      const response = await fetch("/api/logs/webapi");
      return response.json();
    },
  });

  const SmsLogsTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Message</TableHead>
          <TableHead>Recipients</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Error</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {smsLogs?.map((log: SmsLogEntry) => (
          <TableRow key={log.id}>
            <TableCell>{format(new Date(log.created), "PPpp")}</TableCell>
            <TableCell className="max-w-md truncate">{log.message}</TableCell>
            <TableCell>{log.recipients.length}</TableCell>
            <TableCell>{log.status}</TableCell>
            <TableCell className="text-red-500">{log.error || "-"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const EmailLogsTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Subject</TableHead>
          <TableHead>Recipients</TableHead>
          <TableHead>Attachments</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Error</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {emailLogs?.map((log: EmailLogEntry) => (
          <TableRow key={log.id}>
            <TableCell>{format(new Date(log.created), "PPpp")}</TableCell>
            <TableCell className="max-w-md truncate">{log.subject}</TableCell>
            <TableCell>{log.recipients.length}</TableCell>
            <TableCell>
              {log.attachments?.files.length || 0} file(s)
            </TableCell>
            <TableCell>{log.status}</TableCell>
            <TableCell className="text-red-500">{log.error || "-"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const WebApiLogsTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Subject</TableHead>
          <TableHead>Message</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {webApiLogs?.map((log: WebApiLogEntry) => (
          <TableRow key={log.id}>
            <TableCell>{format(new Date(log.created), "PPpp")}</TableCell>
            <TableCell>{log.type}</TableCell>
            <TableCell>{log.subject || "-"}</TableCell>
            <TableCell className="max-w-md truncate">{log.message}</TableCell>
            <TableCell>{log.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="w-full p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start gap-2 bg-background/50 p-1">
          <TabsTrigger 
            value="sms"
            className="flex items-center gap-2 data-[state=active]:bg-accent-blue data-[state=active]:text-white data-[state=active]:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            SMS Logs
          </TabsTrigger>
          <TabsTrigger 
            value="email"
            className="flex items-center gap-2 data-[state=active]:bg-accent-blue data-[state=active]:text-white data-[state=active]:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            Email Logs
          </TabsTrigger>
          <TabsTrigger 
            value="webapi"
            className="flex items-center gap-2 data-[state=active]:bg-accent-blue data-[state=active]:text-white data-[state=active]:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
            Web API Logs
          </TabsTrigger>
        </TabsList>
        <TabsContent value="sms">
          {loadingSms ? <div>Loading...</div> : <SmsLogsTable />}
        </TabsContent>
        <TabsContent value="email">
          {loadingEmail ? <div>Loading...</div> : <EmailLogsTable />}
        </TabsContent>
        <TabsContent value="webapi">
          {loadingWebApi ? <div>Loading...</div> : <WebApiLogsTable />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
