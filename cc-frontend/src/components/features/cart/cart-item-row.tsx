import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRemoveFromCart, useUpdateCartQuantity } from "@/hooks/use-cart";
import type { CartItem } from "@/types/cart";

type Props = { item: CartItem };

export function CartItemRow({ item }: Props) {
  const { mutate: remove, isPending: isRemoving } = useRemoveFromCart();
  const { mutate: updateQty, isPending: isUpdating } = useUpdateCartQuantity();

  const isBusy = isRemoving || isUpdating;

  if (!item) return null;

  return (
    <div className="flex gap-3 py-4">
      {/* Image */}
      <img
        src={item.image}
        alt={item.name}
        className="h-16 w-16 sm:h-18 sm:w-18 rounded-lg object-cover bg-muted shrink-0"
      />

      {/* Right side */}
      <div className="flex-1 min-w-0 flex flex-col gap-2">

        {/* Name + remove */}
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-tight line-clamp-2">
            {item.name}
          </p>
          <Button
            variant="ghost"
            size="icon"
            disabled={isBusy}
            className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive -mt-0.5"
            onClick={() => remove(item.product)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Price + qty controls */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-primary tabular-nums">
              ₹{(item.sellingPrice * item.quantity).toLocaleString()}
            </p>
            {item.quantity > 1 && (
              <p className="text-xs text-muted-foreground tabular-nums">
                ₹{item.sellingPrice.toLocaleString()} each
              </p>
            )}
          </div>

          {/* Qty stepper */}
          <div className="flex items-center border border-border rounded-lg overflow-hidden shrink-0">
            <Button
              variant="ghost"
              size="icon"
              disabled={isBusy || item.quantity <= 1}
              className="h-7 w-7 rounded-none border-0"
              onClick={() =>
                updateQty({ productId: item.product, quantity: item.quantity - 1 })
              }
            >
              <Minus className="h-3 w-3" />
            </Button>

            <span className="w-7 text-center text-xs font-medium tabular-nums select-none">
              {item.quantity}
            </span>

            <Button
              variant="ghost"
              size="icon"
              disabled={isBusy}
              className="h-7 w-7 rounded-none border-0"
              onClick={() =>
                updateQty({ productId: item.product, quantity: item.quantity + 1 })
              }
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}