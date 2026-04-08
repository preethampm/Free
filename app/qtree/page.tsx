import Link from 'next/link';
import { QTreeVisualizer } from '@/src/components/qtree-visualizer';

export default function QuadTreePage() {
  return (
    <main className="min-h-screen bg-[#04342C] flex flex-col items-center justify-center p-8">
      <div className="absolute top-6 left-6">
        <Link
          href="/"
          className="text-[#E1F5EE]/60 hover:text-[#E1F5EE] text-sm transition-colors"
        >
          ← Back
        </Link>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-2xl font-mono text-[#5DCAA5] mb-2">QuadTree Visualization</h1>
        <p className="text-[#E1F5EE]/40 text-sm font-mono">Click anywhere to add points</p>
      </div>

      <QTreeVisualizer width={800} height={500} />

      <div className="mt-8 text-[#E1F5EE]/20 text-xs font-mono">
        easter egg
      </div>
    </main>
  );
}
