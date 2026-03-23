import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CopyLinkButton } from '@/src/components/copy-link-button'

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

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">Your events</h1>
          <Link
            href="/create"
            className="text-sm font-medium border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition-all"
          >
            + New
          </Link>
        </div>

        {eventsWithStats.length === 0 ? (
          <div className="border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-500 mb-4">No events yet</p>
            <Link
              href="/create"
              className="inline-block bg-black text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-all"
            >
              Create your first event
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {eventsWithStats.map((event) => (
              <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium">{event.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {event.itemCount} items · {event.voterCount} voters
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Link
                    href={`/e/${event.slug}/admin`}
                    className="text-xs font-medium border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-all"
                  >
                    Results
                  </Link>
                  <Link
                    href={`/e/${event.slug}`}
                    className="text-xs font-medium border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-all"
                  >
                    Preview
                  </Link>
                  <CopyLinkButton slug={event.slug} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
