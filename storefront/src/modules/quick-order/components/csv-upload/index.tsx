"use client"

import { useState, useRef } from "react"
import { Button, Text, Heading } from "@medusajs/ui"
import { DocumentText, CloudArrowUp } from "@medusajs/icons"
import { addToCart } from "@lib/data/cart"
import { getProductBySku } from "@lib/data/products"
import { useParams } from "next/navigation"
import ErrorMessage from "@modules/checkout/components/error-message"

interface CSVRow {
  sku: string
  quantity: number
}

interface ProcessResult {
  sku: string
  quantity: number
  status: "success" | "error"
  message?: string
  productTitle?: string
}

export default function CSVUpload() {
  const { countryCode } = useParams() as { countryCode: string }
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<ProcessResult[]>([])
  const [error, setError] = useState<string | null>(null)

  const parseCSV = (text: string): CSVRow[] => {
    const lines = text.split('\n').filter(line => line.trim())
    const rows: CSVRow[] = []
    
    // Skip header row if it exists
    const startIndex = lines[0].toLowerCase().includes('sku') ? 1 : 0
    
    for (let i = startIndex; i < lines.length; i++) {
      const [sku, quantityStr] = lines[i].split(',').map(s => s.trim())
      
      if (sku) {
        const quantity = parseInt(quantityStr) || 1
        rows.push({ sku, quantity: Math.max(1, quantity) })
      }
    }
    
    return rows
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)
    setResults([])
    
    try {
      const text = await file.text()
      const rows = parseCSV(text)
      
      if (rows.length === 0) {
        setError("No valid SKU entries found in the CSV file")
        return
      }
      
      if (rows.length > 100) {
        setError("Maximum 100 items allowed per upload")
        return
      }
      
      setIsProcessing(true)
      const processResults: ProcessResult[] = []
      
      // Process each row
      for (const row of rows) {
        try {
          const variant = await getProductBySku(row.sku, countryCode)
          
          if (!variant) {
            processResults.push({
              ...row,
              status: "error",
              message: "Product not found"
            })
            continue
          }
          
          // Add to cart
          for (let i = 0; i < row.quantity; i++) {
            await addToCart({
              variantId: variant.id,
              quantity: 1,
              countryCode
            })
          }
          
          processResults.push({
            ...row,
            status: "success",
            productTitle: variant.product?.title
          })
        } catch (error) {
          processResults.push({
            ...row,
            status: "error",
            message: error instanceof Error ? error.message : "Failed to add item"
          })
        }
      }
      
      setResults(processResults)
    } catch (error) {
      setError("Failed to process CSV file. Please check the format.")
    } finally {
      setIsProcessing(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const downloadTemplate = () => {
    const csvContent = "SKU,Quantity\nPROD-001,10\nPROD-002,5\nPROD-003,25"
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "bulk-order-template.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const successCount = results.filter(r => r.status === "success").length
  const errorCount = results.filter(r => r.status === "error").length

  return (
    <div className="w-full">
      <div className="mb-6">
        <Heading level="h2" className="mb-2">Upload CSV</Heading>
        <Text className="text-ui-fg-subtle">
          Upload a CSV file with SKU and quantity columns for bulk ordering
        </Text>
      </div>

      <div className="border-2 border-dashed border-ui-border-base rounded-lg p-8 text-center">
        <CloudArrowUp className="h-12 w-12 text-ui-fg-subtle mx-auto mb-4" />
        
        <Text className="mb-4">
          Drag and drop your CSV file here, or click to browse
        </Text>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="hidden"
          disabled={isProcessing}
        />
        
        <div className="flex gap-4 justify-center">
          <Button
            variant="primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            isLoading={isProcessing}
          >
            {isProcessing ? "Processing..." : "Choose File"}
          </Button>
          
          <Button
            variant="secondary"
            onClick={downloadTemplate}
            disabled={isProcessing}
            className="flex items-center gap-2"
          >
            <DocumentText className="h-4 w-4" />
            Download Template
          </Button>
        </div>
      </div>

      {error && (
        <ErrorMessage error={error} className="mt-4" />
      )}

      {results.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <Heading level="h3">Upload Results</Heading>
            <div className="flex gap-4 text-sm">
              <Text className="text-ui-fg-interactive">
                Success: {successCount}
              </Text>
              <Text className="text-ui-fg-error">
                Failed: {errorCount}
              </Text>
            </div>
          </div>
          
          <div className="border border-ui-border-base rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-ui-bg-subtle">
                <tr>
                  <th className="text-left px-4 py-2 text-sm font-medium">SKU</th>
                  <th className="text-left px-4 py-2 text-sm font-medium">Product</th>
                  <th className="text-center px-4 py-2 text-sm font-medium">Quantity</th>
                  <th className="text-left px-4 py-2 text-sm font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr key={index} className="border-t border-ui-border-base">
                    <td className="px-4 py-2 text-sm">{result.sku}</td>
                    <td className="px-4 py-2 text-sm">
                      {result.productTitle || "-"}
                    </td>
                    <td className="px-4 py-2 text-sm text-center">
                      {result.quantity}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {result.status === "success" ? (
                        <span className="text-ui-fg-interactive">Added to cart</span>
                      ) : (
                        <span className="text-ui-fg-error">
                          {result.message || "Error"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
} 