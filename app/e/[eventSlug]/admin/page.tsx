'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/src/lib/supabase/client'
import { QRCard } from '@/src/components/qr-card'

interface Event {
  id: string
  name: string
  slug: string
  organizer_id: string
}

interface LeaderboardRow {
  item_id: string
  item_name: string
  item_slug: string
  total_votes: number
  average_score: number
  total_score: number
}

interface CriteriaRow {
  item_id: string
  criteria_label: string
  avg_score: number
}

interface EventItem {
  id: string
  name: string
  slug: string
}

export default function AdminPage() {
  const { eventSlug } = useParams<{ eventSlug: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [event, setEvent] = useState<Event | null>(null)
  const [items, setItems] = useState<EventItem[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([])
  const [criteriaScores, setCriteriaScores] = useState<CriteriaRow[]>([])
  const [completedCount, setCompletedCount] = useState(0)
  const [totalAttendees, setTotalAttendees] = useState(0)
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [showQR, setShowQR] = useState(false)

  const fetchData = useCallback(async (eventId: string) => {
    const [lbRes, csRes, completedRes, totalRes] = await Promise.all([
      supabase
        .from('leaderboard')
        .select('*')
        .eq('event_id', eventId)
        .order('average_score', { ascending: false }),
      supabase
        .from('leaderboard_by_criteria')
        .select('item_id, criteria_label, avg_score')
        .eq('event_id', eventId),
      supabase
        .from('attendees')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .not('completed_at', 'is', null),
      supabase
        .from('attendees')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', eventId),
    ])

    if (lbRes.data) setLeaderboard(lbRes.data as LeaderboardRow[])
    if (csRes.data) setCriteriaScores(csRes.data as CriteriaRow[])
    setCompletedCount(completedRes.count || 0)
    setTotalAttendees(totalRes.count || 0)
  }, [supabase])

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push(`/login?redirectTo=/e/${eventSlug}/admin`)
        return
      }

      // Fetch event
      const { data: eventData } = await supabase
        .from('events')
        .select('id, name, slug, organizer_id')
        .eq('slug', eventSlug)
        .single()

      if (!eventData) { router.push('/dashboard'); return }

      // Check ownership
      if (eventData.organizer_id !== user.id) {
        router.push('/dashboard')
        return
      }

      setEvent(eventData)
      setAuthorized(true)

      // Fetch items for QR cards
      const { data: itemsData } = await supabase
        .from('event_items')
        .select('id, name, slug')
        .eq('event_id', eventData.id)
        .order('sort_order')

      if (itemsData) setItems(itemsData)

      // Fetch leaderboard data
      await fetchData(eventData.id)

      setLoading(false)

      // Realtime subscription
      const channel = supabase
        .channel(`admin-${eventData.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'event_ratings' },
          () => fetchData(eventData.id)
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'attendees' },
          () => fetchData(eventData.id)
        )
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }
    init()
  }, [eventSlug, supabase, router, fetchData])

  function exportCSV() {
    const headers = ['Item', 'Average Score', 'Total Votes', 'Total Score']
    const rows = leaderboard.map((row) => [
      row.item_name,
      row.average_score,
      row.total_votes,
      row.total_score,
    ])

    const criteriaLabels = [...new Set(criteriaScores.map((c) => c.criteria_label))]
    criteriaLabels.forEach((label) => headers.push(label))

    const csvRows = rows.map((row) => {
      const itemCriteria = criteriaScores.filter((c) => {
        const item = leaderboard.find((l) => l.item_name === row[0])
        return item && c.item_id === item.item_id
      })
      criteriaLabels.forEach((label) => {
        const found = itemCriteria.find((c) => c.criteria_label === label)
        row.push(found ? String(found.avg_score) : 'N/A')
      })
      return row
    })

    const csv = [headers.join(','), ...csvRows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${eventSlug}-results.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading || !authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  if (!event) return null

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-xs text-gray-400 hover:text-black transition-all mb-2 block mx-auto"
          >
            &#8592; Dashboard
          </button>
          <h1 className="text-xl font-bold">{event.name}</h1>
          <p className="text-sm text-gray-400 mt-1">
            <span className="inline-block w-1.5 h-1.5 bg-[#1D9E75] rounded-full mr-1 animate-pulse" />
            Live results
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold">{completedCount}</p>
            <p className="text-xs text-gray-400 mt-1">Completed voters</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold">{totalAttendees}</p>
            <p className="text-xs text-gray-400 mt-1">Total registered</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={exportCSV}
            className="flex-1 py-2.5 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
          >
            Export CSV
          </button>
          <button
            onClick={() => setShowQR(!showQR)}
            className="flex-1 py-2.5 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
          >
            {showQR ? 'Hide QR codes' : 'Show QR codes'}
          </button>
        </div>

        {/* QR Codes */}
        {showQR && (
          <div className="mb-8">
            <h2 className="text-sm font-medium text-gray-500 mb-3">QR codes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {items.map((item) => (
                <QRCard
                  key={item.id}
                  eventName={event.name}
                  itemName={item.name}
                  url={`${window.location.origin}/e/${event.slug}/${item.slug}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-3">Leaderboard</h2>
          <div className="space-y-2">
            {leaderboard.map((row, index) => {
              const itemCriteria = criteriaScores.filter(
                (c) => c.item_id === row.item_id
              )

              return (
                <div key={row.item_id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className={`
                        w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium
                        ${index < 3 ? 'bg-[#1D9E75] text-[#E1F5EE]' : 'border border-gray-300 text-gray-500'}
                      `}>
                        {index + 1}
                      </span>
                      <span className="font-medium text-sm">{row.item_name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{row.average_score}</p>
                      <p className="text-xs text-gray-400">
                        {row.total_votes} vote{row.total_votes !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {itemCriteria.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-2">
                      {itemCriteria.map((c) => (
                        <span
                          key={c.criteria_label}
                          className="text-xs border border-gray-200 rounded px-2 py-0.5 text-gray-500"
                        >
                          {c.criteria_label}: {c.avg_score}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}

            {leaderboard.length === 0 && (
              <div className="border border-gray-200 rounded-lg p-8 text-center">
                <p className="text-gray-400 text-sm">
                  No completed votes yet. Results appear when users rate all items.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
