"use client"

import { Text, Heading, Badge } from "@medusajs/ui"
import { useLocation } from "@lib/context/location-context"
import { HttpTypes } from "@medusajs/types"
import { BuildingTax, Package } from "@medusajs/icons"

interface InventoryByLocationProps {
  variant: HttpTypes.StoreProductVariant | null
}

// Mock inventory data - in production this would come from your inventory API
const getInventoryByLocation = (variantId: string | undefined, locationCode: string | undefined) => {
  if (!variantId || !locationCode) return null
  
  // Mock data structure
  const inventoryData: Record<string, Record<string, number>> = {
    "default": {
      "LOC-001": 150,
      "LOC-002": 75,
      "LOC-003": 200,
      "LOC-004": 0,
      "LOC-005": 45
    }
  }
  
  return inventoryData["default"] || {}
}

export default function InventoryByLocation({ variant }: InventoryByLocationProps) {
  const { locations, selectedLocation } = useLocation()

  if (!variant || !variant.manage_inventory) {
    return null
  }

  const locationInventory = getInventoryByLocation(variant.id, selectedLocation?.metadata?.location_code)

  return (
    <div className="bg-ui-bg-subtle rounded-lg p-4 mt-6">
      <div className="flex items-center gap-2 mb-4">
        <Package className="h-5 w-5 text-ui-fg-subtle" />
        <Heading level="h4" className="text-base">Inventory by Location</Heading>
      </div>

      <div className="space-y-3">
        {locations.map((location) => {
          const inventory = locationInventory?.[location.metadata?.location_code || ""] || 0
          const isSelected = selectedLocation?.id === location.id
          
          return (
            <div
              key={location.id}
              className={`flex items-center justify-between p-3 rounded-md border ${
                isSelected ? "border-ui-border-interactive bg-ui-bg-base" : "border-ui-border-base"
              }`}
            >
              <div className="flex items-center gap-3">
                <BuildingTax className="h-4 w-4 text-ui-fg-subtle" />
                <div>
                  <Text className="txt-compact-medium">
                    {location.metadata?.location_name}
                  </Text>
                  <Text className="txt-compact-xsmall text-ui-fg-subtle">
                    {location.metadata?.location_code}
                  </Text>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {inventory > 0 ? (
                  <>
                    <Badge variant="success" size="small">
                      In Stock
                    </Badge>
                    <Text className="txt-compact-medium text-ui-fg-base">
                      {inventory} units
                    </Text>
                  </>
                ) : (
                  <Badge variant="destructive" size="small">
                    Out of Stock
                  </Badge>
                )}
                {isSelected && (
                  <Badge variant="default" size="small">
                    Selected
                  </Badge>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {selectedLocation && (
        <div className="mt-4 pt-4 border-t border-ui-border-base">
          <Text className="txt-compact-small text-ui-fg-subtle">
            Showing availability for SKU: <span className="font-medium">{variant.sku}</span>
          </Text>
          {selectedLocation.metadata?.delivery_instructions && (
            <Text className="txt-compact-xsmall text-ui-fg-muted mt-1">
              Delivery notes: {selectedLocation.metadata.delivery_instructions}
            </Text>
          )}
        </div>
      )}
    </div>
  )
} 