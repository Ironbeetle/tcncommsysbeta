"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from '@tanstack/react-query';
import { searchMembers } from "@/lib/actions";
import { itemSchema } from "@/lib/validation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { z } from "zod";
import { SMSComposer, EmailComposer } from "./staffmessenger";
import { toast } from "sonner";

type Member = z.infer<typeof itemSchema>;

interface AppMessage {
    id?: string;
    title: string;
    content: string;
    priority: 'low' | 'medium' | 'high';
    expiryDate?: string;
    isPublished: boolean;
}

// Move WebAPIMessageComposer outside of StaffPanel
const WebAPIMessageComposer = () => {
    const [message, setMessage] = useState<AppMessage>({
        title: '',
        content: '',
        priority: 'low',
        isPublished: false
    });
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
            const response = await fetch('/api/app-messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(message),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to publish message');
            }

            toast.success('Message published successfully');
            setMessage({
                title: '',
                content: '',
                priority: 'low',
                isPublished: false
            });

        } catch (error: any) {
            toast.error(error.message || 'Failed to publish message');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="w-full max-w-2xl p-4">
            <h2 className="text-xl font-bold mb-4">Web API Message Composer</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Title
                    </label>
                    <input
                        type="text"
                        value={message.title}
                        onChange={(e) => setMessage({ ...message, title: e.target.value })}
                        className="w-full rounded-md border border-gray-300 p-2"
                        placeholder="Enter message title..."
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Content
                    </label>
                    <textarea
                        value={message.content}
                        onChange={(e) => setMessage({ ...message, content: e.target.value })}
                        className="w-full rounded-md border border-gray-300 p-2"
                        rows={4}
                        placeholder="Enter message content..."
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Priority
                    </label>
                    <select
                        value={message.priority}
                        onChange={(e) => setMessage({ ...message, priority: e.target.value as 'low' | 'medium' | 'high' })}
                        className="w-full rounded-md border border-gray-300 p-2"
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Expiry Date (Optional)
                    </label>
                    <input
                        type="datetime-local"
                        value={message.expiryDate || ''}
                        onChange={(e) => setMessage({ ...message, expiryDate: e.target.value })}
                        className="w-full rounded-md border border-gray-300 p-2"
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={message.isPublished}
                        onChange={(e) => setMessage({ ...message, isPublished: e.target.checked })}
                        className="rounded border-gray-300"
                    />
                    <label className="text-sm text-gray-700">
                        Publish immediately
                    </label>
                </div>

                <div className="flex justify-end space-x-2">
                    <Button
                        variant="outline"
                        type="button"
                        disabled={isSending}
                        onClick={() => {
                            setMessage({
                                title: '',
                                content: '',
                                priority: 'low',
                                isPublished: false
                            });
                            setSendingStatus({});
                        }}
                    >
                        Clear
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSending || !message.title || !message.content}
                    >
                        {isSending ? 'Publishing...' : 'Publish Message'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

function StaffPanel() {
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
            <div className="grid grid-cols-5 w-full h-[100vh]">
                <div className="col-span-3 h-full p-4">
                    <Tabs defaultValue="sms" className="w-full">
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
                                SMS
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
                                Email
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
                                Web API Messages
                            </TabsTrigger>
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
                        <TabsContent value="webapi">
                            <WebAPIMessageComposer />
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
                            className="border rounded-md p-2"
                        />
                        {isSearching ? (
                            <div>Searching...</div>
                        ) : searchData ? (
                            <div className="space-y-2">
                                {searchData.map((item) => (
                                    <div
                                        key={item.t_number}
                                        className="flex items-center justify-between p-2 border rounded hover:bg-gray-100 cursor-pointer"
                                        onClick={() => handleSelectMember({
                                            ...item,
                                            birthdate: new Date(item.birthdate),
                                            house_number: "0",
                                            email: item.email || "",
                                            o_r_status: item.o_r_status || "false",
                                            option: item.option || "none"
                                        })}
                                    >
                                        <span>
                                            {item.first_name} {item.last_name}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {item.t_number}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StaffPanel;
