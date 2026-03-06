import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import type { ProductDetails } from "@/types/product";
import { Link } from "@tanstack/react-router";
import { useAddToCart } from "@/hooks/use-cart";

interface ProductCardProps {
  product: ProductDetails;
  rating?: number;
  reviewCount?: number;
  onAddToCart?: (product: ProductDetails) => void;
}

export default function ProductCard({
  product,
}: ProductCardProps) {
  const [added, setAdded] = useState(false);
  const { mutate } = useAddToCart();

  const hasDiscount = product.sellingPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.sellingPrice) / product.price) * 100)
    : 0;

  const handleAddToCart = () => {
    setAdded(true);
    mutate({product, qty: 1});
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
        <Link
          to={"/products/$productId"}
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

        {/* Add to cart button */}
        <div className="absolute bottom-3 right-3 z-10 flex items-center justify-center rounded-full bg-background text-muted-foreground shadow-lg transition-all duration-300 ease-in-out hover:bg-muted hover:text-primary">
          <button
            aria-label="add to cart"
            onClick={handleAddToCart}
            className={`w-11 h-11 flex items-center justify-center rounded-full cursor-pointer border-2 font-medium transition-colors duration-300 focus:outline-none
              ${added
                ? "bg-green-500 border-green-500 text-white"
                : "bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:border-primary hover:text-primary-foreground focus:border-primary focus:bg-primary focus:text-primary-foreground"
              }`}
          >
            <ShoppingBag className="text-xl w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col space-y-2 px-4 pt-2 pb-4">
        {/* Category */}
        <span className="text-xs text-muted-foreground">{product.category}</span>

        {/* Product name */}
        <div className="relative mb-1">
          <Link
            to={"/products/$productId"}
            params={{ productId: product._id }}
            className="text-sm font-medium text-foreground line-clamp-1 hover:text-primary"
          >
            {product.name}
          </Link>
        </div>

        {/* Price */}
        <div className="product-price font-bold flex items-center gap-2">
          <span className="inline-block text-base text-foreground">
            ₹{product.sellingPrice.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              ₹{product.price.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}