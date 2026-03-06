import { BACKEND_URL, BaseApiClient } from "@/lib/api";

class GeneralService extends BaseApiClient {
  fetchImage(path?: string){
    return BACKEND_URL + `/images/${path}`
  }

}

export const generalService = new GeneralService();