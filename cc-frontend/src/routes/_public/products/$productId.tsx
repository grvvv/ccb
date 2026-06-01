// routes/_public/products/$productId.tsx

import { useProductDetails } from '@/hooks/use-product';
import { createFileRoute, Link, useParams } from '@tanstack/react-router';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Minus, Plus, PackageX, ChevronRight } from 'lucide-react';
import { AddToCartButton } from '@/components/features/cart/add-to-cart-button';
import { BuyNowButton } from '@/components/features/checkout/buynow-button';
import type { ProductVariant, VariantOption } from '@/types/product';

export const Route = createFileRoute('/_public/products/$productId')({
  component: RouteComponent,
});


function RouteComponent() {
  const { productId } = useParams({ from: '/_public/products/$productId' });
  const { data: product, isLoading, error } = useProductDetails(productId);

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // One selected value per option axis, keyed by lowercased option name
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));

  // ── Loading / error states ────────────────────────────────────────────────

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <PackageX className="h-12 w-12 mx-auto text-muted-foreground opacity-40" />
          <h2 className="text-xl font-semibold text-foreground">Something went wrong</h2>
          <Link to="/products" className="text-sm text-primary hover:underline">
            Back to products
          </Link>
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
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <PackageX className="h-12 w-12 mx-auto text-muted-foreground opacity-40" />
          <h2 className="text-xl font-semibold text-foreground">Product not found</h2>
          <Link to="/products" className="text-sm text-primary hover:underline">
            Back to products
          </Link>
        </div>
      </div>
    );
  }

  // ── Variant resolution ────────────────────────────────────────────────────

  const variantOptions: VariantOption[] = product.variantOptions ?? []
  const variants: ProductVariant[] = product.variants ?? []
  const hasVariants = variants.length > 0

  const normalize = (v: string) => v?.toLowerCase().trim()

  const selectedVariant =
    variantOptions.length &&
    variantOptions.every((opt) => selectedAttributes[opt.name.toLowerCase().trim()])
      ? variants.find((v) =>
          variantOptions.every((opt) => {
            const key = opt.name.toLowerCase().trim()
            return normalize(v.attributes[key]) === normalize(selectedAttributes[key])
          }),
        ) ?? null
      : null

  // Effective values — variant overrides fall back to base product fields
  const effectivePrice = selectedVariant?.sellingPrice ?? product.sellingPrice
  const effectiveMRP = selectedVariant?.price ?? product.price
  const effectiveStock = selectedVariant?.stock ?? (hasVariants ? 0 : product.stock)
  const effectiveWeight = selectedVariant?.weight ?? product.weight
  const effectiveDimensions = selectedVariant?.dimensions ?? product.dimensions
  const effectiveSKU = selectedVariant?.sku ?? null
  const effectiveVariantId = selectedVariant?._id ?? null

  const isOutOfStock = effectiveStock <= 0

  // Block purchase until a variant is chosen when the product has variants
  const variantRequired = hasVariants && !selectedVariant
  const canPurchase = !isOutOfStock && !variantRequired

  const discount =
    effectiveMRP && effectivePrice && effectiveMRP > effectivePrice
      ? Math.round(((effectiveMRP - effectivePrice) / effectiveMRP) * 100)
      : 0

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
        <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/products" className="hover:text-foreground transition-colors">Products</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground truncate max-w-40 sm:max-w-xs">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">

        {/* ── Image Gallery ───────────────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="aspect-square rounded-xl border border-border bg-card overflow-hidden">
            <img
              src={product.productImages?.[selectedImage] || '/api/placeholder/600/600'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {product.productImages?.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {product.productImages.map((image: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg border-2 overflow-hidden transition-all ${
                    selectedImage === index
                      ? 'border-primary ring-1 ring-primary/30'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <img
                    src={image || '/api/placeholder/120/120'}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Product Details ─────────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Name */}
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-3xl sm:text-4xl font-bold text-foreground">
              ₹{effectivePrice}
            </span>
            {effectiveMRP && effectiveMRP > effectivePrice && (
              <>
                <span className="text-xl text-muted-foreground line-through tabular-nums">
                  ₹{effectiveMRP}
                </span>
                <span className="px-2.5 py-0.5 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                  {discount}% OFF
                </span>
              </>
            )}
          </div>

          {/* Stock + COD */}
          <div className="flex items-center gap-4 flex-wrap text-sm">
            {variantRequired ? (
              <span className="text-muted-foreground">Select options to see availability</span>
            ) : isOutOfStock ? (
              <span className="text-red-500 font-medium">Out of Stock</span>
            ) : (
              <span className="text-green-600 font-medium">
                In Stock
                <span className="text-muted-foreground font-normal ml-1">
                  ({effectiveStock} available)
                </span>
              </span>
            )}
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">
              COD:{' '}
              <span className={product.isCODAvailable ? 'text-green-600' : 'text-red-500'}>
                {product.isCODAvailable ? 'Available' : 'Not Available'}
              </span>
            </span>
          </div>

          {/* Variant option selectors */}
          {variantOptions.map((opt) => {
            const key = opt.name.toLowerCase().trim()
            return (
              <div key={key} className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{opt.name}</span>
                  {selectedAttributes[key] && (
                    <span className="text-sm text-muted-foreground">
                      — {selectedAttributes[key]}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {opt.values.map((value) => {
                    const isSelected = selectedAttributes[key] === value

                    // Determine whether this value leads to any in-stock variant
                    // given the other axes already selected
                    const wouldBeOutOfStock = variants
                      .filter((v) => {
                        // This variant must match `value` for the current axis
                        if (v.attributes[key] !== value) return false
                        // And must match all other already-selected axes
                        return variantOptions
                          .filter((o) => o.name.toLowerCase().trim() !== key)
                          .every((o) => {
                            const otherKey = o.name.toLowerCase().trim()
                            return (
                              !selectedAttributes[otherKey] ||
                              v.attributes[otherKey] === selectedAttributes[otherKey]
                            )
                          })
                      })
                      .every((v) => v.stock <= 0)

                    return (
                      <button
                        key={value}
                        onClick={() =>
                          setSelectedAttributes((prev) => {
                            const next = { ...prev }

                            if (isSelected) delete next[key]
                            else next[key] = value

                            return next
                          })
                        }
                        title={wouldBeOutOfStock ? 'Out of stock' : value}
                        className={`h-8 px-3 rounded-lg border-2 text-xs font-medium transition-all relative capitalize ${
                          isSelected
                            ? 'border-primary bg-primary/5 text-primary'
                            : wouldBeOutOfStock
                              ? 'border-border text-muted-foreground/40 line-through cursor-not-allowed'
                              : 'border-border hover:border-muted-foreground text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {value}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {/* Prompt to select variant if needed */}
          {variantRequired && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Please select all options above before adding to cart.
            </p>
          )}

          {/* Description */}
          {product.description && (
            <div className="space-y-1.5 pt-4 border-t border-border">
              <h2 className="text-sm font-semibold text-foreground">Description</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Quantity */}
          <div className="space-y-2 pt-4 border-t border-border">
            <label className="text-sm font-medium text-foreground">Quantity</label>
            <div className="flex items-center border border-border rounded-lg overflow-hidden w-fit bg-card">
              <Button
                variant="ghost"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                className="h-10 w-10 rounded-none hover:bg-muted"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </Button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="w-14 h-10 text-center text-sm font-semibold border-x border-border bg-transparent outline-none tabular-nums"
              />
              <Button
                variant="ghost"
                onClick={incrementQuantity}
                className="h-10 w-10 rounded-none hover:bg-muted"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <AddToCartButton
              productId={product._id}
              qty={quantity}
              variantId={effectiveVariantId}
              className="flex-1 h-11"
              disabled={!canPurchase}
            />
            <BuyNowButton
              product={product}
              qty={quantity}
              stock={effectiveStock}
              variantId={effectiveVariantId}
              className="flex-1 h-11"
              disabled={!canPurchase}
            />
          </div>

          {/* Product Details Table */}
          <div className="space-y-2 pt-5 border-t border-border">
            <h3 className="text-sm font-semibold text-foreground">Product Details</h3>
            <div className="text-sm divide-y divide-border">
              {[
                { label: 'Category',   value: product.category },
                // SKU shown only once a variant is selected (no top-level SKU)
                ...(effectiveSKU ? [{ label: 'SKU', value: effectiveSKU }] : []),
                { label: 'Weight',     value: `${effectiveWeight} g` },
                {
                  label: 'Dimensions',
                  value: effectiveDimensions
                    ? `${effectiveDimensions.length} × ${effectiveDimensions.width} × ${effectiveDimensions.height} cm`
                    : '—',
                },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-2 gap-4">
                  <span className="text-muted-foreground shrink-0">{label}</span>
                  <span className="font-medium text-foreground text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}