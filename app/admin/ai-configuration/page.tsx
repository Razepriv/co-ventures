'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Settings,
  Save,
  RotateCcw,
  TestTube2,
  CheckCircle,
  XCircle,
  Loader2,
  TrendingUp,
  DollarSign,
  Building2,
  Scale,
  LogOut,
  Users,
  AlertCircle,
  Key,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const agentIcons = {
  market_pulse: TrendingUp,
  deal_underwriter: DollarSign,
  developer_verification: Building2,
  legal_regulatory: Scale,
  exit_optimizer: LogOut,
  committee_synthesizer: Users
}

interface AgentConfig {
  id: string
  agent_slug: string
  display_name: string
  description: string
  system_prompt: string
  model: string
  temperature: number
  max_tokens: number
  required_tier: string
  icon: string
  color_theme: string
  display_order: number
  is_enabled: boolean
  version: number
}

export default function AIConfigurationPage() {
  const [agents, setAgents] = useState<AgentConfig[]>([])
  const [selectedAgent, setSelectedAgent] = useState<AgentConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const [formData, setFormData] = useState<Partial<AgentConfig>>({})

  // Gemini API Configuration
  const [geminiApiKey, setGeminiApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [geminiModels, setGeminiModels] = useState<string[]>([])
  const [fetchingModels, setFetchingModels] = useState(false)
  const [savingApiKey, setSavingApiKey] = useState(false)

  const fetchGeminiModels = useCallback(async (apiKey: string) => {
    if (!apiKey) {
      toast.error('Please enter Gemini API key first')
      return
    }

    try {
      setFetchingModels(true)
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch models. Please check your API key.')
      }

      const data = await response.json()
      const modelNames = data.models
        .filter((model: any) => model.supportedGenerationMethods?.includes('generateContent'))
        .map((model: any) => model.name.replace('models/', ''))

      setGeminiModels(modelNames)
      toast.success(`Fetched ${modelNames.length} Gemini models`)
    } catch (error) {
      console.error('Error fetching Gemini models:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to fetch models')
    } finally {
      setFetchingModels(false)
    }
  }, [])

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      const { data, error } = await supabase
        .from('ai_agent_configurations')
        .select('*')
        .order('display_order', { ascending: true })

      if (error) throw error
      setAgents(data || [])
      if (data && data.length > 0) {
        setSelectedAgent((prev) => prev || data[0])
      }
    } catch (error) {
      console.error('Error fetching agents:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchGeminiApiKey = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('ai_api_keys')
        .select('api_key')
        .eq('provider', 'gemini')
        .single()

      if (data && !error) {
        const apiKey = (data as any).api_key
        setGeminiApiKey(apiKey)
        // Fetch models if API key exists
        if (apiKey) {
          fetchGeminiModels(apiKey)
        }
      }
    } catch (error) {
      console.error('Error fetching Gemini API key:', error)
    }
  }, [fetchGeminiModels])

  useEffect(() => {
    fetchAgents()
    fetchGeminiApiKey()

    // Set up realtime subscription for AI configuration changes
    const supabase = createClient()
    const channel = supabase
      .channel('admin_ai_config_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ai_agent_configurations' }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          console.log('AI configuration updated in real-time')
        }
        fetchAgents()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchAgents, fetchGeminiApiKey])

  useEffect(() => {
    if (selectedAgent) {
      setFormData(selectedAgent)
    }
  }, [selectedAgent])

  async function saveGeminiApiKey() {
    if (!geminiApiKey.trim()) {
      toast.error('Please enter a valid API key')
      return
    }

    try {
      setSavingApiKey(true)
      const supabase = createClient()

      // Upsert API key
      const { error } = await (supabase as any)
        .from('ai_api_keys')
        .upsert({
          provider: 'gemini',
          api_key: geminiApiKey.trim(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'provider'
        })

      if (error) throw error

      toast.success('Gemini API key saved successfully!')
      // Fetch models with new key
      await fetchGeminiModels(geminiApiKey.trim())
    } catch (error) {
      console.error('Error saving API key:', error)
      toast.error('Failed to save API key')
    } finally {
      setSavingApiKey(false)
    }
  }

  async function handleSave() {
    if (!selectedAgent || !formData) return

    try {
      setSaving(true)
      const supabase = createClient()

      // Save configuration
      const { data: updatedAgent, error } = await supabase
        .from('ai_agent_configurations')
        // @ts-ignore
        .update({
          display_name: formData.display_name,
          description: formData.description,
          system_prompt: formData.system_prompt,
          model: formData.model,
          temperature: formData.temperature,
          max_tokens: formData.max_tokens,
          required_tier: formData.required_tier,
          color_theme: formData.color_theme,
          is_enabled: formData.is_enabled,
          version: selectedAgent.version + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedAgent.id)
        .select()
        .single()

      if (error) throw error

      // Save to history
      // @ts-ignore
      await supabase.from('ai_agent_configuration_history').insert({
        agent_config_id: selectedAgent.id,
        system_prompt: formData.system_prompt || '',
        model: formData.model || '',
        temperature: formData.temperature || 0.3,
        max_tokens: formData.max_tokens || 2000,
        version: selectedAgent.version + 1,
        change_notes: 'Updated via admin panel'
      })

      // Refresh agents list
      await fetchAgents()
      alert('Configuration saved successfully!')
    } catch (error) {
      console.error('Error saving configuration:', error)
      alert('Failed to save configuration')
    } finally {
      setSaving(false)
    }
  }

  async function handleTest() {
    if (!selectedAgent) return

    try {
      setTesting(true)
      setTestResult(null)

      // Get a sample property for testing
      const supabase = createClient()
      const { data: property } = await supabase
        .from('properties')
        .select('*')
        .limit(1)
        .single()

      if (!property) {
        alert('No properties available for testing')
        return
      }

      // Test the agent
      const response = await fetch('/api/ai/analyze-property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // @ts-ignore
          propertyId: property.id,
          agentSlugs: [selectedAgent.agent_slug]
        })
      })

      const data = await response.json()
      setTestResult(data)
    } catch (error) {
      console.error('Test error:', error)
      setTestResult({ error: 'Test failed', message: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setTesting(false)
    }
  }

  async function handleRollback() {
    if (!selectedAgent) return

    if (!confirm('Are you sure you want to rollback to the previous version?')) return

    try {
      const supabase = createClient()

      // Get previous version
      const { data: history, error: historyError } = await supabase
        .from('ai_agent_configuration_history')
        .select('*')
        .eq('agent_config_id', selectedAgent.id)
        .order('version', { ascending: false })
        .limit(2)

      if (historyError || !history || history.length < 2) {
        alert('No previous version available')
        return
      }

      const previousVersion = history[1]

      // Restore previous version
      const { error } = await supabase
        .from('ai_agent_configurations')
        // @ts-ignore
        .update({
          // @ts-ignore
          system_prompt: previousVersion.system_prompt,
          // @ts-ignore
          model: previousVersion.model,
          // @ts-ignore
          temperature: previousVersion.temperature,
          // @ts-ignore
          max_tokens: previousVersion.max_tokens,
          version: selectedAgent.version + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedAgent.id)

      if (error) throw error

      await fetchAgents()
      alert('Rolled back to previous version!')
    } catch (error) {
      console.error('Rollback error:', error)
      alert('Failed to rollback')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-coral" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-charcoal">AI Agent Configuration</h1>
          <p className="text-gray-600 mt-2">
            Customize system prompts, model parameters, and agent behavior
          </p>
        </div>
        <Settings className="h-8 w-8 text-coral" />
      </div>

      {/* Gemini API Configuration Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
            <Key className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-charcoal mb-2">Gemini API Configuration</h2>
            <p className="text-gray-600 text-sm mb-4">
              Configure your Google Gemini API key to enable AI-powered features with real-time model updates
            </p>

            <div className="space-y-4">
              {/* API Key Input */}
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Input
                    type={showApiKey ? 'text' : 'password'}
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    placeholder="Enter your Gemini API key (e.g., AIzaSy...)"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Button
                  onClick={saveGeminiApiKey}
                  disabled={savingApiKey || !geminiApiKey.trim()}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  {savingApiKey ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Key
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => geminiApiKey && fetchGeminiModels(geminiApiKey)}
                  disabled={fetchingModels || !geminiApiKey}
                  variant="outline"
                >
                  {fetchingModels ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Fetching...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Fetch Models
                    </>
                  )}
                </Button>
              </div>

              {/* Available Models */}
              {geminiModels.length > 0 && (
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-charcoal flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Available Gemini Models ({geminiModels.length})
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {geminiModels.map((model) => (
                      <Badge key={model} className="bg-blue-100 text-blue-700 border-blue-300">
                        {model}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    💡 These models are now available in the Model dropdown below
                  </p>
                </div>
              )}

              {/* API Key Info */}
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <AlertCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p>
                  Get your API key from{' '}
                  <a
                    href="https://makersuite.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600 underline"
                  >
                    Google AI Studio
                  </a>
                  . Models will be fetched automatically and updated in real-time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar - Agents List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-charcoal mb-4">AI Agents</h2>
            <div className="space-y-2">
              {agents.map((agent) => {
                const Icon = agentIcons[agent.agent_slug as keyof typeof agentIcons] || Settings
                const isSelected = selectedAgent?.id === agent.id

                return (
                  <button
                    key={agent.id}
                    onClick={() => setSelectedAgent(agent)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${isSelected
                      ? 'bg-coral-light border-2 border-coral'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }`}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: agent.color_theme + '20' }}
                    >
                      <Icon className="h-5 w-5" style={{ color: agent.color_theme }} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`font-medium ${isSelected ? 'text-coral' : 'text-charcoal'}`}>
                        {agent.display_name}
                      </p>
                      <p className="text-xs text-gray-500">v{agent.version}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {/* @ts-ignore */}
                      <Badge variant={agent.is_enabled ? 'green' : 'gray'}>
                        {agent.is_enabled ? 'Active' : 'Disabled'}
                      </Badge>
                      <span className="text-xs text-gray-500 capitalize">
                        {agent.required_tier.replace('ai_', '')}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Content - Configuration Form */}
        <div className="lg:col-span-2">
          {selectedAgent && (
            <motion.div
              key={selectedAgent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              {/* Agent Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: selectedAgent.color_theme + '20' }}
                  >
                    {(() => {
                      const Icon = agentIcons[selectedAgent.agent_slug as keyof typeof agentIcons] || Settings
                      return <Icon className="h-8 w-8" style={{ color: selectedAgent.color_theme }} />
                    })()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-charcoal">{formData.display_name}</h2>
                    <p className="text-gray-600">{selectedAgent.agent_slug}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRollback}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Rollback
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTest}
                    disabled={testing}
                  >
                    {testing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <TestTube2 className="h-4 w-4 mr-2" />
                    )}
                    Test
                  </Button>
                </div>
              </div>

              {/* Configuration Form */}
              <div className="space-y-6">
                {/* Display Name */}
                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">
                    Display Name
                  </label>
                  <Input
                    value={formData.display_name || ''}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">
                    Description
                  </label>
                  <Input
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                {/* System Prompt */}
                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">
                    System Prompt
                  </label>
                  <textarea
                    value={formData.system_prompt || ''}
                    onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coral focus:border-transparent font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.system_prompt?.length || 0} characters
                  </p>
                </div>

                {/* Model Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">
                      Model
                    </label>
                    <select
                      value={formData.model || 'gpt-4-turbo-preview'}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coral focus:border-transparent"
                    >
                      <optgroup label="OpenAI Models">
                        <option value="gpt-4-turbo-preview">GPT-4 Turbo Preview</option>
                        <option value="gpt-4">GPT-4</option>
                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                        <option value="gpt-3.5-turbo-16k">GPT-3.5 Turbo 16K</option>
                      </optgroup>
                      {geminiModels.length > 0 && (
                        <optgroup label="Google Gemini Models">
                          {geminiModels.map((model) => (
                            <option key={model} value={model}>
                              {model}
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                    {geminiModels.length === 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Add Gemini API key above to see Gemini models
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">
                      Required Tier
                    </label>
                    <select
                      value={formData.required_tier || 'ai_basic'}
                      onChange={(e) => setFormData({ ...formData, required_tier: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coral focus:border-transparent"
                    >
                      <option value="free">Free</option>
                      <option value="ai_basic">AI Basic</option>
                      <option value="ai_pro">AI Pro</option>
                      <option value="ai_enterprise">AI Enterprise</option>
                    </select>
                  </div>
                </div>

                {/* Temperature & Max Tokens */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">
                      Temperature: {formData.temperature || 0.3}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={formData.temperature || 0.3}
                      onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Precise</span>
                      <span>Creative</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">
                      Max Tokens
                    </label>
                    <Input
                      type="number"
                      min="100"
                      max="4000"
                      step="100"
                      value={formData.max_tokens || 2000}
                      onChange={(e) => setFormData({ ...formData, max_tokens: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                {/* Color Theme & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">
                      Color Theme
                    </label>
                    <Input
                      type="color"
                      value={formData.color_theme || '#8B5CF6'}
                      onChange={(e) => setFormData({ ...formData, color_theme: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">
                      Status
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_enabled || false}
                        onChange={(e) => setFormData({ ...formData, is_enabled: e.target.checked })}
                        className="w-5 h-5 text-coral focus:ring-coral"
                      />
                      <span className="text-sm font-medium text-charcoal">
                        {formData.is_enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Test Results */}
                {testResult && (
                  <div className={`p-4 rounded-lg border-2 ${testResult.error ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                    }`}>
                    <div className="flex items-start gap-3">
                      {testResult.error ? (
                        <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-sm mb-2">
                          {testResult.error ? 'Test Failed' : 'Test Successful'}
                        </p>
                        <pre className="text-xs overflow-auto max-h-40 bg-white p-2 rounded border">
                          {JSON.stringify(testResult, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => setFormData(selectedAgent)}
                  >
                    Reset
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-coral hover:bg-coral-dark text-white"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Configuration
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
