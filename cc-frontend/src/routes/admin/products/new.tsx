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
import type { CreateProductFormDetails, Dimensions } from '@/types/product'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, ImagePlus, Layers, Loader2, Package, Plus, Trash2, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/admin/products/new')({
  component: AddProduct,
})

// ─── Local types ────────────────────────────────────────────────────────────

interface VariantOption {
  name: string
  values: string[]
  input: string
}

interface VariantRow {
  sku: string
  attributes: Record<string, string>
  stock: number
  price?: number
  sellingPrice?: number
  weight?: number
  dimensions?: Dimensions
}

// ─── Component ──────────────────────────────────────────────────────────────

function AddProduct() {
  const [formData, setFormData] = useState<CreateProductFormDetails>({
    name: '',
    category: '',
    description: '',
    price: 0,
    sellingPrice: 0,
    stock: 0,
    weight: 0,
    dimensions: { length: 0, width: 0, height: 0 },
    isCODAvailable: false,
    images: [],
  })

  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [variantOptions, setVariantOptions] = useState<VariantOption[]>([])
  const [variants, setVariants] = useState<VariantRow[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)

  const createProduct = useCreateProduct()
  const { data: categoriesResponse, isLoading } = useCategories()
  const categories = categoriesResponse?.result ?? []

  const navigate = useNavigate({ from: '/admin/products/new' })

  // ── Basic field handlers ──────────────────────────────────────────────────

  const handleInputChange = (
    field: keyof CreateProductFormDetails,
    value: string | boolean | number,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleDimensionChange = (axis: keyof Dimensions, value: string) => {
    setFormData((prev) => ({
      ...prev,
      dimensions: { ...prev.dimensions, [axis]: parseFloat(value) || 0 },
    }))
  }

  // ── Image handlers ────────────────────────────────────────────────────────

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }))

    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () =>
        setImagePreviews((prev) => [...prev, reader.result as string])
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

  // ── Variant-option handlers ───────────────────────────────────────────────

  const addVariantOption = () => {
    setVariantOptions((prev) =>  [...prev, {
      name: '',
      values: [],
      input: '',
    },])
  }

  const updateVariantOptionName = (index: number, name: string) => {
    setVariantOptions((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], name }
      return next
    })
  }

  const updateVariantOptionValues = (index: number, raw: string) => {
    const values = raw.split(',').map((v) => v.trim()).filter(Boolean)
    setVariantOptions((prev) => {
      const next = [...prev]
      next[index] = {
        ...next[index], 
        input: raw, values,
      }

      return next
    })
  }

  const removeVariantOption = (index: number) => {
    setVariantOptions((prev) => prev.filter((_, i) => i !== index))
  }

  // ── Variant-row handlers ──────────────────────────────────────────────────

  const addVariantRow = () => {
    // Pre-fill attributes from current option names
    const attributes: Record<string, string> = {}
    variantOptions.forEach((opt) => {
      if (opt.name) attributes[opt.name.toLowerCase().trim()] = ''
    })
    setVariants((prev) => [
      ...prev,
      { sku: '', attributes, stock: 0 },
    ])
  }

  const updateVariantField = (
    rowIndex: number,
    field: keyof Omit<VariantRow, 'attributes' | 'dimensions'>,
    value: string,
  ) => {
    setVariants((prev) => {
      const next = [...prev]
      next[rowIndex] = {
        ...next[rowIndex],
        [field]: field === 'sku' ? value : parseFloat(value) || 0,
      }
      return next
    })
  }

  const updateVariantAttribute = (
    rowIndex: number,
    attrKey: string,
    value: string,
  ) => {
    setVariants((prev) => {
      const next = [...prev]
      next[rowIndex] = {
        ...next[rowIndex],
        attributes: { ...next[rowIndex].attributes, [attrKey]: value },
      }
      return next
    })
  }

  const updateVariantDimension = (
    rowIndex: number,
    axis: keyof Dimensions,
    value: string,
  ) => {
    setVariants((prev) => {
      const next = [...prev]
      const existing = next[rowIndex].dimensions ?? { length: 0, width: 0, height: 0 }
      next[rowIndex] = {
        ...next[rowIndex],
        dimensions: { ...existing, [axis]: parseFloat(value) || 0 },
      }
      return next
    })
  }

  const removeVariantRow = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index))
  }

  const hasVariants = variants.length > 0

  // ── Submit ────────────────────────────────────────────────────────────────

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
      data.append('weight', formData.weight.toString())
      data.append('dimensions', JSON.stringify(formData.dimensions))
      data.append('isCODAvailable', formData.isCODAvailable.toString())

      // Stock is only meaningful when there are no variants.
      // The backend resets it to 0 anyway when variants are present.
      if (!hasVariants) {
        data.append('stock', formData.stock.toString())
      }

      // Variant options & variants
      data.append('variantOptions', JSON.stringify(variantOptions))
      data.append('variants', JSON.stringify(variants))

      // Images — backend reads req.files so use a consistent field name
      formData.images.forEach((file) => {
        data.append('productImages', file)
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

  // ── Validation ────────────────────────────────────────────────────────────

  const isFormValid =
    formData.name &&
    formData.category &&
    formData.price > 0 &&
    formData.sellingPrice > 0 &&
    formData.weight > 0 &&
    formData.dimensions.length > 0 &&
    formData.dimensions.width > 0 &&
    formData.dimensions.height > 0 &&
    formData.images.length > 0

  // ── Render ────────────────────────────────────────────────────────────────

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

          {/* ── Product Images ─────────────────────────────────────────────── */}
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

          {/* ── Product Information ────────────────────────────────────────── */}
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

              {/* Category */}
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
                      onChange={(e) =>
                        handleInputChange('sellingPrice', parseFloat(e.target.value) || 0)
                      }
                      className="border-border pl-7"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Discount Preview */}
              {!!formData.price && !!formData.sellingPrice && (
                <DiscountPreview
                  formData={{ price: formData.price, sellingPrice: formData.sellingPrice }}
                />
              )}
            </CardContent>
          </Card>

          {/* ── Inventory & Shipping ───────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                Inventory & Shipping
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stock — hidden when variants are present (backend ignores it) */}
              {!hasVariants && (
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
              )}

              {hasVariants && (
                <p className="text-xs text-muted-foreground border border-dashed border-border rounded-lg px-4 py-3">
                  Stock is managed per-variant when variants are configured.
                </p>
              )}

              {/* Weight */}
              <div className="space-y-2">
                <Label htmlFor="weight" className="text-xs font-medium uppercase tracking-wide">
                  Weight (grams) <span className="text-primary">*</span>
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

          {/* ── Variant Options ────────────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  Variant Options
                  <Badge variant="secondary" className="text-[10px] font-normal">Optional</Badge>
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addVariantOption}
                  className="h-8 gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Option
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {variantOptions.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6 border border-dashed border-border rounded-lg">
                  No variant options. Add options like Color or Size to enable variants.
                </p>
              ) : (
                variantOptions.map((opt, index) => (
                  <div key={index} className="grid grid-cols-[1fr_2fr_36px] gap-3 items-start">
                    <div className="space-y-1">
                      {index === 0 && (
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Option Name
                        </p>
                      )}
                      <Input
                        placeholder="e.g. Color"
                        value={opt.name}
                        onChange={(e) => updateVariantOptionName(index, e.target.value)}
                        className="border-border h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      {index === 0 && (
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Values (comma-separated)
                        </p>
                      )}
                      <Input
                        placeholder="e.g. Red, Blue, Green"
                        value={opt.input}
                        onChange={(e) => updateVariantOptionValues(index, e.target.value)}
                        className="border-border h-9"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={`h-9 w-9 text-muted-foreground hover:text-destructive ${index === 0 ? `mt-5` : ``}`}
                      onClick={() => removeVariantOption(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* ── Variants (SKU rows) ────────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  Variants
                  <Badge variant="secondary" className="text-[10px] font-normal">Optional</Badge>
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addVariantRow}
                  className="h-8 gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Variant
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {variants.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6 border border-dashed border-border rounded-lg">
                  No variants added. Each variant needs a unique SKU and stock quantity.
                </p>
              ) : (
                variants.map((variant, rowIndex) => (
                  <div
                    key={rowIndex}
                    className="rounded-lg border border-border p-4 space-y-3 relative"
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-3 right-3 h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => removeVariantRow(rowIndex)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>

                    {/* SKU & Stock */}
                    <div className="grid sm:grid-cols-2 gap-3 pr-10">
                      <div className="space-y-1">
                        <Label className="text-xs font-medium uppercase tracking-wide">
                          SKU <span className="text-primary">*</span>
                        </Label>
                        <Input
                          placeholder="e.g. WBH-RED-001"
                          value={variant.sku}
                          onChange={(e) => updateVariantField(rowIndex, 'sku', e.target.value)}
                          className="border-border h-9"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-medium uppercase tracking-wide">
                          Stock <span className="text-primary">*</span>
                        </Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={variant.stock || ''}
                          onChange={(e) => updateVariantField(rowIndex, 'stock', e.target.value)}
                          className="border-border h-9"
                        />
                      </div>
                    </div>

                    {/* Attribute values (one input per option) */}
                    {variantOptions.length > 0 && (
                      <div className="grid sm:grid-cols-3 gap-3">
                        {variantOptions.map((opt) => {
                          const key = opt.name.toLowerCase().trim()
                          return (
                            <div key={key} className="space-y-1">
                              <Label className="text-xs font-medium uppercase tracking-wide">
                                {opt.name || 'Attribute'}
                              </Label>
                              <Select
                                value={variant.attributes[key] ?? ''}
                                onValueChange={(val) =>
                                  updateVariantAttribute(rowIndex, key, val)
                                }
                              >
                                <SelectTrigger className="border-border h-9">
                                  <SelectValue placeholder="Select…" />
                                </SelectTrigger>
                                <SelectContent>
                                  {opt.values.map((v) => (
                                    <SelectItem key={v} value={v}>
                                      {v}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Optional overrides */}
                    <details className="group">
                      <summary className="text-xs text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors list-none flex items-center gap-1">
                        <Plus className="h-3 w-3 group-open:rotate-45 transition-transform" />
                        Override price / weight / dimensions for this variant
                      </summary>

                      <div className="mt-3 space-y-3">
                        {/* Price overrides */}
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs font-medium uppercase tracking-wide">
                              Price (MRP)
                            </Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder={`${formData.price || `—`} (default)`}
                                value={variant.price ?? ''}
                                onChange={(e) =>
                                  updateVariantField(rowIndex, 'price', e.target.value)
                                }
                                className="border-border h-9 pl-7"
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs font-medium uppercase tracking-wide">
                              Selling Price
                            </Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder={`${formData.sellingPrice || `—`} (default)`}
                                value={variant.sellingPrice ?? ''}
                                onChange={(e) =>
                                  updateVariantField(rowIndex, 'sellingPrice', e.target.value)
                                }
                                className="border-border h-9 pl-7"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Weight override */}
                        <div className="space-y-1">
                          <Label className="text-xs font-medium uppercase tracking-wide">
                            Weight (grams)
                          </Label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder={`${formData.weight || `—`} (default)`}
                            value={variant.weight ?? ''}
                            onChange={(e) =>
                              updateVariantField(rowIndex, 'weight', e.target.value)
                            }
                            className="border-border h-9"
                          />
                        </div>

                        {/* Dimensions override */}
                        <div className="space-y-1">
                          <Label className="text-xs font-medium uppercase tracking-wide">
                            Dimensions (cm)
                          </Label>
                          <div className="grid grid-cols-3 gap-3">
                            {(['length', 'width', 'height'] as const).map((axis) => (
                              <div key={axis} className="space-y-1">
                                <p className="text-xs text-muted-foreground capitalize">{axis}</p>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  value={variant.dimensions?.[axis] ?? ''}
                                  onChange={(e) =>
                                    updateVariantDimension(rowIndex, axis, e.target.value)
                                  }
                                  className="border-border h-9"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </details>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* ── Actions ────────────────────────────────────────────────────── */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => navigate({ to: '/admin/products' })}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="min-w-[140px]"
            >
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