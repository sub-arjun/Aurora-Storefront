"use client"

import { Table, Text, clx, Input } from "@medusajs/ui"

import { updateLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import CartItemSelect from "@modules/cart/components/cart-item-select"
import DeleteButton from "@modules/common/components/delete-button"
import ErrorMessage from "@modules/checkout/components/error-message"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Spinner from "@modules/common/icons/spinner"
import Thumbnail from "@modules/products/components/thumbnail"
import { useState } from "react"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
}

const Item = ({ item, type = "full" }: ItemProps) => {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tempQuantity, setTempQuantity] = useState(item.quantity)

  const { handle } = item.variant?.product ?? {}

  const changeQuantity = async (quantity: number) => {
    setError(null)
    setUpdating(true)

    const message = await updateLineItem({
      lineId: item.id,
      quantity,
    })
      .catch((err) => {
        setError(err.message)
        // Reset to original quantity on error
        setTempQuantity(item.quantity)
      })
      .finally(() => {
        setUpdating(false)
      })
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1
    setTempQuantity(Math.max(1, value))
  }

  const handleQuantityBlur = () => {
    if (tempQuantity !== item.quantity) {
      changeQuantity(tempQuantity)
    }
  }

  return (
    <Table.Row className="w-full" data-testid="product-row">
      <Table.Cell className="!pl-0 p-4 w-24">
        <LocalizedClientLink
          href={`/products/${handle}`}
          className={clx("flex", {
            "w-16": type === "preview",
            "small:w-24 w-12": type === "full",
          })}
        >
          <Thumbnail
            thumbnail={item.variant?.product?.thumbnail}
            images={item.variant?.product?.images}
            size="square"
          />
        </LocalizedClientLink>
      </Table.Cell>

      <Table.Cell className="text-left">
        <Text
          className="txt-medium-plus text-ui-fg-base"
          data-testid="product-title"
        >
          {item.product_title}
        </Text>
        <LineItemOptions variant={item.variant} data-testid="product-variant" />
      </Table.Cell>

      {type === "full" && (
        <Table.Cell>
          <div className="flex gap-2 items-center w-28">
            <DeleteButton id={item.id} data-testid="product-delete-button" />
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="1"
                max="9999"
                value={tempQuantity}
                onChange={handleQuantityChange}
                onBlur={handleQuantityBlur}
                className="w-16 h-8 text-center"
                data-testid="product-quantity-input"
                disabled={updating}
              />
              {updating && <Spinner />}
            </div>
          </div>
          <ErrorMessage error={error} data-testid="product-error-message" />
        </Table.Cell>
      )}

      {type === "full" && (
        <Table.Cell className="hidden small:table-cell">
          <LineItemUnitPrice item={item} style="tight" />
        </Table.Cell>
      )}

      <Table.Cell className="!pr-0">
        <span
          className={clx("!pr-0", {
            "flex flex-col items-end h-full justify-center": type === "preview",
          })}
        >
          {type === "preview" && (
            <span className="flex gap-x-1 ">
              <Text className="text-ui-fg-muted">{item.quantity}x </Text>
              <LineItemUnitPrice item={item} style="tight" />
            </span>
          )}
          <LineItemPrice item={item} style="tight" />
        </span>
      </Table.Cell>
    </Table.Row>
  )
}

export default Item
