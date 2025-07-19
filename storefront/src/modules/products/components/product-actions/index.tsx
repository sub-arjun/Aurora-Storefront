"use client"

import { Button, Input } from "@medusajs/ui"
import { useParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"

import { HttpTypes } from "@medusajs/types"
import Divider from "@modules/common/components/divider"
import OptionSelect from "@modules/products/components/option-select"
import { isEqual } from "lodash"

import MobileActions from "./mobile-actions"
import ProductPrice from "../product-price"
import { addToCart } from "@lib/data/cart"
import { useIntersection } from "@lib/hooks/use-in-view"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
}

function optionsAsKeymap(
  variantOptions: HttpTypes.StoreProductVariantOption[] | undefined
) {
  return variantOptions?.reduce((keymap: Record<string, string>, varOpt) => {
    keymap[varOpt.option_id!] = varOpt.option_value!
    return keymap
  }, {})
}

export default function ProductActions({
  product,
  region,
  disabled,
}: ProductActionsProps) {
  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [isAdding, setIsAdding] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const countryCode = useParams().countryCode as string

  // If there is only 1 variant, preselect the options
  useEffect(() => {
    if (product.variants?.length === 1) {
      const variantOptions = optionsAsKeymap(product.variants[0].options)
      setOptions(variantOptions ?? {})
    }
  }, [product.variants])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // update the options when a variant is selected
  const setOptionValue = (title: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [title]: value,
    }))
  }

  // check if the selected variant is in stock
  const inStock = useMemo(() => {
    // If we don't manage inventory, we can always add to cart
    if (selectedVariant && !selectedVariant.manage_inventory) {
      return true
    }

    // If we allow back orders on the variant, we can add to cart
    if (selectedVariant?.allow_backorder) {
      return true
    }

    // If there is inventory available, we can add to cart
    if (
      selectedVariant?.manage_inventory &&
      (selectedVariant?.inventory_quantity || 0) > 0
    ) {
      return true
    }

    // Otherwise, we can't add to cart
    return false
  }, [selectedVariant])

  const actionsRef = useRef<HTMLDivElement>(null)

  const inView = useIntersection(actionsRef, "0px")

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

    setIsAdding(true)

    // Add multiple items based on quantity
    for (let i = 0; i < quantity; i++) {
      await addToCart({
        variantId: selectedVariant.id,
        quantity: 1,
        countryCode,
      })
    }

    setIsAdding(false)
    // Reset quantity after adding
    setQuantity(1)
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1
    setQuantity(Math.max(1, value))
  }

  return (
    <>
      <div className="flex flex-col gap-y-2" ref={actionsRef}>
        <div>
          {(product.variants?.length ?? 0) > 1 && (
            <div className="flex flex-col gap-y-4">
              {(product.options || []).map((option) => {
                return (
                  <div key={option.id}>
                    <OptionSelect
                      option={option}
                      current={options[option.title ?? ""]}
                      updateOption={setOptionValue}
                      title={option.title ?? ""}
                      data-testid="product-options"
                      disabled={!!disabled || isAdding}
                    />
                  </div>
                )
              })}
              <Divider />
            </div>
          )}
        </div>

        <ProductPrice product={product} variant={selectedVariant} />

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="quantity" className="text-sm text-ui-fg-subtle">
              Quantity:
            </label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max="9999"
              value={quantity}
              onChange={handleQuantityChange}
              className="w-20 text-center"
              disabled={!!disabled || isAdding}
            />
          </div>
          
          <Button
            onClick={handleAddToCart}
            disabled={!inStock || !selectedVariant || !!disabled || isAdding}
            variant="primary"
            className="flex-1 h-10"
            isLoading={isAdding}
            data-testid="add-product-button"
          >
            {!selectedVariant
              ? "Select variant"
              : !inStock
              ? "Out of stock"
              : `Add ${quantity} to cart`}
          </Button>
        </div>

        <MobileActions
          product={product}
          variant={selectedVariant}
          options={options}
          updateOptions={setOptionValue}
          inStock={inStock}
          handleAddToCart={handleAddToCart}
          isAdding={isAdding}
          show={!inView}
          optionsDisabled={!!disabled || isAdding}
        />
      </div>
    </>
  )
}
