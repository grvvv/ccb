import { useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCarousels } from '@/hooks/use-carousel'
import { Spinner } from '../ui/spinner'

// const heroSlides = [
//   {
//     id: 1,
//     title: 'Party Collection 2026',
//     subtitle: 'Discover the season trends',
//     description: 'Up to 50% off on selected items',
//     image: 'https://i.pinimg.com/1200x/71/77/98/7177985535ec83dc423241345facaaee.jpg',
//     cta: 'Shop Now',
//     ctaLink: '/products',
//     overlay: 'from-black/60 to-black/20',
//   },
//   {
//     id: 2,
//     title: 'New Arrivals',
//     subtitle: 'Fresh styles just in',
//     description: 'Explore our latest collection',
//     image: 'https://i.pinimg.com/1200x/6c/84/95/6c8495455b0b4db29a213c9a5241c71f.jpg',
//     cta: 'Explore',
//     ctaLink: '/new-arrivals',
//     overlay: 'from-primary/60 to-primary/20',
//   },
// ]

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const navigate = useNavigate()
  
  const { data, isLoading, isError } = useCarousels()
  const heroSlides = data?.result || []

  // Auto-play logic
  useEffect(() => {
    // Don't start interval if loading or no slides exist
    if (!isAutoPlaying || heroSlides.length === 0) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, heroSlides.length]) // Added length dependency

  const goToSlide = (index: number) => {
    if (heroSlides.length === 0) return
    setCurrentSlide(index)
    
    // Reset auto-play
    setIsAutoPlaying(false)
    const resumeTimeout = setTimeout(() => setIsAutoPlaying(true), 10000)
    
    return () => clearTimeout(resumeTimeout)
  }

  const nextSlide = () => goToSlide((currentSlide + 1) % heroSlides.length)
  const prevSlide = () => goToSlide((currentSlide - 1 + heroSlides.length) % heroSlides.length)

  // ACTUAL return for loading state
  if (isLoading) {
    return (
      <div className="flex h-[500px] lg:h-[600px] w-full items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if(isError) return null

  // Handle case where fetch finishes but result is empty
  if (heroSlides.length === 0) return null

  return (
    <div className="relative w-full h-[500px] lg:h-[600px] overflow-hidden">
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
            <div className="max-w-7xl mx-auto px-6 w-full">
              <div
                className={`max-w-xl transition-all duration-700 delay-200 ${
                  index === currentSlide
                    ? 'translate-x-0 opacity-100'
                    : '-translate-x-12 opacity-0'
                }`}
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                  {slide.title}
                </h1>
                <p className="text-lg text-white/90 mb-8">{slide.description}</p>
                <Button 
                   size="lg" 
                   className="bg-primary hover:bg-primary/90" 
                   onClick={() => navigate({ to: slide.redirectUrl })}
                >
                  Explore
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
        <button
          onClick={prevSlide}
          className="pointer-events-auto h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="pointer-events-auto h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Dot Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>
    </div>
  )
}