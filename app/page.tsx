import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-emerald-500/20 selection:text-emerald-700 dark:selection:text-emerald-300">
      {/* Top Navbar */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-base shadow-sm shadow-emerald-500/20">
            F
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
            Finflow
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <ThemeToggle />
          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-lg transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl shadow-sm shadow-emerald-600/20 transition-all hover:shadow-emerald-600/30 active:scale-[0.98]"
          >
            Criar conta
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-24 max-w-5xl mx-auto text-center">
        {/* Subtle pill tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-8 animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Controle financeiro pessoal e inteligente
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-6 max-w-4xl">
          Suas finanças organizadas com <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent">clareza absoluta</span>.
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-10 leading-relaxed font-normal">
          Controle receitas, despesas, cartões de crédito e metas de poupança em uma interface rápida, segura e focada no que realmente importa.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-16">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-base shadow-md shadow-emerald-600/25 hover:shadow-emerald-600/40 transition-all active:scale-[0.98]"
          >
            Começar agora — É grátis
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-base hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all active:scale-[0.98]"
          >
            Já tenho conta
          </Link>
        </div>

        {/* Interactive / Visual App Preview Card */}
        <div className="w-full max-w-4xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden p-6 sm:p-8 text-left">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-6 border-b border-slate-100 dark:border-slate-800/80 gap-4">
            <div>
              <p className="text-xs uppercase font-medium tracking-wider text-slate-400 dark:text-slate-500">Resumo Consolidado</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">R$ 14.850,00</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                +24% este mês
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">Metas em dia</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Entradas (Mês)</p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">R$ 8.200,00</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Saídas (Mês)</p>
              <p className="text-lg font-bold text-rose-600 dark:text-rose-400">R$ 3.450,00</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Poupança Guardada</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">R$ 4.750,00</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/60">
            <span>Última sincronização: hoje às 14:32</span>
            <span>Segurança ponta a ponta com PostgreSQL</span>
          </div>
        </div>

        {/* Features Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-5xl mt-24 text-left">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold mb-4">
              📊
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">Fluxo de Caixa Real</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Registre receitas e despesas com categorização e filtros por período em tempo real.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold mb-4">
              💳
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">Cartões & Faturas</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Monitore dias de fechamento e vencimento de cada cartão para planejar suas faturas.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold mb-4">
              🎯
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">Metas de Poupança</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Defina alvos com prazos e acompanhe o percentual acumulado com barras de progresso visuais.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold mb-4">
              ⚡
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">Importação CSV</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Traga extratos bancários em formato CSV diretamente com pré-visualização e validação.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800/80 py-8 px-6 text-center text-xs text-slate-500 dark:text-slate-500">
        <p>© {new Date().getFullYear()} Finflow. Controle Financeiro Pessoal. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
