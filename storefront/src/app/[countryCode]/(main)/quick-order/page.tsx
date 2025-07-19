import { Metadata } from "next"
import { Suspense } from "react"
import { notFound } from "next/navigation"

import { getCustomer } from "@lib/data/customer"
import QuickOrderForm from "@modules/quick-order/components/quick-order-form"
import CSVUpload from "@modules/quick-order/components/csv-upload"
import { Tabs } from "@medusajs/ui"

export const metadata: Metadata = {
  title: "Quick Order",
  description: "Add multiple products by SKU for faster ordering",
}

export default async function QuickOrderPage() {
  const customer = await getCustomer()
  
  if (!customer) {
    notFound()
  }

  return (
    <div className="content-container py-12">
      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="manual">
          <Tabs.List>
            <Tabs.Trigger value="manual">Manual Entry</Tabs.Trigger>
            <Tabs.Trigger value="csv">CSV Upload</Tabs.Trigger>
          </Tabs.List>
          
          <Tabs.Content value="manual" className="mt-6">
            <Suspense fallback={<div className="animate-pulse bg-ui-bg-subtle h-96 rounded-lg" />}>
              <QuickOrderForm />
            </Suspense>
          </Tabs.Content>
          
          <Tabs.Content value="csv" className="mt-6">
            <Suspense fallback={<div className="animate-pulse bg-ui-bg-subtle h-96 rounded-lg" />}>
              <CSVUpload />
            </Suspense>
          </Tabs.Content>
        </Tabs>
      </div>
    </div>
  )
} 