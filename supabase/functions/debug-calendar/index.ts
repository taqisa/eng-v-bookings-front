import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { providerId } = await req.json()
    
    if (!providerId) {
      return new Response(
        JSON.stringify({ error: 'Provider ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🔴 [DEBUG ENDPOINT] Starting debug for provider:', providerId)

    // Get provider data
    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .select('*')
      .eq('id', providerId)
      .single()

    if (providerError || !provider) {
      console.error('🔴 [DEBUG ENDPOINT] Provider not found:', providerError)
      return new Response(
        JSON.stringify({ error: 'Provider not found', details: providerError }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('🔴 [DEBUG ENDPOINT] Provider data:', {
      id: provider.id,
      name: provider.name_ar,
      google_calendar_connected: provider.google_calendar_connected,
      google_calendar_id: provider.google_calendar_id,
      has_access_token: !!provider.google_access_token,
      token_expires_at: provider.token_expires_at
    })

    if (!provider.google_calendar_connected || !provider.google_access_token) {
      return new Response(
        JSON.stringify({ 
          error: 'Provider Google Calendar not connected',
          provider_data: {
            google_calendar_connected: provider.google_calendar_connected,
            has_access_token: !!provider.google_access_token
          }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 1: List the provider's calendars
    console.log('🔴 [DEBUG ENDPOINT] Step 1: Listing calendars')
    const calendarListResponse = await fetch(
      'https://www.googleapis.com/calendar/v3/users/me/calendarList',
      {
        headers: {
          'Authorization': `Bearer ${provider.google_access_token}`
        }
      }
    )

    let calendars = []
    if (calendarListResponse.ok) {
      const calendarData = await calendarListResponse.json()
      calendars = calendarData.items || []
      console.log('🔴 [DEBUG ENDPOINT] Available calendars:', calendars.map(cal => ({
        id: cal.id,
        summary: cal.summary,
        primary: cal.primary,
        accessRole: cal.accessRole
      })))
    } else {
      const errorData = await calendarListResponse.json()
      console.error('🔴 [DEBUG ENDPOINT] Failed to list calendars:', errorData)
    }

    // Step 2: Create a test event
    console.log('🔴 [DEBUG ENDPOINT] Step 2: Creating test event')
    const calendarId = provider.google_calendar_id || 'primary'
    const testEvent = {
      summary: '🔴 DEBUG TEST EVENT - موعد تجريبي',
      description: 'This is a test event created by the debug endpoint to verify calendar integration.',
      start: {
        dateTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
        timeZone: 'Asia/Jerusalem'
      },
      end: {
        dateTime: new Date(Date.now() + 90 * 60 * 1000).toISOString(), // 1.5 hours from now
        timeZone: 'Asia/Jerusalem'
      }
    }

    console.log('🔴 [DEBUG ENDPOINT] Test event data:', JSON.stringify(testEvent, null, 2))
    console.log('🔴 [DEBUG ENDPOINT] Target calendar ID:', calendarId)

    const eventResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${provider.google_access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testEvent)
      }
    )

    console.log('🔴 [DEBUG ENDPOINT] Event creation response status:', eventResponse.status)

    let eventResult = null
    let eventError = null

    if (eventResponse.ok) {
      eventResult = await eventResponse.json()
      console.log('🔴 [DEBUG ENDPOINT] Event created successfully:', {
        id: eventResult.id,
        status: eventResult.status,
        htmlLink: eventResult.htmlLink,
        summary: eventResult.summary
      })
    } else {
      eventError = await eventResponse.json()
      console.error('🔴 [DEBUG ENDPOINT] Event creation failed:', eventError)
    }

    // Return comprehensive debug info
    return new Response(
      JSON.stringify({
        success: true,
        debug_info: {
          provider: {
            id: provider.id,
            name: provider.name_ar,
            google_calendar_connected: provider.google_calendar_connected,
            google_calendar_id: provider.google_calendar_id,
            has_access_token: !!provider.google_access_token,
            token_expires_at: provider.token_expires_at
          },
          calendars: calendars,
          test_event: {
            target_calendar_id: calendarId,
            event_data: testEvent,
            response_status: eventResponse.status,
            success: eventResponse.ok,
            result: eventResult,
            error: eventError
          }
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('🔴 [DEBUG ENDPOINT] Exception:', error)
    return new Response(
      JSON.stringify({ error: error.message, stack: error.stack }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})