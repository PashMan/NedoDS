import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import { Hash, LogOut, Send, Server as ServerIcon } from 'lucide-react';

export function ChatLayout() {
  const { user, token, logout } = useAuth();
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock data for MVP
  const servers = [{ id: '1', name: 'Gaming Hub' }];
  const channels = [{ id: '1', name: 'general' }, { id: '2', name: 'lfg' }];
  const activeChannel = channels[0];

  useEffect(() => {
    if (!socket) return;

    socket.emit('join_channel', activeChannel.id);

    socket.on('new_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.emit('leave_channel', activeChannel.id);
      socket.off('new_message');
    };
  }, [socket, activeChannel.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    socket.emit('send_message', {
      channelId: activeChannel.id,
      content: newMessage,
    });
    setNewMessage('');
  };

  return (
    <div className="flex h-screen bg-neutral-800 text-white overflow-hidden">
      {/* Servers Sidebar */}
      <div className="w-18 bg-neutral-900 flex flex-col items-center py-4 space-y-4">
        {servers.map((server) => (
          <div
            key={server.id}
            className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center cursor-pointer hover:rounded-xl transition-all"
          >
            <ServerIcon size={24} />
          </div>
        ))}
      </div>

      {/* Channels Sidebar */}
      <div className="w-60 bg-neutral-800 flex flex-col border-r border-neutral-700/50">
        <div className="h-12 flex items-center px-4 font-bold border-b border-neutral-700/50 shadow-sm">
          {servers[0].name}
        </div>
        <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {channels.map((channel) => (
            <div
              key={channel.id}
              className={`flex items-center px-2 py-1.5 rounded cursor-pointer ${
                activeChannel.id === channel.id
                  ? 'bg-neutral-700 text-white'
                  : 'text-neutral-400 hover:bg-neutral-700/50 hover:text-neutral-200'
              }`}
            >
              <Hash size={18} className="mr-1.5 opacity-60" />
              {channel.name}
            </div>
          ))}
        </div>
        <div className="h-14 bg-neutral-900/50 flex items-center px-4 justify-between">
          <div className="font-medium text-sm truncate">{user?.username}</div>
          <button onClick={logout} className="text-neutral-400 hover:text-red-400 transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-neutral-700">
        {/* Chat Header */}
        <div className="h-12 flex items-center px-4 border-b border-neutral-600/50 shadow-sm">
          <Hash size={20} className="mr-2 text-neutral-400" />
          <span className="font-bold">{activeChannel.name}</span>
          <span className="ml-auto text-xs text-neutral-400 flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold mr-3 shrink-0">
                {msg.author?.username?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <div className="flex items-baseline">
                  <span className="font-medium mr-2">{msg.author?.username || 'Unknown'}</span>
                  <span className="text-xs text-neutral-400">
                    {new Date(msg.createdAt || Date.now()).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-neutral-200 mt-0.5">{msg.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-neutral-700">
          <form onSubmit={sendMessage} className="relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Message #${activeChannel.name}`}
              className="w-full bg-neutral-600 rounded-lg pl-4 pr-12 py-3 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-neutral-400 hover:text-white disabled:opacity-50 transition-colors"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
