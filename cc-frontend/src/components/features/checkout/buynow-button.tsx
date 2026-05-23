// components/add-to-cart-button.tsx

import { ShoppingCart, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAddToCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";
import type { ProductDetails } from "@/types/product";
import { useNavigate } from "@tanstack/react-router";

type Props = {
  product: ProductDetails;
  qty?: number;
  className?: string;
  variant?: "default" | "outline";
  disabled?: boolean;
};

export function BuyNowButton({
  product,
  qty = 1,
  className,
  variant = "outline",
  disabled,
}: Props) {
  const addToCartMutation = useAddToCart();
  let navigate = useNavigate({ from: "/products/$productId"})

  const handleAddToCart = () => {
    if (product.stock <= 0) return;

    addToCartMutation.mutate({
      productId: product._id,
      quantity: qty,
    });

    navigate({ to: "/checkout" })
  };

  const isOutOfStock = product.stock <= 0;

  return (
    <Button
      variant={variant}
      disabled={
        disabled ||
        isOutOfStock ||
        addToCartMutation.isPending
      }
      onClick={handleAddToCart}
      className={cn("gap-2", className)}
    >
      {addToCartMutation.isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : addToCartMutation.isSuccess ? (
        <Check className="h-4 w-4" />
      ) : (
        <ShoppingCart className="h-4 w-4" />
      )}

      {isOutOfStock
        ? "Out of Stock"
        : addToCartMutation.isPending
          ? "Adding..."
          : addToCartMutation.isSuccess
            ? "Added!"
            : "Buy Now"}
    </Button>
  );
}