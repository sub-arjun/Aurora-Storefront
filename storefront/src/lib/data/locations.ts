"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { cache } from "react"
import { getAuthHeaders } from "./cookies"
import { HttpTypes } from "@medusajs/types"

export interface LocationAddress extends HttpTypes.StoreCustomerAddress {
  metadata?: {
    location_name?: string
    location_code?: string
    is_primary?: boolean
    delivery_instructions?: string
    [key: string]: any
  }
}

export const createLocationAddress = async function ({
  customerId,
  address,
  locationName,
  locationCode,
  deliveryInstructions,
  isDefault = false
}: {
  customerId: string
  address: Omit<HttpTypes.StoreCustomerAddress, "id" | "created_at" | "updated_at">
  locationName: string
  locationCode: string
  deliveryInstructions?: string
  isDefault?: boolean
}) {
  return sdk.store.customer
    .createAddress(
      customerId,
      {
        ...address,
        company: locationCode, // Use company field for location code
        metadata: {
          location_name: locationName,
          location_code: locationCode,
          is_primary: isDefault,
          delivery_instructions: deliveryInstructions || ""
        }
      },
      {},
      getAuthHeaders()
    )
    .then(({ address }) => address as LocationAddress)
    .catch(medusaError)
}

export const listLocationAddresses = cache(async function (customerId: string) {
  return sdk.store.customer
    .listAddresses(
      customerId,
      {},
      { next: { tags: ["customer"] }, ...getAuthHeaders() }
    )
    .then(({ addresses }) => {
      // Filter to only return addresses with location metadata
      return addresses.filter(
        addr => addr.metadata?.location_name
      ) as LocationAddress[]
    })
    .catch(() => [])
})

export const updateLocationAddress = async function (
  customerId: string,
  addressId: string,
  update: Partial<LocationAddress>
) {
  return sdk.store.customer
    .updateAddress(
      customerId,
      addressId,
      update,
      {},
      getAuthHeaders()
    )
    .then(({ address }) => address as LocationAddress)
    .catch(medusaError)
}

export const getDefaultLocation = cache(async function (customerId: string) {
  const locations = await listLocationAddresses(customerId)
  return locations.find(loc => loc.metadata?.is_primary) || locations[0] || null
}) 