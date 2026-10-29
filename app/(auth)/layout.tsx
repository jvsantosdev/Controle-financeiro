import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-6 transition-colors duration-200">
      {/* Top Header */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-lg shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            F
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
            Finflow
          </span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Main Auth Card Container */}
      <main className="w-full max-w-md mx-auto my-8">
        <div className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none transition-all">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center py-4 text-xs text-slate-400 dark:text-slate-500">
        © {new Date().getFullYear()} Finflow — Gestão financeira simplificada e inteligente.
      </footer>
    </div>
  );
}
