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
  user: {
    first_name: string;
    last_name: string;
  };
  recipientDetails: {
    first_name: string;
    last_name: string;
    contact_number?: string;
    email?: string;
  }[];
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
  title: string;
  content: string;
  priority: string;
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

  const { data: webApiLogs, isLoading: loadingWebApi, error: webApiError } = useQuery({
    queryKey: ["webApiLogs"],
    queryFn: async () => {
      const response = await fetch("/api/logs/webapi");
      if (!response.ok) {
        throw new Error("Failed to fetch web API logs");
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        console.error("Unexpected API response:", data);
        return [];
      }
      return data;
    },
  });

  const SmsLogsTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Sender</TableHead>
          <TableHead>Message</TableHead>
          <TableHead>Recipients</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Error</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {smsLogs?.map((log: LogEntry) => (
          <TableRow key={log.id}>
            <TableCell>{format(new Date(log.created), "PPpp")}</TableCell>
            <TableCell>{`${log.user.first_name} ${log.user.last_name}`}</TableCell>
            <TableCell className="max-w-md truncate">{log.message}</TableCell>
            <TableCell>
              <div className="max-h-20 overflow-y-auto">
                {log.recipientDetails.map((recipient, index) => (
                  <div key={index} className="text-sm">
                    {`${recipient.first_name} ${recipient.last_name}`}
                  </div>
                ))}
              </div>
            </TableCell>
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
          <TableHead>Sender</TableHead>
          <TableHead>Subject</TableHead>
          <TableHead>Recipients</TableHead>
          <TableHead>Attachments</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Error</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {emailLogs?.map((log: LogEntry) => (
          <TableRow key={log.id}>
            <TableCell>{format(new Date(log.created), "PPpp")}</TableCell>
            <TableCell>{`${log.user.first_name} ${log.user.last_name}`}</TableCell>
            <TableCell className="max-w-md truncate">{(log as EmailLogEntry).subject}</TableCell>
            <TableCell>
              <div className="max-h-20 overflow-y-auto">
                {log.recipientDetails.map((recipient, index) => (
                  <div key={index} className="text-sm">
                    {`${recipient.first_name} ${recipient.last_name}`}
                  </div>
                ))}
              </div>
            </TableCell>
            <TableCell>
              {((log as EmailLogEntry).attachments?.files.length) || 0} file(s)
            </TableCell>
            <TableCell>{log.status}</TableCell>
            <TableCell className="text-red-500">{log.error || "-"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const WebApiLogsTable = () => {
    if (!Array.isArray(webApiLogs)) {
      return <div>No logs available</div>;
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {webApiLogs.map((log: WebApiLogEntry) => (
            <TableRow key={log.id}>
              <TableCell>{format(new Date(log.created), "PPpp")}</TableCell>
              <TableCell>{log.type}</TableCell>
              <TableCell>{log.title || "-"}</TableCell>
              <TableCell className="max-w-md truncate">{log.content}</TableCell>
              <TableCell>{log.priority}</TableCell>
              <TableCell>{log.status || "pending"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="w-full h-full p-4">
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
          {loadingWebApi ? (
            <div>Loading...</div>
          ) : webApiError ? (
            <div className="text-red-500">Error loading logs: {webApiError.message}</div>
          ) : (
            <WebApiLogsTable />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
