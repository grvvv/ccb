import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MapPin, Phone, Trash2, Plus, User } from "lucide-react";
import { toast } from "sonner"; // or your preferred toast lib

const ADDRESS_TYPES = ["HOME", "WORK", "OTHER"];

const typeBadgeVariant = (type) => {
  if (type === "HOME") return "success";   // add these to your badge variants if needed
  if (type === "WORK") return "default";
  return "secondary";
};

const emptyForm = {
  name: "",
  phone: "",
  address: "",
  locality: "",
  city: "",
  state: "",
  pincode: "",
  type: "HOME",
};

export default function ManageAccount({ user, onAddAddress, onDeleteAddress }) {
  // user shape: { name, email, phone, role, createdAt, addresses }
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  const initials = user?.name
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleTypeChange = (val) =>
    setForm((prev) => ({ ...prev, type: val }));

  const handleAdd = async () => {
    const required = ["name", "phone", "address", "city", "state", "pincode"];
    if (required.some((k) => !form[k].trim())) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      await onAddAddress(form);          // POST /api/user/address
      toast.success("Address added.");
      setForm(emptyForm);
      setShowForm(false);
    } catch {
      toast.error("Failed to add address.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (addressId) => {
    try {
      await onDeleteAddress(addressId);  // DELETE /api/user/address/:addressId
      toast.success("Address removed.");
    } catch {
      toast.error("Failed to remove address.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-6 space-y-6">
      {/* Page header */}
      <div>
        <p className="text-sm text-muted-foreground">Settings</p>
        <h1 className="text-2xl font-semibold tracking-tight">Manage account</h1>
      </div>

      {/* Profile card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
              {initials || <User size={18} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-base leading-tight">{user?.name}</p>
              <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
            </div>
            {user?.role === "admin" && (
              <Badge variant="outline" className="capitalize">
                {user.role}
              </Badge>
            )}
          </div>

          <Separator className="mb-4" />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Phone</p>
              <p className="text-sm font-medium">{user?.phone || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Member since</p>
              <p className="text-sm font-medium">{memberSince}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Addresses card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Saved addresses</CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowForm((v) => !v)}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add address
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Add address form */}
          {showForm && (
            <div className="bg-muted/50 rounded-lg p-4 mb-4 space-y-3">
              <p className="text-sm font-medium">New address</p>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Full name *</Label>
                  <Input placeholder="Name" value={form.name} onChange={handleChange("name")} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Phone *</Label>
                  <Input placeholder="Phone number" value={form.phone} onChange={handleChange("phone")} />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Address line *</Label>
                <Input placeholder="Street address" value={form.address} onChange={handleChange("address")} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Locality</Label>
                  <Input placeholder="Area / locality" value={form.locality} onChange={handleChange("locality")} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">City *</Label>
                  <Input placeholder="City" value={form.city} onChange={handleChange("city")} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">State *</Label>
                  <Input placeholder="State" value={form.state} onChange={handleChange("state")} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Pincode *</Label>
                  <Input placeholder="400001" value={form.pincode} onChange={handleChange("pincode")} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Type</Label>
                  <Select value={form.type} onValueChange={handleTypeChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ADDRESS_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t.charAt(0) + t.slice(1).toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setForm(emptyForm); }}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleAdd} disabled={loading}>
                  {loading ? "Saving..." : "Save address"}
                </Button>
              </div>
            </div>
          )}

          {/* Address list */}
          {(!user?.addresses || user.addresses.length === 0) && !showForm ? (
            <div className="text-center py-10 text-muted-foreground">
              <MapPin className="w-7 h-7 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No addresses saved yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {user?.addresses?.map((addr) => (
                <div key={addr._id} className="flex gap-3 py-4 items-start">
                  <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-medium">{addr.name}</span>
                      <Badge variant={typeBadgeVariant(addr.type)} className="text-[11px] px-2 py-0">
                        {addr.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {addr.address}{addr.locality ? `, ${addr.locality}` : ""}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {addr.city}, {addr.state} — {addr.pincode}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {addr.phone}
                    </p>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-8 w-8 shrink-0">
                        <Trash2 className="w-4 h-4" />
                        <span className="sr-only">Remove address</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove address?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently remove the address at {addr.address}, {addr.city}.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => handleDelete(addr._id)}
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}