import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { 
  Settings as SettingsIcon, 
  Key, 
  Brain, 
  Save, 
  Eye, 
  EyeOff, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Server,
  Mail,
  Globe,
  HardDrive,
  Zap
} from 'lucide-react';
import { apiClient } from '../../services/api';

export function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Settings State
  const [settings, setSettings] = useState({
    // General
    app_name: '',
    frontend_url: '',
    
    // AI Configuration
    ai_provider: 'openai',
    ai_model: 'gpt-3.5-turbo',
    ai_temperature: 0.7,
    ai_max_tokens: 1000,
    openai_api_key: '',
    anthropic_api_key: '',
    embedding_model: 'text-embedding-ada-002',
    
    // Email Configuration
    mail_server: '',
    mail_port: 587,
    mail_username: '',
    mail_password: '',
    mail_from: '',
    mail_from_name: '',
    mail_starttls: true,
    mail_ssl_tls: false,
    
    // Storage
    max_upload_size: 10485760, // 10MB in bytes
    upload_dir: './data/uploads',
    vector_store_path: './data/vectorstore',
    
    // Feature Flags
    enable_streaming: true,
    enable_agent: true,
    enable_knowledge_base: true,
  });

  // Password visibility toggles
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [showAnthropicKey, setShowAnthropicKey] = useState(false);
  const [showMailPassword, setShowMailPassword] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await apiClient.getSystemSettings();
      
      // Update settings from backend
      setSettings({
        app_name: data.app_name || 'HUBBO',
        frontend_url: data.frontend_url || 'http://localhost:3000',
        ai_provider: data.ai_provider || 'openai',
        ai_model: data.ai_model || 'gpt-3.5-turbo',
        ai_temperature: data.ai_temperature || 0.7,
        ai_max_tokens: data.ai_max_tokens || 1000,
        openai_api_key: '', // Never send actual key from server
        anthropic_api_key: '', // Never send actual key from server
        embedding_model: data.embedding_model || 'text-embedding-ada-002',
        mail_server: data.mail_server || 'smtp.gmail.com',
        mail_port: data.mail_port || 587,
        mail_username: data.mail_username || '',
        mail_password: '', // Never send actual password from server
        mail_from: data.mail_from || '',
        mail_from_name: data.mail_from_name || 'HUBBO',
        mail_starttls: data.mail_starttls ?? true,
        mail_ssl_tls: data.mail_ssl_tls ?? false,
        max_upload_size: data.max_upload_size || 10485760,
        upload_dir: data.upload_dir || './data/uploads',
        vector_store_path: data.vector_store_path || './data/vectorstore',
        enable_streaming: data.enable_streaming ?? true,
        enable_agent: data.enable_agent ?? true,
        enable_knowledge_base: data.enable_knowledge_base ?? true,
      });
      
      setHasChanges(false);
    } catch (err: any) {
      console.error('Failed to load settings:', err);
      setError(err.response?.data?.detail || 'Failed to load settings. You may not have admin permissions.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setError('');

    try {
      // Only send non-empty values
      const updateData: any = {};
      
      Object.entries(settings).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          updateData[key] = value;
        }
      });

      await apiClient.updateSystemSettings(updateData);
      
      setSaveSuccess(true);
      setHasChanges(false);
      setTimeout(() => setSaveSuccess(false), 5000);
      
      // Reload to get masked values
      await loadSettings();
    } catch (err: any) {
      console.error('Failed to save settings:', err);
      setError(err.response?.data?.detail || 'Failed to save settings. Please check your permissions and try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetSettings = async () => {
    if (!confirm('Reset all settings to environment defaults? This cannot be undone.')) return;
    
    setLoading(true);
    setError('');
    
    try {
      await apiClient.resetSystemSettings();
      await loadSettings();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to reset settings.');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const formatBytes = (bytes: number): string => {
    return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
  };

  const modelProviders = [
    { 
      value: 'openai', 
      label: 'OpenAI', 
      models: ['gpt-4', 'gpt-4-turbo', 'gpt-4o', 'gpt-3.5-turbo'] 
    },
    { 
      value: 'anthropic', 
      label: 'Anthropic', 
      models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'] 
    },
  ];

  const selectedProvider = modelProviders.find(p => p.value === settings.ai_provider);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/30 border-t-primary"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <SettingsIcon className="h-8 w-8 text-primary" />
          System Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure AI models, email, storage, and platform preferences
        </p>
      </div>

      {/* Success/Error Messages */}
      {saveSuccess && (
        <Alert className="border-green-500/50 bg-green-50 dark:bg-green-900/20">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            ✅ Settings saved successfully! Changes will take effect immediately.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="border-destructive/50">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <CardTitle>General Settings</CardTitle>
            </div>
            <CardDescription>
              Basic platform configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="app-name" className="text-sm font-semibold">
                  Application Name
                </Label>
                <Input
                  id="app-name"
                  value={settings.app_name}
                  onChange={(e) => updateSetting('app_name', e.target.value)}
                  placeholder="HUBBO"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="frontend-url" className="text-sm font-semibold">
                  Frontend URL
                </Label>
                <Input
                  id="frontend-url"
                  value={settings.frontend_url}
                  onChange={(e) => updateSetting('frontend_url', e.target.value)}
                  placeholder="https://your-domain.com"
                />
                <p className="text-xs text-muted-foreground">
                  Used for password reset links and email templates
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <CardTitle>AI Model Configuration</CardTitle>
            </div>
            <CardDescription>
              Configure AI provider, model, and behavior
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ai-provider" className="text-sm font-semibold">
                  AI Provider
                </Label>
                <select
                  id="ai-provider"
                  value={settings.ai_provider}
                  onChange={(e) => {
                    const newProvider = e.target.value;
                    const provider = modelProviders.find(p => p.value === newProvider);
                    updateSetting('ai_provider', newProvider);
                    if (provider) {
                      updateSetting('ai_model', provider.models[0]);
                    }
                  }}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {modelProviders.map(provider => (
                    <option key={provider.value} value={provider.value}>
                      {provider.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ai-model" className="text-sm font-semibold">
                  Model
                </Label>
                <select
                  id="ai-model"
                  value={settings.ai_model}
                  onChange={(e) => updateSetting('ai_model', e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {selectedProvider?.models.map(model => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="temperature" className="text-sm font-semibold">
                  Temperature
                </Label>
                <span className="text-sm text-muted-foreground">{settings.ai_temperature.toFixed(1)}</span>
              </div>
              <input
                type="range"
                id="temperature"
                min="0"
                max="2"
                step="0.1"
                value={settings.ai_temperature}
                onChange={(e) => updateSetting('ai_temperature', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <p className="text-xs text-muted-foreground">
                Lower values (0.0-0.5): More focused and deterministic • Higher values (0.8-2.0): More creative and random
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-tokens" className="text-sm font-semibold">
                Max Tokens
              </Label>
              <Input
                id="max-tokens"
                type="number"
                min="100"
                max="32000"
                value={settings.ai_max_tokens}
                onChange={(e) => updateSetting('ai_max_tokens', parseInt(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Maximum length of AI responses (100-32000 tokens)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="embedding-model" className="text-sm font-semibold">
                Embedding Model
              </Label>
              <Input
                id="embedding-model"
                value={settings.embedding_model}
                onChange={(e) => updateSetting('embedding_model', e.target.value)}
                placeholder="text-embedding-ada-002"
              />
              <p className="text-xs text-muted-foreground">
                Model used for knowledge base embeddings
              </p>
            </div>
          </CardContent>
        </Card>

        {/* API Keys */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                <CardTitle>API Keys</CardTitle>
              </div>
              <Badge variant="outline" className="text-xs">🔒 Encrypted</Badge>
            </div>
            <CardDescription>
              Securely store API keys for AI services
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="openai-key" className="text-sm font-semibold">
                OpenAI API Key
              </Label>
              <div className="relative">
                <Input
                  id="openai-key"
                  type={showOpenAIKey ? 'text' : 'password'}
                  value={settings.openai_api_key}
                  onChange={(e) => updateSetting('openai_api_key', e.target.value)}
                  placeholder="sk-..."
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showOpenAIKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Required for OpenAI models (GPT-4, GPT-3.5, etc.)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="anthropic-key" className="text-sm font-semibold">
                Anthropic API Key
              </Label>
              <div className="relative">
                <Input
                  id="anthropic-key"
                  type={showAnthropicKey ? 'text' : 'password'}
                  value={settings.anthropic_api_key}
                  onChange={(e) => updateSetting('anthropic_api_key', e.target.value)}
                  placeholder="sk-ant-..."
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowAnthropicKey(!showAnthropicKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showAnthropicKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Required for Anthropic models (Claude)
              </p>
            </div>

            <Alert className="border-blue-500/50 bg-blue-50 dark:bg-blue-900/20">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
                ℹ️ API keys are stored encrypted in the database and never logged or exposed in responses.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Email Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <CardTitle>Email Configuration</CardTitle>
            </div>
            <CardDescription>
              Configure SMTP settings for email notifications and password resets
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mail-server" className="text-sm font-semibold">
                  SMTP Server
                </Label>
                <Input
                  id="mail-server"
                  value={settings.mail_server}
                  onChange={(e) => updateSetting('mail_server', e.target.value)}
                  placeholder="smtp.gmail.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mail-port" className="text-sm font-semibold">
                  SMTP Port
                </Label>
                <Input
                  id="mail-port"
                  type="number"
                  value={settings.mail_port}
                  onChange={(e) => updateSetting('mail_port', parseInt(e.target.value))}
                  placeholder="587"
                />
                <p className="text-xs text-muted-foreground">
                  587 for TLS, 465 for SSL
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mail-username" className="text-sm font-semibold">
                  Email Username
                </Label>
                <Input
                  id="mail-username"
                  type="email"
                  value={settings.mail_username}
                  onChange={(e) => updateSetting('mail_username', e.target.value)}
                  placeholder="your-email@gmail.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mail-password" className="text-sm font-semibold">
                  Email Password
                </Label>
                <div className="relative">
                  <Input
                    id="mail-password"
                    type={showMailPassword ? 'text' : 'password'}
                    value={settings.mail_password}
                    onChange={(e) => updateSetting('mail_password', e.target.value)}
                    placeholder="App-specific password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMailPassword(!showMailPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {showMailPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mail-from" className="text-sm font-semibold">
                  From Email
                </Label>
                <Input
                  id="mail-from"
                  type="email"
                  value={settings.mail_from}
                  onChange={(e) => updateSetting('mail_from', e.target.value)}
                  placeholder="noreply@yourdomain.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mail-from-name" className="text-sm font-semibold">
                  From Name
                </Label>
                <Input
                  id="mail-from-name"
                  value={settings.mail_from_name}
                  onChange={(e) => updateSetting('mail_from_name', e.target.value)}
                  placeholder="HUBBO"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Use STARTTLS</Label>
                  <p className="text-xs text-muted-foreground">
                    Encrypt connection with STARTTLS (recommended)
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.mail_starttls}
                    onChange={(e) => updateSetting('mail_starttls', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Use SSL/TLS</Label>
                  <p className="text-xs text-muted-foreground">
                    Use SSL/TLS encryption (port 465)
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.mail_ssl_tls}
                    onChange={(e) => updateSetting('mail_ssl_tls', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Storage Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-primary" />
              <CardTitle>Storage Configuration</CardTitle>
            </div>
            <CardDescription>
              Configure file storage and upload limits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="max-upload" className="text-sm font-semibold">
                  Max Upload Size
                </Label>
                <span className="text-sm font-semibold text-primary">
                  {formatBytes(settings.max_upload_size)}
                </span>
              </div>
              <input
                type="range"
                id="max-upload"
                min="1048576"
                max="104857600"
                step="1048576"
                value={settings.max_upload_size}
                onChange={(e) => updateSetting('max_upload_size', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <p className="text-xs text-muted-foreground">
                Range: 1 MB to 100 MB
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="upload-dir" className="text-sm font-semibold">
                  Upload Directory
                </Label>
                <Input
                  id="upload-dir"
                  value={settings.upload_dir}
                  onChange={(e) => updateSetting('upload_dir', e.target.value)}
                  placeholder="./data/uploads"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vector-store" className="text-sm font-semibold">
                  Vector Store Path
                </Label>
                <Input
                  id="vector-store"
                  value={settings.vector_store_path}
                  onChange={(e) => updateSetting('vector_store_path', e.target.value)}
                  placeholder="./data/vectorstore"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Flags */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <CardTitle>Feature Flags</CardTitle>
            </div>
            <CardDescription>
              Enable or disable platform features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-sm font-semibold">Enable Streaming</Label>
                <p className="text-xs text-muted-foreground">
                  Stream AI responses in real-time for better UX
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enable_streaming}
                  onChange={(e) => updateSetting('enable_streaming', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-sm font-semibold">Enable Agent Mode</Label>
                <p className="text-xs text-muted-foreground">
                  Use intelligent agent for enhanced reasoning and tool usage
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enable_agent}
                  onChange={(e) => updateSetting('enable_agent', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-sm font-semibold">Enable Knowledge Base</Label>
                <p className="text-xs text-muted-foreground">
                  Use knowledge base for context-aware responses (RAG)
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enable_knowledge_base}
                  onChange={(e) => updateSetting('enable_knowledge_base', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-500/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
            </div>
            <CardDescription>
              Destructive actions - use with caution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={handleResetSettings}
              className="border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset to Environment Defaults
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              This will delete all custom settings and revert to values from environment variables
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Save Button - Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t shadow-lg z-50">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {hasChanges && (
                <Badge variant="secondary" className="text-xs">
                  Unsaved changes
                </Badge>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={loadSettings}
                disabled={saving}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Discard Changes
              </Button>
              <Button
                onClick={handleSaveSettings}
                disabled={saving || !hasChanges}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save All Settings
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Server className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium mb-2">Production Configuration</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  <strong>Database Storage:</strong> Settings are stored in the database and override environment variables.
                </p>
                <p>
                  <strong>Security:</strong> API keys and passwords are encrypted and never exposed in API responses.
                </p>
                <p>
                  <strong>Environment Variables:</strong> For initial setup or fallback, configure settings in .env file.
                </p>
                <p className="pt-2">
                  <strong>⚠️ Important:</strong> Changes take effect immediately. Test in development before updating production settings.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
