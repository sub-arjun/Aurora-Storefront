"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { LocationAddress } from "@lib/data/locations"
import { getCustomer } from "@lib/data/customer"
import { listLocationAddresses, getDefaultLocation } from "@lib/data/locations"

interface LocationContextType {
  selectedLocation: LocationAddress | null
  setSelectedLocation: (location: LocationAddress | null) => void
  locations: LocationAddress[]
  isLoading: boolean
  refreshLocations: () => Promise<void>
}

const LocationContext = createContext<LocationContextType | undefined>(undefined)

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [selectedLocation, setSelectedLocation] = useState<LocationAddress | null>(null)
  const [locations, setLocations] = useState<LocationAddress[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refreshLocations = async () => {
    try {
      const customer = await getCustomer()
      if (customer) {
        const customerLocations = await listLocationAddresses(customer.id)
        setLocations(customerLocations)
        
        // If no location selected, set default
        if (!selectedLocation && customerLocations.length > 0) {
          const defaultLoc = await getDefaultLocation(customer.id)
          setSelectedLocation(defaultLoc)
          
          // Store in localStorage for persistence
          if (defaultLoc) {
            localStorage.setItem('selected_location_id', defaultLoc.id)
          }
        }
      }
    } catch (error) {
      console.error("Error loading locations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Load locations on mount
  useEffect(() => {
    refreshLocations()
  }, [])

  // Restore selected location from localStorage
  useEffect(() => {
    const storedLocationId = localStorage.getItem('selected_location_id')
    if (storedLocationId && locations.length > 0) {
      const storedLocation = locations.find(loc => loc.id === storedLocationId)
      if (storedLocation) {
        setSelectedLocation(storedLocation)
      }
    }
  }, [locations])

  // Save selected location to localStorage
  const handleSetSelectedLocation = (location: LocationAddress | null) => {
    setSelectedLocation(location)
    if (location) {
      localStorage.setItem('selected_location_id', location.id)
    } else {
      localStorage.removeItem('selected_location_id')
    }
  }

  return (
    <LocationContext.Provider
      value={{
        selectedLocation,
        setSelectedLocation: handleSetSelectedLocation,
        locations,
        isLoading,
        refreshLocations
      }}
    >
      {children}
    </LocationContext.Provider>
  )
}

export function useLocation() {
  const context = useContext(LocationContext)
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider")
  }
  return context
} 