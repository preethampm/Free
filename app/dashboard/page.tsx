import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CopyLinkButton } from '@/src/components/copy-link-button'
import { PreviewLinkButton } from '@/src/components/preview-link-button'
import { AuthNavbar } from '@/src/components/auth-navbar'
import { Card } from '@/src/components/ui/card'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirectTo=/dashboard')

  // Fetch organizer's events
  const { data: events } = await supabase
    .from('events')
    .select('id, name, slug, created_at')
    .eq('organizer_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch item counts and attendee counts for each event
  const eventsWithStats = await Promise.all(
    (events || []).map(async (event) => {
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

  const totalEvents = eventsWithStats.length
  const totalVoters = eventsWithStats.reduce((sum, e) => sum + e.voterCount, 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E1F5EE]/40 to-white">
      <AuthNavbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#04342C]">Your events</h1>
            <p className="text-sm text-gray-500 mt-1">
              {totalEvents === 0
                ? 'Get started by creating your first event'
                : `${totalEvents} event${totalEvents !== 1 ? 's' : ''} · ${totalVoters} total voter${totalVoters !== 1 ? 's' : ''}`
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

        {eventsWithStats.length === 0 ? (
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
            {eventsWithStats.map((event) => (
              <Link
                key={event.id}
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
                  </div>

                  <div className="flex items-center gap-2 mb-3">
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
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
