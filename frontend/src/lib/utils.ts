import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Sanitize a value for CSV export to prevent formula injection.
 * Prefixes dangerous characters (=, +, -, @) with a single quote.
 */
export function sanitizeCSV(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  // Prefix dangerous formula characters with a single quote
  if (/^[=+\-@]/.test(str)) {
    return `'${str}`
  }
  // Escape quotes and wrap in quotes if contains comma
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * Remove duplicate entries sharing the same `time` field, keeping the last
 * occurrence. lightweight-charts requires strictly ascending time; duplicate
 * timestamps (from bucketed ticks, millisecond truncation, or backend quirks)
 * trigger an assertion and crash the chart.
 *
 * Expects data already sorted ascending by time (`.sort((a, b) => a.time - b.time)`).
 */
export function dedupByTime<T extends { time: number }>(data: T[]): T[] {
  if (data.length <= 1) return data
  const out: T[] = [data[0]]
  for (let i = 1; i < data.length; i++) {
    if (data[i].time !== out[out.length - 1].time) {
      out.push(data[i])
    } else {
      out[out.length - 1] = data[i]
    }
  }
  return out
}

/**
 * Returns a currency formatter bound to the active broker.
 * - deltaexchange → USD ($)
 * - all other brokers  → INR (₹)
 */
export function makeFormatCurrency(broker?: string | null): (value: number) => string {
  const isUSD = broker === 'deltaexchange'
  return (value: number) =>
    isUSD
      ? new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
        }).format(value)
      : new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 2,
        }).format(value)
}
