"use client"

import { useState } from 'react'
import { Calendar } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { format } from 'date-fns'

interface DateRangeFilterProps {
  onDateRangeChange: (startDate: string | null, endDate: string | null) => void
  label?: string
}

export function DateRangeFilter({ onDateRangeChange, label = "Date Range" }: DateRangeFilterProps) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const handleApply = () => {
    if (startDate && endDate) {
      onDateRangeChange(startDate, endDate)
    }
  }

  const handleClear = () => {
    setStartDate('')
    setEndDate('')
    onDateRangeChange(null, null)
  }

  const handlePreset = (days: number) => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days)
    
    const startStr = format(start, 'yyyy-MM-dd')
    const endStr = format(end, 'yyyy-MM-dd')
    
    setStartDate(startStr)
    setEndDate(endStr)
    onDateRangeChange(startStr, endStr)
  }

  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200">
      <Calendar className="h-5 w-5 text-gray-500" />
      <span className="text-sm font-medium text-gray-700">{label}:</span>
      
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="h-9 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-coral focus:border-coral"
      />
      
      <span className="text-gray-500">to</span>
      
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        min={startDate}
        className="h-9 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-coral focus:border-coral"
      />
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePreset(7)}
          className="h-9"
        >
          Last 7 days
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePreset(30)}
          className="h-9"
        >
          Last 30 days
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePreset(90)}
          className="h-9"
        >
          Last 90 days
        </Button>
      </div>
      
      {(startDate || endDate) && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={handleApply}
            className="h-9"
          >
            Apply
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-9 text-gray-500"
          >
            Clear
          </Button>
        </>
      )}
    </div>
  )
}
