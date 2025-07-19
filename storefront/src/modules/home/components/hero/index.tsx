import { Button, Heading, Text } from "@medusajs/ui"
import InteractiveLink from "@modules/common/components/interactive-link"
import { Github } from "@medusajs/icons"

const Hero = () => {
  return (
    <div className="h-[90vh] w-full relative bg-ui-bg-subtle">
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center small:p-32 gap-6">
        <span className="text-ui-fg-base font-normal text-base">
          Welcome to Small Quantity Boxes
        </span>
        <Heading
          level="h1"
          className="text-3xl md:text-5xl leading-10 font-normal text-ui-fg-base"
        >
          Your Trusted Packaging Partner
        </Heading>
        <Text className="text-base md:text-xl text-ui-fg-subtle max-w-2xl">
          Exclusively serving Aurora Parts with premium packaging solutions. 
          Order by SKU, upload bulk orders, and manage deliveries across all your locations.
        </Text>
        <div className="flex gap-4 mt-4">
          <InteractiveLink href="/store">
            <Button size="xlarge">Browse Products</Button>
          </InteractiveLink>
          <InteractiveLink href="/quick-order">
            <Button size="xlarge" variant="secondary">Quick Order</Button>
          </InteractiveLink>
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <Text className="text-2xl font-semibold text-ui-fg-base">500+</Text>
            <Text className="text-ui-fg-subtle">Box Sizes Available</Text>
          </div>
          <div>
            <Text className="text-2xl font-semibold text-ui-fg-base">24hr</Text>
            <Text className="text-ui-fg-subtle">Standard Delivery</Text>
          </div>
          <div>
            <Text className="text-2xl font-semibold text-ui-fg-base">100%</Text>
            <Text className="text-ui-fg-subtle">Wisconsin Made</Text>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero
