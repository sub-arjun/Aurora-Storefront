"use client"

import { useState } from "react"
import { Button, Text, Heading, Badge, clx } from "@medusajs/ui"
import { formatAmount } from "@lib/util/prices"
import { Cart } from "@medusajs/types"
import { useLocation } from "@lib/context/location-context"

interface OrderApprovalProps {
  cart: Cart
  onApprove: () => void
  onRequestApproval: (approverEmail: string, notes: string) => void
}

export default function OrderApproval({ cart, onApprove, onRequestApproval }: OrderApprovalProps) {
  const { selectedLocation } = useLocation()
  const [approverEmail, setApproverEmail] = useState("")
  const [notes, setNotes] = useState("")
  const [isRequesting, setIsRequesting] = useState(false)
  const [approvalRequested, setApprovalRequested] = useState(false)

  // Define approval thresholds
  const APPROVAL_THRESHOLD = 5000 // $5,000
  const HIGH_PRIORITY_THRESHOLD = 10000 // $10,000
  
  const orderTotal = cart.total || 0
  const requiresApproval = orderTotal > APPROVAL_THRESHOLD * 100 // Convert to cents
  const isHighPriority = orderTotal > HIGH_PRIORITY_THRESHOLD * 100

  const handleRequestApproval = async () => {
    setIsRequesting(true)
    try {
      await onRequestApproval(approverEmail, notes)
      setApprovalRequested(true)
    } catch (error) {
      console.error("Failed to request approval:", error)
    } finally {
      setIsRequesting(false)
    }
  }

  if (!requiresApproval) {
    return null
  }

  return (
    <div className="bg-ui-bg-subtle rounded-lg p-6 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <Heading level="h3" className="mb-2">Order Approval Required</Heading>
          <Text className="text-ui-fg-subtle">
            Orders over {formatAmount({
              amount: APPROVAL_THRESHOLD * 100,
              region: cart.region,
            })} require management approval
          </Text>
        </div>
        <Badge 
          variant={isHighPriority ? "destructive" : "warning"}
          className="shrink-0"
        >
          {isHighPriority ? "High Priority" : "Approval Required"}
        </Badge>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center py-2 border-b border-ui-border-base">
          <Text className="text-ui-fg-subtle">Order Total</Text>
          <Text className="txt-medium-plus">
            {formatAmount({
              amount: orderTotal,
              region: cart.region,
            })}
          </Text>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-ui-border-base">
          <Text className="text-ui-fg-subtle">Delivery Location</Text>
          <Text className="txt-medium">
            {selectedLocation?.metadata?.location_name || "Not selected"}
          </Text>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-ui-border-base">
          <Text className="text-ui-fg-subtle">Items in Cart</Text>
          <Text className="txt-medium">
            {cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}
          </Text>
        </div>
      </div>

      {!approvalRequested ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="approver-email" className="txt-compact-medium mb-2 block">
              Approver Email
            </label>
            <input
              id="approver-email"
              type="email"
              value={approverEmail}
              onChange={(e) => setApproverEmail(e.target.value)}
              placeholder="manager@company.com"
              className="w-full px-4 py-2 border border-ui-border-base rounded-md focus:outline-none focus:ring-2 focus:ring-ui-border-interactive"
              required
            />
          </div>

          <div>
            <label htmlFor="order-notes" className="txt-compact-medium mb-2 block">
              Order Notes (Optional)
            </label>
            <textarea
              id="order-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this order..."
              rows={3}
              className="w-full px-4 py-2 border border-ui-border-base rounded-md focus:outline-none focus:ring-2 focus:ring-ui-border-interactive"
            />
          </div>

          <Button
            variant="primary"
            className="w-full"
            onClick={handleRequestApproval}
            disabled={!approverEmail || isRequesting}
            isLoading={isRequesting}
          >
            Request Approval
          </Button>

          <Text className="txt-small text-ui-fg-subtle text-center">
            You will receive an email notification once the order is approved
          </Text>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-ui-bg-interactive rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <Heading level="h4" className="mb-2">Approval Requested</Heading>
          <Text className="text-ui-fg-subtle mb-4">
            We've sent an approval request to <strong>{approverEmail}</strong>
          </Text>
          <Text className="txt-small text-ui-fg-muted">
            Order Reference: #{cart.id?.slice(-8).toUpperCase()}
          </Text>
        </div>
      )}
    </div>
  )
} 