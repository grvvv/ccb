import { useProductDetails } from '@/hooks/use-product';
import { createFileRoute, useParams } from '@tanstack/react-router';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Minus, Plus, Share2 } from 'lucide-react';
import { AddToCartButton } from '@/components/features/cart/add-to-cart-button';

export const Route = createFileRoute('/_public/products/$productId')({
  component: RouteComponent,
});

function RouteComponent() {
  const { productId } = useParams({ from: '/_public/products/$productId' });
  const { data: product, isLoading, error } = useProductDetails(productId);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => prev > 1 ? prev - 1 : 1);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Internal Server Error</h2>
          <a href="/products" className="text-primary hover:underline">
            Go back to products
          </a>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Product not found</h2>
          <a href="/products" className="text-primary hover:underline">
            Go back to products
          </a>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const discount = product.price && product.sellingPrice 
    ? Math.round(((product.price - product.sellingPrice) / product.price) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-4 space-y-4">

      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square rounded-lg border border-border bg-card overflow-hidden">
              <img
                src={product.productImages?.[selectedImage] || "/api/placeholder/600/600"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Gallery */}
            {product.productImages && product.productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-md border-2 overflow-hidden transition-all ${
                      selectedImage === index
                        ? 'border-primary'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <img
                      src={image || "/api/placeholder/150/150"}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Title and Actions */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground">{product.name}</h1>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full border border-border"
                  >
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>

            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold text-foreground">₹{product.sellingPrice}</span>
              {product.price && product.price > product.sellingPrice && (
                <>
                  <span className="text-2xl text-muted-foreground line-through">₹{product.price}</span>
                  <span className="px-3 py-1 bg-primary text-primary-foreground text-sm font-semibold rounded-full">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>

            <div>
              {isOutOfStock ? (
                <span className="text-red-500 font-semibold">Out of Stock</span>
              ) : (
                <span className="text-green-600 font-medium">
                  In Stock ({product.stock} available)
                </span>
              )}
            </div>

            <div className="text-sm">
              <span className="text-muted-foreground">Cash on Delivery: </span>
              <span className={product.isCODAvailable ? "text-green-600" : "text-red-500"}>
                {product.isCODAvailable ? "Available" : "Not Available"}
              </span>
            </div>

            {product.b2bPricingTiers?.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-border">
                <h3 className="text-lg font-semibold text-foreground">Bulk Pricing</h3>
                <div className="space-y-2 text-sm">
                  {product.b2bPricingTiers.map((tier, idx) => (
                    <div key={idx} className="flex justify-between border-b py-2">
                      <span className="text-muted-foreground">
                        {tier.minQty} - {tier.maxQty ?? "∞"} units
                      </span>
                      <span className="font-medium text-foreground">
                        ₹{tier.price}/unit
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-foreground">Description</h2>
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">Quantity</label>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-border rounded-lg overflow-hidden bg-card">
                  <Button
                    variant="ghost"
                    onClick={decrementQuantity}
                    className="h-12 px-4 rounded-none hover:bg-muted"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="px-6 py-3 font-semibold border-x border-border min-w-20 text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    onClick={incrementQuantity}
                    className="h-12 px-4 rounded-none hover:bg-muted"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <AddToCartButton 
                product={product} 
                qty={quantity} 
                className="flex-1 h-12"
                disabled={isOutOfStock}
              />

              <Button 
                variant="outline" 
                className="flex-1 h-12"
                disabled={isOutOfStock}
              >
                Buy Now
              </Button>
            </div>

            {/* Product Details */}
            <div className="space-y-3 pt-6 border-t border-border">
              <h3 className="text-lg font-semibold text-foreground">Product Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium text-foreground">{product.category || 'Kitchen & Dining'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Availability</span>
                  <span className="font-medium text-primary">In Stock</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">SKU</span>
                  <span className="font-medium text-foreground">{product.sku}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Weight</span>
                  <span className="font-medium text-foreground">{product.weight} g</span>
                </div>

                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Dimensions</span>
                  <span className="font-medium text-foreground">
                    {product.dimensions?.length} × {product.dimensions?.width} × {product.dimensions?.height} cm
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}