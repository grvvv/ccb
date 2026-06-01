// components/add-to-cart-button.tsx
import { ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAddToCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";

type Props = {
  productId: string;
  qty?: number;
  variantId: string | null;
  className?: string;
  variant?: "default" | "outline";
  disabled?: boolean;
};

export function AddToCartButton({ productId, qty = 1, variantId = null, className, disabled, variant = "default" }: Props) {
  const { mutate, isPending, isSuccess } = useAddToCart();

  return (
    <Button
        variant={variant}
        disabled={disabled || isPending}
        onClick={() => mutate({ productId, quantity: qty, variantId })}
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