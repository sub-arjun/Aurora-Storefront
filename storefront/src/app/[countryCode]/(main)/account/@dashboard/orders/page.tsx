import { Metadata } from "next"

import { getCustomer } from "@lib/data/customer"
import { listOrders } from "@lib/data/orders"
import OrderOverview from "@modules/account/components/order-overview"
import OrderExport from "@modules/account/components/order-export"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Orders",
  description: "Overview of your previous orders.",
}

export default async function Orders() {
  const customer = await getCustomer()
  const orders = await listOrders()

  if (!customer) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="orders-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">Orders</h1>
        <p className="text-base-regular">
          View your previous orders and their status. You can also export order data for your records.
        </p>
      </div>
      
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <OrderOverview orders={orders} />
        </div>
        
        <div className="lg:col-span-1">
          <OrderExport customerId={customer.id} />
        </div>
      </div>
    </div>
  )
}
