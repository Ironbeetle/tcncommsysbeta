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
        <TabsList className="w-full justify-start">
          <TabsTrigger value="sms">SMS Logs</TabsTrigger>
          <TabsTrigger value="email">Email Logs</TabsTrigger>
          <TabsTrigger value="webapi">Web API Logs</TabsTrigger>
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