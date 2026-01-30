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
   * Run a chat session with history
   */
  static async chat(
    model: string,
    systemPrompt: string,
    history: { role: string; parts: { text: string }[] }[],
    newMessage: string,
    temperature: number = 0.7
  ): Promise<AIResponse> {
    try {
      const apiKey = await this.getApiKey('gemini')
      if (!apiKey) {
        return { success: false, error: 'Gemini API key not configured' }
      }

      const genAI = new GoogleGenerativeAI(apiKey)
      const modelName = (model.startsWith('gemini') || model.startsWith('models/')) ? model : 'gemini-pro'
      const genModel = genAI.getGenerativeModel({ model: modelName })

      const chat = genModel.startChat({
        history: history,
        generationConfig: {
          temperature,
          maxOutputTokens: 2000,
        },
      })

      // Send the new message (prepend system prompt to the first message if needed, 
      // but simpler to just include it in the context of the agent runner)
      // Note: Gemini API doesn't strictly separate System Prompts in chat history in the Node SDK 
      // the same way OpenAI does, but we can prepend context.

      const result = await chat.sendMessage(newMessage)
      const response = result.response.text()

      return {
        success: true,
        response,
        model: modelName,
        provider: 'gemini'
      }
    } catch (error) {
      console.error('Gemini chat error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Run the Master Agent for Property Chat
   */
  static async runMasterAgent(
    history: any[],
    propertyContext: any
  ): Promise<AIResponse> {
    try {
      // Construct a comprehensive system prompt for the Master Agent
      const systemPrompt = `You are an expert Real Estate Investment Advisor acting as a "Master Agent" for Co-Housing Ventures.
Your goal is to assist users by providing comprehensive analysis of the property based on the available data.
You have access to knowledge across multiple domains: Market Analysis, Financial Underwriting, Developer Verification, Legal/Regulatory Compliance, and Exit Strategies.

PROPERTY DETAILS:
Title: ${propertyContext.title}
Price: ${propertyContext.price}
Location: ${propertyContext.location}
City: ${propertyContext.city || ''}
State: ${propertyContext.state || ''}
Type: ${propertyContext.property_type}
ROI: ${propertyContext.roi || 'N/A'}%
Rental Yield: ${propertyContext.rental_yield || 'N/A'}%
Developer: ${propertyContext.developer_name || 'N/A'} (${propertyContext.developer_years_of_experience || 'N/A'} years exp)
RERA: ${propertyContext.rera_number || 'Pending'}
Investment Type: ${propertyContext.investment_type}
Min Investment: ${propertyContext.min_investment_amount || 'N/A'}
Amenities: ${propertyContext.amenities?.join(', ') || 'Standard amenities'}
Highlights: ${propertyContext.investment_highlights?.join('; ') || 'Prime location'}

GUIDELINES:
1. Answer the user's questions specifically using the property data provided.
2. If the user asks about ROI, perform a financial analysis.
3. If the user asks about the location, provide market insights (you can infer general area trends if specific data is missing).
4. If the user asks about safety/legal, refer to RERA and developer reputation.
5. Be professional, encouraging, but objective about risks.
6. If a piece of information is missing (e.g., exact lock-in period), state that it's "To Be Confirmed" rather than guessing.
7. Keep responses concise and structured (use markdown).`

      // Format history for Gemini
      const formattedHistory = history.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }))

      // The latest user message is essentially the last item in the UI history, 
      // but 'startChat' history excludes the very current message we want to send.
      // So we separate them.

      const lastMessage = formattedHistory.pop()
      const newMessage = lastMessage?.parts[0]?.text || ''
      const previousHistory = formattedHistory

      // Prepend System Prompt to the chat context implicitly by modifying the first message 
      // or handling it via instruction if model supports it. 
      // For simplicity/robustness, we'll verify if history is empty.

      if (previousHistory.length === 0) {
        // First turn: Combine System Prompt + User Message
        return await this.chat(
          'gemini-pro',
          systemPrompt,
          [],
          `SYSTEM INSTRUCTIONS:\n${systemPrompt}\n\nUSER QUESTION:\n${newMessage}`
        )
      } else {
        // Subsequent turns: The system prompt context is technically 'lost' in pure history 
        // unless we re-inject it. A common trick is to use a dummy first turn or just rely on the model 
        // effectively recalling from context window if we passed it before.
        // BETTER APPROACH: Just prepend system instructions to the new message again to reinforce behavior.
        return await this.chat(
          'gemini-pro',
          systemPrompt,
          previousHistory,
          `[SYSTEM REMINDER: Act as the Real Estate Advisor for ${propertyContext.title}]\n\n${newMessage}`
        )
      }

    } catch (error) {
      console.error('Error running Master Agent:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
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
