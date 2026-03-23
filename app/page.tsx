import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-tight">
            feedback
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-gray-500 hover:text-black transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Sign up free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-20 sm:py-28">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-tight">
              Listen, learn, and
              <br />
              think. Together.
            </h1>
            <p className="text-gray-500 mt-5 text-lg sm:text-xl leading-relaxed max-w-xl">
              Create a feedback system for any event. People scan a QR code,
              rate what matters, and you see results in real time.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/login"
                className="inline-flex items-center justify-center bg-black text-white text-sm font-medium px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Get started for free
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center border border-gray-200 text-sm font-medium px-6 py-3 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                See how it works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <p className="text-xs font-medium text-gray-400 tracking-widest uppercase text-center mb-8">
            Built for events of all sizes
          </p>
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-3xl sm:text-4xl font-bold tracking-tight">100%</p>
              <p className="text-sm text-gray-400 mt-1">Mobile friendly</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-bold tracking-tight">Real-time</p>
              <p className="text-sm text-gray-400 mt-1">Live results</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-bold tracking-tight">Free</p>
              <p className="text-sm text-gray-400 mt-1">No credit card</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <p className="text-xs font-medium text-gray-400 tracking-widest uppercase mb-3">
            How it works
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-12">
            Good questions,<br />great insights.
          </h2>
          <div className="grid sm:grid-cols-3 gap-10">
            <div>
              <p className="text-5xl font-bold text-gray-100 mb-3">01</p>
              <p className="font-medium mb-1">Set up your event</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                Name it. Add what people will rate &mdash; games, stalls, rooms,
                anything. Choose what criteria matter.
              </p>
            </div>
            <div>
              <p className="text-5xl font-bold text-gray-100 mb-3">02</p>
              <p className="font-medium mb-1">Share QR codes</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                Download a card for each item. Print it, stick it at the booth.
                People scan and rate on their phones.
              </p>
            </div>
            <div>
              <p className="text-5xl font-bold text-gray-100 mb-3">03</p>
              <p className="font-medium mb-1">See results live</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                Watch votes come in on a real-time leaderboard. Export data
                to CSV anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <p className="text-xs font-medium text-gray-400 tracking-widest uppercase mb-3">
            Use it for
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-12">
            More engagement,<br />every day.
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="border border-gray-100 rounded-lg p-6">
              <p className="font-medium mb-1">College fests</p>
              <p className="text-sm text-gray-400">
                Let students rate games, food stalls, and performances. Get real winners.
              </p>
            </div>
            <div className="border border-gray-100 rounded-lg p-6">
              <p className="font-medium mb-1">Corporate events</p>
              <p className="text-sm text-gray-400">
                Collect feedback on sessions, speakers, and workshops instantly.
              </p>
            </div>
            <div className="border border-gray-100 rounded-lg p-6">
              <p className="font-medium mb-1">Hackathons</p>
              <p className="text-sm text-gray-400">
                Fair judging across multiple projects and criteria. No bias.
              </p>
            </div>
            <div className="border border-gray-100 rounded-lg p-6">
              <p className="font-medium mb-1">Exhibitions</p>
              <p className="text-sm text-gray-400">
                Booth-by-booth feedback from visitors. Understand what resonates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="max-w-5xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Start listening today.
          </h2>
          <p className="text-gray-400 max-w-md mx-auto mb-8">
            Create your first feedback event in under two minutes.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center bg-black text-white text-sm font-medium px-8 py-3.5 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Get started for free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between text-xs text-gray-300">
          <span>feedback</span>
          <span>built for events</span>
        </div>
      </footer>
    </div>
  )
}
