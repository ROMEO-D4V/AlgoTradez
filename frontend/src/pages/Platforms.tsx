import { ArrowRight, Layers } from 'lucide-react'
import { Link } from 'react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const platforms = [
  {
    title: 'TradingView',
    description: 'Advanced charting with Pine Script alerts and webhook integration',
    href: '/tradingview',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    borderGlow: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]',
    iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-400',
    letter: 'TV',
  },
  {
    title: 'Amibroker',
    description: 'Professional algorithmic trading with AFL scripting language',
    href: '#',
    gradient: 'from-green-500/20 to-emerald-500/20',
    borderGlow: 'hover:shadow-[0_0_30px_rgba(34,197,94,0.3)]',
    iconBg: 'bg-gradient-to-br from-green-500 to-emerald-400',
    letter: 'AB',
  },
  {
    title: 'GoCharting',
    description: 'Professional HTML5 charting optimized for Indian markets',
    href: '/gocharting',
    gradient: 'from-cyan-500/20 to-teal-500/20',
    borderGlow: 'hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]',
    iconBg: 'bg-gradient-to-br from-cyan-500 to-teal-400',
    letter: 'GC',
  },
  {
    title: 'Python',
    description: 'Run Python trading strategies with live market data access',
    href: '#',
    gradient: 'from-yellow-500/20 to-amber-500/20',
    borderGlow: 'hover:shadow-[0_0_30px_rgba(234,179,8,0.3)]',
    iconBg: 'bg-gradient-to-br from-yellow-500 to-amber-400',
    letter: 'PY',
  },
  {
    title: 'MetaTrader',
    description: 'Industry-standard forex and CFD trading platform integration',
    href: '#',
    gradient: 'from-blue-600/20 to-indigo-500/20',
    borderGlow: 'hover:shadow-[0_0_30px_rgba(37,99,235,0.3)]',
    iconBg: 'bg-gradient-to-br from-blue-600 to-indigo-500',
    letter: 'MT',
  },
  {
    title: 'N8N',
    description: 'Workflow automation for trading signals and alerts',
    href: '#',
    gradient: 'from-red-500/20 to-pink-500/20',
    borderGlow: 'hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]',
    iconBg: 'bg-gradient-to-br from-red-500 to-pink-400',
    letter: 'N8',
  },
  {
    title: 'Java',
    description: 'Enterprise-grade trading applications with Java SDK',
    href: '#',
    gradient: 'from-orange-500/20 to-red-500/20',
    borderGlow: 'hover:shadow-[0_0_30px_rgba(249,115,22,0.3)]',
    iconBg: 'bg-gradient-to-br from-orange-500 to-red-400',
    letter: 'JV',
  },
  {
    title: 'Go',
    description: 'High-performance trading bots with Go concurrency',
    href: '#',
    gradient: 'from-cyan-400/20 to-blue-400/20',
    borderGlow: 'hover:shadow-[0_0_30px_rgba(34,211,238,0.3)]',
    iconBg: 'bg-gradient-to-br from-cyan-400 to-blue-400',
    letter: 'GO',
  },
  {
    title: '.NET',
    description: 'Microsoft ecosystem trading solutions with C#',
    href: '#',
    gradient: 'from-gray-500/20 to-gray-600/20',
    borderGlow: 'hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]',
    iconBg: 'bg-gradient-to-br from-gray-500 to-gray-600',
    letter: '.N',
  },
  {
    title: 'Node.js',
    description: 'JavaScript runtime for real-time trading applications',
    href: '#',
    gradient: 'from-green-400/20 to-lime-500/20',
    borderGlow: 'hover:shadow-[0_0_30px_rgba(74,222,128,0.3)]',
    iconBg: 'bg-gradient-to-br from-green-400 to-lime-500',
    letter: 'NJ',
  },
  {
    title: 'Rust',
    description: 'Memory-safe systems programming for trading infrastructure',
    href: '#',
    gradient: 'from-orange-600/20 to-amber-600/20',
    borderGlow: 'hover:shadow-[0_0_30px_rgba(234,88,12,0.3)]',
    iconBg: 'bg-gradient-to-br from-orange-600 to-amber-600',
    letter: 'RS',
  },
  {
    title: 'ChartInk',
    description: 'Custom stock screeners with technical scan automation',
    href: '/chartink',
    gradient: 'from-gray-500/20 to-gray-600/20',
    borderGlow: 'hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]',
    iconBg: 'bg-gradient-to-br from-gray-500 to-gray-600',
    letter: 'CI',
  },
  {
    title: 'Excel',
    description: 'Spreadsheet-based trading with VBA and API integration',
    href: '#',
    gradient: 'from-green-600/20 to-emerald-600/20',
    borderGlow: 'hover:shadow-[0_0_30px_rgba(22,163,74,0.3)]',
    iconBg: 'bg-gradient-to-br from-green-600 to-emerald-600',
    letter: 'XL',
  },
  {
    title: 'Google Sheets',
    description: 'Cloud-based trading spreadsheets with real-time data',
    href: '#',
    gradient: 'from-green-400/20 to-teal-400/20',
    borderGlow: 'hover:shadow-[0_0_30px_rgba(74,222,128,0.3)]',
    iconBg: 'bg-gradient-to-br from-green-400 to-teal-400',
    letter: 'GS',
  },
  {
    title: 'OpenClaw',
    description: 'Open-source trading framework for algorithmic strategies',
    href: '#',
    gradient: 'from-indigo-500/20 to-blue-500/20',
    borderGlow: 'hover:shadow-[0_0_30px_rgba(99,102,241,0.3)]',
    iconBg: 'bg-gradient-to-br from-indigo-500 to-blue-500',
    letter: 'OC',
  },
  {
    title: 'Telegram',
    description: 'Trading signals and alerts via Telegram bot integration',
    href: '#',
    gradient: 'from-sky-500/20 to-blue-500/20',
    borderGlow: 'hover:shadow-[0_0_30px_rgba(14,165,233,0.3)]',
    iconBg: 'bg-gradient-to-br from-sky-500 to-blue-500',
    letter: 'TG',
  },
]

export default function Platforms() {
  return (
    <div className="py-6 space-y-6 relative">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-white/3 rounded-full blur-3xl animate-float-patch" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-white/2 rounded-full blur-3xl animate-float-patch-2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/2 rounded-full blur-3xl animate-float-patch-3" />
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-white text-glow-intense">
          <Layers className="h-6 w-6 icon-white animate-float" />
          <span className="letter-stagger">
            {'Trading Platforms'.split('').map((letter, i) => (
              <span key={i} className="inline-block animate-letter" style={{ animationDelay: `${i * 0.04}s` }}>
                {letter === ' ' ? '\u00A0' : letter}
              </span>
            ))}
          </span>
        </h1>
        <p className="text-gray-400 mt-1 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          Connect your favorite charting platforms with STOCKX TRADEZ for automated trading
        </p>
      </div>

      {/* Platform Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {platforms.map((platform, index) => (
          <Link key={platform.href + platform.title} to={platform.href}>
            <Card
              className={`h-full cursor-pointer group glass-card card-hover-effect animate-card-slide-up border-white/10 bg-gradient-to-br ${platform.gradient} backdrop-blur-sm transition-all duration-500 ${platform.borderGlow}`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-xl ${platform.iconBg} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <span className="text-white font-bold text-sm">{platform.letter}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </div>
                <CardTitle className="text-base mt-3 text-white group-hover:text-glow transition-all duration-300">
                  {platform.title}
                </CardTitle>
                <CardDescription className="text-xs text-gray-400 line-clamp-2">
                  {platform.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                  Click to configure
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
