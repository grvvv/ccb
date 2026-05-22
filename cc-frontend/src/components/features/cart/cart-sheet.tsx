import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { CartItemRow } from "./cart-item-row";
import { useCart, useClearCart } from "@/hooks/use-cart";

export function CartSheet() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { data: cart, isLoading, isError } = useCart();
  const { mutate: clearCart, isPending: isClearing } = useClearCart();
  const items = cart?.result?.items || [];
  const count = cart?.result?.totalItems || 0;
  const total = cart?.result?.totalAmount || 0;
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />

          {count > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center bg-primary text-primary-foreground border-0">
              {count > 99 ? "99+" : count}
            </Badge>
          )}

          <span className="sr-only">Cart</span>
        </Button>
      </SheetTrigger>

      <SheetContent className="flex flex-col w-full sm:max-w-md p-0">
        <SheetHeader className="px-6 py-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Cart
            {count > 0 && (
              <span className="text-muted-foreground font-normal text-sm">
                ({count} items)
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Spinner />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="font-medium">Failed to load cart</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-16">
              <div className="bg-muted rounded-full p-4">
                <ShoppingCart className="h-8 w-8 text-muted-foreground" />
              </div>

              <p className="font-medium">Your cart is empty</p>

              <p className="text-sm text-muted-foreground">
                Add some items to get started
              </p>
            </div>
          ) : (
            <div>
              {items.map((item) => (
                <CartItemRow key={String(item.product)} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <SheetFooter className="flex-col px-6 py-4 border-t border-border gap-3">
            <div className="flex justify-between items-center w-full">
              <span className="text-sm text-muted-foreground">Subtotal</span>

              <span className="font-semibold tabular-nums">
                ₹{total.toLocaleString()}
              </span>
            </div>

            <p className="text-xs text-muted-foreground">
              Shipping & taxes calculated at checkout
            </p>

            <Button
              className="w-full"
              size="lg"
              onClick={() => {
                setOpen(false);

                navigate({
                  to: "/checkout",
                });
              }}
            >
              Checkout
            </Button>

            <Button
              variant="ghost"
              size="sm"
              disabled={isClearing}
              className="w-full text-muted-foreground"
              onClick={() => {
                clearCart();

                setOpen(false);
              }}
            >
              {isClearing ? "Clearing..." : "Clear cart"}
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
