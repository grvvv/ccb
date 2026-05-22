import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRemoveFromCart, useUpdateCartQuantity } from "@/hooks/use-cart";
import type { CartItem } from "@/types/cart";

type Props = { item: CartItem };

export function CartItemRow({ item }: Props) {
  const { mutate: remove, isPending: isRemoving } = useRemoveFromCart();
  const {
    mutate: updateQty,
    isPending: isUpdating,
  } = useUpdateCartQuantity();

  const isBusy = isRemoving || isUpdating;

  if (!item) {
    return null;
  }
  
  return (
    <div className="flex items-center gap-4 py-4 border-b border-border last:border-0">

      <img
        src={item.image}
        alt={item.name}
        className="h-16 w-16 rounded-lg object-cover bg-muted shrink-0"
      />

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {item.name}
        </p>

        <p className="text-sm text-muted-foreground mt-0.5">
          ₹{item.sellingPrice.toLocaleString()}
        </p>

      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-1 border border-border rounded-lg">

        <Button
          variant="ghost"
          size="icon"
          disabled={isBusy || item.quantity <= 1}
          className="h-8 w-8 rounded-r-none"
          onClick={() =>
            updateQty({
              productId: item.product,
              quantity: item.quantity - 1,
            })
          }
        >
          <Minus className="h-3 w-3" />
        </Button>

        <span className="w-8 text-center text-sm font-medium tabular-nums">
          {item.quantity}
        </span>

        <Button
          variant="ghost"
          size="icon"
          disabled={isBusy}
          className="h-8 w-8 rounded-l-none"
          onClick={() =>
            updateQty({
              productId: item.product,
              quantity: item.quantity + 1,
            })
          }
        >
          <Plus className="h-3 w-3" />
        </Button>

      </div>

      {/* Line Total */}
      <p className="text-sm font-semibold w-20 text-right tabular-nums">
        ₹{(
          item.sellingPrice * item.quantity
        ).toLocaleString()}
      </p>

      {/* Remove */}
      <Button
        variant="ghost"
        size="icon"
        disabled={isBusy}
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
        onClick={() => remove(item.product)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

    </div>
  );
}