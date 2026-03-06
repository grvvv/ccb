// routes/admin/carousels/new.tsx

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCreateCarousel } from '@/hooks/use-carousel'
import type { CarouselForm } from '@/types/carousel'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, GalleryHorizontal, Link2, Loader2, Trash2, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/admin/carousel/add')({
  component: AddCarousel,
})

function AddCarousel() {
  const navigate = useNavigate()
  const createCarousel = useCreateCarousel()

  const [formData, setFormData] = useState<CarouselForm>({
    title: '',
    description: '',
    order: '',
    redirectUrl: '',
    image: null,
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (field: keyof CarouselForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFormData((prev) => ({ ...prev, image: file }))

    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }))
    setImagePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.image) return
    setIsSubmitting(true)

    try {
        const data = new FormData()
        data.append('title', formData.title)
        data.append('description', formData.description)
        data.append('order', formData.order)
        data.append('redirectUrl', formData.redirectUrl)
        data.append('image', formData.image)

        await createCarousel.mutateAsync(data as any)

        toast.success("Request Accepted")
        navigate({ to: '/admin/carousel' })
    } catch (error) {
        toast.error("Error creating carousel")
    } finally {
        setIsSubmitting(false)
    }
  }

  const isFormValid = formData.title && formData.image

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => navigate({ to: '/admin/carousel' })}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Add Carousel Slide</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Create a new banner slide</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Banner Image */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <GalleryHorizontal className="h-4 w-4 text-primary" />
                Banner Image
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {imagePreview ? (
                <div className="group relative w-full aspect-16/5 rounded-lg overflow-hidden border border-border bg-secondary">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-3.5 w-3.5 mr-1.5" />
                      Replace
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={removeImage}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-lg p-10 text-center cursor-pointer hover:border-primary/50 hover:bg-secondary/50 transition-colors"
                >
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium text-foreground mb-1">
                    Click to upload banner image
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, WEBP — recommended 1000px wide
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
            </CardContent>
          </Card>

          {/* Slide Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Slide Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* Title + Order */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="title" className="text-xs font-medium uppercase tracking-wide">
                    Title <span className="text-primary">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g. Summer Sale Banner"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order" className="text-xs font-medium uppercase tracking-wide">
                    Display Order
                  </Label>
                  <Input
                    id="order"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.order}
                    onChange={(e) => handleInputChange('order', e.target.value)}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs font-medium uppercase tracking-wide">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Optional subtitle or caption for this slide"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="resize-none min-h-[90px]"
                />
              </div>

              {/* Redirect URL */}
              <div className="space-y-2">
                <Label htmlFor="redirectUrl" className="text-xs font-medium uppercase tracking-wide">
                  Redirect URL
                </Label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    id="redirectUrl"
                    placeholder="/some/endpoint"
                    value={formData.redirectUrl}
                    onChange={(e) => handleInputChange('redirectUrl', e.target.value)}
                    className="pl-9"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Where users will be taken when they click this slide.
                </p>
              </div>

            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => navigate({ to: '/admin/carousel' })}
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
                'Create Slide'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}