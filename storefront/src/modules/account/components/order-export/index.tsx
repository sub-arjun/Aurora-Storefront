"use client"

import { useState } from "react"
import { Button, Select, DatePicker, Text, Heading } from "@medusajs/ui"
import { CloudArrowDown, Calendar, FileText } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { format } from "date-fns"

interface OrderExportProps {
  customerId: string
}

export default function OrderExport({ customerId }: OrderExportProps) {
  const [exportFormat, setExportFormat] = useState<"csv" | "excel" | "pdf">("csv")
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    end: new Date()
  })
  const [isExporting, setIsExporting] = useState(false)

  const formatOptions = [
    { value: "csv", label: "CSV" },
    { value: "excel", label: "Excel" },
    { value: "pdf", label: "PDF Report" }
  ]

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      // In production, this would call an API endpoint to generate the export
      const exportData = {
        customer_id: customerId,
        format: exportFormat,
        date_start: dateRange.start.toISOString(),
        date_end: dateRange.end.toISOString(),
        include_items: true,
        include_locations: true
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Trigger download (mock implementation)
      const filename = `orders_${format(dateRange.start, 'yyyy-MM-dd')}_to_${format(dateRange.end, 'yyyy-MM-dd')}.${exportFormat}`
      console.log(`Downloading: ${filename}`, exportData)
      
      // In production, this would trigger actual file download
      alert(`Export completed! File: ${filename}`)
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="bg-ui-bg-subtle rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <CloudArrowDown className="h-6 w-6 text-ui-fg-subtle" />
        <Heading level="h3">Export Orders</Heading>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="txt-compact-medium mb-2 block">Start Date</label>
            <div className="relative">
              <input
                type="date"
                value={format(dateRange.start, 'yyyy-MM-dd')}
                onChange={(e) => setDateRange({
                  ...dateRange,
                  start: new Date(e.target.value)
                })}
                className="w-full px-3 py-2 border border-ui-border-base rounded-md focus:outline-none focus:ring-2 focus:ring-ui-border-interactive"
              />
              <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-ui-fg-muted pointer-events-none" />
            </div>
          </div>
          
          <div>
            <label className="txt-compact-medium mb-2 block">End Date</label>
            <div className="relative">
              <input
                type="date"
                value={format(dateRange.end, 'yyyy-MM-dd')}
                onChange={(e) => setDateRange({
                  ...dateRange,
                  end: new Date(e.target.value)
                })}
                className="w-full px-3 py-2 border border-ui-border-base rounded-md focus:outline-none focus:ring-2 focus:ring-ui-border-interactive"
              />
              <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-ui-fg-muted pointer-events-none" />
            </div>
          </div>
        </div>

        <div>
          <label className="txt-compact-medium mb-2 block">Export Format</label>
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as any)}
            className="w-full px-3 py-2 border border-ui-border-base rounded-md focus:outline-none focus:ring-2 focus:ring-ui-border-interactive"
          >
            {formatOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-4">
          <Button
            variant="primary"
            className="w-full"
            onClick={handleExport}
            disabled={isExporting}
            isLoading={isExporting}
          >
            <FileText className="h-4 w-4 mr-2" />
            Export Orders
          </Button>
        </div>

        <Text className="txt-compact-small text-ui-fg-subtle">
          Export includes order details, item information, delivery locations, and pricing. 
          Files are compatible with most ERP and accounting systems.
        </Text>
      </div>
    </div>
  )
} 