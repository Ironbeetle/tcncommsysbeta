"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from '@tanstack/react-query';
import { getItems, getUsers, searchMembers } from "@/lib/actions";
import { itemSchema } from "@/lib/validation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { z } from "zod";

type Member = z.infer<typeof itemSchema>;

interface AppMessage {
    id?: string;
    title: string;
    content: string;
    priority: 'low' | 'medium' | 'high';
    expiryDate?: string;
    isPublished: boolean;
}

export const SMSComposer = ({ selectedRecipients, handleRemoveMember }: { selectedRecipients: Member[], handleRemoveMember: (memberId: string) => void }) => {
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [sendingStatus, setSendingStatus] = useState<{
        success?: string;
        error?: string;
    }>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);
        setSendingStatus({});

        try {
            const formData = new FormData();
            formData.append('type', 'sms');
            formData.append('message', message);
            formData.append('recipients', JSON.stringify(selectedRecipients));

            const response = await fetch('/api/messages', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send message');
            }

            toast.success(`SMS sent successfully to ${selectedRecipients.length} recipients`);
            setMessage('');
            selectedRecipients.forEach(r => handleRemoveMember(r.t_number));

        } catch (error: any) {
            toast.error(error.message || 'Failed to send message');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="w-full max-w-2xl p-4">
            <h2 className="text-xl font-bold mb-4">SMS Composer</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                        Recipients ({selectedRecipients.length})
                    </label>
                    <div className="border rounded-md p-2 max-h-32 overflow-y-auto">
                        {selectedRecipients.map((member) => (
                            <div key={member.t_number} className="flex items-center justify-between p-1 hover:bg-gray-100">
                                <span className="text-sm">
                                    {member.first_name} {member.last_name} - {member.contact_number}
                                </span>
                                <Button
                                    onClick={() => handleRemoveMember(member.t_number)}
                                    variant="ghost"
                                    size="sm"
                                >
                                    ✕
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                        Message
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                        className="w-full rounded-md border border-gray-300 p-2"
                        placeholder="Type your SMS message here..."
                        maxLength={160}
                    />
                    <div className="text-right text-sm text-gray-400">
                        {message.length}/160 characters
                    </div>
                </div>

                {sendingStatus.success && (
                    <div className="p-2 bg-green-100 text-green-700 rounded">
                        {sendingStatus.success}
                    </div>
                )}

                {sendingStatus.error && (
                    <div className="p-2 bg-red-100 text-red-700 rounded">
                        {sendingStatus.error}
                    </div>
                )}

                <div className="flex justify-end space-x-2">
                    <Button
                        variant="outline"
                        type="button"
                        disabled={isSending}
                        onClick={() => {
                            setMessage('');
                            selectedRecipients.forEach(r => handleRemoveMember(r.t_number));
                            setSendingStatus({});
                        }}
                    >
                        Clear
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSending || !message.trim() || selectedRecipients.length === 0}
                    >
                        {isSending ? 'Sending...' : 'Send SMS'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export const EmailComposer = ({ selectedRecipients, handleRemoveMember }: { selectedRecipients: Member[], handleRemoveMember: (memberId: string | string[]) => void }) => {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [attachments, setAttachments] = useState<File[]>([]);
    const [isSending, setIsSending] = useState(false);
    const [sendingStatus, setSendingStatus] = useState<{
        success?: string;
        error?: string;
    }>({});

    const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setAttachments(prev => [...prev, ...files]);
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);
        setSendingStatus({});

        try {
            const formData = new FormData();
            formData.append('type', 'email');
            formData.append('subject', subject);
            formData.append('message', message);
            formData.append('recipients', JSON.stringify(selectedRecipients));
            
            attachments.forEach(file => {
                formData.append('attachments', file);
            });

            const response = await fetch('/api/messages', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send email');
            }

            toast.success(`Email sent successfully to ${selectedRecipients.length} recipients`);
            setSubject('');
            setMessage('');
            handleRemoveMember(selectedRecipients.map(r => r.t_number));
            setAttachments([]);

        } catch (error: any) {
            toast.error(error.message || 'Failed to send email');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="w-full max-w-2xl p-4">
            <h2 className="text-xl font-bold mb-4">Email Composer</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                        Recipients ({selectedRecipients.length})
                    </label>
                    <div className="border rounded-md p-2 max-h-32 overflow-y-auto">
                        {selectedRecipients.map((member) => (
                            <div key={member.t_number} className="flex items-center justify-between p-1 hover:bg-gray-100">
                                <span className="text-sm">
                                    {member.first_name} {member.last_name} - {member.email}
                                </span>
                                <Button
                                    onClick={() => handleRemoveMember(member.t_number)}
                                    variant="ghost"
                                    size="sm"
                                >
                                    ✕
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                        Subject
                    </label>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full rounded-md border border-gray-300 p-2"
                        placeholder="Enter email subject..."
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                        Message
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={6}
                        className="w-full rounded-md border border-gray-300 p-2"
                        placeholder="Type your email message here..."
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                        Attachments
                    </label>
                    <input
                        type="file"
                        multiple
                        onChange={handleAttachmentChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <div className="mt-2 space-y-2">
                        {attachments.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <span className="text-sm truncate">{file.name}</span>
                                <Button
                                    onClick={() => removeAttachment(index)}
                                    variant="ghost"
                                    size="sm"
                                >
                                    ✕
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                {sendingStatus.success && (
                    <div className="p-2 bg-green-100 text-green-700 rounded">
                        {sendingStatus.success}
                    </div>
                )}

                {sendingStatus.error && (
                    <div className="p-2 bg-red-100 text-red-700 rounded">
                        {sendingStatus.error}
                    </div>
                )}

                <div className="flex justify-end space-x-2">
                    <Button
                        variant="outline"
                        type="button"
                        disabled={isSending}
                        onClick={() => {
                            setSubject('');
                            setMessage('');
                            handleRemoveMember(selectedRecipients.map(r => r.t_number));
                            setAttachments([]);
                            setSendingStatus({});
                        }}
                    >
                        Clear
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSending || !subject.trim() || !message.trim() || selectedRecipients.length === 0}
                    >
                        {isSending ? 'Sending...' : 'Send Email'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default function StaffMessenger() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRecipients, setSelectedRecipients] = useState<Member[]>([]);

    const handleSelectMember = (member: Member) => {
        if (!selectedRecipients.some(r => r.t_number === member.t_number)) {
            setSelectedRecipients([...selectedRecipients, member]);
        }
    };

    const handleRemoveMember = (memberId: string) => {
        setSelectedRecipients(selectedRecipients.filter(r => r.t_number !== memberId));
    };

    const { data: searchData, isLoading: isSearching } = useQuery({
        queryKey: ['memberSearch', searchTerm],
        queryFn: () => searchMembers(searchTerm),
        enabled: searchTerm.length > 0,
    });

    return (
        <div className="flex flex-col h-full w-full">
            <div className="grid grid-cols-5 w-full h-full">
                <div className="col-span-3 h-full p-4">
                    <Tabs defaultValue="sms" className="w-full">
                        <TabsList className="w-full justify-start">
                            <TabsTrigger value="sms">SMS</TabsTrigger>
                            <TabsTrigger value="email">Email</TabsTrigger>
                        </TabsList>
                        <TabsContent value="sms">
                            <SMSComposer 
                                selectedRecipients={selectedRecipients}
                                handleRemoveMember={handleRemoveMember}
                            />
                        </TabsContent>
                        <TabsContent value="email">
                            <EmailComposer 
                                selectedRecipients={selectedRecipients}
                                handleRemoveMember={(memberId: string | string[]) => {
                                    if (Array.isArray(memberId)) {
                                        memberId.forEach(id => setSelectedRecipients(prev => prev.filter(r => r.t_number !== id)));
                                    } else {
                                        setSelectedRecipients(prev => prev.filter(r => r.t_number !== memberId));
                                    }
                                }}
                            />
                        </TabsContent>
                    </Tabs>
                </div>
                <div className="col-span-2 h-full border-l border-gray-200 p-4">
                    <div className="flex flex-col space-y-4">
                        <h2 className="text-xl font-bold">Client Search</h2>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search members..."
                            className="w-full px-3 py-2 rounded-md border border-gray-300"
                        />
                        {searchTerm.length > 0 && (
                            <div className="space-y-2">
                                {searchData?.map((member) => (
                                    <div
                                        key={member.id}
                                        className="flex items-center justify-between p-2 glass-container text-text-light cursor-pointer hover:bg-white/10"
                                        onClick={() => handleSelectMember({
                                            ...member,
                                            birthdate: new Date(member.birthdate),
                                            house_number: "0",
                                            email: member.email || ""
                                        } as Member)}
                                    >
                                        <span>
                                            {member.first_name} {member.last_name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
