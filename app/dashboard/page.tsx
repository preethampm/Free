'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/src/lib/supabase/client'
import { CopyLinkButton } from '@/src/components/copy-link-button'
import { PreviewLinkButton } from '@/src/components/preview-link-button'
import { AuthNavbar } from '@/src/components/auth-navbar'
import { Card } from '@/src/components/ui/card'
import { deleteEventData, deleteEvent } from '@/src/lib/actions'

interface EventWithStats {
  id: string
  name: string
  slug: string
  created_at: string
  criteria_mode: 'same' | 'different'
  itemCount: number
  voterCount: number
}

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [events, setEvents] = useState<EventWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [showDeleteDataModal, setShowDeleteDataModal] = useState<string | null>(null)
  const [showDeleteEventModal, setShowDeleteEventModal] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login?redirectTo=/dashboard')
        return
      }

      const { data: eventsData } = await supabase
        .from('events')
        .select('id, name, slug, created_at, criteria_mode')
        .eq('organizer_id', user.id)
        .order('created_at', { ascending: false })

      if (!eventsData) {
        setLoading(false)
        return
      }

      const eventsWithStats = await Promise.all(
        eventsData.map(async (event) => {
          const [itemsRes, attendeesRes] = await Promise.all([
            supabase
              .from('event_items')
              .select('id', { count: 'exact', head: true })
              .eq('event_id', event.id),
            supabase
              .from('attendees')
              .select('id', { count: 'exact', head: true })
              .eq('event_id', event.id),
          ])

          return {
            ...event,
            itemCount: itemsRes.count || 0,
            voterCount: attendeesRes.count || 0,
          }
        })
      )

      setEvents(eventsWithStats)
      setLoading(false)
    }

    fetchData()
  }, [supabase, router])

  const totalVoters = events.reduce((sum, e) => sum + e.voterCount, 0)

  async function handleDeleteData(eventId: string) {
    setDeleting(eventId)
    try {
      await deleteEventData(eventId)
      setEvents(events.map(e => 
        e.id === eventId ? { ...e, voterCount: 0 } : e
      ))
    } catch (error) {
      console.error('Error deleting data:', error)
    }
    setDeleting(null)
    setShowDeleteDataModal(null)
    setOpenDropdown(null)
  }

  async function handleDeleteEvent(eventId: string) {
    setDeleting(eventId)
    try {
      await deleteEvent(eventId)
    } catch (error) {
      console.error('Error deleting event:', error)
      setDeleting(null)
      setShowDeleteEventModal(null)
      setOpenDropdown(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#E1F5EE]/40 to-white">
        <AuthNavbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-[#1D9E75] animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm text-gray-400">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E1F5EE]/40 to-white">
      <AuthNavbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#04342C]">Your events</h1>
            <p className="text-sm text-gray-500 mt-1">
              {events.length === 0
                ? 'Get started by creating your first event'
                : `${events.length} event${events.length !== 1 ? 's' : ''} · ${totalVoters} total voter${totalVoters !== 1 ? 's' : ''}`
              }
            </p>
          </div>
          <Link
            href="/create"
            className="inline-flex items-center gap-1.5 bg-[#1D9E75] text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-[#0F6E56] transition-all active:scale-[0.98] shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New event
          </Link>
        </div>

        {events.length === 0 ? (
          /* Empty state */
          <Card className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-[#E1F5EE] flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-[#1D9E75]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-[#04342C] mb-2">No events yet</h2>
            <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
              Create your first event to start collecting real-time feedback from attendees.
            </p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 bg-[#1D9E75] text-white text-sm font-medium px-6 py-3 rounded-full hover:bg-[#0F6E56] transition-all active:scale-[0.98]"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Create your first event
            </Link>
          </Card>
        ) : (
          /* Event list */
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="relative"
              >
                <Link
                  href={`/e/${event.slug}/admin`}
                  className="block group"
                >
                  <Card className="hover:border-[#1D9E75]/40 hover:shadow-sm transition-all group-hover:bg-[#E1F5EE]/20">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-[#E1F5EE] flex items-center justify-center flex-shrink-0">
                            <svg className="w-4.5 h-4.5 text-[#1D9E75]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-[#04342C] truncate">{event.name}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {new Date(event.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Dropdown button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setOpenDropdown(openDropdown === event.id ? null : event.id)
                        }}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-all"
                      >
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className="inline-flex items-center gap-1 bg-[#E1F5EE] text-[#0F6E56] rounded-full px-2.5 py-0.5 text-xs font-medium">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h8m-8 4h12m-4 4h4M4 4v16" />
                        </svg>
                        {event.itemCount} item{event.itemCount !== 1 ? 's' : ''}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-[#E1F5EE] text-[#0F6E56] rounded-full px-2.5 py-0.5 text-xs font-medium">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                        </svg>
                        {event.voterCount} voter{event.voterCount !== 1 ? 's' : ''}
                      </span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        event.criteria_mode === 'same' 
                          ? 'bg-[#E1F5EE] text-[#0F6E56]'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {event.criteria_mode === 'same' ? 'Same criteria' : 'Different criteria'}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <span className="text-xs font-medium border border-[#1D9E75]/20 text-[#1D9E75] rounded-lg px-3 py-1.5 group-hover:bg-[#E1F5EE]/50 transition-all">
                        View results
                      </span>
                      <PreviewLinkButton slug={event.slug} />
                      <CopyLinkButton slug={event.slug} />
                    </div>
                  </Card>
                </Link>

                {/* Dropdown menu */}
                {openDropdown === event.id && (
                  <div className="absolute right-4 top-14 z-10 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        setShowDeleteDataModal(event.id)
                        setOpenDropdown(null)
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete data
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        setShowDeleteEventModal(event.id)
                        setOpenDropdown(null)
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete event
                    </button>
                  </div>
                )}

                {/* Delete Data Modal */}
                {showDeleteDataModal === event.id && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
                      <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-[#04342C] text-center mb-2">Delete Event Data?</h3>
                      <p className="text-sm text-gray-500 text-center mb-6">
                        Warning: All ratings and attendee data will be lost. This cannot be undone.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowDeleteDataModal(null)}
                          className="flex-1 py-2.5 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDeleteData(event.id)}
                          disabled={deleting === event.id}
                          className="flex-1 py-2.5 text-sm font-medium bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all disabled:opacity-50"
                        >
                          {deleting === event.id ? 'Deleting...' : 'Delete Data'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Delete Event Modal */}
                {showDeleteEventModal === event.id && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
                      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-[#04342C] text-center mb-2">Delete Event?</h3>
                      <p className="text-sm text-gray-500 text-center mb-6">
                        Warning: This will permanently delete &ldquo;{event.name}&rdquo; and all related data including items, criteria, ratings, and attendees. This cannot be undone.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowDeleteEventModal(null)}
                          className="flex-1 py-2.5 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          disabled={deleting === event.id}
                          className="flex-1 py-2.5 text-sm font-medium bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all disabled:opacity-50"
                        >
                          {deleting === event.id ? 'Deleting...' : 'Delete Event'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
