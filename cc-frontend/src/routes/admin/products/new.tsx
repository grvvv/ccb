// routes/admin/products/add.tsx

import { DiscountPreview } from '@/components/features/discount/discount-preview'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useCategories } from '@/hooks/use-category'
import { useCreateProduct } from '@/hooks/use-product'
import type { B2BTier, CreateProductFormDetails, Dimensions } from '@/types/product'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, ImagePlus, Layers, Loader2, Package, Plus, Trash2, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/admin/products/new')({
  component: AddProduct,
})

function AddProduct() {
  const [formData, setFormData] = useState<CreateProductFormDetails>({
    name: '',
    category: '',
    description: '',
    price: 0,
    sellingPrice: 0,
    sku: '',
    stock: 0,
    weight: 0,
    dimensions: { length: 0, width: 0, height: 0 },
    b2bPricingTiers: [],
    isCODAvailable: false,
    images: [],
  })
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const createProduct = useCreateProduct()
  const { data: categoriesResponse, isLoading } = useCategories()
  const categories = categoriesResponse?.result ?? []

  const navigate = useNavigate({ from: '/admin/products/new' })

  const handleInputChange = (field: keyof CreateProductFormDetails, value: string | boolean | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleDimensionChange = (axis: keyof Dimensions, value: string) => {
    setFormData((prev) => ({
      ...prev,
      dimensions: { ...prev.dimensions, [axis]: parseFloat(value) || 0 },
    }))
  }

  // B2B Tier Handlers
  const addB2BTier = () => {
    setFormData((prev) => ({
      ...prev,
      b2bPricingTiers: [
        ...prev.b2bPricingTiers,
        { minQty: 0, maxQty: null, price: 0 },
      ],
    }))
  }

  const updateB2BTier = (index: number, field: keyof B2BTier, value: string) => {
    setFormData((prev) => {
      const tiers = [...prev.b2bPricingTiers]
      tiers[index] = {
        ...tiers[index],
        [field]: field === 'maxQty' && value === '' ? null : parseFloat(value) || 0,
      }
      return { ...prev, b2bPricingTiers: tiers }
    })
  }

  const removeB2BTier = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      b2bPricingTiers: prev.b2bPricingTiers.filter((_, i) => i !== index),
    }))
  }

  // Image Handlers
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const newImages = [...formData.images, ...files]
    setFormData((prev) => ({ ...prev, images: newImages }))

    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const data = new FormData()
      data.append('name', formData.name)
      data.append('category', formData.category)
      data.append('description', formData.description)
      data.append('price', formData.price.toString())
      data.append('sellingPrice', formData.sellingPrice.toString())
      data.append('sku', formData.sku)
      data.append('stock', formData.stock.toString())
      data.append('weight', formData.weight.toString())
      data.append('dimensions', JSON.stringify(formData.dimensions))
      data.append('b2bPricingTiers', JSON.stringify(formData.b2bPricingTiers))
      data.append('isCODAvailable', formData.isCODAvailable.toString())

      formData.images.forEach((file, index) => {
        data.append(`productImages[${index}]`, file)
      })

      await createProduct.mutateAsync(data as any)

      toast.success('Product Created')
      navigate({ to: '/admin/products' })
    } catch (error) {
      console.error('Error submitting product:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid =
    formData.name &&
    formData.category &&
    formData.price &&
    formData.sellingPrice &&
    formData.sku &&
    formData.weight &&
    formData.dimensions.length &&
    formData.dimensions.width &&
    formData.dimensions.height &&
    formData.images.length > 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => navigate({ to: '/admin/products' })}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Add New Product</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Create a new product listing</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Product Images */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <ImagePlus className="h-4 w-4 text-primary" />
                Product Images
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div
                      key={index}
                      className="group relative aspect-square rounded-lg overflow-hidden border-2 border-border bg-secondary"
                    >
                      {index === 0 && (
                        <Badge className="absolute top-2 left-2 z-10 bg-primary text-primary-foreground text-[9px] px-1.5 py-0.5">
                          THUMBNAIL
                        </Badge>
                      )}
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-5 w-5 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-secondary/50 transition-colors"
              >
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground mb-1">Click to upload images</p>
                <p className="text-xs text-muted-foreground">PNG, JPG, WEBP up to 10MB</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />

              <p className="text-xs text-muted-foreground">
                First image will be used as the thumbnail.
              </p>
            </CardContent>
          </Card>

          {/* Product Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-medium uppercase tracking-wide">
                  Product Name <span className="text-primary">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Wireless Bluetooth Headphones"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="border-border"
                  required
                />
              </div>

              {/* SKU & Category */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku" className="text-xs font-medium uppercase tracking-wide">
                    SKU <span className="text-primary">*</span>
                  </Label>
                  <Input
                    id="sku"
                    placeholder="e.g. WBH-001"
                    value={formData.sku}
                    onChange={(e) => handleInputChange('sku', e.target.value)}
                    className="border-border"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-xs font-medium uppercase tracking-wide">
                    Category <span className="text-primary">*</span>
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleInputChange('category', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="border-border">
                      <SelectValue
                        placeholder={isLoading ? 'Loading categories...' : 'Select a category'}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoading ? (
                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                      ) : (categories ?? []).length > 0 ? (
                        (categories ?? []).map((cat) => (
                          <SelectItem key={cat._id} value={cat._id}>
                            {cat.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="empty" disabled>No categories found</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs font-medium uppercase tracking-wide">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe your product features, specifications, etc."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="border-border resize-none min-h-[120px]"
                />
              </div>

              {/* Price & Selling Price */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-xs font-medium uppercase tracking-wide">
                    Original Price (MRP) <span className="text-primary">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.price || ''}
                      onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                      className="border-border pl-7"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sellingPrice" className="text-xs font-medium uppercase tracking-wide">
                    Selling Price <span className="text-primary">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                    <Input
                      id="sellingPrice"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.sellingPrice || ''}
                      onChange={(e) => handleInputChange('sellingPrice', parseFloat(e.target.value) || 0)}
                      className="border-border pl-7"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Discount Preview */}
              {!!formData.price && !!formData.sellingPrice && (
                <DiscountPreview formData={{ price: formData.price, sellingPrice: formData.sellingPrice }} />
              )}
            </CardContent>
          </Card>

          {/* Inventory & Shipping */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                Inventory & Shipping
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stock & Weight */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock" className="text-xs font-medium uppercase tracking-wide">
                    Stock Quantity
                  </Label>
                  <Input
                    id="stock"
                    type="number"
                    placeholder="0"
                    value={formData.stock || ''}
                    onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                    className="border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-xs font-medium uppercase tracking-wide">
                    Weight (kg) <span className="text-primary">*</span>
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.weight || ''}
                    onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                    className="border-border"
                    required
                  />
                </div>
              </div>

              {/* Dimensions */}
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wide">
                  Dimensions (cm) <span className="text-primary">*</span>
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  {(['length', 'width', 'height'] as const).map((axis) => (
                    <div key={axis} className="space-y-1">
                      <p className="text-xs text-muted-foreground capitalize">{axis}</p>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.dimensions[axis] || ''}
                        onChange={(e) => handleDimensionChange(axis, e.target.value)}
                        className="border-border"
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* COD Toggle */}
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Cash on Delivery</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Allow customers to pay on delivery
                  </p>
                </div>
                <Switch
                  checked={formData.isCODAvailable}
                  onCheckedChange={(checked) => handleInputChange('isCODAvailable', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* B2B Pricing Tiers */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  B2B Pricing Tiers
                  <Badge variant="secondary" className="text-[10px] font-normal">Optional</Badge>
                </CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addB2BTier} className="h-8 gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  Add Tier
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {formData.b2bPricingTiers.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6 border border-dashed border-border rounded-lg">
                  No B2B tiers configured. Add tiers to offer bulk pricing.
                </p>
              ) : (
                <>
                  {/* Column Headers */}
                  <div className="grid grid-cols-[1fr_1fr_1fr_36px] gap-3 px-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Min Qty</p>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Max Qty</p>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Price (₹)</p>
                    <span />
                  </div>

                  {formData.b2bPricingTiers.map((tier, index) => (
                    <div key={index} className="grid grid-cols-[1fr_1fr_1fr_36px] gap-3 items-center">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={tier.minQty || ''}
                        onChange={(e) => updateB2BTier(index, 'minQty', e.target.value)}
                        className="border-border h-9"
                      />
                      <Input
                        type="number"
                        placeholder="No limit"
                        value={tier.maxQty ?? ''}
                        onChange={(e) => updateB2BTier(index, 'maxQty', e.target.value)}
                        className="border-border h-9"
                      />
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={tier.price || ''}
                          onChange={(e) => updateB2BTier(index, 'price', e.target.value)}
                          className="border-border h-9 pl-7"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground hover:text-destructive"
                        onClick={() => removeB2BTier(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <p className="text-xs text-muted-foreground pt-1">
                    B2B price must be ≤ selling price. Leave Max Qty blank for an open-ended tier.
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => navigate({ to: '/admin/products' })}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isFormValid || isSubmitting} className="min-w-[140px]">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Product'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}