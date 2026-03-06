import axios, { type AxiosInstance, type AxiosResponse, AxiosError } from 'axios'
import { authService } from './auth'

export const BACKEND_URL = 'http://localhost:8800'

export class BaseApiClient {
  protected axiosInstance: AxiosInstance

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: `${BACKEND_URL}/api`,
    })

    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }

        if (config.data instanceof FormData) {
          delete config.headers?.['Content-Type']
        } else {
          config.headers['Content-Type'] = 'application/json'
        }

        return config
      },
      (error) => Promise.reject(error)
    )

    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          authService.logout()
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  protected async get<T>(endpoint: string, params?: any): Promise<T> {
    const response = await this.axiosInstance.get<T>(endpoint, { params })
    return response.data
  }

  protected async post<T>(
    endpoint: string,
    data?: any,
    customHeaders?: Record<string, string>
  ): Promise<T> {
    const response = await this.axiosInstance.post<T>(endpoint, data, {
      headers: customHeaders,
    })
    return response.data
  }

  protected async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.axiosInstance.put<T>(endpoint, data)
    return response.data
  }

  protected async patch<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.axiosInstance.patch<T>(endpoint, data)
    return response.data
  }

  protected async delete<T>(endpoint: string): Promise<T> {
    const response = await this.axiosInstance.delete<T>(endpoint)
    return response.data
  }
}
