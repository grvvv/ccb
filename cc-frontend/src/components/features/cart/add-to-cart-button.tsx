// components/add-to-cart-button.tsx
import { ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAddToCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useEffect } from "react";
import { AxiosError } from "axios";

type Props = {
  productId: string;
  qty?: number;
  className?: string;
  variant?: "default" | "outline";
  disabled?: boolean;
};

export function AddToCartButton({ productId, qty = 1, className, disabled, variant = "default" }: Props) {
  const { mutate, isPending, isSuccess, error } = useAddToCart();

  useEffect(() => {
      if (!error) return;
      if (error instanceof AxiosError && error.response) {
        toast.error('Login Failed', {
          description: error.response.data.message,
        });
        return;
      }
    }, [error]);

  return (
    <Button
        variant={variant}
        disabled={disabled || isPending}
        onClick={() => mutate({ productId, quantity: qty })}
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