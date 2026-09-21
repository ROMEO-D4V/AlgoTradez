import {
  ArrowDown,
  ArrowUp,
  Download,
  Loader2,
  RefreshCw,
  Settings2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { tradingApi } from '@/api/trading'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useOrderEventRefresh } from '@/hooks/useOrderEventRefresh'
import { useSupportedExchanges } from '@/hooks/useSupportedExchanges'
import { cn, makeFormatCurrency, sanitizeCSV } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import { onModeChange } from '@/stores/themeStore'
import type { Trade } from '@/types/trading'
import { showToast } from '@/utils/toast'

interface FilterState {
  action: string[]
  exchange: string[]
  product: string[]
}

type SortKey = 'timestamp' | 'symbol' | 'action'
interface SortConfig {
  key: SortKey
  direction: 'asc' | 'desc'
}

function parseTimestamp(timestamp: string): number {
  if (!timestamp) return 0
  let date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) {
    const norentm = timestamp.match(/^(\d{2}:\d{2}:\d{2})\s+(\d{2})-(\d{2})-(\d{4})$/)
    if (norentm) date = new Date(`${norentm[4]}-${norentm[3]}-${norentm[2]}T${norentm[1]}`)
  }
  if (Number.isNaN(date.getTime())) {
    const ddmmyyyy = timestamp.match(/^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}:\d{2}:\d{2})$/)
    if (ddmmyyyy) date = new Date(`${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}T${ddmmyyyy[4]}`)
  }
  return date.getTime() || 0
}

function formatTime(timestamp: string): string {
  if (!timestamp) return '-'
  const timeValue = parseTimestamp(timestamp)
  if (timeValue === 0) {
    const timeMatch = timestamp.match(/(\d{2}:\d{2}:\d{2})/)
    return timeMatch ? timeMatch[1] : timestamp
  }
  return new Date(timeValue).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function TradeBook() {
  const { apiKey, user } = useAuthStore()
  const { isCrypto } = useSupportedExchanges()
  const formatCurrency = useMemo(() => makeFormatCurrency(user?.broker), [user?.broker])
  const [trades, setTrades] = useState<Trade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterState>({ action: [], exchange: [], product: [] })
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'timestamp', direction: 'desc' })

  const sortedAndFilteredTrades = useMemo(() => {
    const filtered = trades.filter((trade) => {
      if (filters.action.length > 0 && !filters.action.includes(trade.action)) return false
      if (filters.exchange.length > 0 && !filters.exchange.includes(trade.exchange)) return false
      if (filters.product.length > 0 && !filters.product.includes(trade.product)) return false
      return true
    })
    return [...filtered].sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]
      if (sortConfig.key === 'timestamp') {
        return sortConfig.direction === 'asc' ? parseTimestamp(aValue as string) - parseTimestamp(bValue as string) : parseTimestamp(bValue as string) - parseTimestamp(aValue as string)
      }
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [trades, filters, sortConfig])

  const requestSort = (key: SortKey) => {
    setSortConfig((prev) => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }))
  }

  const hasActiveFilters = filters.action.length > 0 || filters.exchange.length > 0 || filters.product.length > 0

  const toggleFilter = (type: keyof FilterState, value: string) => {
    setFilters((prev) => {
      const arr = prev[type]
      return arr.includes(value) ? { ...prev, [type]: arr.filter((v) => v !== value) } : { ...prev, [type]: [...arr, value] }
    })
  }

  const clearFilters = () => setFilters({ action: [], exchange: [], product: [] })

  const fetchTrades = useCallback(async (showRefresh = false) => {
    if (!apiKey) { setIsLoading(false); return }
    if (showRefresh) setIsRefreshing(true)
    try {
      const response = await tradingApi.getTrades(apiKey)
      if (response.status === 'success' && response.data) { setTrades(response.data); setError(null) }
      else setError(response.message || 'Failed to fetch trades')
    } catch { setError('Failed to fetch trades') }
    finally { setIsLoading(false); setIsRefreshing(false) }
  }, [apiKey])

  useEffect(() => { fetchTrades() }, [fetchTrades])
  useOrderEventRefresh(fetchTrades, { events: ['order_event', 'analyzer_update'] })
  useEffect(() => { const unsub = onModeChange(() => fetchTrades()); return () => unsub() }, [fetchTrades])

  const exportToCSV = () => {
    if (sortedAndFilteredTrades.length === 0) { showToast.error('No data to export', 'system'); return }
    try {
      const headers = ['Symbol', 'Exchange', ...(isCrypto ? [] : ['Product']), 'Action', 'Qty', 'Price', 'Trade Value', 'Order ID', 'Time']
      const rows = sortedAndFilteredTrades.map((t) => [
        sanitizeCSV(t.symbol), sanitizeCSV(t.exchange), ...(isCrypto ? [] : [sanitizeCSV(t.product)]),
        sanitizeCSV(t.action), sanitizeCSV(t.quantity), sanitizeCSV(t.average_price),
        sanitizeCSV(t.trade_value), sanitizeCSV(t.orderid), sanitizeCSV(t.timestamp),
      ])
      const csv = [headers, ...rows].map((row) => row.join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = `tradebook_${new Date().toISOString().split('T')[0]}.csv`; a.click(); URL.revokeObjectURL(url)
      showToast.success('Downloaded', 'clipboard')
    } catch { showToast.error('Failed to export CSV', 'system') }
  }

  const stats = {
    total: sortedAndFilteredTrades.length,
    buyTrades: sortedAndFilteredTrades.filter((t) => t.action === 'BUY').length,
    sellTrades: sortedAndFilteredTrades.filter((t) => t.action === 'SELL').length,
    buyValue: sortedAndFilteredTrades.filter((t) => t.action === 'BUY').reduce((s, t) => s + (parseFloat(String(t.trade_value)) || 0), 0),
    sellValue: sortedAndFilteredTrades.filter((t) => t.action === 'SELL').reduce((s, t) => s + (parseFloat(String(t.trade_value)) || 0), 0),
  }

  const FilterChip = ({ type, value, label }: { type: keyof FilterState; value: string; label: string }) => (
    <Button variant={filters[type].includes(value) ? 'default' : 'outline'} size="sm"
      className={cn('rounded-full text-xs', filters[type].includes(value) ? 'bg-white/15 hover:bg-white/20 text-white' : 'border-white/15 text-gray-400 hover:border-white/30 hover:text-white')}
      onClick={() => toggleFilter(type, value)}>
      {label}
    </Button>
  )

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            <span className="text-white glow-heading">Trade Book</span>
          </h1>
          <p className="text-gray-500 text-sm flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 pulse-glow" />
            Real-time executed trades
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className={cn('relative border-white/15 text-gray-400 hover:border-white/30 hover:text-white', hasActiveFilters && 'border-white/40 text-white')}>
                <Settings2 className="h-4 w-4 mr-2" />Filters
                {hasActiveFilters && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white/60 rounded-full animate-tracking-pulse" />}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-black/95 border-white/15">
              <DialogHeader>
                <DialogTitle className="text-white">Trade Filters</DialogTitle>
                <DialogDescription className="text-gray-500">Filter trades by action, exchange, or product</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-3">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Action</Label>
                  <div className="flex flex-wrap gap-2">
                    <FilterChip type="action" value="BUY" label="Buy" />
                    <FilterChip type="action" value="SELL" label="Sell" />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Exchange</Label>
                  <div className="flex flex-wrap gap-2">
                    {['NSE', 'BSE', 'NFO', 'BFO', 'MCX', 'CDS'].map((e) => <FilterChip key={e} type="exchange" value={e} label={e} />)}
                  </div>
                </div>
                {!isCrypto && (
                  <div className="space-y-3">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Product</Label>
                    <div className="flex flex-wrap gap-2">
                      <FilterChip type="product" value="CNC" label="CNC" />
                      <FilterChip type="product" value="MIS" label="MIS" />
                      <FilterChip type="product" value="NRML" label="NRML" />
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={clearFilters} className="text-gray-400 hover:text-white">Clear All</Button>
                <Button onClick={() => setSettingsOpen(false)} className="bg-white/10 hover:bg-white/20">Done</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm" onClick={() => fetchTrades(true)} disabled={isRefreshing} className="border-white/15 text-gray-400 hover:border-white/30 hover:text-white">
            <RefreshCw className={cn('h-4 w-4 mr-2', isRefreshing && 'animate-spin')} />Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportToCSV} className="border-white/15 text-gray-400 hover:border-white/30 hover:text-white">
            <Download className="h-4 w-4 mr-2" />Export
          </Button>
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-3 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10">
          <span className="text-xs text-gray-500 uppercase tracking-wider">Active:</span>
          {[...filters.action, ...filters.exchange, ...filters.product].map((v) => (
                <Badge key={v} variant="secondary" className="bg-white/10 text-gray-300 border border-white/15 text-xs">{v}</Badge>
          ))}
          <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs" onClick={clearFilters}>Clear All</Button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-3 md:grid-cols-5">
        {[
          { label: 'Total Trades', value: stats.total, color: 'text-white', scifi: 'scifi-stat' },
          { label: 'Buy Trades', value: stats.buyTrades, color: 'text-green-400', scifi: 'scifi-stat-green', sub: formatCurrency(stats.buyValue) },
          { label: 'Sell Trades', value: stats.sellTrades, color: 'text-red-400', scifi: 'scifi-stat-red', sub: formatCurrency(stats.sellValue) },
          { label: 'Buy Value', value: formatCurrency(stats.buyValue), color: 'text-emerald-400', scifi: 'scifi-stat-emerald', isText: true },
          { label: 'Sell Value', value: formatCurrency(stats.sellValue), color: 'text-rose-400', scifi: 'scifi-stat-rose', isText: true },
        ].map((stat, i) => (
          <Card key={stat.label} className={cn('scifi-stat animate-card-slide-up', stat.scifi)} style={{ animationDelay: `${i * 0.05}s` }}>
            <CardContent className="pt-4 pb-3 px-4">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{stat.label}</p>
              <p className={cn('font-black', stat.isText ? 'text-base' : 'text-2xl', stat.color)}>
                {isLoading ? '...' : stat.value}
              </p>
              {'sub' in stat && stat.sub && <p className="text-[10px] text-gray-600 mt-0.5">{stat.sub}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trades Table */}
      <Card className="scifi-card animate-card-slide-up" style={{ animationDelay: '0.2s' }}>
        <CardContent className="py-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-16 text-gray-500">{error}</div>
          ) : sortedAndFilteredTrades.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 mb-3">{hasActiveFilters ? 'No trades match your filters' : 'No trades today'}</p>
              {hasActiveFilters && <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-400 hover:text-gray-300">Clear Filters</Button>}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5 hover:bg-transparent">
                    {[
                      { key: 'symbol' as SortKey, label: 'Symbol', className: '' },
                      { label: 'Exchange', className: '' },
                      ...(!isCrypto ? [{ label: 'Product', className: '' }] : []),
                      { key: 'action' as SortKey, label: 'Action', className: '' },
                      { label: 'Qty', className: 'text-right' },
                      { label: 'Price', className: 'text-right' },
                      { label: 'Value', className: 'text-right' },
                      { label: 'Order ID', className: '' },
                      { key: 'timestamp' as SortKey, label: 'Time', className: '' },
                    ].map((col, ci) => (
                      <TableHead key={ci} onClick={() => 'key' in col && col.key && requestSort(col.key)}
                        className={cn('text-[10px] uppercase tracking-wider text-gray-500 font-semibold', 'key' in col && col.key && 'cursor-pointer hover:text-gray-400 transition-colors', col.className)}>
                        <div className={cn('flex items-center gap-1', 'className' in col && col.className?.includes('right') && 'justify-end')}>
                          {col.label}
                          {'key' in col && col.key && sortConfig.key === col.key && (
                            sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3 text-gray-400" /> : <ArrowDown className="h-3 w-3 text-gray-400" />
                          )}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedAndFilteredTrades.map((trade, index) => (
                    <TableRow key={`${trade.orderid}-${index}`} className="scifi-row border-white/5 animate-card-slide-up" style={{ animationDelay: `${Math.min(index * 0.02, 0.5)}s` }}>
                      <TableCell className="font-bold text-white text-sm">{trade.symbol}</TableCell>
                      <TableCell><Badge variant="outline" className="border-white/10 text-gray-400 text-[10px] bg-white/5">{trade.exchange}</Badge></TableCell>
                      {!isCrypto && <TableCell><Badge variant="secondary" className="text-[10px] bg-white/5 text-gray-400">{trade.product}</Badge></TableCell>}
                      <TableCell>
                        <Badge variant={trade.action === 'BUY' ? 'default' : 'destructive'}
                          className={cn('gap-1 text-[10px] font-bold', trade.action === 'BUY' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30')}>
                          {trade.action === 'BUY' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {trade.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-gray-300">{trade.quantity}</TableCell>
                      <TableCell className="text-right font-mono text-sm text-white">{formatCurrency(trade.average_price)}</TableCell>
                        <TableCell className="text-right font-mono text-sm text-gray-300">{formatCurrency(trade.trade_value)}</TableCell>
                      <TableCell className="font-mono text-[10px] text-gray-600">{trade.orderid}</TableCell>
                      <TableCell className="text-xs text-gray-500">{formatTime(trade.timestamp)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
