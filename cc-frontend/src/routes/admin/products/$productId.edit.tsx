// routes/admin/products/$productId/edit.tsx

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
import { Textarea } from '@/components/ui/textarea'
import { useCategories } from '@/hooks/use-category'
import { useProductDetails, useUpdateProduct } from '@/hooks/use-product'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, ImagePlus, Loader2, Trash2, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export const Route = createFileRoute('/admin/products/$productId/edit')({
  component: EditProduct,
})

interface FormData {
  name: string
  category: string
  description: string
  price: number
  sellingPrice: number
  images: File[]
}

// Existing images already uploaded (URLs from the server)
interface ExistingImage {
  url: string
  publicId: string
}

function EditProduct() {
  const { productId } = Route.useParams()
  const navigate = useNavigate()

  const { data: product, isLoading: isProductLoading } = useProductDetails(productId)

  const [formData, setFormData] = useState<FormData>({
    name: '',
    category: '',
    description: '',
    price: 0,
    sellingPrice: 0,
    images: [],
  })
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([])
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([])
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const updateProduct = useUpdateProduct()
  const { data: categoriesResponse, isLoading: isCategoriesLoading } = useCategories()
  const categories = categoriesResponse?.result ?? []

  // Populate form when product data loads
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name ?? '',
        category: product.category ?? '',
        description: product.description ?? '',
        price: product.price ?? 0,
        sellingPrice: product.sellingPrice ?? 0,
        images: [],
      })
      setExistingImages(
        (product.productImages ?? []).map((img: any) => ({
          url: img.url ?? img,
          publicId: img.publicId ?? img,
        }))
      )
    }
  }, [product])

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const newImages = [...formData.images, ...files]
    setFormData((prev) => ({ ...prev, images: newImages }))

    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewImagePreviews((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeExistingImage = (index: number) => {
    const removed = existingImages[index]
    setRemovedImageIds((prev) => [...prev, removed.publicId])
    setExistingImages((prev) => prev.filter((_, i) => i !== index))
  }

  const removeNewImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const totalImageCount = existingImages.length + formData.images.length

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

      // Tell the server which existing images to remove
      removedImageIds.forEach((id) => {
        data.append('removedImages[]', id)
      })

      // Append new image files
      formData.images.forEach((file, index) => {
        data.append(`productImages[${index}]`, file)
      })

      await updateProduct.mutateAsync({ productId: productId, productData: data as any })
      navigate({ to: '/admin/products' })
    } catch (error) {
      console.error('Error updating product:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid =
    formData.name &&
    formData.category &&
    formData.price &&
    formData.sellingPrice &&
    totalImageCount > 0

  if (isProductLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Product not found.</p>
      </div>
    )
  }

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
            <h1 className="text-xl font-semibold text-foreground">Edit Product</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Update details for <span className="text-foreground font-medium">{product.name}</span>
            </p>
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
              {/* Image Grid */}
              {totalImageCount > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* Existing images */}
                  {existingImages.map((img, index) => (
                    <div
                      key={`existing-${index}`}
                      className="group relative aspect-square rounded-lg overflow-hidden border-2 border-border bg-secondary"
                    >
                      {index === 0 && formData.images.length === 0 && (
                        <Badge className="absolute top-2 left-2 z-10 bg-primary text-primary-foreground text-[9px] px-1.5 py-0.5">
                          THUMBNAIL
                        </Badge>
                      )}
                      <img
                        src={img.url}
                        alt={`Product image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-5 w-5 text-white" />
                      </button>
                    </div>
                  ))}

                  {/* New image previews */}
                  {newImagePreviews.map((preview, index) => (
                    <div
                      key={`new-${index}`}
                      className="group relative aspect-square rounded-lg overflow-hidden border-2 border-primary/40 bg-secondary"
                    >
                      {existingImages.length === 0 && index === 0 && (
                        <Badge className="absolute top-2 left-2 z-10 bg-primary text-primary-foreground text-[9px] px-1.5 py-0.5">
                          THUMBNAIL
                        </Badge>
                      )}
                      <Badge className="absolute top-2 right-2 z-10 bg-secondary text-secondary-foreground text-[9px] px-1.5 py-0.5 border border-border">
                        NEW
                      </Badge>
                      <img
                        src={preview}
                        alt={`New preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-5 w-5 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Button */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-secondary/50 transition-colors"
              >
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground mb-1">
                  Click to upload more images
                </p>
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
                First image will be used as the thumbnail. Removed images will be deleted on save.
              </p>
            </CardContent>
          </Card>

          {/* Product Details */}
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
                  disabled={isCategoriesLoading}
                >
                  <SelectTrigger className="border-border">
                    <SelectValue
                      placeholder={isCategoriesLoading ? 'Loading categories...' : 'Select a category'}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {isCategoriesLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading...
                      </SelectItem>
                    ) : (categories ?? []).length > 0 ? (
                      (categories ?? []).map((cat) => (
                        <SelectItem key={cat._id} value={cat._id}>
                          {cat.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="empty" disabled>
                        No categories found
                      </SelectItem>
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
                    Original Price <span className="text-primary">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      ₹
                    </span>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
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
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      ₹
                    </span>
                    <Input
                      id="sellingPrice"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.sellingPrice}
                      onChange={(e) => handleInputChange('sellingPrice', e.target.value)}
                      className="border-border pl-7"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Discount Badge */}
              {!!formData.price && !!formData.sellingPrice && (
                <DiscountPreview
                  formData={{ price: formData.price, sellingPrice: formData.sellingPrice }}
                />
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
            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}