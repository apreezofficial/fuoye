'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Send, MessageSquare, Users, Loader2, Search } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function ChatPage() {
    const [conversations, setConversations] = useState<any>({ direct_messages: [], groups: [] });
    const [selectedConversation, setSelectedConversation] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState<'direct' | 'groups'>('direct');

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (selectedConversation) {
            fetchMessages();
            // Poll for new messages every 3 seconds
            const interval = setInterval(fetchMessages, 3000);
            return () => clearInterval(interval);
        }
    }, [selectedConversation]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchConversations = async () => {
        try {
            const { data } = await api.get('/student/chat.php?type=all');
            setConversations(data);
        } catch (error: any) {
            toast.error('Failed to load conversations', {
                description: error.response?.data?.message || 'Please try again'
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async () => {
        if (!selectedConversation) return;

        try {
            const type = selectedConversation.group_id ? 'group' : 'direct';
            const param = selectedConversation.group_id ? 'group_id' : 'other_id';
            const value = selectedConversation.group_id || selectedConversation.other_user_id;
            
            const { data } = await api.get(`/student/chat.php?conversation=1&type=${type}&${param}=${value}`);
            setMessages(data);
        } catch (error: any) {
            console.error('Failed to fetch messages', error);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation) return;

        setSending(true);
        try {
            const payload: any = {
                message: newMessage.trim()
            };

            if (selectedConversation.group_id) {
                payload.group_id = selectedConversation.group_id;
            } else {
                payload.receiver_id = selectedConversation.other_user_id;
            }

            await api.post('/student/chat.php', payload);
            setNewMessage('');
            fetchMessages();
            fetchConversations(); // Refresh to update last message
        } catch (error: any) {
            toast.error('Failed to send message', {
                description: error.response?.data?.message || 'Please try again'
            });
        } finally {
            setSending(false);
        }
    };

    const filteredDirectMessages = conversations.direct_messages?.filter((conv: any) =>
        conv.other_user_name?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const filteredGroups = conversations.groups?.filter((group: any) =>
        group.name?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>;

    return (
        <div className="h-[calc(100vh-8rem)] flex bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Sidebar */}
            <div className="w-80 border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                        <MessageSquare className="w-5 h-5 text-gray-600" />
                        <h2 className="font-bold text-gray-900">Messages</h2>
                    </div>
                    <div className="flex gap-2 mb-4">
                        <button
                            onClick={() => setActiveTab('direct')}
                            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                activeTab === 'direct'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Direct
                        </button>
                        <button
                            onClick={() => setActiveTab('groups')}
                            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                activeTab === 'groups'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Groups
                        </button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {activeTab === 'direct' ? (
                        <div>
                            {filteredDirectMessages.length === 0 ? (
                                <div className="p-4 text-center text-gray-500 text-sm">
                                    No conversations yet
                                </div>
                            ) : (
                                filteredDirectMessages.map((conv: any) => (
                                    <button
                                        key={conv.other_user_id}
                                        onClick={() => setSelectedConversation({ ...conv, type: 'direct' })}
                                        className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                                            selectedConversation?.other_user_id === conv.other_user_id ? 'bg-green-50' : ''
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold">
                                                {conv.other_user_name?.charAt(0) || 'U'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="font-medium text-gray-900 truncate">
                                                        {conv.other_user_name}
                                                    </p>
                                                    {conv.unread_count > 0 && (
                                                        <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
                                                            {conv.unread_count}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500 truncate">
                                                    {conv.last_message || 'No messages yet'}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    ) : (
                        <div>
                            {filteredGroups.length === 0 ? (
                                <div className="p-4 text-center text-gray-500 text-sm">
                                    No groups yet
                                </div>
                            ) : (
                                filteredGroups.map((group: any) => (
                                    <button
                                        key={group.id}
                                        onClick={() => setSelectedConversation({ ...group, type: 'group' })}
                                        className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                                            selectedConversation?.group_id === group.id ? 'bg-green-50' : ''
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white">
                                                <Users className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="font-medium text-gray-900 truncate">
                                                        {group.name}
                                                    </p>
                                                    {group.unread_count > 0 && (
                                                        <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
                                                            {group.unread_count}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500 truncate">
                                                    {group.last_message || 'No messages yet'}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {selectedConversation ? (
                    <>
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold">
                                    {selectedConversation.type === 'group' 
                                        ? <Users className="w-5 h-5" />
                                        : (selectedConversation.other_user_name?.charAt(0) || 'U')
                                    }
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {selectedConversation.type === 'group' 
                                            ? selectedConversation.name 
                                            : selectedConversation.other_user_name
                                        }
                                    </p>
                                    {selectedConversation.type === 'group' && (
                                        <p className="text-xs text-gray-500">
                                            {selectedConversation.member_count || 0} members
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg: any) => {
                                const isMe = msg.sender_id === parseInt(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).id : '0');
                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                                            isMe
                                                ? 'bg-green-600 text-white'
                                                : 'bg-gray-100 text-gray-900'
                                        }`}>
                                            {!isMe && (
                                                <p className="text-xs font-medium mb-1 opacity-70">
                                                    {msg.sender_name}
                                                </p>
                                            )}
                                            <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                            <p className={`text-xs mt-1 ${isMe ? 'text-green-100' : 'text-gray-500'}`}>
                                                {new Date(msg.created_at).toLocaleTimeString('en-US', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 border-t border-gray-200">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                                <Button
                                    onClick={sendMessage}
                                    disabled={!newMessage.trim() || sending}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <p>Select a conversation to start chatting</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}


