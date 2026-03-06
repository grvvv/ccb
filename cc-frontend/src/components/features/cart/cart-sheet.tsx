// components/cart-sheet.tsx
import { ShoppingCart } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart, useCartCount, useCartTotal, useClearCart } from "@/hooks/use-cart";
import { CartItemRow } from "./cart-item-row";
import { useNavigate } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";

export function CartSheet() {
  const { data: items = [] } = useCart();
  const count = useCartCount();
  const total = useCartTotal();
  const { mutate: clearCart } = useClearCart();
  const navigate = useNavigate();

  return (
    <Sheet>
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

      <SheetContent className="flex flex-col w-full sm:max-w-md p-0" >
        <SheetHeader className="flex px-6 py-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Cart
            {items.length > 0 && (
              <span className="text-muted-foreground font-normal text-sm">
                ({items.length} {items.length === 1 ? "item" : "items"})
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6">
          {items.length === 0 ? (
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
                <CartItemRow key={item._id} item={item} />
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
              className="w-full" size="lg"
              onClick={() => navigate({ to: "/checkout" })}
            >
              Checkout
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground"
              onClick={() => clearCart()}
            >
              Clear cart
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}