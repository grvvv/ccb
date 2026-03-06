// routes/admin/carousels/$carouselId/edit.tsx

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {  useCarouselDetails, useUpdateCarousel } from '@/hooks/use-carousel'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, GalleryHorizontal, Link2, Loader2, Trash2, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export const Route = createFileRoute('/admin/carousel/$carouselId/edit')({
  component: EditCarousel,
})

interface FormData {
  title: string
  description: string
  order: string
  redirectUrl: string
  image: File | null
}

function EditCarousel() {
  const { carouselId } = Route.useParams()
  const navigate = useNavigate()
  const updateCarousel = useUpdateCarousel()

  const { data: carouselResponse, isLoading: isCarouselLoading } = useCarouselDetails(carouselId)
  const carousel = carouselResponse

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    order: '',
    redirectUrl: '',
    image: null,
  })
  // Existing image URL from server
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null)
  // Preview for a newly selected replacement image
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Hydrate form once data loads
  useEffect(() => {
    if (carousel) {
      setFormData({
        title: carousel.title ?? '',
        description: carousel.description ?? '',
        order: carousel.order != null ? String(carousel.order) : '',
        redirectUrl: carousel.redirectUrl ?? '',
        image: null,
      })
      setExistingImageUrl(carousel.imageUrl ?? null)
    }
  }, [carousel])

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFormData((prev) => ({ ...prev, image: file }))

    const reader = new FileReader()
    reader.onloadend = () => setNewImagePreview(reader.result as string)
    reader.readAsDataURL(file)

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeNewImage = () => {
    setFormData((prev) => ({ ...prev, image: null }))
    setNewImagePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const data = new FormData()
      data.append('title', formData.title)
      data.append('description', formData.description)
      data.append('order', formData.order)
      data.append('redirectUrl', formData.redirectUrl)

      // Only send image if user picked a new one
      if (formData.image) {
        data.append('image', formData.image)
      }

      await updateCarousel.mutateAsync({ id: carouselId, data: data as any })
      navigate({ to: '/admin/carousel' })
    } catch (error) {
      console.error('Error updating carousel:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = formData.title && (existingImageUrl || formData.image)

  // Determine what to show in the image area
  const displayPreview = newImagePreview ?? existingImageUrl

  if (isCarouselLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!carousel) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Carousel slide not found.</p>
      </div>
    )
  }

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
            <h1 className="text-xl font-semibold text-foreground">Edit Carousel Slide</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Updating{' '}
              <span className="text-foreground font-medium">{carousel.title}</span>
            </p>
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
              {displayPreview ? (
                <div className="space-y-3">
                  <div className="group relative w-full aspect-16/5 rounded-lg overflow-hidden border border-border bg-secondary">
                    <img
                      src={displayPreview}
                      alt="Banner preview"
                      className="w-full h-full object-cover"
                    />
                    {/* New image badge */}
                    {newImagePreview && (
                      <span className="absolute top-2 left-2 text-[10px] font-medium bg-primary text-primary-foreground px-2 py-0.5 rounded">
                        NEW
                      </span>
                    )}
                    {/* Hover overlay */}
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
                      {newImagePreview && (
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={removeNewImage}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                          Revert
                        </Button>
                      )}
                    </div>
                  </div>

                  {newImagePreview && (
                    <p className="text-xs text-muted-foreground">
                      New image selected — the existing banner will be replaced on save.
                    </p>
                  )}
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