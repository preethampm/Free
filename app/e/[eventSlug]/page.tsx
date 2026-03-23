'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/src/lib/supabase/client'
import { Button } from '@/src/components/ui/button'
import { ProgressBar } from '@/src/components/ui/progress-bar'
import Link from 'next/link'

interface Event {
  id: string
  name: string
  slug: string
}

interface EventItem {
  id: string
  name: string
  slug: string
  description: string | null
  sort_order: number
}

interface Attendee {
  id: string
  name: string
  completed_at: string | null
}

export default function EventPage() {
  const { eventSlug } = useParams<{ eventSlug: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [event, setEvent] = useState<Event | null>(null)
  const [items, setItems] = useState<EventItem[]>([])
  const [attendee, setAttendee] = useState<Attendee | null>(null)
  const [ratedItemIds, setRatedItemIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  // Inline auth state
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [authError, setAuthError] = useState('')
  const [registering, setRegistering] = useState(false)

  const loadData = useCallback(async (attendeeId: string) => {
    // Fetch rated items for this attendee
    const { data: ratings } = await supabase
      .from('event_ratings')
      .select('item_id')
      .eq('attendee_id', attendeeId)

    const rated = new Set(ratings?.map((r) => r.item_id) || [])
    setRatedItemIds(rated)
  }, [supabase])

  useEffect(() => {
    async function init() {
      // Fetch event
      const { data: eventData } = await supabase
        .from('events')
        .select('id, name, slug')
        .eq('slug', eventSlug)
        .single()

      if (!eventData) {
        router.push('/')
        return
      }
      setEvent(eventData)

      // Fetch items
      const { data: itemsData } = await supabase
        .from('event_items')
        .select('id, name, slug, description, sort_order')
        .eq('event_id', eventData.id)
        .order('sort_order')

      if (itemsData) setItems(itemsData)

      // Check existing attendee session (cookie-based)
      const cookieName = `attendee_${eventData.id}`
      const existingId = document.cookie
        .split('; ')
        .find((c) => c.startsWith(`${cookieName}=`))
        ?.split('=')[1]

      if (existingId) {
        const { data: attendeeData } = await supabase
          .from('attendees')
          .select('id, name, completed_at')
          .eq('id', existingId)
          .single()

        if (attendeeData) {
          setAttendee(attendeeData)
          await loadData(attendeeData.id)
        }
      }

      setLoading(false)
    }
    init()
  }, [eventSlug, supabase, router, loadData])

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !phone.trim() || !event) return

    setRegistering(true)
    setAuthError('')

    // Check if phone already registered for this event
    const { data: existing } = await supabase
      .from('attendees')
      .select('id, name, completed_at')
      .eq('event_id', event.id)
      .eq('phone', phone.trim())
      .single()

    if (existing) {
      // Returning attendee
      setAttendee(existing)
      document.cookie = `attendee_${event.id}=${existing.id}; path=/; max-age=${60 * 60 * 24 * 30}`
      await loadData(existing.id)
      setRegistering(false)
      return
    }

    // New attendee
    const { data: newAttendee, error } = await supabase
      .from('attendees')
      .insert({
        event_id: event.id,
        name: name.trim(),
        phone: phone.trim(),
      })
      .select('id, name, completed_at')
      .single()

    if (error || !newAttendee) {
      setAuthError('Something went wrong. Try again.')
      setRegistering(false)
      return
    }

    setAttendee(newAttendee)
    document.cookie = `attendee_${event.id}=${newAttendee.id}; path=/; max-age=${60 * 60 * 24 * 30}`
    setRegistering(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  if (!event) return null

  // Not registered yet — show inline form
  if (!attendee) {
    return (
      <div className="min-h-screen px-4 py-6">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <p className="text-xs text-gray-400 tracking-widest uppercase mb-2">feedback</p>
            <h1 className="text-2xl font-bold">{event.name}</h1>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Your name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-black"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Phone number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-black"
                required
              />
            </div>
            {authError && <p className="text-sm text-red-600">{authError}</p>}
            <Button type="submit" disabled={registering || !name.trim() || !phone.trim()}>
              {registering ? 'Continuing...' : 'Continue'}
            </Button>
          </form>
        </div>
      </div>
    )
  }

  // Registered — show items list
  const completed = attendee.completed_at !== null
  const ratedCount = ratedItemIds.size

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-6">
          <p className="text-xs text-gray-400 tracking-widest uppercase mb-2">feedback</p>
          <h1 className="text-xl font-bold">{event.name}</h1>
          <p className="text-sm text-gray-400 mt-1">Welcome, {attendee.name}</p>
        </div>

        {completed ? (
          <div className="border border-gray-200 rounded-lg p-6 text-center mb-6">
            <p className="font-medium text-lg mb-1">All done!</p>
            <p className="text-sm text-gray-500">
              You&apos;ve rated all {items.length} items. Thank you for your feedback.
            </p>
          </div>
        ) : (
          <div className="mb-6">
            <ProgressBar current={ratedCount} total={items.length} label="Your progress" />
          </div>
        )}

        <div className="space-y-2">
          {items.map((item) => {
            const isRated = ratedItemIds.has(item.id)
            return (
              <Link
                key={item.id}
                href={`/e/${eventSlug}/${item.slug}`}
                className={`
                  block border rounded-lg p-4 transition-all
                  ${isRated
                    ? 'border-gray-800 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-400'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">
                      {item.name}
                      {isRated && <span className="ml-2 text-gray-400">&#10003;</span>}
                    </p>
                    {item.description && (
                      <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">
                    {isRated ? 'Rated' : 'Rate \u2192'}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
