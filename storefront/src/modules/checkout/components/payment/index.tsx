"use client"

import { RadioGroup } from "@headlessui/react"
import { CheckCircleSolid } from "@medusajs/icons"
import { Cart, PaymentSession } from "@medusajs/types"
import { Button, clx, Input, Text } from "@medusajs/ui"
import { PaymentMethod } from "@types/global"
import React, { useState } from "react"
import PaymentTest from "../payment-test"

export type PaymentProps = {
  cart: Cart
  availablePaymentMethods: PaymentMethod[]
  handleSetPaymentSession: (providerId: string) => void
}

const Payment: React.FC<PaymentProps> = ({
  cart,
  availablePaymentMethods,
  handleSetPaymentSession,
}) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    cart.payment_session?.provider_id || ""
  )
  const [purchaseOrderNumber, setPurchaseOrderNumber] = useState("")

  const handlePaymentMethodChange = (providerId: string) => {
    setSelectedPaymentMethod(providerId)
    handleSetPaymentSession(providerId)
  }

  const hasPurchaseOrderOption = availablePaymentMethods.some(
    method => method.id === "manual" || method.id === "po"
  )

  return (
    <div className="flex flex-col gap-y-4">
      <RadioGroup
        value={selectedPaymentMethod}
        onChange={handlePaymentMethodChange}
      >
        <RadioGroup.Label className="txt-medium-plus mb-1">
          Payment method
        </RadioGroup.Label>
        <div className="flex flex-col gap-y-2">
          {availablePaymentMethods
            .sort((a, b) => {
              return a.id > b.id ? 1 : -1
            })
            .map((paymentMethod) => {
              return (
                <PaymentMethodItem
                  key={paymentMethod.id}
                  paymentMethod={paymentMethod}
                  selectedPaymentMethod={selectedPaymentMethod}
                />
              )
            })}
          
          {/* Add Purchase Order option for enterprise customers */}
          {hasPurchaseOrderOption && (
            <RadioGroup.Option
              value="purchase_order"
              className={clx(
                "flex items-center justify-between text-small-regular cursor-pointer",
                "py-4 border rounded-rounded px-8 mb-2 hover:shadow-borders-interactive-with-active",
                {
                  "border-ui-border-interactive":
                    selectedPaymentMethod === "purchase_order",
                }
              )}
            >
              <div className="flex items-center gap-x-4">
                <RadioGroup.Description className="flex items-center gap-x-3">
                  <Text className="txt-medium-plus">Purchase Order</Text>
                </RadioGroup.Description>
                <RadioGroup.Label className="sr-only">
                  Purchase Order
                </RadioGroup.Label>
              </div>
              <CheckCircleSolid
                className={clx("w-5 h-5", {
                  "text-ui-fg-interactive":
                    selectedPaymentMethod === "purchase_order",
                })}
              />
            </RadioGroup.Option>
          )}
        </div>
      </RadioGroup>
      
      {selectedPaymentMethod === "purchase_order" && (
        <div className="mt-4">
          <Input
            label="Purchase Order Number"
            value={purchaseOrderNumber}
            onChange={(e) => setPurchaseOrderNumber(e.target.value)}
            placeholder="Enter your PO number"
            required
          />
          <Text className="txt-small text-ui-fg-subtle mt-2">
            Your order will be processed after PO approval. Standard payment terms apply.
          </Text>
        </div>
      )}
    </div>
  )
}

const PaymentMethodItem = ({
  paymentMethod,
  selectedPaymentMethod,
}: {
  paymentMethod: PaymentMethod
  selectedPaymentMethod: string
}) => {
  return (
    <RadioGroup.Option
      value={paymentMethod.id}
      className={clx(
        "flex items-center justify-between text-small-regular cursor-pointer",
        "py-4 border rounded-rounded px-8 mb-2 hover:shadow-borders-interactive-with-active",
        {
          "border-ui-border-interactive":
            selectedPaymentMethod === paymentMethod.id,
        }
      )}
    >
      <div className="flex items-center gap-x-4">
        <RadioGroup.Description className="flex items-center gap-x-3">
          <div className="flex items-center">
            {paymentMethod.icon && (
              <div className="w-8 h-6 flex items-center justify-center">
                {paymentMethod.icon}
              </div>
            )}
            <Text
              className={clx("txt-medium-plus", {
                "ml-3": !paymentMethod.icon,
              })}
            >
              {paymentMethod.title}
            </Text>
          </div>
        </RadioGroup.Description>
        <RadioGroup.Label className="sr-only">
          {paymentMethod.title}
        </RadioGroup.Label>
      </div>
      <CheckCircleSolid
        className={clx("w-5 h-5", {
          "text-ui-fg-interactive":
            selectedPaymentMethod === paymentMethod.id,
        })}
      />
    </RadioGroup.Option>
  )
}

export default Payment
