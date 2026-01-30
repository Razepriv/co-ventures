import { createAdminClient } from '@/lib/supabase/server'
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
      // First try to get from database (dynamic config) using Admin Client to bypass RLS
      const supabase = await createAdminClient()
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
        return { success: false, error: 'Gemini API key not configured in Admin Panel or Environment' }
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
        return { success: false, error: 'Gemini API key not configured in Admin Panel or Environment' }
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
      // 1. Fetch all configured agents from the database
      const supabase = await createAdminClient()
      const { data: agents, error } = await supabase
        .from('ai_agent_configurations')
        .select('*')
        .eq('is_enabled', true)

      let subAgentContext = ""
      if (agents && agents.length > 0) {
        subAgentContext = "\n\nYOU HAVE ACCESS TO THE FOLLOWING SPECIALIZED AGENT PERSONAS (Use these perspectives when answering):\n" +
          agents.map((agent: any) =>
            `- ${agent.name} (${agent.agent_slug}): ${agent.description}\n  Key Focus: ${agent.system_prompt.substring(0, 100)}...`
          ).join("\n")
      }

      // Construct a comprehensive system prompt for the Master Agent
      const systemPrompt = `You are the "Master AI Agent" for Co-Housing Ventures, an expert Real Estate Investment Advisor.
Your goal is to be the single point of truth for the user, synthesizing insights from all available domains.

${subAgentContext}

PROPERTY CONTEXT:
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
1. Orchestrate your response by drawing from the relevant agent perspectives above.
2. If the user asks about market trends, adopt the 'Market Pulse' persona.
3. If specific financial data is asked, use the 'Deal Underwriter' logic.
4. Always ground your answers in the provided Property Context.
5. Be concise, professional, and helpful. Use markdown formatting.`

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

      // GEMINI FIX: History must start with 'user'. If it starts with 'model', prepend a dummy user message.
      if (previousHistory.length > 0 && previousHistory[0].role === 'model') {
        previousHistory.unshift({
          role: 'user',
          parts: [{ text: 'Hello, I am interested in this property so I am asking some questions.' }]
        })
      }

      if (previousHistory.length === 0) {
        return await this.chat(
          'gemini-1.5-flash',
          systemPrompt,
          [],
          `SYSTEM_INSTRUCTIONS:\n${systemPrompt}\n\nUSER_QUERY:\n${newMessage}`
        )
      } else {
        return await this.chat(
          'gemini-1.5-flash',
          systemPrompt,
          previousHistory,
          `[SYSTEM_REMINDER: Use property data and agent personas]\n\n${newMessage}`
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
      const supabase = await createAdminClient()

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
