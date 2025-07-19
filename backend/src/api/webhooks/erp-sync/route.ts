import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { 
    event_type,
    data 
  } = req.body

  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)

  try {
    // Log webhook receipt
    logger.info(`ERP webhook received: ${event_type}`)

    switch (event_type) {
      case "order.placed":
        await handleOrderPlaced(data, req.scope)
        break
      
      case "inventory.updated":
        await handleInventoryUpdate(data, req.scope)
        break
      
      case "product.sync":
        await handleProductSync(data, req.scope)
        break
      
      case "customer.updated":
        await handleCustomerUpdate(data, req.scope)
        break
      
      default:
        logger.warn(`Unknown webhook event type: ${event_type}`)
    }

    res.json({ 
      success: true,
      message: `Webhook ${event_type} processed successfully`
    })
  } catch (error) {
    logger.error(`Error processing ERP webhook: ${error}`)
    res.status(500).json({ 
      success: false,
      error: "Failed to process webhook" 
    })
  }
}

async function handleOrderPlaced(data: any, scope: any) {
  const orderService = scope.resolve("orderService")
  const logger = scope.resolve(ContainerRegistrationKeys.LOGGER)
  
  try {
    // Extract order data
    const { order_id, location_code, po_number } = data
    
    // Add ERP reference to order metadata
    await orderService.update(order_id, {
      metadata: {
        erp_synced: true,
        erp_sync_date: new Date().toISOString(),
        location_code,
        po_number
      }
    })
    
    logger.info(`Order ${order_id} synced with ERP`)
  } catch (error) {
    logger.error(`Failed to sync order with ERP: ${error}`)
    throw error
  }
}

async function handleInventoryUpdate(data: any, scope: any) {
  const inventoryService = scope.resolve("inventoryService")
  const logger = scope.resolve(ContainerRegistrationKeys.LOGGER)
  
  try {
    const { sku, location_code, quantity } = data
    
    // Update inventory levels
    // This would integrate with your actual inventory module
    logger.info(`Inventory updated for SKU ${sku} at ${location_code}: ${quantity}`)
  } catch (error) {
    logger.error(`Failed to update inventory: ${error}`)
    throw error
  }
}

async function handleProductSync(data: any, scope: any) {
  const productService = scope.resolve("productService")
  const logger = scope.resolve(ContainerRegistrationKeys.LOGGER)
  
  try {
    const { products } = data
    
    // Sync product data from ERP
    for (const product of products) {
      await productService.upsert({
        external_id: product.erp_id,
        title: product.name,
        description: product.description,
        metadata: {
          erp_id: product.erp_id,
          erp_category: product.category,
          bulk_pricing: product.bulk_pricing
        }
      })
    }
    
    logger.info(`Synced ${products.length} products from ERP`)
  } catch (error) {
    logger.error(`Failed to sync products: ${error}`)
    throw error
  }
}

async function handleCustomerUpdate(data: any, scope: any) {
  const customerService = scope.resolve("customerService")
  const logger = scope.resolve(ContainerRegistrationKeys.LOGGER)
  
  try {
    const { customer_id, credit_limit, payment_terms } = data
    
    // Update customer with enterprise data
    await customerService.update(customer_id, {
      metadata: {
        credit_limit,
        payment_terms,
        erp_customer_id: data.erp_customer_id
      }
    })
    
    logger.info(`Customer ${customer_id} updated with ERP data`)
  } catch (error) {
    logger.error(`Failed to update customer: ${error}`)
    throw error
  }
} 