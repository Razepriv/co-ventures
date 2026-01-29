import { createClient } from '@/lib/supabase/client'
import { GoogleGenerativeAI } from '@google/generative-ai'

interface AIResponse {
  success: boolean
  response?: string
  model?: string
  provider?: string
  error?: string
}

export class AIService {
  /**
   * Get API key for a specific provider from database or env
   */
  static async getApiKey(provider: 'gemini'): Promise<string | null> {
    try {
      // First try to get from database (dynamic config)
      const supabase = createClient()
      const { data, error } = await supabase
        .from('ai_api_keys')
        .select('api_key')
        .eq('provider', provider)
        .eq('is_active', true)
        .single()

      if (data && (data as any).api_key) {
        return (data as any).api_key
      }

      // Fallback to environment variables
      if (provider === 'gemini') {
        return process.env.GEMINI_API_KEY || null
      }

      return null
    } catch (error) {
      console.error('Error fetching API key:', error)
      // Fallback to environment variables on error
      if (provider === 'gemini') {
        return process.env.GEMINI_API_KEY || null
      }
      return null
    }
  }

  /**
   * Generate content using Google Gemini
   */
  static async generateWithGemini(
    model: string,
    systemPrompt: string,
    userPrompt: string,
    temperature: number = 0.7,
    maxTokens: number = 2000
  ): Promise<AIResponse> {
    try {
      const apiKey = await this.getApiKey('gemini')
      if (!apiKey) {
        return { success: false, error: 'Gemini API key not configured' }
      }

      const genAI = new GoogleGenerativeAI(apiKey)

      // Default to gemini-pro if model is not specified or is an invalid one
      // If user passed a GPT model name, switch to gemini-pro
      const modelName = (model.startsWith('gemini') || model.startsWith('models/')) ? model : 'gemini-pro'

      const genModel = genAI.getGenerativeModel({ model: modelName })

      // Gemini doesn't have a strict "system" role in the same way as OpenAI for chat
      // but we can prepend it or use systemInstruction if supported by specific models.
      // safely prepending is the most compatible way.
      const prompt = `System: ${systemPrompt}\n\nUser: ${userPrompt}`

      const result = await genModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
        }
      })

      const response = result.response
      const text = response.text()

      return {
        success: true,
        response: text,
        model: modelName,
        provider: 'gemini'
      }
    } catch (error) {
      console.error('Gemini generation error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Generate content using the appropriate provider based on model
   * Now exclusively uses Gemini
   */
  static async generate(
    model: string,
    systemPrompt: string,
    userPrompt: string,
    temperature: number = 0.7,
    maxTokens: number = 2000
  ): Promise<AIResponse> {
    // Force Gemini for all requests, even if model name is OpenAI-like
    return this.generateWithGemini(model, systemPrompt, userPrompt, temperature, maxTokens)
  }

  /**
   * Run an AI agent with specific configuration
   */
  static async runAgent(
    agentSlug: string,
    context: any
  ): Promise<AIResponse> {
    try {
      const supabase = createClient()

      // Get agent configuration
      const { data: agent, error } = await supabase
        .from('ai_agent_configurations')
        .select('*')
        .eq('agent_slug', agentSlug)
        .eq('is_enabled', true)
        .single()

      if (error || !agent) {
        return { success: false, error: `Agent ${agentSlug} not found or disabled` }
      }

      const agentData = agent as any

      // Build user prompt based on context
      const userPrompt = this.buildPromptFromContext(agentSlug, context)

      // Generate response
      return await this.generate(
        agentData.model || 'gemini-pro',
        agentData.system_prompt,
        userPrompt,
        agentData.temperature || 0.7,
        agentData.max_tokens || 2000
      )
    } catch (error) {
      console.error('Error running agent:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Build context-specific prompts for different agents
   */
  private static buildPromptFromContext(agentSlug: string, context: any): string {
    switch (agentSlug) {
      case 'market_pulse':
        return `Analyze the following property market data:
Location: ${context.location}
Price: ${context.price}
Type: ${context.property_type}
Area: ${context.area}
Amenities: ${context.amenities?.join(', ')}

Provide a comprehensive market analysis including trends, pricing insights, and investment potential.`

      case 'deal_underwriter':
        return `Evaluate this property investment opportunity:
Title: ${context.title}
Price: ${context.price}
Location: ${context.location}
Expected ROI: ${context.expected_roi || 'Not specified'}
Investment Type: ${context.investment_type || 'Co-ownership'}

Provide detailed financial analysis and risk assessment.`

      case 'developer_verification':
        return `Verify the following developer/property information:
Developer: ${context.developer_name || 'Unknown'}
Project: ${context.title}
Location: ${context.location}
Status: ${context.status}

Assess credibility, track record, and red flags.`

      case 'legal_regulatory':
        return `Analyze legal and regulatory aspects of:
Property: ${context.title}
Location: ${context.location}
Property Type: ${context.property_type}
Ownership Structure: ${context.ownership_structure || 'Co-ownership'}

Identify legal requirements, compliance issues, and regulatory considerations.`

      case 'exit_optimizer':
        return `Optimize exit strategy for:
Property: ${context.title}
Current Value: ${context.price}
Holding Period: ${context.holding_period || 'Not specified'}
Market Conditions: ${context.market_conditions || 'Current'}

Recommend optimal exit timing and strategy.`

      case 'committee_synthesizer':
        return `Synthesize insights from multiple analyses for:
Property: ${context.title}
Location: ${context.location}
Price: ${context.price}

Previous Analysis Results:
${JSON.stringify(context.previous_analyses || {}, null, 2)}

Provide a comprehensive investment recommendation.`

      default:
        return `Analyze the following property:
${JSON.stringify(context, null, 2)}`
    }
  }

  /**
   * Run multiple agents in parallel
   */
  static async runMultipleAgents(
    agentSlugs: string[],
    context: any
  ): Promise<Record<string, AIResponse>> {
    const results: Record<string, AIResponse> = {}

    const promises = agentSlugs.map(async (slug) => {
      const result = await this.runAgent(slug, context)
      return { slug, result }
    })

    const responses = await Promise.all(promises)

    responses.forEach(({ slug, result }) => {
      results[slug] = result
    })

    return results
  }
}
