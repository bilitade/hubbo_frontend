import { useState } from 'react';
import { apiClient } from '../../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Bot, Send, Sparkles } from 'lucide-react';

export function AIPage() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChat = async () => {
    if (!message.trim()) return;

    setLoading(true);
    try {
      const result = await apiClient.chat({ message });
      setResponse(result.response);
    } catch (err: any) {
      setResponse('Error: ' + (err.response?.data?.detail || 'Failed to get response'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Assistant</h1>
        <p className="text-muted-foreground">
          Chat with AI and get intelligent assistance
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <CardTitle>Chat</CardTitle>
            </div>
            <CardDescription>Ask questions and get AI-powered responses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message">Your Message</Label>
              <Input
                id="message"
                placeholder="How can I help you today?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleChat()}
                disabled={loading}
              />
            </div>

            <Button 
              onClick={handleChat} 
              disabled={loading || !message.trim()}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              {loading ? 'Sending...' : 'Send Message'}
            </Button>

            {response && (
              <div className="mt-4 p-4 rounded-lg bg-muted">
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  AI Response:
                </p>
                <p className="text-sm whitespace-pre-wrap">{response}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Features</CardTitle>
            <CardDescription>Available AI-powered capabilities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Chat Assistant</h4>
              <p className="text-sm text-muted-foreground">
                Have natural conversations and get intelligent responses
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Idea Generation</h4>
              <p className="text-sm text-muted-foreground">
                Generate creative ideas on any topic
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Content Enhancement</h4>
              <p className="text-sm text-muted-foreground">
                Improve, expand, or summarize your content
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Auto-Fill</h4>
              <p className="text-sm text-muted-foreground">
                Get smart suggestions for form fields
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Document Search</h4>
              <p className="text-sm text-muted-foreground">
                Search through documents using semantic search
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
