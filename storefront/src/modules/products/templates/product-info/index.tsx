import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import InventoryByLocation from "@modules/products/components/inventory-by-location"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const selectedVariant = product.variants?.[0] // Simple variant selection for demo

  return (
    <div id="product-info">
      <div className="flex flex-col gap-y-4">
        {product.collection && (
          <LocalizedClientLink
            href={`/collections/${product.collection.handle}`}
            className="text-medium text-ui-fg-muted hover:text-ui-fg-subtle"
          >
            {product.collection.title}
          </LocalizedClientLink>
        )}
        <Heading level="h2" className="text-3xl leading-10 text-ui-fg-base">
          {product.title}
        </Heading>

        <Text className="text-medium text-ui-fg-subtle">
          {product.description}
        </Text>
      </div>

      {/* Add inventory by location display */}
      {selectedVariant && <InventoryByLocation variant={selectedVariant} />}
    </div>
  )
}

export default ProductInfo
