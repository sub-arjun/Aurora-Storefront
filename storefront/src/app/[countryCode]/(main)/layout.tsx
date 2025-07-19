import { Metadata } from "next"

import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"
import { LocationProvider } from "@lib/context/location-context"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:8000"

export const metadata = {
  metadataBase: new URL(BASE_URL),
}

export default async function PageLayout(props: {
  children: React.ReactNode
  params: Promise<{ countryCode: string }>
}) {
  return (
    <LocationProvider>
      <Nav />
      {props.children}
      <Footer />
    </LocationProvider>
  )
}
