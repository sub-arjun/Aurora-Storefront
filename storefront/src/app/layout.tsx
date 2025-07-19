import { Metadata } from "next"

import "./globals.css"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:8000"

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    template: "%s | Small Quantity Boxes",
    default: "Small Quantity Boxes - Packaging Solutions for Aurora Parts"
  },
  description: "Premium packaging solutions exclusively for Aurora Parts. Order boxes by SKU, upload bulk orders, and manage deliveries across all your Wisconsin locations.",
  keywords: ["packaging", "boxes", "shipping supplies", "Wisconsin", "Aurora Parts", "bulk ordering"],
  openGraph: {
    title: "Small Quantity Boxes - Your Packaging Partner",
    description: "Exclusively serving Aurora Parts with premium packaging solutions",
    type: "website",
    siteName: "Small Quantity Boxes",
    locale: "en_US"
  },
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light">
      <body>
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
