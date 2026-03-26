import Link from 'next/link'
import Image from 'next/image'
import { ScrollReveal } from '@/src/components/scroll-reveal'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <Image src="/votu_logo.svg" alt="votu" width={220} height={70} priority style={{ height: 'auto' }} />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 px-4 py-2.5 rounded-full hover:bg-gray-100 transition-all"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium bg-[#1D9E75] text-white px-5 py-2.5 rounded-full hover:bg-[#0F6E56] transition-all active:scale-[0.98]"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mesh-gradient absolute inset-0 pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 pt-24 sm:pt-32 pb-20 relative">
          <ScrollReveal>
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E1F5EE] text-[#1D9E75] text-xs font-medium mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] animate-pulse" />
                Live event feedback
              </div>
              <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.05] text-gray-900">
                Rate what{' '}
                <span className="text-[#1D9E75]">matters</span>
                <br />
                in real time.
              </h1>
              <p className="text-gray-500 mt-6 text-lg sm:text-xl leading-relaxed max-w-xl">
                Create an event, place QR codes at each booth, let attendees
                scan and rate on the spot. No app download required.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center bg-[#1D9E75] text-white text-sm font-medium px-7 py-3.5 rounded-full hover:bg-[#0F6E56] transition-all active:scale-[0.98] shadow-lg shadow-[#1D9E75]/20"
                >
                  Get started for free
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center text-sm font-medium px-7 py-3.5 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all"
                >
                  See how it works
                  <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Social proof */}
      <section className="border-y border-gray-100 bg-gray-50/50">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <ScrollReveal>
            <p className="text-xs font-medium text-gray-400 tracking-widest uppercase text-center mb-10">
              Built for events of all sizes
            </p>
          </ScrollReveal>
          <div className="grid grid-cols-3 gap-8 text-center">
            <ScrollReveal className="reveal-delay-1">
              <p className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">100%</p>
              <p className="text-sm text-gray-500 mt-2">Mobile friendly</p>
            </ScrollReveal>
            <ScrollReveal className="reveal-delay-2">
              <p className="text-4xl sm:text-5xl font-bold tracking-tight text-[#1D9E75]">Real-time</p>
              <p className="text-sm text-gray-500 mt-2">Live results</p>
            </ScrollReveal>
            <ScrollReveal className="reveal-delay-3">
              <p className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">Free</p>
              <p className="text-sm text-gray-500 mt-2">No credit card</p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <ScrollReveal>
            <p className="text-xs font-medium text-[#1D9E75] tracking-widest uppercase mb-3">
              How it works
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-16 text-gray-900">
              Good questions,<br />great insights.
            </h2>
          </ScrollReveal>
          <div className="grid sm:grid-cols-3 gap-12">
            <ScrollReveal className="reveal-delay-1">
              <div className="relative">
                <span className="text-7xl font-bold text-gray-100 absolute -top-4 -left-2 select-none">01</span>
                <div className="relative pt-12">
                  <div className="w-10 h-10 rounded-xl bg-[#E1F5EE] flex items-center justify-center mb-4">
                    <svg className="w-5 h-5 text-[#1D9E75]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <p className="font-semibold text-lg mb-2 text-gray-900">Set up your event</p>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Name it. Add what people will rate &mdash; games, stalls, rooms,
                    anything. Choose what criteria matter.
                  </p>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal className="reveal-delay-2">
              <div className="relative">
                <span className="text-7xl font-bold text-gray-100 absolute -top-4 -left-2 select-none">02</span>
                <div className="relative pt-12">
                  <div className="w-10 h-10 rounded-xl bg-[#E1F5EE] flex items-center justify-center mb-4">
                    <svg className="w-5 h-5 text-[#1D9E75]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-lg mb-2 text-gray-900">Share QR codes</p>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Download a card for each item. Print it, stick it at the booth.
                    People scan and rate on their phones.
                  </p>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal className="reveal-delay-3">
              <div className="relative">
                <span className="text-7xl font-bold text-gray-100 absolute -top-4 -left-2 select-none">03</span>
                <div className="relative pt-12">
                  <div className="w-10 h-10 rounded-xl bg-[#E1F5EE] flex items-center justify-center mb-4">
                    <svg className="w-5 h-5 text-[#1D9E75]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-lg mb-2 text-gray-900">See results live</p>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Watch votes come in on a real-time leaderboard. Export data
                    to CSV anytime.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <ScrollReveal>
            <p className="text-xs font-medium text-[#1D9E75] tracking-widest uppercase mb-3">
              Use it for
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-16 text-gray-900">
              More engagement,<br />every day.
            </h2>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                title: 'College fests',
                desc: 'Let students rate games, food stalls, and performances. Get real winners.',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                ),
              },
              {
                title: 'Corporate events',
                desc: 'Collect feedback on sessions, speakers, and workshops instantly.',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                ),
              },
              {
                title: 'Hackathons',
                desc: 'Fair judging across multiple projects and criteria. No bias.',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                ),
              },
              {
                title: 'Exhibitions',
                desc: 'Booth-by-booth feedback from visitors. Understand what resonates.',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                ),
              },
            ].map((item, i) => (
              <ScrollReveal key={item.title} className={`reveal-delay-${(i % 3) + 1}`}>
                <div className="bg-white border border-gray-200 rounded-2xl p-7 hover:border-[#1D9E75]/30 transition-colors group">
                  <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center mb-4 text-gray-400 group-hover:bg-[#E1F5EE] group-hover:text-[#1D9E75] transition-colors">
                    {item.icon}
                  </div>
                  <p className="font-semibold text-lg mb-1 text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-[#04342C]">
        <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 py-24 text-center relative">
          <ScrollReveal>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-5 text-white">
              Start listening today.
            </h2>
            <p className="text-[#5DCAA5] max-w-md mx-auto mb-10 text-lg">
              Create your first feedback event in under two minutes.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center bg-[#1D9E75] text-white text-sm font-medium px-8 py-4 rounded-full hover:bg-[#148f6a] transition-all active:scale-[0.98] shadow-lg shadow-black/20"
            >
              Get started for free
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900">votu</span>
          <span className="text-xs text-gray-400">Rate what matters.</span>
        </div>
      </footer>
    </div>
  )
}
