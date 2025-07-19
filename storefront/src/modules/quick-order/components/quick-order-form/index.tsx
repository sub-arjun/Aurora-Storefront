"use client"

import { useState } from "react"
import { Button, Input, Text, Heading, clx } from "@medusajs/ui"
import { Trash, Plus } from "@medusajs/icons"
import { addToCart } from "@lib/data/cart"
import { getProductBySku } from "@lib/data/products"
import ErrorMessage from "@modules/checkout/components/error-message"
import { useParams } from "next/navigation"

interface QuickOrderItem {
  id: string
  sku: string
  quantity: number
  isLoading?: boolean
  error?: string
  productTitle?: string
}

export default function QuickOrderForm() {
  const { countryCode } = useParams() as { countryCode: string }
  const [items, setItems] = useState<QuickOrderItem[]>([
    { id: Date.now().toString(), sku: "", quantity: 1 }
  ])
  const [isProcessing, setIsProcessing] = useState(false)
  const [generalError, setGeneralError] = useState<string | null>(null)

  const addRow = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), sku: "", quantity: 1 }
    ])
  }

  const removeRow = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const updateItem = (id: string, field: keyof QuickOrderItem, value: string | number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value, error: undefined } : item
    ))
  }

  const validateItems = () => {
    let isValid = true
    const updatedItems = items.map(item => {
      if (!item.sku.trim()) {
        isValid = false
        return { ...item, error: "SKU is required" }
      }
      if (item.quantity < 1) {
        isValid = false
        return { ...item, error: "Quantity must be at least 1" }
      }
      return item
    })
    setItems(updatedItems)
    return isValid
  }

  const handleAddToCart = async () => {
    setGeneralError(null)
    
    if (!validateItems()) {
      return
    }

    setIsProcessing(true)
    const itemsToProcess = items.filter(item => item.sku.trim())
    
    // Process each item
    const results = await Promise.allSettled(
      itemsToProcess.map(async (item) => {
        try {
          // Get product variant by SKU
          const variant = await getProductBySku(item.sku, countryCode)
          
          if (!variant) {
            throw new Error(`Product with SKU "${item.sku}" not found`)
          }

          // Add to cart with the specified quantity
          for (let i = 0; i < item.quantity; i++) {
            await addToCart({
              variantId: variant.id,
              quantity: 1,
              countryCode
            })
          }

          return { ...item, productTitle: variant.product?.title }
        } catch (error) {
          throw { item, error: error instanceof Error ? error.message : "Failed to add item" }
        }
      })
    )

    // Update items with results
    const updatedItems = [...items]
    let hasErrors = false
    
    results.forEach((result, index) => {
      const itemIndex = items.findIndex(item => item.sku === itemsToProcess[index].sku)
      if (result.status === "fulfilled") {
        updatedItems[itemIndex] = {
          ...updatedItems[itemIndex],
          productTitle: result.value.productTitle,
          sku: "",
          quantity: 1
        }
      } else {
        hasErrors = true
        updatedItems[itemIndex] = {
          ...updatedItems[itemIndex],
          error: result.reason.error
        }
      }
    })

    setItems(updatedItems)
    setIsProcessing(false)

    if (!hasErrors) {
      // Reset form on success
      setItems([{ id: Date.now().toString(), sku: "", quantity: 1 }])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter" && index === items.length - 1) {
      e.preventDefault()
      addRow()
    }
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <Heading level="h2" className="mb-2">Quick Order</Heading>
        <Text className="text-ui-fg-subtle">
          Add multiple products by SKU for faster ordering
        </Text>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-[1fr,120px,auto] gap-2 mb-2">
          <Text className="txt-compact-small-plus text-ui-fg-subtle">SKU</Text>
          <Text className="txt-compact-small-plus text-ui-fg-subtle">Quantity</Text>
          <div className="w-10" />
        </div>

        {items.map((item, index) => (
          <div key={item.id}>
            <div className="grid grid-cols-[1fr,120px,auto] gap-2 items-start">
              <div>
                <Input
                  placeholder="Enter SKU"
                  value={item.sku}
                  onChange={(e) => updateItem(item.id, "sku", e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  disabled={isProcessing}
                  className={clx(item.error && "border-ui-fg-error")}
                />
                {item.productTitle && (
                  <Text className="txt-compact-xsmall text-ui-fg-subtle mt-1">
                    {item.productTitle}
                  </Text>
                )}
              </div>
              
              <Input
                type="number"
                min="1"
                max="9999"
                value={item.quantity}
                onChange={(e) => updateItem(item.id, "quantity", parseInt(e.target.value) || 1)}
                disabled={isProcessing}
                className={clx("text-center", item.error && "border-ui-fg-error")}
              />
              
              <Button
                variant="secondary"
                size="base"
                onClick={() => removeRow(item.id)}
                disabled={items.length === 1 || isProcessing}
                className="h-10 w-10 p-0"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
            {item.error && (
              <Text className="txt-compact-xsmall text-ui-fg-error mt-1">
                {item.error}
              </Text>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-4">
        <Button
          variant="secondary"
          onClick={addRow}
          disabled={isProcessing}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Row
        </Button>

        <Button
          variant="primary"
          onClick={handleAddToCart}
          disabled={isProcessing || items.every(item => !item.sku.trim())}
          isLoading={isProcessing}
        >
          Add All to Cart
        </Button>
      </div>

      {generalError && (
        <ErrorMessage error={generalError} className="mt-4" />
      )}
    </div>
  )
} 