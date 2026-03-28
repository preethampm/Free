'use server'

import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function deleteEventData(eventId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  // Verify ownership
  const { data: event } = await supabase
    .from('events')
    .select('id, organizer_id')
    .eq('id', eventId)
    .single()

  if (!event || event.organizer_id !== user.id) {
    throw new Error('Not authorized')
  }

  // Get item IDs
  const { data: items } = await supabase
    .from('event_items')
    .select('id')
    .eq('event_id', eventId)

  const itemIds = items?.map(i => i.id) || []

  // Delete ratings first (due to foreign key)
  if (itemIds.length > 0) {
    await supabase
      .from('event_ratings')
      .delete()
      .in('item_id', itemIds)
  }

  // Delete attendees
  await supabase
    .from('attendees')
    .delete()
    .eq('event_id', eventId)

  return { success: true }
}

export async function deleteEvent(eventId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  // Verify ownership
  const { data: event } = await supabase
    .from('events')
    .select('id, organizer_id')
    .eq('id', eventId)
    .single()

  if (!event || event.organizer_id !== user.id) {
    throw new Error('Not authorized')
  }

  // Get all item IDs first
  const { data: items } = await supabase
    .from('event_items')
    .select('id')
    .eq('event_id', eventId)

  const itemIds = items?.map(i => i.id) || []

  // Delete ratings
  if (itemIds.length > 0) {
    await supabase
      .from('event_ratings')
      .delete()
      .in('item_id', itemIds)
  }

  // Delete item_criteria
  await supabase
    .from('item_criteria')
    .delete()
    .in('item_id', itemIds)

  // Delete attendees
  await supabase
    .from('attendees')
    .delete()
    .eq('event_id', eventId)

  // Delete event_criteria
  await supabase
    .from('event_criteria')
    .delete()
    .eq('event_id', eventId)

  // Delete event_items
  await supabase
    .from('event_items')
    .delete()
    .eq('event_id', eventId)

  // Delete event
  await supabase
    .from('events')
    .delete()
    .eq('id', eventId)

  redirect('/dashboard')
}

export async function deleteUserAccount() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  // Get all events owned by user
  const { data: events } = await supabase
    .from('events')
    .select('id')
    .eq('organizer_id', user.id)

  const eventIds = events?.map(e => e.id) || []

  // For each event, get items and delete related data
  for (const eventId of eventIds) {
    const { data: items } = await supabase
      .from('event_items')
      .select('id')
      .eq('event_id', eventId)

    const itemIds = items?.map(i => i.id) || []

    if (itemIds.length > 0) {
      await supabase.from('event_ratings').delete().in('item_id', itemIds)
      await supabase.from('item_criteria').delete().in('item_id', itemIds)
    }

    await supabase.from('attendees').delete().eq('event_id', eventId)
    await supabase.from('event_criteria').delete().eq('event_id', eventId)
    await supabase.from('event_items').delete().eq('event_id', eventId)
  }

  // Delete all events
  await supabase.from('events').delete().eq('organizer_id', user.id)

  // Sign out
  await supabase.auth.signOut()

  redirect('/')
}
