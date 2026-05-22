import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useAddAddress } from "@/hooks/use-user";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddAddressDialog({ open, onOpenChange }: Props) {
  const { mutateAsync, isPending } = useAddAddress();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    locality: "",
    city: "",
    state: "",
    pincode: "",
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    await mutateAsync(form);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Address</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
          />

          <Input
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value)}
          />

          <Input
            placeholder="Address (House No., Building, Street, Area)"
            value={form.address}
            onChange={(e) => updateField("address", e.target.value)}
          />

          <Input
            placeholder="Locality / Town"
            value={form.locality}
            onChange={(e) => updateField("locality", e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="City"
              value={form.city}
              onChange={(e) => updateField("city", e.target.value)}
            />

            <Input
              placeholder="State"
              value={form.state}
              onChange={(e) => updateField("state", e.target.value)}
            />
          </div>

          <Input
            placeholder="Pincode"
            value={form.pincode}
            onChange={(e) => updateField("pincode", e.target.value)}
          />

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={isPending}
          >
            Save Address
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
