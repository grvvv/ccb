// routes/admin/categories/add.tsx
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
import { useCategories, useCreateCategory } from '@/hooks/use-category'
import type { CreateCategoryFormDetails } from '@/types/category'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, FolderOpen, ImagePlus, Loader2, Upload, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/admin/categories/new')({
  component: AddCategory,
})

function AddCategory() {
  const [formData, setFormData] = useState<CreateCategoryFormDetails>({
    name: '',
    icon: '',
    parent: '',
    order: '0',
    image: null,
  })
  const [imagePreview, setImagePreview] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: catergoriesResponse } = useCategories()
  const createCategory = useCreateCategory()
  let parentCategories = catergoriesResponse?.result || []
  let navigate = useNavigate({ from: '/admin/categories/new' })

  // Common icon options
  const iconOptions = [
    '🎮', '👕', '🏠', '⚽', '📱', '💻', '🎧', '📷', 
    '⌚', '🎨', '📚', '🍔', '🚗', '✈️', '🎵', '🎬'
  ]

  const handleInputChange = (field: keyof CreateCategoryFormDetails, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFormData((prev) => ({ ...prev, image: file }))

    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }))
    setImagePreview('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
        const data = new FormData()
        data.append('name', formData.name)
        data.append('icon', formData.icon)
        data.append('order', formData.order)
        
        if (formData.parent !== "NA" && formData.parent !== "") {
            data.append('parent', formData.parent)
        }
        if (formData.image) {
            data.append('image', formData.image)
        }
        await createCategory.mutateAsync(data as any)
        toast.success('Category created successfully!')
        setFormData({
            name: '',
            icon: '',
            parent: '',
            order: '0',
            image: null,
        })
        setImagePreview('')
        navigate({ to: '/admin' })
    } catch (error) {
        toast.error('Failed to create category. Please try again.')
    } finally {
        setIsSubmitting(false)
    }
  }

  const isFormValid = formData.name && formData.icon && formData.image

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Add New Category</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Create a new product category
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Image */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <ImagePlus className="h-4 w-4 text-primary" />
                Category Image
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {imagePreview ? (
                <div className="relative w-full max-w-sm mx-auto">
                  <div className="group relative aspect-video rounded-lg overflow-hidden border-2 border-border bg-secondary">
                    <img
                      src={imagePreview}
                      alt="Category preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-3 right-3 p-2 bg-black/70 hover:bg-black rounded-full transition-colors"
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-primary/50 hover:bg-secondary/50 transition-colors"
                >
                  <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm font-medium text-foreground mb-1">
                    Click to upload category image
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, WEBP up to 10MB
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />

              <p className="text-xs text-muted-foreground text-center">
                Recommended: 1000x600px or 16:9 aspect ratio
              </p>
            </CardContent>
          </Card>

          {/* Category Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Category Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-medium uppercase tracking-wide">
                  Category Name <span className="text-primary">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Electronics, Clothing, Sports"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="border-border"
                  required
                />
                {formData.name && (
                  <p className="text-xs text-muted-foreground">
                    Slug will be:{' '}
                    <code className="bg-secondary px-1.5 py-0.5 rounded text-foreground">
                      {formData.name.toLowerCase().replace(/\s+/g, '-')}
                    </code>
                  </p>
                )}
              </div>

              {/* Icon Picker */}
              <div className="space-y-2">
                <Label className="text-xs font-medium uppercase tracking-wide">
                  Category Icon <span className="text-primary">*</span>
                </Label>
                <div className="grid grid-cols-8 sm:grid-cols-10 gap-2">
                  {iconOptions.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleInputChange('icon', emoji)}
                      className={`aspect-square rounded-lg border-2 text-2xl flex items-center justify-center transition-all hover:scale-110 ${
                        formData.icon === emoji
                          ? 'border-primary bg-primary/10 scale-110'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Input
                    placeholder="Or enter custom emoji/icon"
                    value={formData.icon}
                    onChange={(e) => handleInputChange('icon', e.target.value)}
                    className="border-border flex-1"
                    maxLength={2}
                  />
                  {formData.icon && (
                    <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg bg-secondary">
                      <span className="text-xs text-muted-foreground">Selected:</span>
                      <span className="text-2xl">{formData.icon}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Parent Category */}
              <div className="space-y-2">
                <Label htmlFor="parent" className="text-xs font-medium uppercase tracking-wide">
                  Parent Category
                  <span className="text-muted-foreground text-[10px] ml-2 normal-case">
                    (Optional - leave empty for top-level category)
                  </span>
                </Label>
                <Select
                  value={formData.parent}
                  onValueChange={(value) => handleInputChange('parent', value)}
                >
                  <SelectTrigger className="border-border">
                    <SelectValue placeholder="None - This will be a main category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NA">None (Main Category)</SelectItem>
                    {parentCategories.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Sub-categories appear under their parent in navigation
                </p>
              </div>

              {/* Display Order */}
              <div className="space-y-2">
                <Label htmlFor="order" className="text-xs font-medium uppercase tracking-wide">
                  Display Order
                </Label>
                <Input
                  id="order"
                  type="number"
                  placeholder="0"
                  value={formData.order}
                  onChange={(e) => handleInputChange('order', e.target.value)}
                  className="border-border"
                  min="0"
                />
                <p className="text-xs text-muted-foreground">
                  Lower numbers appear first. Use 0 for default ordering.
                </p>
              </div>

              {/* Preview */}
              {formData.name && formData.icon && (
                <div className="p-4 bg-secondary rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wide">
                    Category Preview
                  </p>
                  <div className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border hover:shadow-md transition-shadow">
                    <div className="text-3xl">{formData.icon}</div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{formData.name}</p>
                      {formData.parent && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <FolderOpen className="h-3 w-3" />
                          Sub-category of{' '}
                          {parentCategories.find((c) => c._id === formData.parent)?.name}
                        </p>
                      )}
                    </div>
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-12 w-12 rounded object-cover border border-border"
                      />
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isFormValid || isSubmitting} className="min-w-[140px]">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Category'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}