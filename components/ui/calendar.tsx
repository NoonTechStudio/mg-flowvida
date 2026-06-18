'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, getDay } from 'date-fns'

interface CalendarProps {
  mode?: 'single' | 'range' | 'multiple'
  selected?: Date | { from: Date; to: Date } | Date[]
  onSelect?: (date: any) => void
  numberOfMonths?: number
  className?: string
  disabled?: (date: Date) => boolean
  initialFocus?: boolean
}

export function Calendar({
  mode = 'single',
  selected,
  onSelect,
  numberOfMonths = 1,
  className,
  disabled,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date())

  const months = Array.from({ length: numberOfMonths }, (_, i) => addMonths(currentMonth, i))

  const isSelected = (date: Date): boolean => {
    if (!selected) return false
    if (mode === 'single') return isSameDay(date, selected as Date)
    if (mode === 'range') {
      const range = selected as { from: Date; to: Date }
      if (!range.from) return false
      if (!range.to) return isSameDay(date, range.from)
      return date >= range.from && date <= range.to
    }
    if (mode === 'multiple') return (selected as Date[]).some(d => isSameDay(d, date))
    return false
  }

  const isRangeStart = (date: Date): boolean => {
    if (mode !== 'range' || !selected) return false
    const range = selected as { from: Date; to: Date }
    return !!(range.from && isSameDay(date, range.from))
  }

  const isRangeEnd = (date: Date): boolean => {
    if (mode !== 'range' || !selected) return false
    const range = selected as { from: Date; to: Date }
    return !!(range.to && isSameDay(date, range.to))
  }

  const handleSelect = (date: Date) => {
    if (disabled?.(date)) return
    if (mode === 'single') {
      onSelect?.(date)
    } else if (mode === 'range') {
      const range = selected as { from: Date; to: Date } | undefined
      if (!range?.from || (range.from && range.to)) {
        onSelect?.({ from: date, to: undefined })
      } else {
        if (date < range.from) {
          onSelect?.({ from: date, to: range.from })
        } else {
          onSelect?.({ from: range.from, to: date })
        }
      }
    }
  }

  return (
    <div className={cn('p-3', className)}>
      <div className={cn('flex gap-4', numberOfMonths > 1 && 'flex-wrap')}>
        {months.map((month, monthIndex) => {
          const days = eachDayOfInterval({
            start: startOfMonth(month),
            end: endOfMonth(month),
          })
          const startDay = getDay(startOfMonth(month))

          return (
            <div key={monthIndex} className="w-64">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                {monthIndex === 0 && (
                  <button
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="p-1 hover:bg-gray-100 rounded-md"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                )}
                <span className={cn('text-sm font-semibold flex-1 text-center', monthIndex > 0 && 'pl-6')}>
                  {format(month, 'MMMM yyyy')}
                </span>
                {monthIndex === months.length - 1 && (
                  <button
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="p-1 hover:bg-gray-100 rounded-md"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 mb-1">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day} className="text-center text-xs font-medium text-gray-400 py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7">
                {Array.from({ length: startDay }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {days.map((day) => {
                  const sel = isSelected(day)
                  const rangeStart = isRangeStart(day)
                  const rangeEnd = isRangeEnd(day)
                  const today = isToday(day)
                  const isDisabled = disabled?.(day)
                  const inCurrentMonth = isSameMonth(day, month)

                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      onClick={() => handleSelect(day)}
                      disabled={isDisabled || !inCurrentMonth}
                      className={cn(
                        'h-8 w-8 mx-auto rounded-full text-sm flex items-center justify-center transition-colors',
                        !inCurrentMonth && 'text-gray-300',
                        inCurrentMonth && !sel && !today && 'hover:bg-violet-50 text-gray-700',
                        today && !sel && 'text-violet-600 font-semibold',
                        sel && 'bg-violet-600 text-white font-medium',
                        (rangeStart || rangeEnd) && 'bg-violet-600 text-white',
                        isDisabled && 'opacity-30 cursor-not-allowed'
                      )}
                    >
                      {format(day, 'd')}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
