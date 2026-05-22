import { useState } from "react";
import { Plus, MapPin, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AddAddressDialog } from "./add-address-dialog";
import type { Address } from "@/types/order";

type Props = {
  addresses: Address[];
  value?: Address;
  onChange: (address: Address) => void;
};

export function AddressSelector({ addresses, value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Delivery Address</h3>

          <p className="text-sm text-muted-foreground">
            Select delivery location
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Address
        </Button>
      </div>

      <div className="space-y-3">
        {addresses.map((address) => {
          const isSelected = value?._id === address._id;

          return (
            <Card
              key={address._id}
              onClick={() => onChange(address)}
              className={`
                p-4
                cursor-pointer
                transition-all
                border-2
                ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "hover:border-primary/50"
                }
              `}
            >
              <div className="flex gap-3">
                <div
                  className={`
                    mt-1
                    shrink-0
                    h-5
                    w-5
                    rounded-full
                    border-2
                    flex
                    items-center
                    justify-center
                    ${isSelected ? "border-primary" : "border-muted-foreground"}
                  `}
                >
                  {isSelected && <Check className="h-3 w-3 text-primary" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />

                    <p className="font-medium text-sm">{address.name}</p>
                  </div>

                  <p className="text-sm text-muted-foreground mt-1">
                    {address.phone}
                  </p>

                  <p className="text-sm text-muted-foreground mt-1">
                    {address.address}, {address.locality}, {address.city}, {address.state}
                    {" - "}
                    {address.pincode}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <AddAddressDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
