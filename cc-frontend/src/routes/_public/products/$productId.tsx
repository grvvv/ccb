import { useProductDetails } from '@/hooks/use-product';
import { createFileRoute, useParams } from '@tanstack/react-router';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Minus, Plus, Share2, Truck, Shield, RotateCcw } from 'lucide-react';
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

  const discount = product.price && product.sellingPrice 
    ? Math.round(((product.price - product.sellingPrice) / product.price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">

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
              <AddToCartButton product={product} qty={quantity} className="flex-1 h-12" />
              <Button variant="outline" className="flex-1 h-12">
                Buy Now
              </Button>
            </div>

            {/* Features */}
            <div className="grid sm:grid-cols-3 gap-4 pt-6 border-t border-border">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-secondary">
                  <Truck className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground">Free Shipping</h4>
                  <p className="text-xs text-muted-foreground">On orders over ₹500</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-secondary">
                  <RotateCcw className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground">Easy Returns</h4>
                  <p className="text-xs text-muted-foreground">30-day return policy</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-secondary">
                  <Shield className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground">Secure Payment</h4>
                  <p className="text-xs text-muted-foreground">100% protected</p>
                </div>
              </div>
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}