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
  Zap,
  Database
} from 'lucide-react';
import { Select } from '../../components/ui/select';

interface ApiKeyConfig {
  name: string;
  key: string;
  masked: boolean;
}

interface ModelConfig {
  provider: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  // API Keys State
  const [apiKeys, setApiKeys] = useState<ApiKeyConfig[]>([
    { name: 'OpenAI API Key', key: '', masked: true },
    { name: 'Anthropic API Key', key: '', masked: true },
    { name: 'Google AI API Key', key: '', masked: true },
    { name: 'Groq API Key', key: '', masked: true },
  ]);

  // Model Configuration State
  const [modelConfig, setModelConfig] = useState<ModelConfig>({
    provider: 'openai',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000,
  });

  // System Settings State
  const [systemSettings, setSystemSettings] = useState({
    enableStreaming: true,
    enableAgent: true,
    enableKnowledgeBase: true,
    defaultLanguage: 'en',
    maxUploadSize: 10,
  });

  useEffect(() => {
    // Load settings from localStorage or API
    loadSettings();
  }, []);

  const loadSettings = () => {
    try {
      const savedModelConfig = localStorage.getItem('hubbo_model_config');
      const savedSystemSettings = localStorage.getItem('hubbo_system_settings');
      const savedApiKeys = localStorage.getItem('hubbo_api_keys');

      if (savedModelConfig) {
        setModelConfig(JSON.parse(savedModelConfig));
      }
      if (savedSystemSettings) {
        setSystemSettings(JSON.parse(savedSystemSettings));
      }
      if (savedApiKeys) {
        setApiKeys(JSON.parse(savedApiKeys));
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    setSaveSuccess(false);
    setError('');

    try {
      // Save to localStorage (in production, this would be an API call)
      localStorage.setItem('hubbo_model_config', JSON.stringify(modelConfig));
      localStorage.setItem('hubbo_system_settings', JSON.stringify(systemSettings));
      
      // Only save API keys if they're not empty
      const keysToSave = apiKeys.map(k => ({
        ...k,
        key: k.key || '' // Keep existing if not changed
      }));
      localStorage.setItem('hubbo_api_keys', JSON.stringify(keysToSave));

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleApiKeyVisibility = (index: number) => {
    setApiKeys(prev => prev.map((k, i) => 
      i === index ? { ...k, masked: !k.masked } : k
    ));
  };

  const updateApiKey = (index: number, value: string) => {
    setApiKeys(prev => prev.map((k, i) => 
      i === index ? { ...k, key: value } : k
    ));
  };

  const modelProviders = [
    { value: 'openai', label: 'OpenAI', models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
    { value: 'anthropic', label: 'Anthropic', models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'] },
    { value: 'google', label: 'Google AI', models: ['gemini-pro', 'gemini-pro-vision'] },
    { value: 'groq', label: 'Groq', models: ['mixtral-8x7b', 'llama2-70b'] },
  ];

  const selectedProvider = modelProviders.find(p => p.value === modelConfig.provider);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <SettingsIcon className="h-8 w-8 text-primary" />
          Platform Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure AI models, API keys, and platform preferences
        </p>
      </div>

      {/* Success/Error Messages */}
      {saveSuccess && (
        <Alert className="border-green-500/50 bg-green-50 dark:bg-green-900/20">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Settings saved successfully!
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="border-destructive/50">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* API Keys Configuration */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                <CardTitle>API Keys</CardTitle>
              </div>
              <Badge variant="outline">Secure Storage</Badge>
            </div>
            <CardDescription>
              Configure API keys for different AI providers. Keys are stored securely and never exposed in logs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {apiKeys.map((apiKey, index) => (
              <div key={index} className="space-y-2">
                <Label htmlFor={`api-key-${index}`} className="text-sm font-semibold">
                  {apiKey.name}
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id={`api-key-${index}`}
                      type={apiKey.masked ? 'password' : 'text'}
                      value={apiKey.key}
                      onChange={(e) => updateApiKey(index, e.target.value)}
                      placeholder={`Enter ${apiKey.name.toLowerCase()}`}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => toggleApiKeyVisibility(index)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {apiKey.masked ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <Alert className="border-blue-500/50 bg-blue-50 dark:bg-blue-900/20 mt-4">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
                API keys are stored in your browser's local storage. For production use, configure environment variables on the server.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* AI Model Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <CardTitle>AI Model Configuration</CardTitle>
            </div>
            <CardDescription>
              Select and configure the AI model for chat and generation tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="provider" className="text-sm font-semibold">
                AI Provider
              </Label>
              <Select
                id="provider"
                value={modelConfig.provider}
                onChange={(e) => setModelConfig(prev => ({ 
                  ...prev, 
                  provider: e.target.value,
                  model: modelProviders.find(p => p.value === e.target.value)?.models[0] || ''
                }))}
              >
                {modelProviders.map(provider => (
                  <option key={provider.value} value={provider.value}>
                    {provider.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model" className="text-sm font-semibold">
                Model
              </Label>
              <Select
                id="model"
                value={modelConfig.model}
                onChange={(e) => setModelConfig(prev => ({ ...prev, model: e.target.value }))}
              >
                {selectedProvider?.models.map(model => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="temperature" className="text-sm font-semibold">
                  Temperature
                </Label>
                <span className="text-sm text-muted-foreground">{modelConfig.temperature}</span>
              </div>
              <input
                type="range"
                id="temperature"
                min="0"
                max="2"
                step="0.1"
                value={modelConfig.temperature}
                onChange={(e) => setModelConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <p className="text-xs text-muted-foreground">
                Lower values make output more focused, higher values more creative
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxTokens" className="text-sm font-semibold">
                Max Tokens
              </Label>
              <Input
                id="maxTokens"
                type="number"
                min="100"
                max="4000"
                value={modelConfig.maxTokens}
                onChange={(e) => setModelConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
              />
              <p className="text-xs text-muted-foreground">
                Maximum length of generated responses
              </p>
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-primary" />
              <CardTitle>System Settings</CardTitle>
            </div>
            <CardDescription>
              Configure platform behavior and features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-semibold">Enable Streaming</Label>
                <p className="text-xs text-muted-foreground">
                  Stream AI responses in real-time
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={systemSettings.enableStreaming}
                  onChange={(e) => setSystemSettings(prev => ({ ...prev, enableStreaming: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-semibold">Enable Agent Mode</Label>
                <p className="text-xs text-muted-foreground">
                  Use intelligent agent for enhanced reasoning
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={systemSettings.enableAgent}
                  onChange={(e) => setSystemSettings(prev => ({ ...prev, enableAgent: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-semibold">Enable Knowledge Base</Label>
                <p className="text-xs text-muted-foreground">
                  Use KB for context-aware responses
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={systemSettings.enableKnowledgeBase}
                  onChange={(e) => setSystemSettings(prev => ({ ...prev, enableKnowledgeBase: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxUploadSize" className="text-sm font-semibold">
                Max Upload Size (MB)
              </Label>
              <Input
                id="maxUploadSize"
                type="number"
                min="1"
                max="100"
                value={systemSettings.maxUploadSize}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, maxUploadSize: parseInt(e.target.value) }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language" className="text-sm font-semibold">
                Default Language
              </Label>
              <Select
                id="language"
                value={systemSettings.defaultLanguage}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, defaultLanguage: e.target.value }))}
              >
                <option value="en">English</option>
                <option value="am">Amharic (አማርኛ)</option>
                <option value="om">Oromo (Afaan Oromoo)</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Performance & Cache */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <CardTitle>Performance & Cache</CardTitle>
            </div>
            <CardDescription>
              Manage cache and performance settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button variant="outline" className="justify-start">
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear Cache
              </Button>
              <Button variant="outline" className="justify-start">
                <Database className="h-4 w-4 mr-2" />
                Reset Database
              </Button>
              <Button variant="outline" className="justify-start">
                <SettingsIcon className="h-4 w-4 mr-2" />
                Reset to Defaults
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-4 sticky bottom-4 bg-background/80 backdrop-blur-sm p-4 rounded-lg border shadow-lg">
        <Button
          variant="outline"
          onClick={loadSettings}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset Changes
        </Button>
        <Button
          onClick={handleSaveSettings}
          disabled={loading}
          className="bg-brand-gradient hover:bg-brand-gradient-hover shadow-brand"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <SettingsIcon className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium mb-1">Platform Configuration</h4>
              <p className="text-sm text-muted-foreground">
                These settings control how the platform interacts with AI services. API keys are stored locally in your browser. 
                For production deployments, configure these settings as environment variables on the server for better security.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

