// components/cart-item-row.tsx
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type CartItem } from "@/lib/cart-store";
import { useRemoveFromCart, useUpdateCartQty } from "@/hooks/use-cart";

type Props = {
  item: CartItem;
};

export function CartItemRow({ item }: Props) {
  const { mutate: remove } = useRemoveFromCart();
  const { mutate: updateQty } = useUpdateCartQty();

  return (
    <div className="flex items-center gap-4 py-4 border-b border-border last:border-0">
      {/* Image */}
      {item.productImages && item.productImages.length > 0 && (
        <img
          src={item.productImages[0]}
          alt={item.name}
          className="h-16 w-16 rounded-lg object-cover bg-muted shrink-0"
        />
      )}

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{item.name}</p>
        <p className="text-sm text-muted-foreground mt-0.5">
          ₹{item.sellingPrice.toLocaleString()}
        </p>
      </div>

      {/* Qty controls */}
      <div className="flex items-center gap-1 border border-border rounded-lg">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-r-none"
          onClick={() => updateQty({ id: item._id, quantity: item.quantity - 1 })}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-8 text-center text-sm font-medium tabular-nums">
          {item.quantity}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-l-none"
          onClick={() => updateQty({ id: item._id, quantity: item.quantity + 1 })}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {/* Line total */}
      <p className="text-sm font-semibold w-16 text-right tabular-nums">
        ₹{(item.sellingPrice * item.quantity).toLocaleString()}
      </p>

      {/* Remove */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
        onClick={() => remove(item._id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}