import { useState, useEffect, useRef } from 'react';
import { apiClient } from '../../services/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card } from '../../components/ui/card';
import {
  Bot,
  Send,
  Plus,
  MessageSquare,
  Archive,
  Pin,
  Trash2,
  Loader2,
  User,
  Sparkles,
  MoreVertical,
  Edit3,
  ArchiveRestore,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../../components/ui/dropdown-menu';
import ReactMarkdown from 'react-markdown';

interface Chat {
  id: string;
  title: string;
  description?: string;
  is_pinned: boolean;
  is_archived: boolean;
  last_message_at?: string;
  thread_count: number;
}

interface Thread {
  id: string;
  chat_id: string;
  title?: string;
  message_count: number;
  updated_at: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export function HubboChat() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [currentThread, setCurrentThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadChats();
  }, [showArchived]);

  useEffect(() => {
    if (currentChat) {
      loadThreads(currentChat.id);
    }
  }, [currentChat]);

  useEffect(() => {
    if (currentThread) {
      loadMessages(currentThread.id);
    }
  }, [currentThread]);

  const loadChats = async () => {
    try {
      setLoading(true);
      const response = await apiClient.listChats(showArchived, 50);
      setChats(response.chats || []);
      
      // Auto-select first chat if available
      if (response.chats && response.chats.length > 0 && !currentChat) {
        setCurrentChat(response.chats[0]);
      }
    } catch (err: any) {
      console.error('Failed to load chats:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadThreads = async (chatId: string) => {
    try {
      const response = await apiClient.listChatThreads(chatId, false);
      
      // Auto-select first thread if available
      if (response.threads && response.threads.length > 0 && !currentThread) {
        setCurrentThread(response.threads[0]);
      }
    } catch (err: any) {
      console.error('Failed to load threads:', err);
    }
  };

  const loadMessages = async (threadId: string) => {
    try {
      const response = await apiClient.getChatMessages(threadId, 100);
      setMessages(response.messages || []);
    } catch (err: any) {
      console.error('Failed to load messages:', err);
    }
  };

  const createNewChat = async (firstMessage?: string) => {
    try {
      // Generate title from first message or use default
      let title = 'New Conversation';
      if (firstMessage) {
        // Use first 50 chars of message as title
        title = firstMessage.length > 50 
          ? firstMessage.substring(0, 50) + '...' 
          : firstMessage;
      }
      
      const chat = await apiClient.createChat({
        title: title,
        description: 'Chat with Hubbo AI Assistant',
      });
      setChats([chat, ...chats]);
      setCurrentChat(chat);
      setCurrentThread(null);
      setMessages([]);
      return chat;
    } catch (err: any) {
      console.error('Failed to create chat:', err);
      return null;
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || sending) return;

    const messageText = inputMessage.trim();
    setInputMessage('');
    setSending(true);

    try {
      let chatToUse = currentChat;
      
      // If no chat exists, create one with the message as title
      if (!chatToUse) {
        chatToUse = await createNewChat(messageText);
        if (!chatToUse) {
          setSending(false);
          return;
        }
      }

      let threadId = currentThread?.id;

      // If no thread, create one
      if (!threadId) {
        const response = await apiClient.quickChat({
          chat_id: chatToUse.id,
          message: messageText,
        });
        
        setCurrentThread(response.thread);
        setMessages([response.user_message, response.assistant_message]);
        await loadThreads(chatToUse.id);
        
        // If this is the first message, update the chat title
        if (chatToUse.title === 'New Conversation') {
          const updatedTitle = messageText.length > 50 
            ? messageText.substring(0, 50) + '...' 
            : messageText;
          
          await apiClient.updateChat(chatToUse.id, { title: updatedTitle });
          await loadChats(); // Refresh chat list with new title
        }
      } else {
        // Send to existing thread
        const response = await apiClient.sendChatMessage({
          thread_id: threadId,
          message: messageText,
        });
        
        setMessages([...messages, response.user_message, response.assistant_message]);
      }
    } catch (err: any) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this conversation?')) return;
    
    try {
      await apiClient.deleteChat(chatId);
      setChats(chats.filter(c => c.id !== chatId));
      if (currentChat?.id === chatId) {
        setCurrentChat(null);
        setMessages([]);
        setCurrentThread(null);
      }
    } catch (err) {
      console.error('Failed to delete chat:', err);
    }
  };

  const handleArchiveChat = async (chatId: string, isArchived: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      await apiClient.updateChat(chatId, { is_archived: !isArchived });
      await loadChats();
    } catch (err) {
      console.error('Failed to archive chat:', err);
    }
  };

  const handlePinChat = async (chatId: string, isPinned: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      await apiClient.updateChat(chatId, { is_pinned: !isPinned });
      await loadChats();
    } catch (err) {
      console.error('Failed to pin chat:', err);
    }
  };

  const startEditingChat = (chat: Chat, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditingTitle(chat.title);
  };

  const saveEditedTitle = async (chatId: string) => {
    if (!editingTitle.trim()) return;
    
    try {
      await apiClient.updateChat(chatId, { title: editingTitle });
      await loadChats();
      setEditingChatId(null);
    } catch (err) {
      console.error('Failed to update chat title:', err);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="flex h-[75vh] bg-card rounded-lg border border-border overflow-hidden shadow-sm mx-4 mt-2 mb-4">
      {/* Sidebar */}
      <div className="w-60 border-r border-border flex flex-col bg-card">
          {/* Header */}
          <div className="p-3 border-b border-border space-y-2">
            <Button onClick={() => createNewChat()} className="w-full h-9" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
            
            {/* Archive Toggle */}
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowArchived(false)}
                variant={!showArchived ? "default" : "outline"}
                size="sm"
                className="flex-1 h-8 text-xs"
              >
                <MessageSquare className="h-3 w-3 mr-1.5" />
                Active
              </Button>
              <Button
                onClick={() => setShowArchived(true)}
                variant={showArchived ? "default" : "outline"}
                size="sm"
                className="flex-1 h-8 text-xs"
              >
                <Archive className="h-3 w-3 mr-1.5" />
                Archived
              </Button>
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'hsl(var(--muted)) transparent' }}>
            {loading ? (
              <div className="flex items-center justify-center p-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : chats.length === 0 ? (
              <div className="p-4 text-center">
                <div className="mb-2">
                  {showArchived ? (
                    <Archive className="h-8 w-8 mx-auto text-muted-foreground opacity-50" />
                  ) : (
                    <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground opacity-50" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {showArchived 
                    ? 'No archived conversations' 
                    : 'No chats yet. Create one to get started!'}
                </p>
              </div>
            ) : (
              <div className="p-2">
                <ul className="space-y-0.5">
                  {chats.map((chat, index) => (
                    <li
                      key={chat.id}
                      className={`group rounded-md transition-all duration-200 ${
                        currentChat?.id === chat.id 
                          ? 'bg-primary/10 border-l-2 border-primary' 
                          : 'hover:bg-muted/50 border-l-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 p-2.5">
                        {/* Number indicator */}
                        <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium ${
                          currentChat?.id === chat.id 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {index + 1}
                        </span>

                        {/* Chat content */}
                        <button
                          onClick={() => setCurrentChat(chat)}
                          className="flex-1 min-w-0 text-left"
                        >
                          <div className="flex items-center gap-1.5 mb-0.5">
                            {chat.is_pinned && <Pin className="h-3 w-3 text-primary fill-primary" />}
                            {chat.is_archived && <Archive className="h-3 w-3 text-muted-foreground" />}
                          </div>
                          
                          {editingChatId === chat.id ? (
                            <Input
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              onBlur={() => saveEditedTitle(chat.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEditedTitle(chat.id);
                                if (e.key === 'Escape') setEditingChatId(null);
                              }}
                              className="h-6 text-xs px-1"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <p className={`text-xs font-medium truncate ${
                              currentChat?.id === chat.id ? 'text-primary' : ''
                            }`}>
                              {chat.title}
                            </p>
                          )}
                        </button>

                        {/* Action menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className="flex-shrink-0 p-1 rounded hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={(e) => startEditingChat(chat, e)}>
                              <Edit3 className="h-3.5 w-3.5 mr-2" />
                              <span className="text-xs">Rename</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => handlePinChat(chat.id, chat.is_pinned, e)}>
                              <Pin className="h-3.5 w-3.5 mr-2" />
                              <span className="text-xs">{chat.is_pinned ? 'Unpin' : 'Pin'}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => handleArchiveChat(chat.id, chat.is_archived, e)}>
                              {chat.is_archived ? (
                                <ArchiveRestore className="h-3.5 w-3.5 mr-2" />
                              ) : (
                                <Archive className="h-3.5 w-3.5 mr-2" />
                              )}
                              <span className="text-xs">{chat.is_archived ? 'Unarchive' : 'Archive'}</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={(e) => handleDeleteChat(chat.id, e)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-2" />
                              <span className="text-xs">Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col w-full bg-card">
        {/* Chat Header */}
        <div className="border-b border-border px-6 py-3 bg-card">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-sm">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Hubbo Chat</h2>
              <p className="text-xs text-muted-foreground">
                Your intelligent project assistant
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4" style={{ scrollbarWidth: 'thin', scrollbarColor: 'hsl(var(--muted)) transparent' }}>
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4 py-8">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-3 shadow-lg">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Welcome to Hubbo Chat!</h3>
              <p className="text-sm text-muted-foreground max-w-md mb-5">
                I'm your AI assistant for project management. Ask me about project status, tasks,
                team workload, or anything else about your projects.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-w-xl w-full">
                <Card 
                  className="p-3 hover:bg-muted/30 cursor-pointer transition-all duration-200 border-border/50 hover:border-primary/30"
                  onClick={() => setInputMessage("What's the status of all my projects?")}
                >
                  <p className="text-xs font-medium mb-0.5">📊 Project Status</p>
                  <p className="text-[11px] text-muted-foreground">
                    "What's the status of all my projects?"
                  </p>
                </Card>
                <Card 
                  className="p-3 hover:bg-muted/30 cursor-pointer transition-all duration-200 border-border/50 hover:border-primary/30"
                  onClick={() => setInputMessage("Show me all in-progress tasks")}
                >
                  <p className="text-xs font-medium mb-0.5">✅ Task Overview</p>
                  <p className="text-[11px] text-muted-foreground">
                    "Show me all in-progress tasks"
                  </p>
                </Card>
                <Card 
                  className="p-3 hover:bg-muted/30 cursor-pointer transition-all duration-200 border-border/50 hover:border-primary/30"
                  onClick={() => setInputMessage("Who has the most tasks assigned?")}
                >
                  <p className="text-xs font-medium mb-0.5">👥 Team Workload</p>
                  <p className="text-[11px] text-muted-foreground">
                    "Who has the most tasks assigned?"
                  </p>
                </Card>
                <Card 
                  className="p-3 hover:bg-muted/30 cursor-pointer transition-all duration-200 border-border/50 hover:border-primary/30"
                  onClick={() => setInputMessage("What should I focus on today?")}
                >
                  <p className="text-xs font-medium mb-0.5">💡 Suggestions</p>
                  <p className="text-[11px] text-muted-foreground">
                    "What should I focus on today?"
                  </p>
                </Card>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2.5 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-xl px-3.5 py-2.5 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted/50 text-foreground border border-border/30'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown
                        components={{
                          h2: ({node, ...props}) => <h2 className="text-base font-semibold mt-3 mb-2 first:mt-0" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-sm font-semibold mt-2 mb-1.5" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-1 my-2" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal list-inside space-y-1 my-2" {...props} />,
                          li: ({node, ...props}) => <li className="text-sm" {...props} />,
                          p: ({node, ...props}) => <p className="text-sm my-2 leading-relaxed" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-semibold text-foreground" {...props} />,
                          em: ({node, ...props}) => <em className="italic text-muted-foreground" {...props} />,
                          code: ({node, ...props}) => <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono" {...props} />,
                          table: ({node, ...props}) => (
                            <div className="overflow-x-auto my-3">
                              <table className="min-w-full divide-y divide-border text-xs" {...props} />
                            </div>
                          ),
                          thead: ({node, ...props}) => <thead className="bg-muted/50" {...props} />,
                          tbody: ({node, ...props}) => <tbody className="divide-y divide-border" {...props} />,
                          tr: ({node, ...props}) => <tr className="hover:bg-muted/30 transition-colors" {...props} />,
                          th: ({node, ...props}) => <th className="px-3 py-2 text-left font-medium" {...props} />,
                          td: ({node, ...props}) => <td className="px-3 py-2" {...props} />,
                          hr: ({node, ...props}) => <hr className="my-3 border-border" {...props} />,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  )}
                  <p className="text-[10px] opacity-60 mt-1.5">{formatTime(message.created_at)}</p>
                </div>
                {message.role === 'user' && (
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            ))
          )}
          {sending && (
            <div className="flex gap-2.5 justify-start">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-muted/50 text-foreground rounded-xl px-3.5 py-2.5 border border-border/30">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-border px-6 py-3.5 bg-card">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex gap-2.5"
          >
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask Hubbo anything about your projects..."
              className="flex-1 h-10 text-sm"
              disabled={sending}
            />
            <Button type="submit" disabled={!inputMessage.trim() || sending} size="sm" className="h-10 px-4">
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
          <p className="text-[10px] text-muted-foreground mt-2 text-center opacity-70">
            Hubbo AI can make mistakes. Check important information.
          </p>
        </div>
      </div>
    </div>
  );
}

