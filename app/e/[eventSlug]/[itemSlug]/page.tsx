'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/src/lib/supabase/client'
import { Button } from '@/src/components/ui/button'
import { ScoreGrid } from '@/src/components/ui/score-grid'
import { ProgressBar } from '@/src/components/ui/progress-bar'

interface Event {
  id: string
  name: string
  slug: string
  criteria_mode: 'same' | 'different'
}

interface Item {
  id: string
  name: string
  slug: string
  description: string | null
}

interface Criterion {
  id: string
  label: string
  min_score: number
  max_score: number
  source: 'event' | 'item'
}

interface Attendee {
  id: string
  name: string
  completed_at: string | null
}

export default function ItemRatingPage() {
  const { eventSlug, itemSlug } = useParams<{ eventSlug: string; itemSlug: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [event, setEvent] = useState<Event | null>(null)
  const [item, setItem] = useState<Item | null>(null)
  const [criteria, setCriteria] = useState<Criterion[]>([])
  const [attendee, setAttendee] = useState<Attendee | null>(null)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [feedback, setFeedback] = useState('')
  const [alreadyRated, setAlreadyRated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [progress, setProgress] = useState({ rated: 0, total: 0 })

  const checkSession = useCallback(async (eventId: string) => {
    const cookieName = `attendee_${eventId}`
    const existingId = document.cookie
      .split('; ')
      .find((c) => c.startsWith(`${cookieName}=`))
      ?.split('=')[1]

    if (!existingId) {
      router.push(`/e/${eventSlug}`)
      return null
    }

    const { data } = await supabase
      .from('attendees')
      .select('id, name, completed_at')
      .eq('id', existingId)
      .single()

    if (!data) {
      router.push(`/e/${eventSlug}`)
      return null
    }

    return data
  }, [eventSlug, router, supabase])

  const updateProgress = useCallback(async (attendeeId: string, eventId: string) => {
    const [ratingsRes, itemsRes] = await Promise.all([
      supabase.from('event_ratings').select('item_id').eq('attendee_id', attendeeId),
      supabase.from('event_items').select('id').eq('event_id', eventId),
    ])

    const uniqueItems = new Set(ratingsRes.data?.map((r) => r.item_id) || [])
    setProgress({ rated: uniqueItems.size, total: itemsRes.data?.length || 0 })
  }, [supabase])

  useEffect(() => {
    async function init() {
      // Fetch event
      const { data: eventData } = await supabase
        .from('events')
        .select('id, name, slug, criteria_mode')
        .eq('slug', eventSlug)
        .single()

      if (!eventData) { router.push('/'); return }
      setEvent(eventData)

      // Check attendee session
      const attendeeData = await checkSession(eventData.id)
      if (!attendeeData) return
      setAttendee(attendeeData)

      // Fetch item
      const { data: itemData } = await supabase
        .from('event_items')
        .select('id, name, slug, description')
        .eq('event_id', eventData.id)
        .eq('slug', itemSlug)
        .single()

      if (!itemData) { router.push(`/e/${eventSlug}`); return }
      setItem(itemData)

      // Fetch criteria based on mode
      let criteriaData: Criterion[] = []
      
      if (eventData.criteria_mode === 'same') {
        const { data } = await supabase
          .from('event_criteria')
          .select('id, label, min_score, max_score')
          .eq('event_id', eventData.id)
          .order('sort_order')
        
        if (data) {
          criteriaData = data.map(c => ({ ...c, source: 'event' as const }))
        }
      } else {
        const { data } = await supabase
          .from('item_criteria')
          .select('id, label, min_score, max_score')
          .eq('item_id', itemData.id)
          .order('sort_order')
        
        if (data) {
          criteriaData = data.map(c => ({ ...c, source: 'item' as const }))
        }
      }

      if (criteriaData.length > 0) {
        setCriteria(criteriaData)
        const initial: Record<string, number> = {}
        criteriaData.forEach((c) => { initial[c.id] = 0 })
        setScores(initial)
      }

      // Check existing ratings
      const { data: existingRatings } = await supabase
        .from('event_ratings')
        .select('criteria_id, item_criteria_id, score')
        .eq('attendee_id', attendeeData.id)
        .eq('item_id', itemData.id)

      if (existingRatings && existingRatings.length > 0) {
        setAlreadyRated(true)
        const existing: Record<string, number> = {}
        existingRatings.forEach((r) => {
          const keyId = r.criteria_id || r.item_criteria_id
          if (keyId) existing[keyId] = r.score
        })
        setScores(existing)
      }

      // Get progress
      await updateProgress(attendeeData.id, eventData.id)

      setLoading(false)
    }
    init()
  }, [eventSlug, itemSlug, supabase, router, checkSession, updateProgress])

  async function handleSubmit() {
    const unrated = criteria.filter((c) => !scores[c.id] || scores[c.id] === 0)
    if (unrated.length > 0 || !attendee || !item || !event) return

    setSubmitting(true)

    // Insert ratings based on criteria source
    const ratingRows = criteria.map((c) => ({
      attendee_id: attendee.id,
      item_id: item.id,
      criteria_id: c.source === 'event' ? c.id : null,
      item_criteria_id: c.source === 'item' ? c.id : null,
      score: scores[c.id],
      feedback: criteria.indexOf(c) === 0 && feedback.trim() ? feedback.trim() : null,
    }))

    // For upsert, we need a unique constraint. Since we added nullable criteria_id,
    // we need to handle this differently - delete existing and insert new
    await supabase
      .from('event_ratings')
      .delete()
      .eq('attendee_id', attendee.id)
      .eq('item_id', item.id)

    const { error } = await supabase
      .from('event_ratings')
      .insert(ratingRows)

    if (error) {
      console.error('Rating error:', error)
      setSubmitting(false)
      return
    }

    // Update progress
    await updateProgress(attendee.id, event.id)

    // Check if all items rated
    const { data: allRatings } = await supabase
      .from('event_ratings')
      .select('item_id')
      .eq('attendee_id', attendee.id)

    const uniqueItems = new Set(allRatings?.map((r) => r.item_id) || [])
    const totalItems = progress.total

    if (uniqueItems.size >= totalItems) {
      await supabase
        .from('attendees')
        .update({ completed_at: new Date().toISOString() })
        .eq('id', attendee.id)
        .is('completed_at', null)
    }

    setSubmitted(true)
    setAlreadyRated(true)
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  if (!event || !item) return null

  const allRated = criteria.every((c) => scores[c.id] > 0)

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <button
            onClick={() => router.push(`/e/${eventSlug}`)}
            className="text-xs text-gray-400 hover:text-black transition-all mb-2 block mx-auto"
          >
            &#8592; Back to {event.name}
          </button>
          <h1 className="text-xl font-bold">{item.name}</h1>
          {item.description && (
            <p className="text-sm text-gray-400 mt-1">{item.description}</p>
          )}
        </div>

        {/* Progress */}
        <div className="mb-6">
          <ProgressBar current={progress.rated} total={progress.total} label="Overall progress" />
        </div>

        {/* Already rated / submitted */}
        {(alreadyRated || submitted) && (
          <div className="border border-gray-800 bg-gray-50 rounded-lg p-4 mb-6 text-center">
            <p className="font-medium">
              {submitted ? 'Rating submitted!' : 'You already rated this item'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {progress.rated}/{progress.total} items rated
              {progress.rated >= progress.total && ' — All done!'}
            </p>
          </div>
        )}

        {/* Rating form */}
        {!alreadyRated && !submitted && (
          <div className="space-y-4">
            {criteria.map((criterion) => (
              <ScoreGrid
                key={criterion.id}
                label={criterion.label}
                value={scores[criterion.id] || 0}
                onChange={(score) => setScores((prev) => ({ ...prev, [criterion.id]: score }))}
                min={criterion.min_score}
                max={criterion.max_score}
              />
            ))}

            {/* Feedback */}
            <div className="border border-gray-200 rounded-xl p-4">
              <p className="text-base sm:text-sm font-medium mb-2">
                Any feedback? <span className="text-gray-400 font-normal">(optional)</span>
              </p>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-base sm:text-sm resize-none focus:outline-none focus:border-black min-h-[100px]"
              />
            </div>

            {/* Submit */}
            <Button onClick={handleSubmit} disabled={!allRated || submitting}>
              {submitting ? 'Submitting...' : 'Submit'}
            </Button>

            {!allRated && (
              <p className="text-center text-xs text-gray-400">
                Rate all criteria to submit
              </p>
            )}
          </div>
        )}

        {/* Go back after submit */}
        {(alreadyRated || submitted) && (
          <Button onClick={() => router.push(`/e/${eventSlug}`)}>
            Back to items
          </Button>
        )}
      </div>
    </div>
  )
}
