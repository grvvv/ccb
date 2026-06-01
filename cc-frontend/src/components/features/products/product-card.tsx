import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import type { ProductDetails } from "@/types/product";
import { Link } from "@tanstack/react-router";
import { useAddToCart } from "@/hooks/use-cart";

interface ProductCardProps {
  product: ProductDetails;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [added, setAdded] = useState(false);
  const { mutate } = useAddToCart();

  const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;

  // For variant products, stock is the sum of all variant stocks.
  // For simple products, use the top-level stock field directly.
  const totalStock = hasVariants
    ? product.variants.reduce((sum: number, v: { stock: number }) => sum + (v.stock ?? 0), 0)
    : product.stock;

  const isOutOfStock = totalStock <= 0;

  const hasDiscount = product.sellingPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.sellingPrice) / product.price) * 100)
    : 0;

  const handleAddToCart = () => {
    // Only reachable for simple (no-variant) products. Variant products
    // navigate to the detail page instead (see button below).
    setAdded(true);
    mutate({ productId: product._id, quantity: 1, variantId: null });
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border bg-background border-border transition-all duration-100 ease-in-out hover:border-primary">
      {/* Discount badge */}
      {hasDiscount && (
        <div className="absolute top-3 left-3 z-10 bg-primary text-primary-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
          -{discountPercent}%
        </div>
      )}

      {/* Image area */}
      <div className="relative w-full min-h-48 lg:h-48 xl:h-52">
        {isOutOfStock && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-[1px]">
            <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2">
              <span className="text-sm font-semibold tracking-wide text-white">
                Out of Stock
              </span>
            </div>
          </div>
        )}

        <Link
          to="/products/$productId"
          params={{ productId: product._id }}
          className="relative block w-full h-full overflow-hidden bg-muted"
        >
          <img
            src={product.thumbnail}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="inset-0 w-full h-full object-contain p-2 transition duration-150 ease-linear transform group-hover:scale-105"
          />
        </Link>

        {/* Cart button — navigates to PDP for variant products, adds directly for simple ones */}
        <div className="absolute bottom-3 right-3 z-10">
          {hasVariants ? (
            // Variant products: can't pick a SKU from a card, send to product page
            <Link
              to="/products/$productId"
              params={{ productId: product._id }}
              aria-label="Select options"
              className={`w-11 h-11 flex items-center justify-center rounded-full border-2 font-medium transition-colors duration-300
                bg-primary text-primary-foreground border-primary hover:bg-primary/90`}
            >
              <ShoppingBag className="w-5 h-5" />
            </Link>
          ) : (
            <button
              aria-label="Add to cart"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`w-11 h-11 flex items-center justify-center rounded-full cursor-pointer border-2 font-medium transition-colors duration-300 focus:outline-none
                ${added
                  ? "bg-green-500 border-green-500 text-white"
                  : "bg-primary text-primary-foreground border-primary hover:bg-primary/90 focus:border-primary focus:bg-primary focus:text-primary-foreground"
                }`}
            >
              <ShoppingBag className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col space-y-2 px-4 pt-2 pb-4">
        {/* Category */}
        <span className="text-xs text-muted-foreground">{product.category}</span>

        {/* Product name */}
        <Link
          to="/products/$productId"
          params={{ productId: product._id }}
          className="text-sm font-medium text-foreground line-clamp-1 hover:text-primary"
        >
          {product.name}
        </Link>

        {/* Price */}
        <div className="font-bold flex items-center gap-2">
          <span className="inline-block text-base text-foreground">
            ₹{product.sellingPrice.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              ₹{product.price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Variant hint */}
        {hasVariants && (
          <span className="text-xs text-muted-foreground">
            {product.variants.length} variant{product.variants.length !== 1 ? 's' : ''} available
          </span>
        )}
      </div>
    </div>
  );
}