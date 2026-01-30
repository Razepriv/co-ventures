import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AIService } from '@/lib/services/ai-service'

// Post handler for AI Chat
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, propertyData } = body

    // Verify user is authenticated
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

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
