
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Verify user is authenticated
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { integrationType, action, data } = await req.json()

    // Rate limiting check
    const rateLimitKey = `integration_${user.id}_${integrationType}`
    const rateLimitCount = await checkRateLimit(rateLimitKey)
    if (rateLimitCount > 10) { // 10 requests per minute
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Handle different integration types securely
    let result
    switch (integrationType) {
      case 'email':
        result = await handleEmailIntegration(action, data, user.id)
        break
      case 'sms':
        result = await handleSMSIntegration(action, data, user.id)
        break
      case 'slack':
        result = await handleSlackIntegration(action, data, user.id)
        break
      default:
        return new Response(
          JSON.stringify({ error: 'Unsupported integration type' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Integration proxy error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function checkRateLimit(key: string): Promise<number> {
  // In a real implementation, you'd use Redis or similar
  // For now, we'll use a simple in-memory approach
  return 0 // Placeholder
}

async function handleEmailIntegration(action: string, data: any, userId: string) {
  const apiKey = Deno.env.get('SENDGRID_API_KEY')
  if (!apiKey) {
    throw new Error('Email service not configured')
  }

  // Sanitize input
  const sanitizedData = {
    to: sanitizeEmail(data.to),
    subject: sanitizeText(data.subject),
    content: sanitizeText(data.content)
  }

  // Make secure API call to SendGrid
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email: sanitizedData.to }]
      }],
      from: { email: 'noreply@safinet.com' },
      subject: sanitizedData.subject,
      content: [{
        type: 'text/plain',
        value: sanitizedData.content
      }]
    })
  })

  return { success: response.ok }
}

async function handleSMSIntegration(action: string, data: any, userId: string) {
  const apiKey = Deno.env.get('TWILIO_API_KEY')
  if (!apiKey) {
    throw new Error('SMS service not configured')
  }

  // Implement SMS logic here
  return { success: true }
}

async function handleSlackIntegration(action: string, data: any, userId: string) {
  const webhookUrl = Deno.env.get('SLACK_WEBHOOK_URL')
  if (!webhookUrl) {
    throw new Error('Slack integration not configured')
  }

  // Implement Slack logic here
  return { success: true }
}

function sanitizeEmail(email: string): string {
  // Basic email validation and sanitization
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format')
  }
  return email.toLowerCase().trim()
}

function sanitizeText(text: string): string {
  // Remove potential XSS and injection attempts
  return text
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
    .substring(0, 1000) // Limit length
}
