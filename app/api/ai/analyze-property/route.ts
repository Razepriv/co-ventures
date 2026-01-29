import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { AIService } from '@/lib/services/ai-service'

export async function POST(request: Request) {
  const startTime = Date.now()

  try {
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { propertyId, agentSlugs } = body

    if (!propertyId || !agentSlugs || !Array.isArray(agentSlugs)) {
      return NextResponse.json(
        { error: 'Property ID and agent slugs are required' },
        { status: 400 }
      )
    }

    // Get user's subscription
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        plan:subscription_plans(*)
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    // @ts-ignore
    const plan = subscription?.plan || await getFreePlan(supabase)

    // Check usage limits
    const canAnalyze = await checkUsageLimit(supabase, user.id, plan)
    if (!canAnalyze) {
      return NextResponse.json(
        { error: 'Usage limit exceeded. Please upgrade your plan.' },
        { status: 403 }
      )
    }

    // Get property details
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single()

    if (propertyError || !property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    // Get agent configurations
    const { data: agents, error: agentsError } = await supabase
      .from('ai_agent_configurations')
      .select('*')
      .in('agent_slug', agentSlugs)
      .eq('is_enabled', true)

    if (agentsError || !agents || agents.length === 0) {
      return NextResponse.json({ error: 'No valid agents found' }, { status: 404 })
    }

    // Check if user has access to all requested agents
    for (const agent of agents) {
      // @ts-ignore
      const hasAccess = checkAgentAccess(plan, agent.agent_slug)
      if (!hasAccess) {
        return NextResponse.json(
          // @ts-ignore
          { error: `You don't have access to ${agent.display_name}. Upgrade your plan.` },
          { status: 403 }
        )
      }
    }

    // Run AI analysis with each agent
    const analysisResults: any = {}
    let totalTokensUsed = 0

    for (const agent of agents) {
      try {
        const result = await runAgentAnalysis(agent, property)
        // @ts-ignore
        analysisResults[agent.agent_slug] = result
        totalTokensUsed += result.tokensUsed || 0
      } catch (error) {
        // @ts-ignore
        console.error(`Error running ${agent.agent_slug}:`, error)
        // @ts-ignore
        analysisResults[agent.agent_slug] = {
          error: 'Analysis failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }

    // Calculate overall score and recommendation
    const synthesizedResult = synthesizeResults(analysisResults, agents)

    const executionTime = Math.round((Date.now() - startTime) / 1000)

    // Save analysis to database
    const { data: savedAnalysis, error: saveError } = await supabase
      .from('ai_property_analyses')
      // @ts-ignore
      .insert({
        user_id: user.id,
        property_id: propertyId,
        analysis_data: {
          ...analysisResults,
          ...synthesizedResult
        },
        agents_used: agentSlugs,
        execution_time_seconds: executionTime,
        tokens_used: totalTokensUsed
      })
      .select()
      .single()

    if (saveError) {
      console.error('Error saving analysis:', saveError)
    }

    // Track usage
    if (subscription) {
      // @ts-ignore
      await supabase.from('subscription_usage_logs').insert({
        user_id: user.id,
        // @ts-ignore
        subscription_id: subscription.id,
        usage_type: 'ai_analysis',
        property_id: propertyId,
        metadata: {
          agents_used: agentSlugs,
          tokens_used: totalTokensUsed,
          execution_time: executionTime
        }
      })
    }

    return NextResponse.json({
      success: true,
      analysis: {
        ...analysisResults,
        ...synthesizedResult
      },
      metadata: {
        execution_time: executionTime,
        tokens_used: totalTokensUsed,
        agents_used: agentSlugs
      }
    })

  } catch (error) {
    console.error('AI analysis error:', error)
    return NextResponse.json(
      { error: 'Analysis failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

async function getFreePlan(supabase: any) {
  const { data } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('slug', 'free')
    .single()
  return data
}

async function checkUsageLimit(supabase: any, userId: string, plan: any): Promise<boolean> {
  const analysesLimit = plan.analyses_per_month

  // 0 means unlimited
  if (analysesLimit === 0) return true

  // Get start of current month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count } = await supabase
    .from('subscription_usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('usage_type', 'ai_analysis')
    .gte('created_at', startOfMonth.toISOString())

  return (count || 0) < analysesLimit
}

function checkAgentAccess(plan: any, agentSlug: string): boolean {
  if (!plan || !plan.agents_access) return false
  if (plan.agents_access.includes('all')) return true
  return plan.agents_access.includes(agentSlug)
}

async function runAgentAnalysis(agent: any, property: any) {
  const propertyContext = `
Property Details:
- Title: ${property.title}
- Location: ${property.location}
- Price: ₹${property.price}
- Size: ${property.size} ${property.size_unit}
- Type: ${property.property_type}
- Bedrooms: ${property.bedrooms}
- Bathrooms: ${property.bathrooms}
- Status: ${property.status}
- Description: ${property.description}
- Amenities: ${property.amenities ? JSON.stringify(property.amenities) : 'N/A'}
`

  // Use AIService which now defaults to Gemini
  const response = await AIService.generate(
    agent.model || 'gemini-pro',
    agent.system_prompt,
    propertyContext,
    agent.temperature,
    agent.max_tokens
  )

  if (!response.success) {
    throw new Error(response.error || 'Failed to generate analysis')
  }

  return {
    analysis: response.response,
    // Note: Gemini via standard SDK doesn't always strictly return token usage.
    // We'll estimate or leave as 0 for now.
    tokensUsed: 0,
    model: response.model,
    agentName: agent.display_name
  }
}

function synthesizeResults(results: any, agents: any[]) {
  // Simple scoring based on sentiment analysis
  // In production, you might want more sophisticated scoring

  let totalScore = 0
  let validResults = 0

  for (const agent of agents) {
    const result = results[agent.agent_slug]
    if (result && result.analysis && !result.error) {
      // Simple sentiment scoring (positive words increase score)
      const text = result.analysis.toLowerCase()
      const positiveWords = ['excellent', 'good', 'strong', 'positive', 'recommended', 'buy', 'growth', 'potential']
      const negativeWords = ['poor', 'weak', 'negative', 'avoid', 'risk', 'concern', 'delay', 'issue']

      let score = 50 // Neutral
      positiveWords.forEach(word => {
        if (text.includes(word)) score += 5
      })
      negativeWords.forEach(word => {
        if (text.includes(word)) score -= 5
      })

      totalScore += Math.max(0, Math.min(100, score))
      validResults++
    }
  }

  const averageScore = validResults > 0 ? Math.round(totalScore / validResults) : 50

  let recommendation: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'AVOID' = 'HOLD'
  if (averageScore >= 75) recommendation = 'STRONG_BUY'
  else if (averageScore >= 60) recommendation = 'BUY'
  else if (averageScore < 40) recommendation = 'AVOID'

  return {
    overall_score: averageScore,
    recommendation,
    confidence_level: validResults / agents.length
  }
}
