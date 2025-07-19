"use client"

import { Popover, Transition } from "@headlessui/react"
import { ChevronDownMini, BuildingTax } from "@medusajs/icons"
import { Text, clx } from "@medusajs/ui"
import { Fragment } from "react"
import { useLocation } from "@lib/context/location-context"

export default function LocationSelector() {
  const { selectedLocation, locations, setSelectedLocation, isLoading } = useLocation()

  if (isLoading || locations.length === 0) {
    return null
  }

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button
            className={clx(
              "flex items-center gap-1.5 px-3 py-2 rounded-md transition-colors",
              "text-ui-fg-subtle hover:text-ui-fg-base",
              "hover:bg-ui-bg-subtle-hover",
              open && "text-ui-fg-base bg-ui-bg-subtle"
            )}
          >
            <BuildingTax className="h-5 w-5" />
            <div className="flex flex-col items-start">
              <Text className="txt-compact-small-plus">Location</Text>
              <Text className="txt-compact-small text-ui-fg-muted">
                {selectedLocation?.metadata?.location_name || "Select location"}
              </Text>
            </div>
            <ChevronDownMini 
              className={clx(
                "h-4 w-4 transition-transform duration-150",
                open && "rotate-180"
              )}
            />
          </Popover.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-lg bg-white shadow-elevation-card-rest">
              <div className="p-2">
                <div className="px-3 py-2 mb-2">
                  <Text className="txt-compact-small-plus text-ui-fg-subtle">
                    Select Delivery Location
                  </Text>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {locations.map((location) => (
                    <button
                      key={location.id}
                      onClick={() => {
                        setSelectedLocation(location)
                      }}
                      className={clx(
                        "w-full px-3 py-3 rounded-md transition-colors",
                        "hover:bg-ui-bg-subtle-hover",
                        "flex flex-col items-start gap-1 text-left",
                        selectedLocation?.id === location.id && "bg-ui-bg-subtle"
                      )}
                    >
                      <Text className="txt-compact-medium">
                        {location.metadata?.location_name}
                      </Text>
                      <Text className="txt-compact-small text-ui-fg-subtle">
                        {location.metadata?.location_code}
                      </Text>
                      <Text className="txt-compact-xsmall text-ui-fg-muted">
                        {location.address_1}, {location.city}, {location.province} {location.postal_code}
                      </Text>
                      {location.metadata?.is_primary && (
                        <span className="txt-compact-xsmall text-ui-fg-interactive">
                          Primary Location
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {selectedLocation && (
                  <div className="mt-2 pt-2 border-t border-ui-border-base">
                    <div className="px-3 py-2">
                      <Text className="txt-compact-xsmall text-ui-fg-muted">
                        Delivery Instructions:
                      </Text>
                      <Text className="txt-compact-small">
                        {selectedLocation.metadata?.delivery_instructions || "None"}
                      </Text>
                    </div>
                  </div>
                )}
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  )
} 