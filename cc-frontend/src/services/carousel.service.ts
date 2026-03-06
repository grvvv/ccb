import { BaseApiClient } from "@/lib/api";
import type { CarouselDetails, CarouselForm, CarouselList } from "@/types/carousel";

class CarouselService extends BaseApiClient {
  async getById(id: string): Promise<CarouselDetails> {
    return this.get<CarouselDetails>(`carousel/${id}/`);
  }

  async create(data: CarouselForm): Promise<CarouselDetails> {
    return this.post<CarouselDetails>(`carousel/add`, data);
  }

  async update(id: string, data: CarouselForm): Promise<CarouselDetails> {
    return this.put<CarouselDetails>(`carousel/update/${id}/`, data);
  }

  async list(): Promise<CarouselList> {
    return this.get<CarouselList>('carousel/');
  }

  async deleteById(id: string): Promise<void> {
    return this.delete<void>(`category/delete/${id}/`);
  }
}

export const carouselService = new CarouselService();