import { useProductDetails } from '@/hooks/use-product';
import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { useState, useMemo } from 'react';
import { Minus, Plus } from 'lucide-react';
import { AddToCartButton } from '@/components/features/cart/add-to-cart-button';

export const Route = createFileRoute('/_public/products/$productId')({
  component: RouteComponent,
});

function RouteComponent() {
  const { productId } = useParams({ from: '/_public/products/$productId' });
  const { data: product, isLoading, error } = useProductDetails(productId);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const navigate = useNavigate();

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => prev > 1 ? prev - 1 : 1);

  // Derive active bulk pricing tier based on current quantity
  const activeTier = useMemo(() => {
    if (!product?.b2bPricingTiers?.length) return null;
    return (
      [...product.b2bPricingTiers]
        .sort((a, b) => a.minQty - b.minQty)
        .findLast(tier => quantity >= tier.minQty) ?? null
    );
  }, [product?.b2bPricingTiers, quantity]);

  // Effective price: tier price overrides selling price when a tier is active
  const effectivePrice = activeTier?.price ?? product?.sellingPrice;

  const handleBuyNow = () => {
    if (!product) return;
    navigate({
      to: '/checkout',
      search: {
        productId: product._id,
        quantity,
        price: effectivePrice,
      },
    });
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Internal Server Error</h2>
          <a href="/products" className="text-primary hover:underline">Go back to products</a>
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
          <a href="/products" className="text-primary hover:underline">Go back to products</a>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const discount = product.price && effectivePrice
    ? Math.round(((product.price - effectivePrice) / product.price) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-4 space-y-4">
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">

          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg border border-border bg-card overflow-hidden">
              <img
                src={product.productImages?.[selectedImage] || "/api/placeholder/600/600"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
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
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground">{product.name}</h1>
              </div>
            </div>

            {/* Price — reflects active tier */}
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold text-foreground">₹{effectivePrice}</span>
              {product.price && product.price > effectivePrice && (
                <>
                  <span className="text-2xl text-muted-foreground line-through">₹{product.price}</span>
                  <span className="px-3 py-1 bg-primary text-primary-foreground text-sm font-semibold rounded-full">
                    {discount}% OFF
                  </span>
                </>
              )}
              {activeTier && (
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                  Bulk rate applied
                </span>
              )}
            </div>

            <div>
              {isOutOfStock ? (
                <span className="text-red-500 font-semibold">Out of Stock</span>
              ) : (
                <span className="text-green-600 font-medium">In Stock ({product.stock} available)</span>
              )}
            </div>

            <div className="text-sm">
              <span className="text-muted-foreground">Cash on Delivery: </span>
              <span className={product.isCODAvailable ? "text-green-600" : "text-red-500"}>
                {product.isCODAvailable ? "Available" : "Not Available"}
              </span>
            </div>

            {/* Bulk Pricing Table — highlights active tier */}
            {product.b2bPricingTiers?.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-border">
                <h3 className="text-lg font-semibold text-foreground">Bulk Pricing</h3>
                <div className="space-y-1 text-sm">
                  {[...product.b2bPricingTiers]
                    .sort((a, b) => a.minQty - b.minQty)
                    .map((tier, idx) => {
                      const isActive = activeTier === tier;
                      return (
                        <div
                          key={idx}
                          className={`flex justify-between items-center px-3 py-2 rounded-md border transition-colors ${
                            isActive
                              ? 'border-primary bg-primary/5 text-foreground font-semibold'
                              : 'border-transparent hover:bg-muted text-muted-foreground'
                          }`}
                        >
                          <span>{tier.minQty}–{tier.maxQty ?? '∞'} units</span>
                          <div className="flex items-center gap-2">
                            <span className={isActive ? 'text-primary' : ''}>
                              ₹{tier.price}/unit
                            </span>
                            {isActive && (
                              <span className="text-xs text-primary font-normal">(active)</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

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
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-20 h-12 text-center font-semibold border-x border-border bg-transparent outline-none"
                  />
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
                productId={product._id}
                qty={quantity}
                className="flex-1 h-12"
                disabled={isOutOfStock}
              />
              <Button
                variant="outline"
                className="flex-1 h-12"
                disabled={isOutOfStock || isBuyingNow}
                onClick={handleBuyNow}
              >
                {isBuyingNow ? <Spinner className="w-4 h-4" /> : 'Buy Now'}
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