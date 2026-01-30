import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase/client'

// For now, this is a placeholder. You'll need to integrate with OpenAI or another AI service
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, propertyData } = body

    // Verify user is authenticated and has subscription
    // Verify user is authenticated
    const supabase = getSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Subscription check skipped as per configuration to allow all logged-in users
    /*
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_plan, subscription_status')
      .eq('id', user.id)
      .single() as { data: { subscription_plan: string; subscription_status: string } | null }

    if (!profile || profile.subscription_plan === 'free') {
      return NextResponse.json(
        { error: 'Premium subscription required' },
        { status: 403 }
      )
    }
    */

    // Import AIService dynamically to avoid build cycles if any (though standard import is fine here)
    const { AIService } = require('@/lib/services/ai-service')

    // Call the Master Agent
    const aiResponse = await AIService.runMasterAgent(messages, propertyData)

    if (!aiResponse.success) {
      throw new Error(aiResponse.error || 'AI Service failed')
    }

    // Log the interaction asynchronously
    // (Optional: Implement logging to 'ai_interactions' table)

    return NextResponse.json({
      role: 'assistant',
      content: aiResponse.response
    })

  } catch (error) {
    console.error('AI Chat Error:', error)
    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    )
  }
}

// Helper function removed in favor of AIService
// function generateAIResponse...
