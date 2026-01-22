import { createClient } from '@/lib/supabase/client'

interface AIResponse {
  success: boolean
  response?: string
  model?: string
  provider?: string
  error?: string
}

export class AIService {
  /**
   * Get API key for a specific provider from database
   */
  static async getApiKey(provider: 'openai' | 'gemini' | 'anthropic' | 'cohere'): Promise<string | null> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('ai_api_keys')
        .select('api_key')
        .eq('provider', provider)
        .eq('is_active', true)
        .single()

      if (error || !data) {
        console.error(`No active API key found for ${provider}`)
        return null
      }

      return (data as any).api_key
    } catch (error) {
      console.error('Error fetching API key:', error)
      return null
    }
  }

  /**
   * Generate content using OpenAI
   */
  static async generateWithOpenAI(
    model: string,
    systemPrompt: string,
    userPrompt: string,
    temperature: number = 0.7,
    maxTokens: number = 2000
  ): Promise<AIResponse> {
    try {
      const apiKey = await this.getApiKey('openai')
      if (!apiKey) {
        return { success: false, error: 'OpenAI API key not configured' }
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: temperature,
          max_tokens: maxTokens
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'OpenAI API request failed')
      }

      const data = await response.json()
      return {
        success: true,
        response: data.choices[0].message.content,
        model: model,
        provider: 'openai'
      }
    } catch (error) {
      console.error('OpenAI generation error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
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

      // Combine system prompt and user prompt for Gemini
      const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: combinedPrompt
              }]
            }],
            generationConfig: {
              temperature: temperature,
              maxOutputTokens: maxTokens,
              topP: 0.8,
              topK: 40
            }
          })
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Gemini API request failed')
      }

      const data = await response.json()
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text

      if (!generatedText) {
        throw new Error('No response generated from Gemini')
      }

      return {
        success: true,
        response: generatedText,
        model: model,
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
   */
  static async generate(
    model: string,
    systemPrompt: string,
    userPrompt: string,
    temperature: number = 0.7,
    maxTokens: number = 2000
  ): Promise<AIResponse> {
    // Determine provider based on model name
    if (model.startsWith('gpt-')) {
      return this.generateWithOpenAI(model, systemPrompt, userPrompt, temperature, maxTokens)
    } else if (model.startsWith('gemini-')) {
      return this.generateWithGemini(model, systemPrompt, userPrompt, temperature, maxTokens)
    } else {
      // Default to trying Gemini (as it's more flexible with model names)
      return this.generateWithGemini(model, systemPrompt, userPrompt, temperature, maxTokens)
    }
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
        agentData.model,
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
