import { Activity, BarChart3, CandlestickChart, ChevronRight, Cpu, FileText, Flame, Shield, Sparkles, Target, TrendingDown, TrendingUp, Wallet, Zap } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { useOrderEventRefresh } from '@/hooks/useOrderEventRefresh'
import { cn } from '@/lib/utils'
import { onModeChange } from '@/stores/themeStore'

interface MarginData {
  availablecash: string
  collateral: string
  m2munrealized: string
  m2mrealized: string
  utiliseddebits: string
}

interface MasterContractStatus {
  status: 'pending' | 'downloading' | 'success' | 'error'
  message?: string
  total_symbols?: number
}

interface MarketIndex {
  symbol: string
  name: string
  value: number
  change: number
  changePercent: number
  high: number
  low: number
  open: number
  prevClose: number
  volume: number
}

interface StockSuggestion {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  high52w: number
  low52w: number
  pe: number
  marketCap: string
  signal: 'STRONG BUY' | 'BUY' | 'HOLD' | 'SELL'
  target: number
  stopLoss: number
  sector: string
  reason: string
}

function formatIndianNumber(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (Number.isNaN(num)) return '0.00'
  const isNegative = num < 0
  const absNum = Math.abs(num)
  let formatted: string
  if (absNum >= 10000000) {
    formatted = `${(absNum / 10000000).toFixed(2)}Cr`
  } else if (absNum >= 100000) {
    formatted = `${(absNum / 100000).toFixed(2)}L`
  } else {
    formatted = absNum.toFixed(2)
  }
  return isNegative ? `-${formatted}` : formatted
}

function getPnLColor(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (num > 0) return 'text-profit'
  if (num < 0) return 'text-loss'
  return 'text-white'
}

function formatMarketNumber(value: number): string {
  return value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function getEmptyMarketData(): MarketIndex[] {
  return [
    { symbol: 'NIFTY 50', name: 'NIFTY', value: 0, change: 0, changePercent: 0, high: 0, low: 0, open: 0, prevClose: 0, volume: 0 },
    { symbol: 'BANK NIFTY', name: 'BANKNIFTY', value: 0, change: 0, changePercent: 0, high: 0, low: 0, open: 0, prevClose: 0, volume: 0 },
    { symbol: 'NIFTY IT', name: 'NIFTY IT', value: 0, change: 0, changePercent: 0, high: 0, low: 0, open: 0, prevClose: 0, volume: 0 },
    { symbol: 'SENSEX', name: 'SENSEX', value: 0, change: 0, changePercent: 0, high: 0, low: 0, open: 0, prevClose: 0, volume: 0 },
    { symbol: 'INDIA VIX', name: 'INDIA VIX', value: 0, change: 0, changePercent: 0, high: 0, low: 0, open: 0, prevClose: 0, volume: 0 },
  ]
}

function getEmptyStockSuggestions(): StockSuggestion[] {
  return []
}

export default function Dashboard() {
  const [marginData, setMarginData] = useState<MarginData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [masterContract, setMasterContract] = useState<MasterContractStatus>({ status: 'pending' })
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const [brokerExpired, setBrokerExpired] = useState(false)
  const [aiMessage, setAiMessage] = useState('')
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>(getEmptyMarketData())
  const [stockSuggestions] = useState<StockSuggestion[]>(getEmptyStockSuggestions())
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [marketTime, setMarketTime] = useState(new Date())
  const marketIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchFundsData = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/auth/dashboard-data', { credentials: 'include' })
      if (response.status === 401) {
        const body = await response.json().catch(() => null)
        if (body?.code === 'BROKER_SESSION_EXPIRED') {
          setBrokerExpired(true)
        } else {
          setIsAuthenticated(false)
        }
        setIsLoading(false)
        return
      }
      const data = await response.json()
      if (data.status === 'success' && data.data) {
        setMarginData(data.data)
        setError(null)
      } else {
        setMarginData({ availablecash: '0', collateral: '0', m2munrealized: '0', m2mrealized: '0', utiliseddebits: '0' })
        setError(null)
      }
    } catch {
      setMarginData({ availablecash: '0', collateral: '0', m2munrealized: '0', m2mrealized: '0', utiliseddebits: '0' })
      setError(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useOrderEventRefresh(fetchFundsData, {
    events: ['order_event', 'analyzer_update', 'close_position_event'],
  })

  useEffect(() => {
    const unsubscribe = onModeChange(() => { fetchFundsData() })
    return () => unsubscribe()
  }, [fetchFundsData])

  useEffect(() => {
    marketIntervalRef.current = setInterval(() => {
      setMarketIndices(prev => prev.map(item => {
        const drift = (Math.random() - 0.5) * item.value * 0.0003
        const newValue = item.value + drift
        const newChange = newValue - item.prevClose
        const newChangePercent = (newChange / item.prevClose) * 100
        return {
          ...item,
          value: newValue,
          change: newChange,
          changePercent: newChangePercent,
          high: Math.max(item.high, newValue),
          low: Math.min(item.low, newValue),
        }
      }))
      setLastUpdated(new Date())
      setMarketTime(new Date())
    }, 2000)
    return () => { if (marketIntervalRef.current) clearInterval(marketIntervalRef.current) }
  }, [])

  const checkMasterContractStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/master-contract/status', {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      })
      if (response.status === 401) return
      const data = await response.json()
      setMasterContract(data)
    } catch {
      setMasterContract({ status: 'error', message: 'Failed to check status' })
    }
  }, [])

  useEffect(() => {
    checkMasterContractStatus()
    const interval = setInterval(() => {
      setMasterContract((prev) => {
        if (prev.status === 'success' || prev.status === 'error') return prev
        return prev
      })
    }, 10000)
    return () => clearInterval(interval)
  }, [checkMasterContractStatus])

  useEffect(() => {
    fetchFundsData()
  }, [fetchFundsData])

  const getMasterContractLedColor = () => {
    switch (masterContract.status) {
      case 'success': return 'bg-profit shadow-[0_0_6px_rgba(34,197,94,0.6)]'
      case 'downloading': return 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.6)]'
      case 'error': return 'bg-loss shadow-[0_0_6px_rgba(239,68,68,0.6)]'
      default: return 'bg-gray-500 shadow-[0_0_6px_rgba(107,114,128,0.6)]'
    }
  }

  const getMasterContractStatusText = () => {
    switch (masterContract.status) {
      case 'success': return `Loaded (${masterContract.total_symbols?.toLocaleString() || 0} symbols)`
      case 'downloading': return 'Downloading...'
      case 'error': return 'Error'
      default: return 'Checking...'
    }
  }

  const quickAccessCards = [
    { href: '/orderbook', label: 'Orders', description: 'All orders', icon: FileText, color: 'text-blue-400' },
    { href: '/tradebook', label: 'Trades', description: 'Trade history', icon: BarChart3, color: 'text-gray-400' },
    { href: '/positions', label: 'Positions', description: 'Open positions', icon: Target, color: 'text-amber-400' },
    { href: '/holdings', label: 'Holdings', description: 'Portfolio', icon: Wallet, color: 'text-cyan-400' },
  ]

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h1 className="text-2xl font-bold text-white">Session Expired</h1>
        <p className="text-gray-400">Please log in to access the dashboard.</p>
        <Link to="/login" className="text-white hover:underline">Go to Login</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#000000' }}>
      {/* Background ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute w-[400px] h-[400px] rounded-full opacity-[0.008]" style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)', top: '5%', left: '10%', animation: 'white-patch-drift 22s ease-in-out infinite' }} />
        <div className="absolute w-[350px] h-[350px] rounded-full opacity-[0.006]" style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)', top: '40%', right: '5%', animation: 'white-patch-drift-2 26s ease-in-out infinite' }} />
        <div className="absolute w-[300px] h-[300px] rounded-full opacity-[0.007]" style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)', bottom: '10%', left: '30%', animation: 'white-patch-drift-3 20s ease-in-out infinite' }} />
        <div className="absolute w-[250px] h-[250px] rounded-full opacity-[0.005]" style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)', top: '20%', left: '60%', animation: 'white-patch-drift 18s ease-in-out infinite 2s' }} />
        <div className="dash-grid-overlay absolute inset-0" />
      </div>

      {/* Cherry blossom left-side "video loop" decoration */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">

        {/* Large cherry blossom tree silhouette - left side */}
        <div className="absolute -left-5 top-0 h-full" style={{ opacity: 0.18, animation: 'sakura-branch-sway 20s ease-in-out infinite' }}>
          <svg width="500" height="100%" viewBox="0 0 500 1000" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin slice">
            <path d="M70 1000C75 920 82 840 92 760C102 680 110 610 120 540C130 470 138 410 148 350C158 290 165 240 175 190C185 140 192 100 200 65C208 30 215 12 222 0" stroke="white" strokeWidth="8" strokeLinecap="round"/>
            <path d="M75 950C80 900 86 850 95 790" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
            <path d="M148 350C170 328 200 312 235 308C270 304 305 310 330 328C355 346 368 372 372 400" stroke="white" strokeWidth="5" strokeLinecap="round"/>
            <path d="M235 308C248 290 268 280 290 285C312 290 322 305 318 320" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M330 328C345 315 362 308 380 315C398 322 405 340 398 355" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <path d="M120 540C148 518 182 505 218 510C254 515 285 535 305 560C325 585 332 618 325 645" stroke="white" strokeWidth="4.5" strokeLinecap="round"/>
            <path d="M218 510C235 492 258 485 282 492C306 499 315 518 308 535" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <path d="M305 560C322 545 342 538 362 548C382 558 388 578 380 595" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M175 190C152 172 128 162 105 168C82 174 68 192 62 215C56 238 60 262 72 280" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
            <path d="M105 168C92 152 75 145 58 152C41 159 35 175 40 190" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M200 65C218 48 242 40 265 48C288 56 300 75 305 98" stroke="white" strokeWidth="3" strokeLinecap="round"/>
            <path d="M265 48C278 35 295 30 312 38C329 46 335 62 328 78" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M92 760C115 740 142 732 168 740C194 748 210 768 215 792" stroke="white" strokeWidth="3" strokeLinecap="round"/>
            {/* Blossoms - branch 1 end */}
            <circle cx="372" cy="400" r="28" fill="rgba(255,183,197,0.55)"/>
            <circle cx="355" cy="388" r="22" fill="rgba(255,200,215,0.5)"/>
            <circle cx="388" cy="395" r="18" fill="rgba(255,220,230,0.45)"/>
            <circle cx="365" cy="412" r="15" fill="rgba(255,160,185,0.4)"/>
            <circle cx="340" cy="398" r="12" fill="rgba(255,240,245,0.35)"/>
            <circle cx="395" cy="380" r="14" fill="rgba(255,183,197,0.4)"/>
            {/* Blossoms - branch 1 sub */}
            <circle cx="318" cy="320" r="20" fill="rgba(255,183,197,0.45)"/>
            <circle cx="305" cy="310" r="16" fill="rgba(255,200,215,0.4)"/>
            <circle cx="398" cy="355" r="18" fill="rgba(255,183,197,0.4)"/>
            <circle cx="385" cy="345" r="14" fill="rgba(255,200,215,0.35)"/>
            {/* Blossoms - branch 2 end */}
            <circle cx="325" cy="645" r="25" fill="rgba(255,183,197,0.5)"/>
            <circle cx="310" cy="632" r="20" fill="rgba(255,200,215,0.45)"/>
            <circle cx="340" cy="638" r="16" fill="rgba(255,220,230,0.4)"/>
            <circle cx="380" cy="595" r="18" fill="rgba(255,183,197,0.4)"/>
            <circle cx="308" cy="535" r="18" fill="rgba(255,183,197,0.4)"/>
            {/* Blossoms - branch 3 */}
            <circle cx="72" cy="280" r="22" fill="rgba(255,183,197,0.45)"/>
            <circle cx="58" cy="268" r="18" fill="rgba(255,200,215,0.4)"/>
            <circle cx="40" cy="190" r="16" fill="rgba(255,183,197,0.35)"/>
            {/* Blossoms - branch 4 */}
            <circle cx="305" cy="98" r="20" fill="rgba(255,183,197,0.45)"/>
            <circle cx="290" cy="88" r="16" fill="rgba(255,200,215,0.4)"/>
            <circle cx="328" cy="78" r="15" fill="rgba(255,183,197,0.35)"/>
            {/* Blossoms - branch 5 */}
            <circle cx="215" cy="792" r="20" fill="rgba(255,183,197,0.42)"/>
            <circle cx="200" cy="780" r="16" fill="rgba(255,200,215,0.36)"/>
            {/* Blossoms - along trunk */}
            <circle cx="175" cy="190" r="14" fill="rgba(255,183,197,0.35)"/>
            <circle cx="148" cy="350" r="16" fill="rgba(255,183,197,0.38)"/>
            <circle cx="120" cy="540" r="15" fill="rgba(255,183,197,0.35)"/>
            <circle cx="200" cy="65" r="12" fill="rgba(255,183,197,0.32)"/>
            <circle cx="92" cy="760" r="13" fill="rgba(255,183,197,0.32)"/>
          </svg>
        </div>

        {/* Dense petal stream falling from the tree - left 30% of screen */}
        {Array.from({ length: 30 }).map((_, i) => {
          const isLeft = i < 22
          const leftPos = isLeft
            ? 1 + (i * 1.8) % 32
            : 55 + (i * 4) % 45
          return (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${leftPos}%`,
                top: '-20px',
                width: `${6 + (i % 5) * 2}px`,
                height: `${6 + (i % 5) * 2}px`,
                animation: `${i % 3 === 0 ? 'sakura-fall' : i % 3 === 1 ? 'sakura-fall-alt' : 'sakura-fall'} ${9 + (i % 7) * 2}s linear ${i * 0.4}s infinite`,
                filter: `drop-shadow(0 0 ${isLeft ? 5 : 2}px rgba(255,183,197,${isLeft ? 0.5 : 0.2}))`,
              }}
            >
              <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d={i % 3 === 0
                    ? 'M10 0C10 0 14 5 14 9C14 13 10 15 10 15C10 15 6 13 6 9C6 5 10 0 10 0Z'
                    : i % 3 === 1
                    ? 'M10 1C10 1 13 5 13 8C13 11 10 13 10 13C10 13 7 11 7 8C7 5 10 1 10 1Z'
                    : 'M10 2C10 2 12 5 12 7C12 10 10 12 10 12C10 12 8 10 8 7C8 5 10 2 10 2Z'
                  }
                  fill={i % 4 === 0 ? 'rgba(255,170,195,0.75)' : i % 4 === 1 ? 'rgba(255,195,215,0.65)' : i % 4 === 2 ? 'rgba(255,215,230,0.6)' : 'rgba(255,150,180,0.5)'}
                />
                <circle cx="10" cy="7" r="1.5" fill="rgba(255,100,130,0.45)"/>
              </svg>
            </div>
          )
        })}

        {/* Ambient pink glow on left side */}
        <div className="absolute left-0 top-0 w-[450px] h-[700px]" style={{ opacity: 0.09, background: 'radial-gradient(ellipse at 15% 25%, rgba(255,150,180,0.7) 0%, rgba(255,183,197,0.3) 40%, transparent 70%)', animation: 'sakura-glow-pulse 7s ease-in-out infinite' }} />
        <div className="absolute left-0 top-[35%] w-[350px] h-[500px]" style={{ opacity: 0.07, background: 'radial-gradient(ellipse at 20% 50%, rgba(255,183,197,0.6) 0%, transparent 65%)', animation: 'sakura-glow-pulse 9s ease-in-out infinite 3s' }} />

        {/* Grid overlay */}
        <div className="dash-grid-overlay absolute inset-0" />
      </div>

      {/* Content */}
      <div className="relative z-10 space-y-5 p-4 md:p-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3" style={{ animation: 'card-enter-up 0.5s ease-out' }}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-profit animate-pulse border-2 border-black" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                <span className="text-white glow-heading">STOCK</span><span className="text-gray-300 glow-heading">X</span>
                <span className="text-gray-500 glow-heading mx-1.5">|</span>
                <span className="text-white glow-heading">TRADE</span><span className="text-gray-300 glow-heading">Z</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-1.5 text-xs backdrop-blur-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-profit animate-pulse" />
              <span className="text-gray-400 font-mono tabular-nums">{marketTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-1.5 text-xs backdrop-blur-sm">
              <span className="text-gray-600">Contract</span>
              <div className={cn('w-1.5 h-1.5 rounded-full', getMasterContractLedColor())} />
              <span className="text-gray-400">{getMasterContractStatusText()}</span>
            </div>
            {brokerExpired && (
              <a
                href="/broker"
                className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5 text-xs text-amber-400 hover:bg-amber-500/20 transition-colors cursor-pointer"
              >
                <Shield className="h-3 w-3" />
                <span>Broker token expired — click to reconnect</span>
              </a>
            )}
          </div>
        </div>

        <div className="dash-glow-divider" />

        {/* Market Overview - 5 indices */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {marketIndices.map((idx, i) => (
            <div key={idx.symbol} className={cn('dash-index-card', idx.change >= 0 ? 'idx-profit' : 'idx-loss')}
              style={{ animation: `card-enter-up 0.5s ease-out ${i * 0.07}s both` }}>
              <div className="p-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">{idx.symbol}</p>
                  <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded', idx.change >= 0 ? 'bg-profit/10 text-profit' : 'bg-loss/10 text-loss')}>
                    {idx.change >= 0 ? '+' : ''}{idx.changePercent.toFixed(2)}%
                  </span>
                </div>
                <p className={cn('text-xl font-black tabular-nums tracking-tight', idx.change >= 0 ? 'text-profit' : 'text-loss')}>
                  {formatMarketNumber(idx.value)}
                </p>
                <div className="flex items-center gap-3 mt-2 text-[9px] text-gray-600">
                  <span>H <span className="text-gray-400">{formatMarketNumber(idx.high)}</span></span>
                  <span>L <span className="text-gray-400">{formatMarketNumber(idx.low)}</span></span>
                </div>
                <div className="dash-progress-bar mt-2.5 bg-white/[0.04]">
                  <div className={cn('h-full rounded-full transition-all duration-700', idx.change >= 0 ? 'bg-profit/60' : 'bg-loss/60')} style={{ width: `${Math.min(100, Math.max(5, ((idx.value - idx.low) / (idx.high - idx.low)) * 100))}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Market Breadth */}
        <div className="dash-stat-card p-3.5" style={{ animation: 'card-enter-up 0.5s ease-out 0.35s both' }}>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5" />
              Market Breadth
            </h3>
            <span className="text-[10px] text-gray-600">Connect broker for live data</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 dash-progress-bar bg-white/[0.04] flex">
              <div className="h-full bg-profit/30 rounded-l-full" style={{ width: '0%' }} />
              <div className="h-full bg-gray-500/20" style={{ width: '100%' }} />
              <div className="h-full bg-loss/30 rounded-r-full" style={{ width: '0%' }} />
            </div>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="text-profit font-bold">0 <span className="text-gray-600 font-normal">adv</span></span>
              <span className="text-loss font-bold">0 <span className="text-gray-600 font-normal">dec</span></span>
              <span className="text-gray-400 font-bold">0 <span className="text-gray-600 font-normal">unch</span></span>
            </div>
          </div>
        </div>

        {/* Account Summary */}
        <div style={{ animation: 'card-enter-up 0.5s ease-out 0.45s both' }}>
          <h2 className="dash-section-header">
            <Wallet className="h-4 w-4" />
            Account Summary
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {[
              { label: 'Available Balance', value: marginData?.availablecash, badge: 'Cash', icon: Wallet, variant: '' },
              { label: 'Collateral', value: marginData?.collateral, badge: 'Collateral', icon: Shield, variant: 'cyan' },
              { label: 'Unrealized P&L', value: marginData?.m2munrealized, badge: 'MTM', icon: marginData && parseFloat(marginData.m2munrealized) >= 0 ? TrendingUp : TrendingDown, variant: marginData && parseFloat(marginData.m2munrealized) >= 0 ? 'profit' : 'loss' },
              { label: 'Realized P&L', value: marginData?.m2mrealized, badge: 'Booked', icon: Flame, variant: marginData && parseFloat(marginData.m2mrealized) >= 0 ? 'profit' : 'loss' },
              { label: 'Used Margin', value: marginData?.utiliseddebits, badge: 'Utilized', icon: Activity, variant: 'amber' },
            ].map((stat, i) => (
              <div key={stat.label} className={cn('dash-stat-card p-3.5', stat.variant === 'profit' && 'border-profit/20', stat.variant === 'loss' && 'border-loss/20', stat.variant === 'cyan' && 'border-cyan-500/20', stat.variant === 'amber' && 'border-amber-500/20')}
                style={{ animation: `card-enter-up 0.4s ease-out ${0.5 + i * 0.06}s both` }}>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <stat.icon className={cn('h-3.5 w-3.5', stat.variant === 'profit' ? 'text-profit' : stat.variant === 'loss' ? 'text-loss' : stat.variant === 'cyan' ? 'text-cyan-400' : stat.variant === 'amber' ? 'text-amber-400' : 'text-gray-500')} />
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">{stat.label}</p>
                </div>
                <p className={cn('text-xl md:text-2xl font-black tracking-tight tabular-nums', stat.label.includes('P&L') ? getPnLColor(stat.value || '0') : 'text-white')}>
                  {isLoading ? '...' : stat.value ? formatIndianNumber(stat.value) : '0.00'}
                </p>
                <span className={cn('dash-badge mt-2.5', stat.variant === 'profit' ? 'bg-profit/10 text-profit border border-profit/20' : stat.variant === 'loss' ? 'bg-loss/10 text-loss border border-loss/20' : stat.variant === 'cyan' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : stat.variant === 'amber' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-white/[0.05] text-gray-500 border border-white/[0.08]')}>
                  {stat.badge}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Access + AI */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left: Quick Access + Quick Stats + Top Movers */}
          <div className="lg:col-span-2 space-y-5">
            {/* Quick Access */}
            <div style={{ animation: 'card-enter-up 0.5s ease-out 0.55s both' }}>
              <h2 className="dash-section-header">
                <Zap className="h-4 w-4" />
                Quick Access
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {quickAccessCards.map((card, i) => (
                  <Link key={card.href} to={card.href} className="dash-quick-card group p-3"
                    style={{ animation: `card-enter-up 0.4s ease-out ${0.6 + i * 0.05}s both` }}>
                    <div className="flex items-center gap-2.5">
                      <div className={cn('p-2 rounded-lg bg-white/[0.04]', card.color)}>
                        <card.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-xs text-white">{card.label}</h3>
                        <p className="text-[10px] text-gray-600">{card.description}</p>
                      </div>
                      <ChevronRight className="h-3 w-3 text-gray-700 group-hover:text-white/50 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div style={{ animation: 'card-enter-up 0.5s ease-out 0.7s both' }}>
              <h2 className="dash-section-header">
                <CandlestickChart className="h-4 w-4" />
                Quick Stats
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { label: 'FII Activity', value: '0 Cr', color: 'text-gray-500', icon: TrendingDown, variant: '' },
                  { label: 'DII Activity', value: '0 Cr', color: 'text-gray-500', icon: TrendingUp, variant: '' },
                  { label: 'Put/Call Ratio', value: '0.00', color: 'text-gray-500', icon: Activity, variant: '' },
                  { label: 'Max Pain NIFTY', value: '0', color: 'text-gray-500', icon: Target, variant: '' },
                ].map((item, i) => (
                  <div key={item.label} className={cn('dash-stat-card p-3')}
                    style={{ animation: `card-enter-up 0.4s ease-out ${0.75 + i * 0.05}s both` }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <item.icon className={cn('h-3 w-3', item.color)} />
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">{item.label}</span>
                    </div>
                    <p className={cn('text-lg font-black tabular-nums', item.color)}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Movers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" style={{ animation: 'card-enter-up 0.5s ease-out 0.9s both' }}>
              <div className="dash-stat-card p-3">
                <h3 className="text-xs font-bold text-profit flex items-center gap-1.5 mb-2.5">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Top Gainers
                </h3>
                <div className="text-center py-4 text-[11px] text-gray-600">Connect broker for live data</div>
              </div>
              <div className="dash-stat-card p-3">
                <h3 className="text-xs font-bold text-loss flex items-center gap-1.5 mb-2.5">
                  <TrendingDown className="h-3.5 w-3.5" />
                  Top Losers
                </h3>
                <div className="text-center py-4 text-[11px] text-gray-600">Connect broker for live data</div>
              </div>
            </div>
          </div>

          {/* Right: AI + Signals + Market Hours */}
          <div className="space-y-4">
            {/* AI Assistant */}
            <div className="dash-ai-card p-3.5 relative overflow-hidden" style={{ animation: 'card-enter-up 0.5s ease-out 0.6s both' }}>
              {/* RGB corner glow effect */}
              <div className="absolute -top-10 -left-10 w-24 h-24 rounded-full opacity-40" style={{ background: 'radial-gradient(circle, rgba(255,0,80,0.6) 0%, transparent 70%)', animation: 'rgb-corner-1 4s ease-in-out infinite' }} />
              <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full opacity-40" style={{ background: 'radial-gradient(circle, rgba(0,200,255,0.6) 0%, transparent 70%)', animation: 'rgb-corner-2 4s ease-in-out infinite 1.3s' }} />
              <div className="absolute -bottom-10 -left-10 w-24 h-24 rounded-full opacity-40" style={{ background: 'radial-gradient(circle, rgba(0,255,120,0.6) 0%, transparent 70%)', animation: 'rgb-corner-3 4s ease-in-out infinite 2.6s' }} />
              <div className="absolute -bottom-10 -right-10 w-24 h-24 rounded-full opacity-40" style={{ background: 'radial-gradient(circle, rgba(180,0,255,0.6) 0%, transparent 70%)', animation: 'rgb-corner-1 4s ease-in-out infinite 0.8s' }} />
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-white/[0.05]">
                  <Cpu className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">STOCKX AI</h3>
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-profit animate-pulse" />
                    <span className="text-[9px] text-profit">Online</span>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5 mb-3">
                {[
                  { label: 'Analyze my portfolio', icon: BarChart3 },
                  { label: 'Market sentiment today', icon: Sparkles },
                  { label: 'Risk assessment', icon: Shield },
                  { label: 'Suggest strategies', icon: Target },
                ].map((action) => (
                  <button key={action.label} onClick={() => { setAiMessage(action.label) }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-left text-[11px] text-gray-400 hover:text-white hover:bg-white/[0.05] transition-all duration-200">
                    <action.icon className="h-3 w-3 text-gray-600" />
                    {action.label}
                  </button>
                ))}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={aiMessage}
                  onChange={(e) => setAiMessage(e.target.value)}
                  placeholder="Ask anything..."
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder:text-gray-700 focus:outline-none focus:border-white/20 transition-all duration-200"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && aiMessage.trim()) {
                      window.location.href = `/agent?q=${encodeURIComponent(aiMessage)}`
                    }
                  }}
                />
                <button
                  onClick={() => { if (aiMessage.trim()) window.location.href = `/agent?q=${encodeURIComponent(aiMessage)}` }}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded-md bg-white/[0.08] text-white hover:bg-white/[0.15] transition-all duration-200"
                >
                  <Sparkles className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Live Signals */}
            <div className="dash-stat-card p-3.5" style={{ animation: 'card-enter-up 0.5s ease-out 0.7s both' }}>
              <div className="flex items-center gap-1.5 mb-2.5">
                <TrendingUp className="h-3.5 w-3.5 text-profit" />
                <h3 className="text-xs font-bold text-white">Live Signals</h3>
                <span className="text-[9px] text-profit font-normal ml-auto">LIVE</span>
              </div>
              <div className="space-y-1.5">
                {[
                  { pair: 'NIFTY 22500 CE', signal: 'BUY', strength: 85, color: 'green' },
                  { pair: 'BANKNIFTY 48000 PE', signal: 'SELL', strength: 72, color: 'red' },
                  { pair: 'RELIANCE CE', signal: 'BUY', strength: 68, color: 'green' },
                ].map((s) => (
                  <div key={s.pair} className={cn('flex items-center justify-between px-2.5 py-1.5 rounded-lg', s.color === 'green' ? 'bg-profit/[0.04] border border-profit/[0.08]' : 'bg-loss/[0.04] border border-loss/[0.08]')}>
                    <div>
                      <p className="text-[11px] font-bold text-white">{s.pair}</p>
                      <p className={cn('text-[9px] font-bold', s.color === 'green' ? 'text-profit' : 'text-loss')}>{s.signal}</p>
                    </div>
                    <div className="text-right">
                      <div className="w-14 h-1 rounded-full bg-white/[0.06] overflow-hidden dash-progress-bar">
                        <div className={cn('h-full rounded-full', s.color === 'green' ? 'bg-profit' : 'bg-loss')} style={{ width: `${s.strength}%` }} />
                      </div>
                      <p className="text-[9px] text-gray-600 mt-0.5">{s.strength}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Market Hours */}
            <div className="dash-stat-card p-3.5" style={{ animation: 'card-enter-up 0.5s ease-out 0.8s both' }}>
              <div className="flex items-center gap-1.5 mb-2.5">
                <CandlestickChart className="h-3.5 w-3.5 text-amber-400" />
                <h3 className="text-xs font-bold text-white">Market Hours</h3>
              </div>
              <div className="space-y-1 text-[10px]">
                {[
                  { label: 'Pre-Open', time: '9:00 - 9:15', active: false },
                  { label: 'Normal Session', time: '9:15 - 15:30', active: true },
                  { label: 'Closing Session', time: '15:30 - 15:40', active: false },
                ].map((h) => (
                  <div key={h.label} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <span className="text-gray-500">{h.label}</span>
                    <span className={cn('font-mono', h.active ? 'text-profit' : 'text-gray-600')}>{h.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stock Suggestions */}
            <div style={{ animation: 'card-enter-up 0.5s ease-out 0.9s both' }}>
              <h2 className="dash-section-header">
                <Sparkles className="h-3.5 w-3.5" />
                Stock Suggestions
                <span className="text-[9px] text-gray-600 font-normal ml-auto">{lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
              </h2>
              <div className="space-y-2">
                {stockSuggestions.length === 0 ? (
                  <div className="text-center py-6 text-[11px] text-gray-600">Configure AI assistant for stock suggestions</div>
                ) : stockSuggestions.slice(0, 5).map((stock) => (
                  <div key={stock.symbol} className="dash-stock-card p-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-[11px] font-bold text-white">{stock.symbol}</p>
                        <span className={cn('text-[8px] font-bold px-1 py-px rounded',
                          stock.signal === 'STRONG BUY' ? 'bg-profit/20 text-profit' :
                          stock.signal === 'BUY' ? 'bg-profit/10 text-profit' :
                          stock.signal === 'HOLD' ? 'bg-white/10 text-gray-400' :
                          'bg-loss/20 text-loss'
                        )}>{stock.signal}</span>
                      </div>
                      <p className="text-[11px] font-bold text-white">₹{formatMarketNumber(stock.price)}</p>
                    </div>
                    <p className={cn('text-[10px] font-bold mb-1', stock.change >= 0 ? 'text-profit' : 'text-loss')}>
                      {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                    </p>
                    <p className="text-[9px] text-gray-600 mb-1">{stock.reason}</p>
                    <div className="flex items-center gap-2 text-[9px]">
                      <span className="text-gray-600">T: <span className="text-profit">₹{formatMarketNumber(stock.target)}</span></span>
                      <span className="text-gray-600">SL: <span className="text-loss">₹{formatMarketNumber(stock.stopLoss)}</span></span>
                      <span className="text-gray-600 ml-auto">MCap: {stock.marketCap}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-loss/10 border border-loss/20 rounded-xl px-3 py-2 text-xs text-loss">
            <Zap className="h-3.5 w-3.5 flex-shrink-0" />
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
