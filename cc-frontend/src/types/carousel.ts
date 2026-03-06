export interface CarouselForm {
    title: string
    description: string
    order: string
    redirectUrl: string
    image: File | null
}
  
export interface CarouselDetails {
    title: string
    description: string
    order: string
    redirectUrl: string
    imageUrl: string
    slug: string
    isActive: boolean
    _id: string
}

export interface CarouselList {
    message: string
    result: CarouselDetails[]
}