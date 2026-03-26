'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/src/lib/supabase/client'
import { QRCard } from '@/src/components/qr-card'
import { AuthNavbar } from '@/src/components/auth-navbar'

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

const rankStyles = [
  'bg-amber-400 text-white',       // Gold
  'bg-gray-400 text-white',         // Silver
  'bg-amber-600 text-white',        // Bronze
]

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
      <div className="min-h-screen flex flex-col">
        <AuthNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-[#1D9E75] animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm text-gray-400">Loading results...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!event) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E1F5EE]/30 to-white">
      <AuthNavbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#04342C]">{event.name}</h1>
          <p className="text-sm text-gray-500 mt-1.5 flex items-center justify-center gap-2">
            <span className="inline-block w-2 h-2 bg-[#1D9E75] rounded-full animate-pulse" />
            Live results
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="rounded-2xl p-5 text-center bg-[#E1F5EE]/60 border border-[#1D9E75]/10">
            <p className="text-3xl font-bold text-[#04342C]">{completedCount}</p>
            <p className="text-xs text-[#0F6E56] font-medium mt-1">Completed voters</p>
          </div>
          <div className="rounded-2xl p-5 text-center bg-white border border-[#1D9E75]/15">
            <p className="text-3xl font-bold text-[#04342C]">{totalAttendees}</p>
            <p className="text-xs text-gray-500 font-medium mt-1">Total registered</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={exportCSV}
            className="flex-1 py-2.5 text-sm font-medium border border-[#1D9E75]/20 text-[#0F6E56] rounded-xl hover:bg-[#E1F5EE]/50 hover:border-[#1D9E75]/30 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export CSV
          </button>
          <button
            onClick={() => setShowQR(!showQR)}
            className="flex-1 py-2.5 text-sm font-medium border border-[#1D9E75]/20 text-[#0F6E56] rounded-xl hover:bg-[#E1F5EE]/50 hover:border-[#1D9E75]/30 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75H16.5v-.75z" />
            </svg>
            {showQR ? 'Hide QR codes' : 'Show QR codes'}
          </button>
        </div>

        {/* QR Codes */}
        {showQR && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-[#04342C] mb-4">QR codes</h2>
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
          <h2 className="text-sm font-semibold text-[#04342C] mb-4">Leaderboard</h2>
          <div className="space-y-3">
            {leaderboard.map((row, index) => {
              const itemCriteria = criteriaScores.filter(
                (c) => c.item_id === row.item_id
              )

              return (
                <div
                  key={row.item_id}
                  className={`rounded-2xl border p-5 transition-all ${
                    index < 3
                      ? 'bg-[#E1F5EE]/30 border-[#1D9E75]/20'
                      : 'bg-white border-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm
                        ${index < 3 ? rankStyles[index] : 'border-2 border-gray-200 text-gray-400'}
                      `}>
                        {index + 1}
                      </span>
                      <span className="font-semibold text-sm text-[#04342C]">{row.item_name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-[#04342C]">{row.average_score}</p>
                      <p className="text-xs text-gray-400">
                        {row.total_votes} vote{row.total_votes !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {itemCriteria.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-3">
                      {itemCriteria.map((c) => (
                        <span
                          key={c.criteria_label}
                          className="text-xs bg-[#E1F5EE] text-[#0F6E56] rounded-full px-2.5 py-0.5 font-medium"
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
              <div className="rounded-2xl border border-[#1D9E75]/15 p-10 text-center bg-white">
                <div className="w-14 h-14 rounded-full bg-[#E1F5EE] flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-[#1D9E75]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0116.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-3.77 1.522m0 0a6.003 6.003 0 01-3.77-1.522" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-[#04342C] mb-1">No completed votes yet</p>
                <p className="text-xs text-gray-400">
                  Results appear once attendees have rated all items.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
