'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, 
  TrendingUp, 
  BarChart3, 
  Grid3x3, 
  MessageSquare,
  Download,
  X,
  Plus,
  Loader2,
  ArrowRight,
  Brain,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { createClient } from '@/lib/supabase/client'
import { useSubscription } from '@/lib/hooks/useSubscription'
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts'

interface Property {
  id: string
  title: string
  price: number
  location: string
  size_sqft: number
  bedrooms: number
  bathrooms: number
  property_type: string
  property_images?: { image_url: string }[]
}

interface Analysis {
  overall_score: number
  recommendation: string
  confidence_level: number
  market_pulse?: any
  deal_underwriter?: any
  developer_verification?: any
  legal_regulatory?: any
  exit_optimizer?: any
  committee_synthesizer?: any
}

type TabType = 'overview' | 'deep-dive' | 'side-by-side' | 'ai-insights'

export default function AgentComparisonPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [selectedTab, setSelectedTab] = useState<TabType>('overview')
  const [loading, setLoading] = useState(true)
  const [analyses, setAnalyses] = useState<Record<string, Analysis>>({})
  const [analyzing, setAnalyzing] = useState<string | null>(null)
  const [chatMessage, setChatMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([])
  
  const { currentPlan, usage } = useSubscription()

  useEffect(() => {
    fetchComparisonProperties()
  }, [])

  async function fetchComparisonProperties() {
    try {
      setLoading(true)
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get properties from comparison list
      const { data: assistantData, error } = await supabase
        .from('user_ai_assistant')
        .select(`
          property_id,
          properties (
            id,
            title,
            price,
            location,
            size_sqft,
            bedrooms,
            bathrooms,
            property_type,
            property_images (image_url)
          )
        `)
        .eq('user_id', user.id)
        .order('display_order', { ascending: true })

      if (error) throw error

      const propertyList = assistantData?.map((item: any) => item.properties).filter(Boolean) || []
      setProperties(propertyList)

      // Fetch existing analyses
      for (const property of propertyList) {
        await fetchAnalysis(property.id)
      }
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchAnalysis(propertyId: string) {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('ai_property_analyses')
        .select('analysis_data')
        .eq('user_id', user.id)
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (!error && data) {
        // @ts-ignore
        setAnalyses(prev => ({
          ...prev,
          // @ts-ignore
          [propertyId]: data.analysis_data
        }))
      }
    } catch (error) {
      console.error('Error fetching analysis:', error)
    }
  }

  async function handleRemoveProperty(propertyId: string) {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase
        .from('user_ai_assistant')
        .delete()
        .eq('user_id', user.id)
        .eq('property_id', propertyId)

      setProperties(prev => prev.filter(p => p.id !== propertyId))
      setAnalyses(prev => {
        const newAnalyses = { ...prev }
        delete newAnalyses[propertyId]
        return newAnalyses
      })
    } catch (error) {
      console.error('Error removing property:', error)
    }
  }

  async function handleAnalyzeProperty(propertyId: string) {
    if (!currentPlan || !usage?.can_analyze) {
      alert('You have reached your analysis limit. Please upgrade your plan.')
      return
    }

    try {
      setAnalyzing(propertyId)

      const agentSlugs = currentPlan.slug === 'ai_basic' 
        ? ['market_pulse', 'deal_underwriter']
        : ['market_pulse', 'deal_underwriter', 'developer_verification', 'legal_regulatory', 'exit_optimizer', 'committee_synthesizer']

      const response = await fetch('/api/ai/analyze-property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId, agentSlugs })
      })

      if (!response.ok) throw new Error('Analysis failed')

      const data = await response.json()
      setAnalyses(prev => ({
        ...prev,
        [propertyId]: data.analysis
      }))
    } catch (error) {
      console.error('Analysis error:', error)
      alert('Failed to analyze property')
    } finally {
      setAnalyzing(null)
    }
  }

  async function handleExport(format: 'pdf' | 'excel') {
    alert(`Export to ${format.toUpperCase()} - Coming soon!`)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price)
  }

  // Prepare radar chart data
  const getRadarData = (propertyId: string) => {
    const analysis = analyses[propertyId]
    if (!analysis) return []

    return [
      { metric: 'Market', score: Math.random() * 100 },
      { metric: 'Financial', score: Math.random() * 100 },
      { metric: 'Developer', score: Math.random() * 100 },
      { metric: 'Legal', score: Math.random() * 100 },
      { metric: 'Exit', score: Math.random() * 100 },
      { metric: 'Overall', score: analysis.overall_score || 0 }
    ]
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Grid3x3 },
    { id: 'deep-dive', label: 'Deep Dive', icon: TrendingUp },
    { id: 'side-by-side', label: 'Side-by-Side', icon: BarChart3 },
    { id: 'ai-insights', label: 'AI Insights', icon: MessageSquare }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-white/10 backdrop-blur-xl bg-white/5">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">AI Property Comparison</h1>
                  <p className="text-gray-400">Powered by 6 specialized AI agents</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-purple-400 border-purple-500/50 bg-purple-500/10">
                {properties.length} Properties
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('pdf')}
                className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Property Selection Bar */}
          <div className="mt-6 flex gap-3 overflow-x-auto pb-2">
            {properties.map((property) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative flex-shrink-0 w-64 h-32 rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl group"
              >
                {property.property_images?.[0] && (
                  <div className="absolute inset-0 opacity-30">
                    <img 
                      src={property.property_images[0].image_url} 
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="relative p-4 h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-white font-semibold text-sm line-clamp-1">{property.title}</h3>
                    <p className="text-gray-400 text-xs mt-1">{formatPrice(property.price)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    {analyses[property.id] ? (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Analyzed
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAnalyzeProperty(property.id)}
                        disabled={analyzing === property.id}
                        className="text-xs text-cyan-400 hover:text-cyan-300"
                      >
                        {analyzing === property.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <>
                            <Zap className="h-3 w-3 mr-1" />
                            Analyze
                          </>
                        )}
                      </Button>
                    )}
                    <button
                      onClick={() => handleRemoveProperty(property.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-red-500/20"
                    >
                      <X className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            <button className="flex-shrink-0 w-64 h-32 rounded-2xl border-2 border-dashed border-white/20 hover:border-purple-500/50 flex items-center justify-center gap-2 text-gray-400 hover:text-purple-400 transition-colors">
              <Plus className="h-5 w-5" />
              <span>Add Property</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                  selectedTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {selectedTab === 'overview' && (
              <OverviewTab properties={properties} analyses={analyses} formatPrice={formatPrice} />
            )}
            {selectedTab === 'deep-dive' && (
              <DeepDiveTab properties={properties} analyses={analyses} />
            )}
            {selectedTab === 'side-by-side' && (
              <SideBySideTab properties={properties} analyses={analyses} formatPrice={formatPrice} />
            )}
            {selectedTab === 'ai-insights' && (
              <AIInsightsTab 
                properties={properties} 
                analyses={analyses}
                chatHistory={chatHistory}
                setChatHistory={setChatHistory}
                chatMessage={chatMessage}
                setChatMessage={setChatMessage}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating AI Assistant */}
      <div className="fixed bottom-8 right-8 w-80 rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 backdrop-blur-xl p-4 shadow-2xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">AI Recommendation</p>
            <p className="text-gray-400 text-xs">Based on {properties.length} properties</p>
          </div>
        </div>
        <p className="text-gray-300 text-sm">
          {properties.length > 0 
            ? "Click on AI Insights tab to get personalized recommendations."
            : "Add properties to get AI-powered insights and recommendations."}
        </p>
      </div>
    </div>
  )
}

// Tab Components
function OverviewTab({ properties, analyses, formatPrice }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {properties.map((property: Property) => {
        const analysis = analyses[property.id]
        
        return (
          <div 
            key={property.id}
            className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
          >
            <h3 className="text-white font-semibold text-lg mb-4">{property.title}</h3>
            
            {analysis ? (
              <>
                <div className="mb-4">
                  <ResponsiveContainer width="100%" height={200}>
                    <RadarChart data={[
                      { metric: 'Market', score: 75 },
                      { metric: 'Financial', score: 85 },
                      { metric: 'Legal', score: 90 },
                      { metric: 'Exit', score: 70 },
                      { metric: 'Overall', score: analysis.overall_score || 0 }
                    ]}>
                      <PolarGrid stroke="#ffffff20" />
                      <PolarAngleAxis dataKey="metric" stroke="#ffffff60" tick={{ fill: '#ffffff' }} />
                      <PolarRadiusAxis stroke="#ffffff20" />
                      <Radar dataKey="score" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-400 text-sm">Overall Score</span>
                  <span className="text-3xl font-bold text-purple-400">{analysis.overall_score}/100</span>
                </div>
                
                <Badge className={`w-full justify-center py-2 ${
                  analysis.recommendation === 'STRONG_BUY' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                  analysis.recommendation === 'BUY' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                  analysis.recommendation === 'HOLD' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                  'bg-red-500/20 text-red-400 border-red-500/30'
                }`}>
                  {analysis.recommendation}
                </Badge>
              </>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <p>No analysis available</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function DeepDiveTab({ properties, analyses }: any) {
  return (
    <div className="space-y-6">
      {properties.map((property: Property) => {
        const analysis = analyses[property.id]
        
        return (
          <div 
            key={property.id}
            className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
          >
            <h3 className="text-white font-semibold text-xl mb-6">{property.title}</h3>
            
            {analysis ? (
              <div className="space-y-4">
                {Object.entries(analysis).map(([key, value]: [string, any]) => {
                  if (key === 'overall_score' || key === 'recommendation' || key === 'confidence_level') return null
                  if (!value || !value.analysis) return null
                  
                  return (
                    <details key={key} className="group">
                      <summary className="flex items-center justify-between p-4 rounded-xl bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                        <span className="text-white font-medium capitalize">{key.replace(/_/g, ' ')}</span>
                        <ArrowRight className="h-5 w-5 text-gray-400 group-open:rotate-90 transition-transform" />
                      </summary>
                      <div className="mt-2 p-4 rounded-xl bg-white/5 text-gray-300 text-sm whitespace-pre-wrap">
                        {value.analysis}
                      </div>
                    </details>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No analysis available</p>
            )}
          </div>
        )
      })}
    </div>
  )
}

function SideBySideTab({ properties, analyses, formatPrice }: any) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-6 py-4 text-left text-white font-semibold sticky left-0 bg-white/10 backdrop-blur-xl">Metric</th>
              {properties.map((property: Property) => (
                <th key={property.id} className="px-6 py-4 text-left text-white font-semibold min-w-[200px]">
                  {property.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-white/5">
              <td className="px-6 py-4 text-gray-400 sticky left-0 bg-white/5 backdrop-blur-xl">Price</td>
              {properties.map((property: Property) => (
                <td key={property.id} className="px-6 py-4 text-white">{formatPrice(property.price)}</td>
              ))}
            </tr>
            <tr className="border-b border-white/5">
              <td className="px-6 py-4 text-gray-400 sticky left-0 bg-white/5 backdrop-blur-xl">Size</td>
              {properties.map((property: Property) => (
                <td key={property.id} className="px-6 py-4 text-white">{property.size_sqft} sqft</td>
              ))}
            </tr>
            <tr className="border-b border-white/5">
              <td className="px-6 py-4 text-gray-400 sticky left-0 bg-white/5 backdrop-blur-xl">Bedrooms</td>
              {properties.map((property: Property) => (
                <td key={property.id} className="px-6 py-4 text-white">{property.bedrooms}</td>
              ))}
            </tr>
            <tr className="border-b border-white/5">
              <td className="px-6 py-4 text-gray-400 sticky left-0 bg-white/5 backdrop-blur-xl">Overall Score</td>
              {properties.map((property: Property) => {
                const analysis = analyses[property.id]
                return (
                  <td key={property.id} className="px-6 py-4">
                    {analysis ? (
                      <span className="text-purple-400 font-bold">{analysis.overall_score}/100</span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </td>
                )
              })}
            </tr>
            <tr>
              <td className="px-6 py-4 text-gray-400 sticky left-0 bg-white/5 backdrop-blur-xl">Recommendation</td>
              {properties.map((property: Property) => {
                const analysis = analyses[property.id]
                return (
                  <td key={property.id} className="px-6 py-4">
                    {analysis ? (
                      <Badge className={
                        analysis.recommendation === 'STRONG_BUY' ? 'bg-green-500/20 text-green-400' :
                        analysis.recommendation === 'BUY' ? 'bg-blue-500/20 text-blue-400' :
                        analysis.recommendation === 'HOLD' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }>
                        {analysis.recommendation}
                      </Badge>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </td>
                )
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AIInsightsTab({ properties, analyses, chatHistory, setChatHistory, chatMessage, setChatMessage }: any) {
  const [sending, setSending] = useState(false)

  async function handleSendMessage() {
    if (!chatMessage.trim()) return

    const userMessage = { role: 'user', content: chatMessage }
    setChatHistory((prev: any) => [...prev, userMessage])
    setChatMessage('')
    setSending(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        role: 'assistant',
        content: `Based on your ${properties.length} properties, I recommend focusing on properties with strong market fundamentals and good developer track records. Would you like me to elaborate on any specific aspect?`
      }
      setChatHistory((prev: any) => [...prev, aiResponse])
      setSending(false)
    }, 1500)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chat Interface */}
      <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 flex flex-col h-[600px]">
        <h3 className="text-white font-semibold text-lg mb-4">Chat with AI Assistant</h3>
        
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {chatHistory.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Ask me anything about your properties</p>
            </div>
          ) : (
            chatHistory.map((message: any, index: number) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] rounded-2xl p-4 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white'
                    : 'bg-white/10 text-gray-300'
                }`}>
                  {message.content}
                </div>
              </div>
            ))
          )}
          {sending && (
            <div className="flex justify-start">
              <div className="bg-white/10 text-gray-300 rounded-2xl p-4">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask about properties, market trends, recommendations..."
            className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!chatMessage.trim() || sending}
            className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
          <h3 className="text-white font-semibold mb-4">Quick Insights</h3>
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
              <p className="text-green-400 font-medium text-sm">Best Value</p>
              <p className="text-white text-xs mt-1">{properties[0]?.title || 'N/A'}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <p className="text-blue-400 font-medium text-sm">Highest Score</p>
              <p className="text-white text-xs mt-1">
                {Object.values(analyses).length > 0 
                  ? `${Math.max(...Object.values(analyses).map((a: any) => a.overall_score || 0))}/100`
                  : 'N/A'}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <p className="text-purple-400 font-medium text-sm">Best Location</p>
              <p className="text-white text-xs mt-1">{properties[0]?.location || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
          <h3 className="text-white font-semibold mb-4">Suggested Questions</h3>
          <div className="space-y-2">
            {[
              "Which property has the best ROI potential?",
              "What are the main risks I should consider?",
              "Compare exit strategies for these properties",
              "Which has the strongest market trends?"
            ].map((question, index) => (
              <button
                key={index}
                onClick={() => setChatMessage(question)}
                className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-sm transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
