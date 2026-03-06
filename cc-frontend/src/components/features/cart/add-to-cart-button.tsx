// components/add-to-cart-button.tsx
import { ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAddToCart } from "@/hooks/use-cart";
import { type CartItem } from "@/lib/cart-store";
import { cn } from "@/lib/utils";

type Props = {
  product: Omit<CartItem, "quantity">;
  qty?: number;
  className?: string;
  variant?: "default" | "outline";
};

export function AddToCartButton({ product, qty = 1, className, variant = "default" }: Props) {
  const { mutate, isPending, isSuccess } = useAddToCart();

  return (
    <Button
        variant={variant}
        disabled={isPending}
        onClick={() => mutate({ product, qty })}
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