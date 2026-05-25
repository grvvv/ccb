import { useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCarousels } from '@/hooks/use-carousel'
import { Spinner } from '../ui/spinner'

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const navigate = useNavigate()

  const { data, isLoading, isError } = useCarousels()
  const heroSlides = data?.result || []

  useEffect(() => {
    if (!isAutoPlaying || heroSlides.length === 0) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [isAutoPlaying, heroSlides.length])

  const goToSlide = (index: number) => {
    if (heroSlides.length === 0) return
    setCurrentSlide(index)
    setIsAutoPlaying(false)
    const resumeTimeout = setTimeout(() => setIsAutoPlaying(true), 10000)
    return () => clearTimeout(resumeTimeout)
  }

  const nextSlide = () => goToSlide((currentSlide + 1) % heroSlides.length)
  const prevSlide = () => goToSlide((currentSlide - 1 + heroSlides.length) % heroSlides.length)

  if (isLoading) {
    return (
      <div className="flex h-[300px] sm:h-[400px] lg:h-[600px] w-full items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (isError) return null
  if (heroSlides.length === 0) return null

  return (
    <div className="relative w-full h-[200px] sm:h-[300px] lg:h-[400px] overflow-hidden">
      {heroSlides.map((slide, index) => (
        <div
          key={slide._id || index}
          className={`absolute inset-0 transition-all duration-700 ease-in-out ${
            index === currentSlide
              ? 'opacity-100 scale-100 z-0'
              : 'opacity-0 scale-105 pointer-events-none z-[-1]'
          }`}
        >
          <img
            src={slide.imageUrl}
            alt={slide.title}
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-linear-to-r from-black/60 to-black/20" />

          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
              <div
                className={`max-w-xs sm:max-w-sm md:max-w-xl transition-all duration-700 delay-200 ${
                  index === currentSlide
                    ? 'translate-x-0 opacity-100'
                    : '-translate-x-12 opacity-0'
                }`}
              >
                <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 sm:mb-4 leading-tight">
                  {slide.title}
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-white/90 mb-4 sm:mb-8 line-clamp-2 sm:line-clamp-none">
                  {slide.description}
                </p>
                <Button
                  size="sm"
                  className="sm:text-base sm:px-6 sm:py-3 bg-primary hover:bg-primary/90"
                  onClick={() => navigate({ to: slide.redirectUrl })}
                >
                  Explore
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Dots + Arrows — bottom-right, never overlaps left-aligned content */}
      <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 z-10 flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-1.5 sm:h-2 rounded-full transition-all ${
                index === currentSlide
                  ? 'w-6 sm:w-8 bg-white'
                  : 'w-1.5 sm:w-2 bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>

        <button
          onClick={prevSlide}
          aria-label="Previous slide"
          className="h-8 w-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={nextSlide}
          aria-label="Next slide"
          className="h-8 w-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}