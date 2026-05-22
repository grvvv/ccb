// components/add-to-cart-button.tsx
import { ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAddToCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";
import type { CartItem } from "@/types/cart";

type Props = {
  product: Omit<CartItem, "quantity">;
  qty?: number;
  className?: string;
  variant?: "default" | "outline";
  disabled?: boolean;
};

export function BuyNowButton({ product, qty = 1, className, disabled}: Props) {
  const { mutate, isPending, isSuccess } = useAddToCart();

  return (
    <Button
        variant="outline"
        disabled={disabled}
        onClick={() => mutate({ productId: product._id, quantity: qty })}
        className={cn("gap-2", className)}
    >
      {isSuccess ? (
        <Check className="h-4 w-4" />
      ) : (
        <ShoppingCart className="h-4 w-4" />
      )}
      {isPending ? "Adding..." : isSuccess ? "Added!" : "Add to Cart"}
    </Button>
  );
}