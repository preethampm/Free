import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-200 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <span className="font-medium text-lg">feedback</span>
          <Link
            href="/login"
            className="text-sm font-medium border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition-all"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-4">
            Instant feedback<br />for any event
          </h1>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Create a feedback system in minutes. QR codes for each item,
            real-time results, mobile-first experience.
          </p>
          <Link
            href="/login"
            className="inline-block w-full py-3 rounded-lg text-base font-medium bg-black text-white hover:bg-gray-800 transition-all"
          >
            Create your system
          </Link>

          <div className="mt-12 space-y-4 text-left">
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                1
              </div>
              <div>
                <p className="font-medium text-sm">Create your event</p>
                <p className="text-xs text-gray-400">
                  Add items to rate, set your criteria
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                2
              </div>
              <div>
                <p className="font-medium text-sm">Print QR codes</p>
                <p className="text-xs text-gray-400">
                  Download cards, place them at each item
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                3
              </div>
              <div>
                <p className="font-medium text-sm">Watch results live</p>
                <p className="text-xs text-gray-400">
                  Real-time leaderboard, export data anytime
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 px-4 py-4 text-center text-xs text-gray-400">
        feedback
      </footer>
    </div>
  )
}
